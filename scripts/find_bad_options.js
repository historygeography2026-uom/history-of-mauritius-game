const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT id, unit_id, question_text, answer_data 
      FROM practice_questions 
      WHERE question_text ILIKE '%mountain range%' 
         OR question_text ILIKE '%picture is%'
      LIMIT 10
    `);
    console.dir(res.rows, { depth: null });
    
    // Check if there are questions where option is just 'A' or 'B'
    const res2 = await client.query(`
       SELECT id, unit_id, question_text, answer_data->'options' as options
       FROM practice_questions
       WHERE answer_data->'options'->>0 = 'A'
       LIMIT 5
    `);
    console.log("Questions with 'A' as option:");
    console.dir(res2.rows, { depth: null });
    
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
