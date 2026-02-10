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

async function test() {
  const client = await pool.connect();
  
  // Get one question of each type
  const questions = await client.query(`
    SELECT DISTINCT ON (question_type_id) id, question_type_id, question_text 
    FROM questions 
    ORDER BY question_type_id, id
  `);
  
  console.log('Sample questions:');
  for (const q of questions.rows) {
    console.log(`  Type ${q.question_type_id}: ID=${q.id} (${typeof q.id}), Text="${q.question_text}"`);
  }
  
  // Try to insert a matching pair for the first type-2 question
  const q2 = questions.rows.find(r => r.question_type_id === 2);
  if (q2) {
    console.log(`\nTrying to insert matching pair for question ID ${q2.id}...`);
    try {
      const result = await client.query(
        `INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [q2.id, 1, 'Test A', 'Test B']
      );
      console.log('Insert result:', result.rows);
      
      // Check if it was inserted
      const check = await client.query(
        `SELECT COUNT(*) FROM matching_pairs WHERE question_id = $1`,
        [q2.id]
      );
      console.log(`Matching pairs for question ${q2.id}:`, check.rows[0].count);
    } catch (e) {
      console.error('Insert failed:', e.message);
    }
  }
  
  client.release();
  pool.end();
}

test();
