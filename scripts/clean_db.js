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
      DELETE FROM practice_questions 
      WHERE answer_data->>'correct_answer' IS NULL 
         OR answer_data->>'correct_answer' = '' 
         OR jsonb_array_length(answer_data->'options') < 2
    `);
    console.log("Deleted legacy/bad questions:", res.rowCount);
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
