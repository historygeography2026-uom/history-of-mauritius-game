import { Pool } from 'pg'

// Create a single pool instance to be reused across the app
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL required for Render PostgreSQL (both local dev and production)
  ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

/**
 * Execute a single query
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount })
    }
    return result.rows as T[]
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Execute a single query and return first result
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const results = await query<T>(text, params)
  return results.length > 0 ? results[0] : null
}

/**
 * Get the pool for advanced operations
 */
export function getPool() {
  return pool
}

/**
 * Close the pool connection
 */
export async function closePool() {
  await pool.end()
}

export default pool

