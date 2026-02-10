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
  const r = await c.query(
   `SELECT id, question_type_id FROM questions LIMIT 5`
  );
  
  console.log('Question data types:');
  r.rows.forEach(row => {
    console.log(`  ID ${row.id} (${typeof row.id}), Type ${row.question_type_id} (${typeof row.question_type_id})`);
    console.log(`    Type === 2? ${row.question_type_id === 2}`);
    console.log(`    Type == '2'? ${row.question_type_id == '2'}`);
    console.log(`    parseInt(Type): ${parseInt(row.question_type_id)} (${typeof parseInt(row.question_type_id)})`);
  });
  
  c.release();
  pool.end();
}

check();
