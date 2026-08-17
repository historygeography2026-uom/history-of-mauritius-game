const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set in .env.local!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const ASSETS_DIR = path.join(__dirname, "..", "public", "practice-assets");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Map the extracted directories to their DB unit
const G6_UNITS = [
  { folder: "./extracted_g6_u3/Grade 6 book unit3", localUnit: 3, globalUnit: 8 },
  { folder: "./extracted_g6_u4/grade 6 book unit4", localUnit: 4, globalUnit: 9 },
  { folder: "./extracted_g6_u5/Pupil book Grade 6 Unit 5", localUnit: 5, globalUnit: 10 },
];

async function ingest() {
  const client = await pool.connect();

  try {
    const unitsRes = await client.query("SELECT id, unit_no FROM practice_units");
    const unitsMap = {};
    for (const row of unitsRes.rows) {
      unitsMap[row.unit_no] = row.id;
    }

    console.log("Found practice units:", unitsMap);

    for (const u of G6_UNITS) {
      console.log(`\n--- Processing Grade 6 Unit ${u.localUnit} (Global: ${u.globalUnit}) ---`);
      
      const unitId = unitsMap[u.globalUnit];
      if (!unitId) {
        console.warn(`Global Unit ${u.globalUnit} not found in database! Skipping.`);
        continue;
      }

      const folderPath = path.resolve(__dirname, '..', u.folder);
      if (!fs.existsSync(folderPath)) {
        console.warn(`Folder not found: ${folderPath}. Skipping.`);
        continue;
      }

      const unitAssetsDir = path.join(ASSETS_DIR, `g6-u${u.localUnit}`);
      ensureDir(unitAssetsDir);

      const files = fs.readdirSync(folderPath);
      let excelFile = files.find(f => f.endsWith(".xlsx"));
      if (!excelFile) {
        console.warn("No .xlsx file found in", folderPath);
        continue;
      }

      let imageMap = {};
      let imgCount = 0;

      // Copy images to public assets and map them
      for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
          const srcPath = path.join(folderPath, file);
          const destPath = path.join(unitAssetsDir, file);
          fs.copyFileSync(srcPath, destPath);

          const match = file.match(/pic\s*(\d+)/i);
          if (match) {
            const num = match[1];
            imageMap[num] = file;
          }
          imgCount++;
        }
      }

      console.log(`Extracted ${imgCount} images to ${unitAssetsDir}`);
      
      const workbook = xlsx.readFile(path.join(folderPath, excelFile));
      const firstSheet = workbook.SheetNames[0];
      const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet]);
      
      let inserted = 0;
      for (const row of excelData) {
        const keys = Object.keys(row);
        const data = {};
        for(let k of keys) {
            data[k.trim()] = row[k];
        }

        let rawQuestion = data["question"];
        if (!rawQuestion) continue;
        
        let question = "";
        let foundPicNumber = null;
        
        if (typeof rawQuestion === 'object' && rawQuestion.richText) {
           question = rawQuestion.richText.map(rt => rt.text).join('');
        } else {
           question = String(rawQuestion);
        }
        
        const picMatch = question.match(/pic\s*(\d+)/i);
        if (picMatch) {
           foundPicNumber = picMatch[1];
        }

        const subject = data["subject"] || "history";
        const level = data["level"] || 1;
        const qType = data["type"] || "mcq";
        
        const optA = data["optionA"];
        const optB = data["optionB"];
        const optC = data["optionC"];
        const optD = data["optionD"];
        const options = [];
        if (optA !== undefined) options.push(String(optA));
        if (optB !== undefined) options.push(String(optB));
        if (optC !== undefined) options.push(String(optC));
        if (optD !== undefined) options.push(String(optD));

        const correctAns = data["correctAnswer"] ? String(data["correctAnswer"]) : null;
        
        let timer = parseInt(data["timer"]);
        if (isNaN(timer)) timer = 30;

        let imageUrl = null;
        if (foundPicNumber && imageMap[foundPicNumber]) {
           imageUrl = `/practice-assets/g6-u${u.localUnit}/${imageMap[foundPicNumber]}`;
        }

        const checkRes = await client.query(
          "SELECT id FROM practice_questions WHERE unit_id = $1 AND question_text = $2",
          [unitId, question.trim()]
        );

        const answerData = {
          subject: subject.toLowerCase(),
          level: parseInt(level) || 1,
          time_limit: timer,
          options: options,
          correct_answer: correctAns,
        };

        if (checkRes.rows.length === 0) {
          await client.query(
            `INSERT INTO practice_questions 
            (unit_id, question_text, question_type, instruction, image_url, answer_data, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              unitId, 
              question.trim(), 
              qType.toLowerCase(), 
              "Select the correct answer", 
              imageUrl, 
              JSON.stringify(answerData),
              "00000000-0000-0000-0000-000000000000"
            ]
          );
          inserted++;
        }
      }
      
      console.log(`Successfully inserted ${inserted} new questions for Grade 6 Unit ${u.localUnit}.`);
    }

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

ingest().then(() => console.log("Done."));
