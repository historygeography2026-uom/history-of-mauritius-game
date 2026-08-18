const { Pool } = require("pg");
const fs = require("fs");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, question_text FROM practice_questions ORDER BY id ASC");
    let content = "";
    for (const row of res.rows) {
      content += `ID: ${row.id} | ${row.question_text}\n`;
    }
    fs.writeFileSync("questions_dump.txt", content, "utf8");
    console.log("Dumped " + res.rows.length + " questions to questions_dump.txt");
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
