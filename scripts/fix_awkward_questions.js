const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    let updated = 0;
    
    // 1. Remove all 'Pic X' artifacts from questions
    const res = await client.query("SELECT id, question_text FROM practice_questions WHERE question_text ILIKE '%pic%'");
    for (let r of res.rows) {
      // replace things like "Pic 21", "pic 1", "Pic13", "...Pic 21"
      let newText = r.question_text.replace(/\.?\s*\.?\s*pic\s*\d+/gi, "").trim();
      if (newText !== r.question_text) {
        await client.query("UPDATE practice_questions SET question_text = $1 WHERE id = $2", [newText, r.id]);
        updated++;
      }
    }
    
    // 2. Fix specific grammatical issues and typos
    const fixes = [
      { id: 633, oldText: "Eucation", newText: "Education" },
      { id: 1261, oldText: "A …...was someone who was given permission by the King to attack British ships.", newText: "A….... was someone who was given permission by the King to attack British ships." },
      { id: 1319, oldText: "The…Building in Rodrigues was a place in the past used to accommodate.", newText: "The…....Building in Rodrigues was a place in the past used to accommodate people." },
      { id: 1265, oldText: "….............as a famous corsair.", newText: "…............. was a famous corsair." },
      { id: 835, oldText: "A widvane", newText: "A windvane" },
      { id: 1146, oldText: "Is the air", newText: "is the air" },
      { id: 208, oldText: "to travelled", newText: "to travel" },
      { id: 830, oldText: "durind", newText: "during" },
      { id: 856, oldText: "continous", newText: "continuous" }
    ];
    
    for (const fix of fixes) {
       const q = await client.query("SELECT question_text FROM practice_questions WHERE id = $1", [fix.id]);
       if (q.rows.length > 0) {
          const current = q.rows[0].question_text;
          const updatedText = current.replace(fix.oldText, fix.newText);
          if (current !== updatedText) {
             await client.query("UPDATE practice_questions SET question_text = $1 WHERE id = $2", [updatedText, fix.id]);
             updated++;
          }
       }
    }
    
    console.log(`Successfully fixed ${updated} awkward questions/typos.`);
    
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
