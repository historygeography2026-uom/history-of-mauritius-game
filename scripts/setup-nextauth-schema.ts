/**
 * Script to create NextAuth.js v5 tables in Render PostgreSQL
 * Run this script once to set up the database schema for authentication
 * 
 * Usage: npx ts-node scripts/setup-nextauth-schema.ts
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function setupSchema() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 Creating NextAuth.js tables...')
    
    // Create users table (if not exists - modify to use existing user_profiles)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        emailVerified TIMESTAMP,
        image TEXT,
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `)
    console.log('✅ users table created')
    
    // Create accounts table (OAuth/provider accounts)
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        providerAccountId VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, providerAccountId)
      );
      
      CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId);
    `)
    console.log('✅ accounts table created')
    
    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        sessionToken VARCHAR(255) UNIQUE NOT NULL,
        userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
      CREATE INDEX IF NOT EXISTS idx_sessions_sessionToken ON sessions(sessionToken);
    `)
    console.log('✅ sessions table created')
    
    // Create verification tokens table (for email verification)
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (identifier, token)
      );
      
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
    `)
    console.log('✅ verification_tokens table created')
    
    // Create authenticators table (WebAuthn support)
    await client.query(`
      CREATE TABLE IF NOT EXISTS authenticators (
        credentialID VARCHAR(255) UNIQUE NOT NULL,
        userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        providerAccountId VARCHAR(255) NOT NULL,
        credentialPublicKey BYTEA NOT NULL,
        counter INTEGER NOT NULL,
        credentialDeviceType VARCHAR(32) NOT NULL,
        credentialBackedUp BOOLEAN NOT NULL,
        transports VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (userId, credentialID)
      );
      
      CREATE INDEX IF NOT EXISTS idx_authenticators_userId ON authenticators(userId);
    `)
    console.log('✅ authenticators table created')
    
    console.log('\n✨ NextAuth.js schema setup complete!')
    console.log('Tables created:')
    console.log('  - users')
    console.log('  - accounts')
    console.log('  - sessions')
    console.log('  - verification_tokens')
    console.log('  - authenticators')
    
  } catch (error) {
    console.error('❌ Error setting up schema:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

setupSchema()
