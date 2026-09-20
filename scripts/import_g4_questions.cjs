/**
 * Import Grade 4 practice questions from 6 Excel files.
 *
 * Each file has sheets: MCQ, TrueFalse, Fill, Matching, Reorder.
 * Columns use game format (subject/level/type/question/...).
 * This script maps each file to its correct Grade 4 unit_no (11-16).
 */

const ExcelJS = require("exceljs");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const G4_FILES = [
  { unitNo: 11, name: "Working with Maps",           file: "Grade 4 Unit 1 - Working with Maps/Grade 4 Unit 1.xlsx" },
  { unitNo: 12, name: "Our Natural Environment",     file: "Grade 4 Unit 2 - Our Natural Environment/Grade 4 Unit 2.xlsx" },
  { unitNo: 13, name: "Weather",                     file: "Grade 4 Unit 3 - Weather/Grade 4 Unit 3.xlsx" },
  { unitNo: 14, name: "Locality - Past and Present", file: "Grade 4 Unit 4 - Locality - Past and Present/Grade 4 Unit 4.xlsx" },
  { unitNo: 15, name: "People Living in our Locality", file: "Grade 4 Unit 5 - People Living in our Locality/Grade 4 Unit 5.xlsx" },
  { unitNo: 16, name: "Voyages of Discovery",        file: "Grade 4 Unit 6 - Voyages of Discovery/Grade 4 Unit 6.xlsx" },
];

const BASE_DIR = "C:/Users/Dell/Downloads/g4_extracted/";

function toStr(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "object" && val.richText) {
    return val.richText.map((r) => r.text).join("").trim();
  }
  if (typeof val === "object" && val.text) {
    return String(val.text).trim();
  }
  return String(val).trim();
}

function normalizeType(raw) {
  const t = toStr(raw).toLowerCase().replace(/[-_\s]+/g, "");
  if (t === "mcq" || t === "multiplechoice") return "mcq";
  if (t === "matching" || t === "match") return "matching";
  if (t === "fill" || t === "fillintheblanks" || t === "fillin") return "fill";
  if (t === "reorder" || t === "ordering" || t === "order") return "reorder";
  if (t === "truefalse" || t === "tf") return "truefalse";
  return null;
}

function buildAnswerData(type, row) {
  if (type === "mcq") {
    const optA = toStr(row.optionA || row.OptionA);
    const optB = toStr(row.optionB || row.OptionB);
    const optC = toStr(row.optionC || row.OptionC);
    const optD = toStr(row.optionD || row.OptionD);
    let correct = toStr(row.correctAnswer || row.CorrectAnswer || row.answer || row.Answer);
    const upper = correct.toUpperCase();
    if (upper === "A") correct = optA;
    else if (upper === "B") correct = optB;
    else if (upper === "C") correct = optC;
    else if (upper === "D") correct = optD;
    const options = [optA, optB, optC, optD]
      .filter((o) => o.length > 0)
      .map((text) => ({ text, is_correct: text.toLowerCase() === correct.toLowerCase() }));
    return { options };
  }
  if (type === "truefalse") {
    const rawVal = toStr(row.isTrue || row.answer || row.correctAnswer).toLowerCase();
    const isTrue = rawVal === "true" || rawVal === "t" || rawVal === "1" || rawVal === "yes";
    return { correct_answer: isTrue, explanation: "" };
  }
  if (type === "fill") {
    return { answers: [toStr(row.answer || row.correctAnswer)] };
  }
  if (type === "matching") {
    const pairs = [];
    for (let i = 1; i <= 4; i++) {
      const left = toStr(row[`leftItem${i}`]);
      const right = toStr(row[`rightItem${i}`]);
      if (left && right) pairs.push({ left, right });
    }
    return { pairs };
  }
  if (type === "reorder") {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const step = toStr(row[`step${i}`]);
      if (step) items.push({ text: step, correct_position: i });
    }
    return { items };
  }
  return {};
}

function parseSheet(worksheet) {
  const headers = [];
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell, colNum) => {
    headers[colNum] = toStr(cell.value);
  });

  const rows = [];
  for (let r = 2; r <= worksheet.rowCount; r++) {
    const excelRow = worksheet.getRow(r);
    const obj = {};
    let hasData = false;
    excelRow.eachCell({ includeEmpty: false }, (cell, colNum) => {
      if (headers[colNum]) {
        obj[headers[colNum]] = cell.value;
        hasData = true;
      }
    });
    if (hasData && toStr(obj.question || obj.Question).length > 0) {
      rows.push(obj);
    }
  }
  return rows;
}

async function importFile(unitNo, unitName, filePath) {
  // Get unit ID from DB
  const unitResult = await pool.query(
    "SELECT id FROM practice_units WHERE unit_no = $1 LIMIT 1",
    [unitNo]
  );
  if (unitResult.rows.length === 0) {
    console.error(`  ❌ Unit ${unitNo} (${unitName}) not found in DB!`);
    return { success: 0, errors: 0 };
  }
  const unitId = unitResult.rows[0].id;

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  let success = 0;
  let errors = 0;

  for (const ws of wb.worksheets) {
    if (ws.name.toLowerCase() === "instructions") continue;
    const rows = parseSheet(ws);
    console.log(`  Sheet "${ws.name}": ${rows.length} questions`);

    for (const row of rows) {
      try {
        const rawType = toStr(row.type || row.Type);
        const qType = normalizeType(rawType);
        if (!qType) {
          console.warn(`    ⚠️ Skipping unknown type: "${rawType}"`);
          errors++;
          continue;
        }

        const questionText = toStr(row.question || row.Question);
        if (!questionText) {
          errors++;
          continue;
        }

        const instruction = toStr(row.instruction || "");
        const imageUrl = toStr(row.imageUrl || row["Name of Image"] || "");
        const answerData = buildAnswerData(qType, row);

        await pool.query(
          `INSERT INTO practice_questions
             (unit_id, question_type, question_text, instruction, image_url, answer_data, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true)`,
          [
            unitId,
            qType,
            questionText,
            instruction || null,
            imageUrl || null,
            JSON.stringify(answerData),
          ]
        );
        success++;
      } catch (err) {
        console.error(`    ❌ Error inserting question: ${err.message}`);
        errors++;
      }
    }
  }

  return { success, errors };
}

async function main() {
  console.log("🚀 Starting Grade 4 Practice Questions Import\n");

  let totalSuccess = 0;
  let totalErrors = 0;

  for (const unit of G4_FILES) {
    const filePath = BASE_DIR + unit.file;
    console.log(`📖 Unit ${unit.unitNo - 10}: ${unit.name} (unit_no=${unit.unitNo})`);
    const { success, errors } = await importFile(unit.unitNo, unit.name, filePath);
    console.log(`  ✅ ${success} imported, ❌ ${errors} errors\n`);
    totalSuccess += success;
    totalErrors += errors;
  }

  console.log("═══════════════════════════════════════");
  console.log(`✅ Total imported: ${totalSuccess}`);
  console.log(`❌ Total errors: ${totalErrors}`);
  console.log("═══════════════════════════════════════");

  // Verify counts
  const result = await pool.query(`
    SELECT pu.unit_no, pu.unit_name,
           COUNT(pq.id) FILTER (WHERE pq.is_active = true) AS question_count
    FROM practice_units pu
    LEFT JOIN practice_questions pq ON pq.unit_id = pu.id
    WHERE pu.unit_no BETWEEN 11 AND 16
    GROUP BY pu.id
    ORDER BY pu.unit_no
  `);
  console.log("\n📊 Grade 4 Unit Question Counts:");
  result.rows.forEach((r) =>
    console.log(`  Unit ${r.unit_no} (${r.unit_name}): ${r.question_count} questions`)
  );

  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
