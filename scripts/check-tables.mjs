import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com',
  user: 'mauriitus_game_user',
  password: process.env.DB_PASSWORD,
  database: 'mauriitus_game',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

async function check() {
  const c = await pool.connect();
  
  // List all tables
  const tables = await c.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  console.log('Tables in database:');
  tables.rows.forEach(r => console.log('  -', r.table_name));
  
  // Check leaderboard table
  const lb = await c.query(`SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_name = 'leaderboard'`);
  console.log('\nLeaderboard table exists:', parseInt(lb.rows[0].cnt) > 0);
  
  // Check public_profiles / users table
  const up = await c.query(`SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_name = 'public_profiles'`);
  console.log('public_profiles table exists:', parseInt(up.rows[0].cnt) > 0);
  
  const users = await c.query(`SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_name = 'users'`);
  console.log('users table exists:', parseInt(users.rows[0].cnt) > 0);
  
  // Check leaderboard table schema if it exists
  if (parseInt(lb.rows[0].cnt) > 0) {
    const cols = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leaderboard' ORDER BY ordinal_position`);
    console.log('\nLeaderboard columns:');
    cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
    
    const count = await c.query('SELECT COUNT(*) as cnt FROM leaderboard');
    console.log('Leaderboard rows:', count.rows[0].cnt);
  }
  
  // Check users table schema if it exists
  if (parseInt(users.rows[0].cnt) > 0) {
    const cols = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`);
    console.log('\nUsers columns:');
    cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
    
    const count = await c.query('SELECT COUNT(*) as cnt FROM users');
    console.log('Users rows:', count.rows[0].cnt);
  }
  
  c.release();
  pool.end();
}

check();
