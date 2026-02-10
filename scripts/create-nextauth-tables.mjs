import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com',
  port: 5432,
  database: 'mauriitus_game',
  user: 'mauriitus_game_user',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

try {
  console.log('Creating NextAuth required tables...\n');

  // 1. users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      email_verified TIMESTAMPTZ,
      image TEXT,
      password_hash TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('✅ users table created');

  // 2. accounts table (OAuth providers)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(255) NOT NULL,
      provider VARCHAR(255) NOT NULL,
      provider_account_id VARCHAR(255) NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at BIGINT,
      token_type VARCHAR(255),
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      UNIQUE(provider, provider_account_id)
    )
  `);
  console.log('✅ accounts table created');

  // 3. sessions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      session_token VARCHAR(255) UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires TIMESTAMPTZ NOT NULL
    )
  `);
  console.log('✅ sessions table created');

  // 4. verification_tokens table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier VARCHAR(255) NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires TIMESTAMPTZ NOT NULL,
      PRIMARY KEY(identifier, token)
    )
  `);
  console.log('✅ verification_tokens table created');

  // Verify
  const tables = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
  );
  console.log('\nAll tables now:', tables.rows.map(x => x.table_name));
  console.log(`\nTotal: ${tables.rows.length} tables`);

} catch (e) {
  console.error('ERROR:', e.message);
  console.error(e.stack);
} finally {
  await pool.end();
}
