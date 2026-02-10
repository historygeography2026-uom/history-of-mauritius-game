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
  const client = await pool.connect();
  
  const countRes = await client.query('SELECT COUNT(*) FROM questions');
  console.log('Total questions:', countRes.rows[0].count);
  
  const mcqRes = await client.query(`
    SELECT q.id, q.question_text, q.question_type_id,
      (SELECT COUNT(*) FROM mcq_options WHERE question_id = q.id) as opt_count,
      (SELECT COUNT(*) FROM matching_pairs WHERE question_id = q.id) as match_count,
      (SELECT COUNT(*) FROM fill_answers WHERE question_id = q.id) as fill_count,
      (SELECT COUNT(*) FROM reorder_items WHERE question_id = q.id) as reorder_count,
      (SELECT COUNT(*) FROM truefalse_answers WHERE question_id = q.id) as tf_count
    FROM questions q
    LIMIT 5
  `);
  
  console.log('\nFirst 5 questions:');
  mcqRes.rows.forEach(r => {
    const type = ['mcq', 'matching', 'fill', 'reorder', 'truefalse'][r.question_type_id - 1];
    const details = {
      1: `options=${r.opt_count}`,
      2: `pairs=${r.match_count}`,
      3: `answers=${r.fill_count}`,
      4: `items=${r.reorder_count}`,
      5: `answers=${r.tf_count}`,
    };
    console.log(`ID ${r.id} [${type}] ${details[r.question_type_id]}: ${r.question_text.substring(0, 50)}`);
  });
  
  client.release();
  pool.end();
}

check();
