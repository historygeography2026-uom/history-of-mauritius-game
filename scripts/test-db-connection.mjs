/**
 * Test database connection and verify NextAuth tables
 * Usage: node scripts/test-db-connection.mjs
 */

import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const testConnection = async () => {
  const client = await pool.connect()

  try {
    console.log("🔗 Testing database connection...")

    // Test basic connection
    const result = await client.query("SELECT NOW()")
    console.log("✅ Connection successful!")
    console.log(`📅 Server time: ${result.rows[0].now}`)

    // List all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    console.log("\n📋 Tables in database:")
    tables.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`)
    })

    // Check for NextAuth tables
    const nextAuthTables = [
      "users",
      "accounts",
      "sessions",
      "verification_tokens",
      "authenticators",
    ]
    const existingTables = tables.rows.map((r) => r.table_name)
    const hasNextAuthTables = nextAuthTables.every((t) =>
      existingTables.includes(t)
    )

    if (hasNextAuthTables) {
      console.log("\n✨ NextAuth.js tables found!")
    } else {
      const missing = nextAuthTables.filter((t) => !existingTables.includes(t))
      console.log(`\n⚠️  Missing tables: ${missing.join(", ")}`)
    }

    // Show table counts
    console.log("\n📊 Table record counts:")
    for (const table of nextAuthTables) {
      if (existingTables.includes(table)) {
        const count = await client.query(`SELECT COUNT(*) FROM "${table}"`)
        console.log(`  - ${table}: ${count.rows[0].count} records`)
      }
    }

    console.log("\n✅ Database test complete!")
  } catch (error) {
    console.error("❌ Connection error:", error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

testConnection()
