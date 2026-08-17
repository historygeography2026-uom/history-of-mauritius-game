const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const AdmZip = require("adm-zip");
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

const DOWNLOADS_DIR = "C:\\Users\\Abdallah Peerally\\Downloads\\practice page";
const ASSETS_DIR = path.join(__dirname, "..", "public", "practice-assets");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function ingest() {
  const client = await pool.connect();

  try {
    // 1. Get units mapping
    const unitsRes = await client.query("SELECT id, unit_no FROM practice_units WHERE unit_no <= 5");
    const unitsMap = {};
    for (const row of unitsRes.rows) {
      unitsMap[row.unit_no] = row.id;
    }

    console.log("Found practice units:", unitsMap);

    for (let unitNo = 1; unitNo <= 5; unitNo++) {
      console.log(`\n--- Processing Grade 5 Unit ${unitNo} ---`);
      
      const unitId = unitsMap[unitNo];
      if (!unitId) {
        console.warn(`Unit ${unitNo} not found in database! Skipping.`);
        continue;
      }

      // Find Question Zip
      const qZipRegex = new RegExp(`Questions_Grade 5_\\s*Unit ${unitNo}_.*\\.zip$`);
      const files = fs.readdirSync(DOWNLOADS_DIR);
      const qZipFile = files.find(f => qZipRegex.test(f));
      
      if (!qZipFile) {
        console.warn(`Could not find questions zip for Unit ${unitNo}. Skipping.`);
        continue;
      }

      console.log(`Found questions zip: ${qZipFile}`);

      // Extract Questions
      const qZipPath = path.join(DOWNLOADS_DIR, qZipFile);
      const qZip = new AdmZip(qZipPath);
      const zipEntries = qZip.getEntries();
      
      let excelData = null;
      for (const entry of zipEntries) {
        if (entry.entryName.endsWith(".xlsx") && !entry.entryName.includes("~_")) {
          const buffer = entry.getData();
          const workbook = xlsx.read(buffer, { type: "buffer" });
          const firstSheet = workbook.SheetNames[0];
          excelData = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet]);
          console.log(`Extracted ${excelData.length} rows from ${entry.entryName}`);
          break;
        }
      }

      if (!excelData) {
        console.warn("No .xlsx file found inside the zip.");
        continue;
      }

      // Find Pictures Zip
      const pZipRegex = new RegExp(`Pictures for all exercises Unit ${unitNo}.*\\.zip$`);
      const pZipFile = files.find(f => pZipRegex.test(f));
      
      const unitAssetsDir = path.join(ASSETS_DIR, `g5-u${unitNo}`);
      ensureDir(unitAssetsDir);

      let imageMap = {}; // "image1" -> "image1.png"

      if (pZipFile) {
        console.log(`Found pictures zip: ${pZipFile}`);
        const pZipPath = path.join(DOWNLOADS_DIR, pZipFile);
        const pZip = new AdmZip(pZipPath);
        
        let docxBuffer = null;
        for (const entry of pZip.getEntries()) {
          if (entry.entryName.endsWith(".docx")) {
            docxBuffer = entry.getData();
            break;
          }
        }

        if (docxBuffer) {
          const docxZip = new AdmZip(docxBuffer);
          const docxEntries = docxZip.getEntries();
          let imgCount = 0;
          for (const entry of docxEntries) {
            if (entry.entryName.startsWith("word/media/")) {
              const filename = path.basename(entry.entryName);
              const destPath = path.join(unitAssetsDir, filename);
              fs.writeFileSync(destPath, entry.getData());
              
              // e.g. "image1.png" -> key "image1"
              const nameWithoutExt = path.parse(filename).name;
              imageMap[nameWithoutExt.toLowerCase()] = filename;
              imgCount++;
            }
          }
          console.log(`Extracted ${imgCount} images to ${unitAssetsDir}`);
        } else {
          console.warn("No .docx found inside pictures zip.");
        }
      } else {
        console.warn(`No pictures zip found for Unit ${unitNo}.`);
      }

      console.log(`Available images map:`, imageMap);

      // Insert Questions
      let inserted = 0;
      for (const row of excelData) {
        // Normalise keys by removing whitespace/newlines
        const keys = Object.keys(row);
        const data = {};
        for(let k of keys) {
            data[k.trim()] = row[k];
        }

        const question = data["question"];
        if (!question) continue;

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

        let imageNameStr = data["Name of Image"];
        let imageUrl = null;

        if (imageNameStr && typeof imageNameStr === "string") {
          // Expected format "Picture 1" or "Picture 12"
          const match = imageNameStr.match(/Picture\s*(\d+)/i);
          if (match) {
            const num = match[1];
            const imgKey = `image${num}`;
            const matchedFile = imageMap[imgKey];
            if (matchedFile) {
              imageUrl = `/practice-assets/g5-u${unitNo}/${matchedFile}`;
            } else {
              console.warn(`Row asks for Picture ${num}, but ${imgKey} not found in docx.`);
            }
          }
        }

        // Only insert if not already there to prevent duplicates in dev
        const checkRes = await client.query(
          "SELECT id FROM practice_questions WHERE unit_id = $1 AND question_text = $2",
          [unitId, question.trim()]
        );

        if (checkRes.rows.length === 0) {
          await client.query(
            `INSERT INTO practice_questions 
            (unit_id, question_text, question_type, subject, difficulty_level, image_url, options, correct_answer, time_limit, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              unitId, 
              question.trim(), 
              qType.toLowerCase(), 
              subject.toLowerCase(), 
              level, 
              imageUrl, 
              JSON.stringify(options), 
              correctAns, 
              timer, 
              "00000000-0000-0000-0000-000000000000" // system user
            ]
          );
          inserted++;
        }
      }
      
      console.log(`Successfully inserted ${inserted} new questions for Unit ${unitNo}.`);
    }

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

ingest().then(() => console.log("Done."));
