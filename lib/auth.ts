import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import { Adapter } from "next-auth/adapters"
import { pool } from "@/lib/db"
import { verifyPassword } from "./auth-utils"

// Minimal PostgreSQL adapter for NextAuth
function PostgresAdapter(client: any): Adapter {
  return {
    createUser: async (user) => {
      const result = await client.query(
        'INSERT INTO users (name, email, image, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
        [user.name, user.email, user.image]
      )
      return result.rows[0]
    },
    getUser: async (id) => {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id])
      return result.rows[0] || null
    },
    getUserByEmail: async (email) => {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
      return result.rows[0] || null
    },
    getUserByAccount: async ({ providerAccountId, provider }) => {
      const result = await client.query(
        'SELECT users.* FROM users JOIN accounts ON users.id = accounts.user_id WHERE accounts.provider_account_id = $1 AND accounts.provider = $2',
        [providerAccountId, provider]
      )
      return result.rows[0] || null
    },
    updateUser: async (user) => {
      const { id, ...data } = user
      const updates = Object.keys(data).map((k, i) => `${k} = $${i + 1}`)
      const values = Object.values(data)
      const result = await client.query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
        [...values, id]
      )
      return result.rows[0]
    },
    deleteUser: async (id) => {
      await client.query('DELETE FROM users WHERE id = $1', [id])
    },
    linkAccount: async (account) => {
      const result = await client.query(
        'INSERT INTO accounts (user_id, provider, provider_account_id, type, access_token, token_type, scope) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [account.userId, account.provider, account.providerAccountId, account.type, account.access_token, account.tokenType, account.scope]
      )
      return result.rows[0]
    },
    unlinkAccount: async ({ provider, providerAccountId }) => {
      await client.query('DELETE FROM accounts WHERE provider = $1 AND provider_account_id = $2', [provider, providerAccountId])
    },
    createSession: async (session) => {
      const result = await client.query(
        'INSERT INTO sessions (user_id, session_token, expires) VALUES ($1, $2, $3) RETURNING *',
        [session.userId, session.sessionToken, session.expires]
      )
      return result.rows[0]
    },
    getSessionAndUser: async (sessionToken) => {
      const result = await client.query(
        'SELECT sessions.*, users.* FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.session_token = $1',
        [sessionToken]
      )
      if (!result.rows[0]) return null
      const row = result.rows[0]
      return {
        session: {
          userId: row.user_id,
          sessionToken: row.session_token,
          expires: row.expires,
        },
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          image: row.image,
          emailVerified: row.email_verified,
        },
      }
    },
    updateSession: async (session) => {
      const { sessionToken, expires } = session
      const result = await client.query(
        'UPDATE sessions SET expires = $1 WHERE session_token = $2 RETURNING *',
        [expires, sessionToken]
      )
      return result.rows[0] || null
    },
    deleteSession: async (sessionToken) => {
      await client.query('DELETE FROM sessions WHERE session_token = $1', [sessionToken])
    },
    async createVerificationToken(token) {
      const result = await client.query(
        'INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1, $2, $3) RETURNING *',
        [token.identifier, token.token, token.expires]
      )
      return result.rows[0]
    },
    async useVerificationToken({ identifier, token }) {
      const result = await client.query(
        'DELETE FROM verification_tokens WHERE identifier = $1 AND token = $2 RETURNING *',
        [identifier, token]
      )
      return result.rows[0] || null
    },
  } as Adapter
}

const authConfig = {
  adapter: PostgresAdapter(pool),
  
  providers: [
    // Email/Password authentication
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Query user from PostgreSQL
          const result = await pool.query(
            'SELECT id, email, name, image, password_hash FROM users WHERE email = $1',
            [credentials.email]
          )

          if (result.rows.length === 0) {
            return null
          }

          const user = result.rows[0]

          // Verify password
          const passwordValid = await verifyPassword(
            credentials.password as string,
            user.password_hash
          )

          if (!passwordValid) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("[auth] Credentials authorization error:", error)
          return null
        }
      },
    }),

    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Facebook OAuth
    Facebook({
      clientId: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  // Use database sessions instead of JWT
  session: {
    strategy: "database" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // Pages configuration
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  // Callbacks for session enrichment and event handling
  callbacks: {
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },

    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },

  // Event handlers
  events: {
    async signIn({ user, account, profile, isNewUser }: any) {
      console.log(`[auth] User ${user?.email} signed in. New user: ${isNewUser}`)
    },
    async signOut({ token }: any) {
      console.log(`[auth] User signed out`)
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authConfig)

export const GET = handler
export const POST = handler

export const { auth, signIn, signOut } = NextAuth(authConfig)
