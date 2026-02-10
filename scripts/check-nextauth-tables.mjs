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
  const tables = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
  );
  console.log('All tables:', tables.rows.map(x => x.table_name));

  // Check for NextAuth required tables
  const needed = ['users', 'accounts', 'sessions', 'verification_tokens'];
  for (const t of needed) {
    const exists = tables.rows.some(r => r.table_name === t);
    console.log(`  ${t}: ${exists ? '✅ exists' : '❌ MISSING'}`);
  }
} catch (e) {
  console.error('ERROR:', e.message);
} finally {
  await pool.end();
}
