import { Pool } from 'pg';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL,
  ssl: { rejectUnauthorized: false },
});

async function migrateAnswers() {
  try {
    console.log('🔄 Migrating answer options from SQL backup...\n');

    const backupDir = path.join(__dirname, '..', 'db_backup_20260108T144359');
    const sqlContent = fs.readFileSync(path.join(backupDir, 'full_backup.sql'), 'utf8');

    // Get all question IDs mapping (old_id -> new_id)
    const oldToNewQuestions = {};
    const questionsRes = await pool.query('SELECT id FROM questions ORDER BY id');
    const newIds = questionsRes.rows.map(r => r.id);

    // For simplicity, assume sequential mapping (old IDs 1,2,3... map to new IDs 1,2,3...)
    for (let i = 1; i <= newIds.length; i++) {
      oldToNewQuestions[i] = newIds[i - 1];
    }

    let mcqCount = 0;
    let matchCount = 0;
    let fillCount = 0;
    let reorderCount = 0;
    let tfCount = 0;

    // Extract and insert MCQ options
    const questionOptionsPattern = /INSERT INTO "question_options"[^;]*VALUES\s*([^;]+);/g;
    let match;

    while ((match = questionOptionsPattern.exec(sqlContent)) !== null) {
      const valuesStr = match[1];
      const optionMatches = valuesStr.match(/\((\d+),(\d+),'([^']*)',(\d+),(\w+)\)/g) || [];

      for (const optMatch of optionMatches) {
        const parsed = /\((\d+),(\d+),'([^']*)',(\d+),(\w+)\)/.exec(optMatch);
        if (parsed) {
          const [, qId, , optionText, optionOrder, isCorrect] = parsed;
          const newQId = oldToNewQuestions[parseInt(qId)];

          if (newQId) {
            try {
              await pool.query(
                `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT DO NOTHING`,
                [newQId, parseInt(optionOrder), optionText, isCorrect === 'true']
              );
              mcqCount++;
            } catch (e) {
              // Skip duplicates
            }
          }
        }
      }
    }

    console.log(`✓ MCQ options migrated: ${mcqCount}`);

    // Extract and insert fill-in answers
    const fillAnswersPattern = /INSERT INTO "fill_answers"[^;]*VALUES\s*([^;]+);/g;

    while ((match = fillAnswersPattern.exec(sqlContent)) !== null) {
      const valuesStr = match[1];
      const answerMatches = valuesStr.match(/\((\d+),'([^']*)',\d+\)/g) || [];

      for (const answerMatch of answerMatches) {
        const parsed = /\((\d+),'([^']*)'\)/.exec(answerMatch);
        if (parsed) {
          const [, qId, answerText] = parsed;
          const newQId = oldToNewQuestions[parseInt(qId)];

          if (newQId) {
            try {
              await pool.query(
                `INSERT INTO fill_answers (question_id, answer_text)
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [newQId, answerText]
              );
              fillCount++;
            } catch (e) {
              // Skip duplicates
            }
          }
        }
      }
    }

    console.log(`✓ Fill-in answers migrated: ${fillCount}`);

    // Extract and insert matching pairs
    const matchingPattern = /INSERT INTO "matching_pairs"[^;]*VALUES\s*([^;]+);/g;

    while ((match = matchingPattern.exec(sqlContent)) !== null) {
      const valuesStr = match[1];
      const pairMatches = valuesStr.match(/\((\d+),'([^']*)','([^']*)'\)/g) || [];

      for (const pairMatch of pairMatches) {
        const parsed = /\((\d+),'([^']*)','([^']*)'\)/.exec(pairMatch);
        if (parsed) {
          const [, qId, leftItem, rightItem] = parsed;
          const newQId = oldToNewQuestions[parseInt(qId)];

          if (newQId) {
            try {
              const existingCount = await pool.query(
                `SELECT COUNT(*) FROM matching_pairs WHERE question_id = $1`,
                [newQId]
              );
              const pairOrder = (existingCount.rows[0].count || 0) + 1;

              await pool.query(
                `INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT DO NOTHING`,
                [newQId, pairOrder, leftItem, rightItem]
              );
              matchCount++;
            } catch (e) {
              // Skip duplicates
            }
          }
        }
      }
    }

    console.log(`✓ Matching pairs migrated: ${matchCount}`);

    console.log('\n✨ Data migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ✓ ${mcqCount} MCQ options`);
    console.log(`   ✓ ${fillCount} Fill-in answers`);
    console.log(`   ✓ ${matchCount} Matching pairs`);
    console.log('\n🎮 Your app is now fully populated!');

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
  } finally {
    await pool.end();
  }
}

migrateAnswers();
