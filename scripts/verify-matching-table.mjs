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
  
  // Check matching_pairs schema
  const r = await c.query(
    `SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_name='matching_pairs' 
     ORDER BY ordinal_position`
  );
  
  console.log('matching_pairs columns:');
  r.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
  
  // Try a simple insert
  console.log('\nTrying insert...');
  try {
    const insert = await c.query(
      `INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
       VALUES ('385', 1, 'Test', 'Test2')`
    );
    console.log('Insert successful, rows affected:', insert.rowCount);
  } catch (e) {
    console.log('Insert error:', e.message);
  }
  
  c.release();
  pool.end();
}

check();
