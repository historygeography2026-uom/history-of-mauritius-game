const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkData() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, unit_id, question_text, image_url, answer_data FROM practice_questions");
    let issues = 0;
    
    let unitStats = {};
    
    let emptyQuestionText = 0;
    let missingCorrectAnswer = 0;
    let insufficientOptions = 0;
    let missingImages = 0;
    
    for (const row of res.rows) {
      const u = row.unit_id;
      if (!unitStats[u]) {
        unitStats[u] = { total: 0, bad: 0 };
      }
      unitStats[u].total++;
      
      const q = row.question_text;
      const opts = row.answer_data.options;
      const correct = row.answer_data.correct_answer;
      
      let hasIssue = false;
      
      if (!q || q.trim() === "") {
        emptyQuestionText++;
        hasIssue = true;
      }
      
      if (!correct || String(correct).trim() === "") {
        missingCorrectAnswer++;
        hasIssue = true;
      }
      
      if (!opts || !Array.isArray(opts) || opts.length < 2) {
        insufficientOptions++;
        hasIssue = true;
      }
      
      if (row.image_url) {
        const publicPath = path.join(__dirname, "..", "public", row.image_url);
        if (!fs.existsSync(publicPath)) {
          missingImages++;
          hasIssue = true;
        }
      }
      
      if (hasIssue) {
        issues++;
        unitStats[u].bad++;
      }
    }
    
    console.log(`Total questions checked: ${res.rows.length}`);
    console.log(`Total questions with ANY issue: ${issues}`);
    console.log(`- Empty question text: ${emptyQuestionText}`);
    console.log(`- Missing correct answer: ${missingCorrectAnswer}`);
    console.log(`- Insufficient options (<2): ${insufficientOptions}`);
    console.log(`- Missing/broken images: ${missingImages}`);
    
    console.log("\nBreakdown by unit_id:");
    console.table(unitStats);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData();
