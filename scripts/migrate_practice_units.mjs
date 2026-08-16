// Migration script: Restructure practice_units from 6 → 10 units (Grade 5 × 5 + Grade 6 × 5)
// Existing questions in old units 1,2,3 (Grade 6 content) → moved to new Grade 6 unit IDs
// Run with: node scripts/migrate_practice_units.mjs

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

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

    // Step 3: Map old unit_no → old unit_id for units that have questions
    // Old unit 1 (id=?) → Grade 6 Unit 1, Old unit 2 (id=?) → Grade 6 Unit 2, Old unit 3 (id=?) → Grade 6 Unit 3
    const oldUnitMap = {};
    for (const row of currentUnits.rows) {
      oldUnitMap[row.unit_no] = row.id;
    }
    console.log("Old unit_no → id map:", oldUnitMap);

    // Step 4: Drop the UNIQUE constraint on unit_no (if exists) so we can renumber
    try {
      await client.query("ALTER TABLE practice_units DROP CONSTRAINT IF EXISTS practice_units_unit_no_key");
      console.log("Dropped unique constraint on unit_no");
    } catch (e) {
      console.log("No unique constraint to drop (or already dropped)");
    }

    // Step 5: Temporarily set old units to high unit_no values to avoid conflicts
    for (const row of currentUnits.rows) {
      await client.query("UPDATE practice_units SET unit_no = $1 WHERE id = $2", [row.unit_no + 100, row.id]);
    }
    console.log("Temporarily renumbered old units to 100+");

    // Step 6: The new 10-unit structure
    const NEW_UNITS = [
      { unit_no: 1, unit_name: "Grade 5 Unit 1" },
      { unit_no: 2, unit_name: "Grade 5 Unit 2" },
      { unit_no: 3, unit_name: "Grade 5 Unit 3" },
      { unit_no: 4, unit_name: "Grade 5 Unit 4" },
      { unit_no: 5, unit_name: "Grade 5 Unit 5" },
      { unit_no: 6, unit_name: "Grade 6 Unit 1" },
      { unit_no: 7, unit_name: "Grade 6 Unit 2" },
      { unit_no: 8, unit_name: "Grade 6 Unit 3" },
      { unit_no: 9, unit_name: "Grade 6 Unit 4" },
      { unit_no: 10, unit_name: "Grade 6 Unit 5" },
    ];

    // Step 7: Rename existing old units to new Grade 6 positions
    // Old unit 1 (content = Grade 6 Unit 1) → unit_no 6
    // Old unit 2 (content = Grade 6 Unit 2) → unit_no 7
    // Old unit 3 (content = Grade 6 Unit 3) → unit_no 8
    if (oldUnitMap[1]) {
      await client.query("UPDATE practice_units SET unit_no = 6, unit_name = 'Grade 6 Unit 1' WHERE id = $1", [oldUnitMap[1]]);
      console.log(`Moved old unit 1 (id=${oldUnitMap[1]}) → unit_no 6 "Grade 6 Unit 1"`);
    }
    if (oldUnitMap[2]) {
      await client.query("UPDATE practice_units SET unit_no = 7, unit_name = 'Grade 6 Unit 2' WHERE id = $1", [oldUnitMap[2]]);
      console.log(`Moved old unit 2 (id=${oldUnitMap[2]}) → unit_no 7 "Grade 6 Unit 2"`);
    }
    if (oldUnitMap[3]) {
      await client.query("UPDATE practice_units SET unit_no = 8, unit_name = 'Grade 6 Unit 3' WHERE id = $1", [oldUnitMap[3]]);
      console.log(`Moved old unit 3 (id=${oldUnitMap[3]}) → unit_no 8 "Grade 6 Unit 3"`);
    }

    // Step 8: Handle remaining old units (4, 5, 6) → move to Grade 6 Unit 4, 5 or delete empty ones
    if (oldUnitMap[4]) {
      await client.query("UPDATE practice_units SET unit_no = 9, unit_name = 'Grade 6 Unit 4' WHERE id = $1", [oldUnitMap[4]]);
      console.log(`Moved old unit 4 (id=${oldUnitMap[4]}) → unit_no 9 "Grade 6 Unit 4"`);
    }
    if (oldUnitMap[5]) {
      await client.query("UPDATE practice_units SET unit_no = 10, unit_name = 'Grade 6 Unit 5' WHERE id = $1", [oldUnitMap[5]]);
      console.log(`Moved old unit 5 (id=${oldUnitMap[5]}) → unit_no 10 "Grade 6 Unit 5"`);
    }
    // Old unit 6 had no Grade 6 equivalent in the new structure — delete it if empty
    if (oldUnitMap[6]) {
      const hasQuestions = unitQuestionCounts.rows.find(r => Number(r.unit_id) === Number(oldUnitMap[6]));
      if (!hasQuestions || Number(hasQuestions.cnt) === 0) {
        await client.query("DELETE FROM practice_units WHERE id = $1", [oldUnitMap[6]]);
        console.log(`Deleted empty old unit 6 (id=${oldUnitMap[6]})`);
      } else {
        console.log(`WARNING: Old unit 6 has ${hasQuestions.cnt} questions — keeping it with temp unit_no`);
      }
    }

    // Step 9: Insert the 5 new Grade 5 units (unit_no 1-5)
    for (let i = 1; i <= 5; i++) {
      const unitDef = NEW_UNITS[i - 1];
      // Check if unit_no already taken (shouldn't be after our renumbering)
      const existing = await client.query("SELECT id FROM practice_units WHERE unit_no = $1", [unitDef.unit_no]);
      if (existing.rows.length === 0) {
        await client.query(
          "INSERT INTO practice_units (unit_no, unit_name) VALUES ($1, $2)",
          [unitDef.unit_no, unitDef.unit_name]
        );
        console.log(`Created new unit: unit_no ${unitDef.unit_no} "${unitDef.unit_name}"`);
      } else {
        console.log(`Unit_no ${unitDef.unit_no} already exists (id=${existing.rows[0].id}), updating name`);
        await client.query("UPDATE practice_units SET unit_name = $1 WHERE unit_no = $2", [unitDef.unit_name, unitDef.unit_no]);
      }
    }

    // Step 10: Re-add unique constraint
    await client.query("ALTER TABLE practice_units ADD CONSTRAINT practice_units_unit_no_key UNIQUE (unit_no)");
    console.log("Re-added unique constraint on unit_no");

    // Step 11: Verify final state
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

migrate().catch(() => process.exit(1));
