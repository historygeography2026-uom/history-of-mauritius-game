/**
 * Setup NextAuth.js PostgreSQL schema
 * 
 * This script creates all necessary tables for NextAuth.js v5 to work with PostgreSQL
 * Run this once to initialize the database for authentication
 * 
 * Usage: node scripts/setup-nextauth-schema.mjs
 */

import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

// Use external URL for local connections, internal for Render services
const connectionString = process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL
console.log(`📡 Connecting to: ${connectionString?.replace(/:[^@]*@/, ':***@')}`)

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Required for external Render connections
})

const setupSchema = async () => {
  const client = await pool.connect()

  try {
    console.log("🔄 Creating NextAuth.js schema...")

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        "emailVerified" TIMESTAMP,
        image TEXT,
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Created users table")

    // Create accounts table (for OAuth providers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        "providerAccountId" VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, "providerAccountId")
      )
    `)
    console.log("✅ Created accounts table")

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
        "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Created sessions table")

    // Create verification tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (identifier, token)
      )
    `)
    console.log("✅ Created verification_tokens table")

    // Create authenticators table
    await client.query(`
      CREATE TABLE IF NOT EXISTS authenticators (
        "credentialID" VARCHAR(255) UNIQUE NOT NULL,
        "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "providerAccountId" VARCHAR(255) NOT NULL,
        "credentialPublicKey" BYTEA NOT NULL,
        counter INTEGER NOT NULL,
        "credentialDeviceType" VARCHAR(32) NOT NULL,
        "credentialBackedUp" BOOLEAN NOT NULL,
        transports VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("userId", "credentialID")
      )
    `)
    console.log("✅ Created authenticators table")

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts("userId");
      CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions("userId");
      CREATE INDEX IF NOT EXISTS idx_sessions_sessionToken ON sessions("sessionToken");
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_authenticators_userId ON authenticators("userId");
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `)
    console.log("✅ Created indexes")

    console.log("\n✨ NextAuth.js schema created successfully!")
    console.log("Tables created:")
    console.log("  - users")
    console.log("  - accounts")
    console.log("  - sessions")
    console.log("  - verification_tokens")
    console.log("  - authenticators")
  } catch (error) {
    console.error("❌ Error creating schema:", error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

setupSchema()
