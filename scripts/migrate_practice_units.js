// Migration script: Restructure practice_units from 6 → 10 units (Grade 5 × 5 + Grade 6 × 5)
// Run with: node scripts/migrate_practice_units.js

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set!");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Step 1: Check current state
    const currentUnits = await client.query("SELECT id, unit_no, unit_name FROM practice_units ORDER BY unit_no");
    console.log("Current units:", currentUnits.rows);

    // Step 2: Check which units have questions
    const unitQuestionCounts = await client.query(
      "SELECT unit_id, COUNT(*) as cnt FROM practice_questions GROUP BY unit_id ORDER BY unit_id"
    );
    console.log("Question counts per unit_id:", unitQuestionCounts.rows);

    // Step 3: Map old unit_no → old unit_id
    const oldUnitMap = {};
    for (const row of currentUnits.rows) {
      oldUnitMap[row.unit_no] = row.id;
    }
    console.log("Old unit_no → id map:", oldUnitMap);

    // Step 4: Drop the UNIQUE constraint on unit_no so we can renumber
    try {
      await client.query("ALTER TABLE practice_units DROP CONSTRAINT IF EXISTS practice_units_unit_no_key");
      console.log("Dropped unique constraint on unit_no");
    } catch (e) {
      console.log("No unique constraint to drop");
    }

    // Step 5: Temporarily set old units to high unit_no values to avoid conflicts
    for (const row of currentUnits.rows) {
      await client.query("UPDATE practice_units SET unit_no = $1 WHERE id = $2", [row.unit_no + 100, row.id]);
    }
    console.log("Temporarily renumbered old units to 100+");

    // Step 6: Rename existing old units to new Grade 6 positions
    // Old unit 1 (Grade 6 Unit 1 content) → unit_no 6
    // Old unit 2 (Grade 6 Unit 2 content) → unit_no 7
    // Old unit 3 (Grade 6 Unit 3 content) → unit_no 8
    // Old unit 4 → unit_no 9 (Grade 6 Unit 4)
    // Old unit 5 → unit_no 10 (Grade 6 Unit 5)
    const remap = [
      { oldNo: 1, newNo: 6, newName: "Grade 6 Unit 1" },
      { oldNo: 2, newNo: 7, newName: "Grade 6 Unit 2" },
      { oldNo: 3, newNo: 8, newName: "Grade 6 Unit 3" },
      { oldNo: 4, newNo: 9, newName: "Grade 6 Unit 4" },
      { oldNo: 5, newNo: 10, newName: "Grade 6 Unit 5" },
    ];

    for (const { oldNo, newNo, newName } of remap) {
      if (oldUnitMap[oldNo]) {
        await client.query("UPDATE practice_units SET unit_no = $1, unit_name = $2 WHERE id = $3", [newNo, newName, oldUnitMap[oldNo]]);
        console.log(`Moved old unit ${oldNo} (id=${oldUnitMap[oldNo]}) → unit_no ${newNo} "${newName}"`);
      }
    }

    // Step 7: Delete old unit 6 if it exists and is empty (was extra)
    if (oldUnitMap[6]) {
      const hasQ = unitQuestionCounts.rows.find(r => Number(r.unit_id) === Number(oldUnitMap[6]));
      if (!hasQ || Number(hasQ.cnt) === 0) {
        await client.query("DELETE FROM practice_units WHERE id = $1", [oldUnitMap[6]]);
        console.log(`Deleted empty old unit 6 (id=${oldUnitMap[6]})`);
      } else {
        console.log(`WARNING: Old unit 6 has questions — skipping delete`);
      }
    }

    // Step 8: Insert 5 new Grade 5 units (unit_no 1-5)
    const grade5Units = [
      { unit_no: 1, unit_name: "Grade 5 Unit 1" },
      { unit_no: 2, unit_name: "Grade 5 Unit 2" },
      { unit_no: 3, unit_name: "Grade 5 Unit 3" },
      { unit_no: 4, unit_name: "Grade 5 Unit 4" },
      { unit_no: 5, unit_name: "Grade 5 Unit 5" },
    ];

    for (const { unit_no, unit_name } of grade5Units) {
      const existing = await client.query("SELECT id FROM practice_units WHERE unit_no = $1", [unit_no]);
      if (existing.rows.length === 0) {
        await client.query("INSERT INTO practice_units (unit_no, unit_name) VALUES ($1, $2)", [unit_no, unit_name]);
        console.log(`Created: unit_no ${unit_no} "${unit_name}"`);
      } else {
        await client.query("UPDATE practice_units SET unit_name = $1 WHERE unit_no = $2", [unit_name, unit_no]);
        console.log(`Updated: unit_no ${unit_no} "${unit_name}"`);
      }
    }

    // Step 9: Re-add unique constraint
    await client.query("ALTER TABLE practice_units ADD CONSTRAINT practice_units_unit_no_key UNIQUE (unit_no)");
    console.log("Re-added unique constraint on unit_no");

    // Step 10: Verify final state
    const finalUnits = await client.query("SELECT id, unit_no, unit_name FROM practice_units ORDER BY unit_no");
    console.log("\n=== Final unit structure ===");
    for (const row of finalUnits.rows) {
      const qCount = await client.query("SELECT COUNT(*) as cnt FROM practice_questions WHERE unit_id = $1", [row.id]);
      console.log(`  unit_no=${row.unit_no}  id=${row.id}  "${row.unit_name}"  → ${qCount.rows[0].cnt} questions`);
    }

    await client.query("COMMIT");
    console.log("\n✅ Migration completed successfully!");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed, rolled back:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((e) => { console.error(e); process.exit(1); });
