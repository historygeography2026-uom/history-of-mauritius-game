import { Pool } from 'pg'

// Create a single pool instance to be reused across the app
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // For SSL connections (required by Render in production)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
    console.log('Executed query', { text, duration, rows: result.rowCount })
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
 * Execute insert and return the inserted row
 */
export async function insert<T = any>(
  table: string,
  data: Record<string, any>
): Promise<T> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
  
  const text = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `
  
  const result = await queryOne<T>(text, values)
  return result as T
}

/**
 * Execute update query
 */
export async function update<T = any>(
  table: string,
  data: Record<string, any>,
  where: Record<string, any>
): Promise<T[]> {
  const setClause = Object.keys(data)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ')
  
  const whereClause = Object.keys(where)
    .map((key, i) => `${key} = $${i + Object.keys(data).length + 1}`)
    .join(' AND ')
  
  const text = `
    UPDATE ${table}
    SET ${setClause}
    WHERE ${whereClause}
    RETURNING *
  `
  
  const values = [...Object.values(data), ...Object.values(where)]
  return query<T>(text, values)
}

/**
 * Execute delete query
 */
export async function deleteRecord(
  table: string,
  where: Record<string, any>
): Promise<number> {
  const whereClause = Object.keys(where)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(' AND ')
  
  const text = `DELETE FROM ${table} WHERE ${whereClause}`
  const result = await pool.query(text, Object.values(where))
  return result.rowCount || 0
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
