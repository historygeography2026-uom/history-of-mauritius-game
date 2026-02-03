import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Render requires this
      },
    })
  }
  return pool
}

export async function query(text: string, params?: any[]) {
  const result = await getPool().query(text, params)
  return result.rows
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
