/**
 * Import Grade 4 Science Practice Questions (Units 17-24)
 *
 * Books:
 * Book 1:
 * - Unit 17 (Living Things)
 * - Unit 18 (Air)
 * - Unit 19 (Plants)
 * - Unit 20 (Animals)
 *
 * Book 2:
 * - Unit 21 (Water)
 * - Unit 22 (Materials)
 * - Unit 23 (Energy)
 * - Unit 24 (Pollution of our Environment)
 *
 * Copies and maps all illustrations into public/uploads/
 * and inserts questions idempotently into practice_questions.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ExcelJS = require("exceljs");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Science Unit configurations
const SCIENCE_UNITS = [
  {
    unitNo: 17,
    unitTitle: "Living Things",
    xlsx: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit One (Livig things)/Part 1 Unit One (Livig things)/Questions_Grade_4_Science (Living things).xlsx",
    book: 1,
    imgDir: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit One (Livig things)/Part 1 Unit One (Livig things)"
  },
  {
    unitNo: 18,
    unitTitle: "Air",
    xlsx: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Two (Air)/Part 1 Unit Two (Air)/Questions_Grade_4_Science (Air).xlsx",
    book: 1,
    imgDir: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Two (Air)/Part 1 Unit Two (Air)"
  },
  {
    unitNo: 19,
    unitTitle: "Plants",
    xlsx: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Three (Plants)/Part 1 Unit Three (Plants)/Questions_Grade_4_Science (Plants).xlsx",
    book: 1,
    imgDir: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Three (Plants)/Part 1 Unit Three (Plants)"
  },
  {
    unitNo: 20,
    unitTitle: "Animals",
    xlsx: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Four (Animals)/Part 1 Unit Four (Animals)/Questions_Grade_4_Science (Animals).xlsx",
    book: 1,
    imgDir: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Four (Animals)/Part 1 Unit Four (Animals)"
  },
  {
    unitNo: 21,
    unitTitle: "Water",
    xlsx: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_Unit 5_Water/Questions_Grade_4_Science_Unit 5_Water.xlsx",
    book: 2,
    docx: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_Unit 5_Water/Pictures for Unit 5 Water.docx"
  },
  {
    unitNo: 22,
    unitTitle: "Materials",
    xlsx: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_Unit 6_ Materials/Questions_Grade_4_Science_ Unit 6_ Materials.xlsx",
    book: 2,
    docx: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_Unit 6_ Materials/Pictures for Unit 6 Materials.docx"
  },
  {
    unitNo: 23,
    unitTitle: "Energy",
    xlsx: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_Unit 7_Energy/Questions_Grade_4_Science_Unit 7_Energy.xlsx",
    book: 2,
    docx: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_Unit 7_Energy/Pictures for Unit 7 Energy.docx"
  },
  {
    unitNo: 24,
    unitTitle: "Pollution in our Environment",
    xlsx: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_ Unit 8_ Pollution of our environment/Questions_Grade_4_Science_ Unit 8_ Pollution of our environment.xlsx",
    book: 2,
    docx: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_ Unit 8_ Pollution of our environment/Pictures for Unit 8 Pollution in our environment.docx"
  }
];

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
  if (t === "fill" || t === "fillintheblanks" || t === "fillin" || t === "blank") return "fill";
  if (t === "reorder" || t === "ordering" || t === "order") return "reorder";
  if (t === "truefalse" || t === "tf") return "truefalse";
  return null;
}

// 1. Process Book 1 loose images
function prepareBook1Images() {
  console.log("📦 Copying Book 1 loose images to public/uploads/...");
  const mappings = [
    // Unit 17
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit One (Livig things)/Part 1 Unit One (Livig things)/Cow.png", dest: "g4-sci-u17-cow.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit One (Livig things)/Part 1 Unit One (Livig things)/crocodile.png", dest: "g4-sci-u17-crocodile.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit One (Livig things)/Part 1 Unit One (Livig things)/Food and animals.png", dest: "g4-sci-u17-food-and-animals.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit One (Livig things)/Part 1 Unit One (Livig things)/Hens.png", dest: "g4-sci-u17-hens.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit One (Livig things)/Part 1 Unit One (Livig things)/lizard.png", dest: "g4-sci-u17-lizard.png" },
    // Unit 18
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Two (Air)/Part 1 Unit Two (Air)/Octopus.png", dest: "g4-sci-u18-octopus.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Two (Air)/Part 1 Unit Two (Air)/perfume.png", dest: "g4-sci-u18-perfume.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Two (Air)/Part 1 Unit Two (Air)/Screenshot 2026-09-24 202943.png", dest: "g4-sci-u18-screenshot1.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Two (Air)/Part 1 Unit Two (Air)/Screenshot 2026-09-24 203216.png", dest: "g4-sci-u18-screenshot2.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Two (Air)/Part 1 Unit Two (Air)/Screenshot 2026-09-24 203332.png", dest: "g4-sci-u18-screenshot3.png" },
    // Unit 19
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Three (Plants)/Part 1 Unit Three (Plants)/banana tree.png", dest: "g4-sci-u19-banana-tree.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Three (Plants)/Part 1 Unit Three (Plants)/desert and cactus.png", dest: "g4-sci-u19-desert-cactus.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Three (Plants)/Part 1 Unit Three (Plants)/fruit.png", dest: "g4-sci-u19-fruit.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Three (Plants)/Part 1 Unit Three (Plants)/tea leaves.png", dest: "g4-sci-u19-tea-leaves.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Three (Plants)/Part 1 Unit Three (Plants)/trochetia.png", dest: "g4-sci-u19-trochetia.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Three (Plants)/Part 1 Unit Three (Plants)/wheat.png", dest: "g4-sci-u19-wheat.png" },
    // Unit 20
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Four (Animals)/Part 1 Unit Four (Animals)/fody.png", dest: "g4-sci-u20-fody.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Four (Animals)/Part 1 Unit Four (Animals)/fruit bat.png", dest: "g4-sci-u20-fruit-bat.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Four (Animals)/Part 1 Unit Four (Animals)/Monkey.png", dest: "g4-sci-u20-monkey.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Four (Animals)/Part 1 Unit Four (Animals)/pigeon.png", dest: "g4-sci-u20-pigeon.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Four (Animals)/Part 1 Unit Four (Animals)/pink pigeon.png", dest: "g4-sci-u20-pink-pigeon.png" },
    { src: "scripts/data/grade4_science/Grade 4 Science/Book 1/Part 1 Unit Four (Animals)/Part 1 Unit Four (Animals)/vet.png", dest: "g4-sci-u20-vet.png" },
  ];

  for (const m of mappings) {
    if (fs.existsSync(m.src)) {
      fs.copyFileSync(m.src, path.join(UPLOADS_DIR, m.dest));
    } else {
      console.warn("  Missing image src:", m.src);
    }
  }
}

// 2. Extract Book 2 DOCX images
function prepareBook2Images() {
  console.log("📦 Extracting Book 2 DOCX images to public/uploads/...");
  const docxList = [
    { unitNo: 21, path: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_Unit 5_Water/Pictures for Unit 5 Water.docx" },
    { unitNo: 22, path: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_Unit 6_ Materials/Pictures for Unit 6 Materials.docx" },
    { unitNo: 23, path: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_Unit 7_Energy/Pictures for Unit 7 Energy.docx" },
    { unitNo: 24, path: "scripts/data/grade4_science/Grade 4 Science/Book 2/Questions_Grade_4_Science_ Unit 8_ Pollution of our environment/Pictures for Unit 8 Pollution in our environment.docx" },
  ];

  for (const item of docxList) {
    const tmpDir = path.join(process.cwd(), "scripts", "data", `_tmp_docx_u${item.unitNo}`);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    try {
      execSync(`tar -xf "${item.path}" -C "${tmpDir}"`);
      const mediaDir = path.join(tmpDir, "word", "media");
      if (fs.existsSync(mediaDir)) {
        for (let i = 1; i <= 8; i++) {
          const imgFile = path.join(mediaDir, `image${i}.png`);
          if (fs.existsSync(imgFile)) {
            const destName = `g4-sci-u${item.unitNo}-pic${i}.png`;
            fs.copyFileSync(imgFile, path.join(UPLOADS_DIR, destName));
          }
        }
      }
    } catch (e) {
      console.error(`  Error extracting DOCX for unit ${item.unitNo}:`, e.message);
    } finally {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    }
  }
}

// 3. Resolve Image URL for a Question
function resolveImageUrl(unitNo, sheetType, rawImageVal, questionText) {
  const qLower = questionText.toLowerCase();

  // Book 2 logic (Units 21 - 24)
  if (unitNo >= 21 && unitNo <= 24) {
    const imgStr = toStr(rawImageVal).toLowerCase();
    if (!imgStr) return null;

    let picIdx = 1;
    if (imgStr.includes("2")) picIdx = 2;
    else if (imgStr.includes("3")) picIdx = 2; // fallback
    else picIdx = 1;

    let targetImgNo = 1;
    if (sheetType === "mcq") {
      targetImgNo = picIdx === 1 ? 1 : 2;
    } else if (sheetType === "truefalse") {
      targetImgNo = picIdx === 1 ? 3 : 4;
    } else if (sheetType === "fill") {
      targetImgNo = picIdx === 1 ? 5 : 6;
    } else if (sheetType === "matching") {
      targetImgNo = 7;
    } else if (sheetType === "reorder") {
      targetImgNo = 8;
    }

    return `/api/images/g4-sci-u${unitNo}-pic${targetImgNo}.png`;
  }

  // Book 1 logic (Units 17 - 20)
  if (unitNo === 17) {
    if (qLower.includes("hens") || qLower.includes("laying eggs") || qLower.includes("hen ")) return "/api/images/g4-sci-u17-hens.png";
    if (qLower.includes("cow")) return "/api/images/g4-sci-u17-cow.png";
    if (qLower.includes("crocodile")) return "/api/images/g4-sci-u17-crocodile.png";
    if (qLower.includes("lizard")) return "/api/images/g4-sci-u17-lizard.png";
    if (qLower.includes("food") && qLower.includes("animal")) return "/api/images/g4-sci-u17-food-and-animals.png";
  } else if (unitNo === 18) {
    if (qLower.includes("octopus")) return "/api/images/g4-sci-u18-octopus.png";
    if (qLower.includes("perfume")) return "/api/images/g4-sci-u18-perfume.png";
  } else if (unitNo === 19) {
    if (qLower.includes("banana") || qLower.includes("shows a ….......tree")) return "/api/images/g4-sci-u19-banana-tree.png";
    if (qLower.includes("desert") || qLower.includes("cactus")) return "/api/images/g4-sci-u19-desert-cactus.png";
    if (qLower.includes("trochetia")) return "/api/images/g4-sci-u19-trochetia.png";
    if (qLower.includes("tea")) return "/api/images/g4-sci-u19-tea-leaves.png";
    if (qLower.includes("wheat") || qLower.includes("cereals")) return "/api/images/g4-sci-u19-wheat.png";
    if (qLower.includes("fruit") && !qLower.includes("banana")) return "/api/images/g4-sci-u19-fruit.png";
  } else if (unitNo === 20) {
    if (qLower.includes("monkey")) return "/api/images/g4-sci-u20-monkey.png";
    if (qLower.includes("pink pigeon")) return "/api/images/g4-sci-u20-pink-pigeon.png";
    if (qLower.includes("vet")) return "/api/images/g4-sci-u20-vet.png";
    if (qLower.includes("fody")) return "/api/images/g4-sci-u20-fody.png";
    if (qLower.includes("fruit bat") || qLower.includes("bat")) return "/api/images/g4-sci-u20-fruit-bat.png";
    if (qLower.includes("pigeon") && !qLower.includes("pink")) return "/api/images/g4-sci-u20-pigeon.png";
  }

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
    const rawVal = toStr(row.isTrue ?? row.answer ?? row.correctAnswer).toLowerCase();
    const isTrue = rawVal === "true" || rawVal === "t" || rawVal === "1" || rawVal === "yes";
    return { correct_answer: isTrue, explanation: "" };
  }
  if (type === "fill") {
    return { answers: [toStr(row.answer || row.Answer || row.correctAnswer)] };
  }
  if (type === "matching") {
    const pairs = [];
    for (let i = 1; i <= 4; i++) {
      const left = toStr(row[`leftItem${i}`] || row[`leftitem${i}`]);
      const right = toStr(row[`rightItem${i}`] || row[`rightitem${i}`]);
      if (left && right) pairs.push({ left, right });
    }
    return { pairs };
  }
  if (type === "reorder") {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const step = toStr(row[`step${i}`] || row[`Step${i}`]);
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

    if (hasData) {
      // Normalize 'question' column if header was named 'the' (as in Unit 5 Water)
      const qText = toStr(obj.question || obj.Question || obj.the || obj[" the "] || obj["The"]);
      obj._resolvedQuestion = qText;
      rows.push(obj);
    }
  }
  return rows;
}

async function importUnit(unitDef) {
  const { unitNo, unitTitle, xlsx } = unitDef;

  // 1. Get unit ID from database
  const unitResult = await pool.query(
    "SELECT id FROM practice_units WHERE unit_no = $1 LIMIT 1",
    [unitNo]
  );
  if (unitResult.rows.length === 0) {
    throw new Error(`Unit ${unitNo} (${unitTitle}) not found in practice_units table!`);
  }
  const unitId = unitResult.rows[0].id;

  // 2. Clear existing questions for idempotence
  await pool.query("DELETE FROM practice_questions WHERE unit_id = $1", [unitId]);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xlsx);

  let success = 0;
  let skipped = 0;

  for (const ws of wb.worksheets) {
    if (ws.name.toLowerCase() === "instructions") continue;
    const rawRows = parseSheet(ws);
    console.log(`    Sheet "${ws.name}": ${rawRows.length} rows`);

    for (const row of rawRows) {
      try {
        let rawType = toStr(row.type || row.Type);
        if (!rawType) {
          const sName = ws.name.toLowerCase();
          if (sName.includes("mcq")) rawType = "mcq";
          else if (sName.includes("true") || sName.includes("false")) rawType = "truefalse";
          else if (sName.includes("fill")) rawType = "fill";
          else if (sName.includes("match")) rawType = "matching";
          else if (sName.includes("reorder") || sName.includes("order")) rawType = "reorder";
        }
        const qType = normalizeType(rawType);
        if (!qType) {
          skipped++;
          continue;
        }

        let questionText = row._resolvedQuestion;

        // Special handling for matching & reorder where question is omitted in sheet
        if (!questionText && qType === "matching") {
          questionText = "Match the following pairs";
        } else if (!questionText && qType === "reorder") {
          const s1 = toStr(row.step1 || row.Step1);
          if (!s1) {
            // empty placeholder row
            skipped++;
            continue;
          }
          questionText = "Arrange the following in chronological order";
        }

        if (!questionText) {
          skipped++;
          continue;
        }

        const rawImg = toStr(row["Name of Image"] || row.imageUrl || row.image_url || "");
        const imageUrl = resolveImageUrl(unitNo, qType, rawImg, questionText);
        const instruction = toStr(row.instruction || "");
        const answerData = buildAnswerData(qType, row);

        // Validation per question type
        if (qType === "mcq" && (!answerData.options || answerData.options.length < 2)) {
          skipped++;
          continue;
        }
        if (qType === "matching" && (!answerData.pairs || answerData.pairs.length === 0)) {
          skipped++;
          continue;
        }
        if (qType === "reorder" && (!answerData.items || answerData.items.length < 2)) {
          skipped++;
          continue;
        }

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
        console.error(`      ❌ Error inserting: ${err.message}`);
        skipped++;
      }
    }
  }

  return { success, skipped };
}

async function main() {
  console.log("🚀 Starting Grade 4 Science Import (Units 17-24)\n");

  // Step A: Prepare Images
  prepareBook1Images();
  prepareBook2Images();
  console.log("✅ All images extracted and copied to public/uploads/\n");

  // Step B: Import Questions
  let totalImported = 0;
  for (const u of SCIENCE_UNITS) {
    console.log(`📘 Importing Unit ${u.unitNo}: ${u.unitTitle} (Science Unit ${u.unitNo - 16})...`);
    const { success, skipped } = await importUnit(u);
    console.log(`    ✅ ${success} imported, ${skipped} skipped\n`);
    totalImported += success;
  }

  console.log("═══════════════════════════════════════");
  console.log(`🎉 Total Grade 4 Science questions imported: ${totalImported}`);
  console.log("═══════════════════════════════════════\n");

  // Step C: Verify in Database
  const stats = await pool.query(`
    SELECT pu.unit_no, pu.unit_name,
           COUNT(pq.id) FILTER (WHERE pq.is_active = true) AS total_questions,
           COUNT(pq.id) FILTER (WHERE pq.question_type = 'mcq') AS mcq,
           COUNT(pq.id) FILTER (WHERE pq.question_type = 'truefalse') AS truefalse,
           COUNT(pq.id) FILTER (WHERE pq.question_type = 'fill') AS fill,
           COUNT(pq.id) FILTER (WHERE pq.question_type = 'matching') AS matching,
           COUNT(pq.id) FILTER (WHERE pq.question_type = 'reorder') AS reorder,
           COUNT(pq.id) FILTER (WHERE pq.image_url IS NOT NULL) AS with_image
    FROM practice_units pu
    LEFT JOIN practice_questions pq ON pq.unit_id = pu.id
    WHERE pu.unit_no BETWEEN 17 AND 24
    GROUP BY pu.id
    ORDER BY pu.unit_no
  `);

  console.table(stats.rows);
  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
