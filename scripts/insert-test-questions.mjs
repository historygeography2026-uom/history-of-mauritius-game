import { Pool } from 'pg';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_EXTERNAL,
  ssl: { rejectUnauthorized: false },
});

async function insertTestQuestions() {
  try {
    console.log('Inserting test questions...\n');

    // Get IDs
    const subjectRes = await pool.query("SELECT id FROM subjects WHERE name = 'history' LIMIT 1");
    const levelRes = await pool.query("SELECT id FROM levels WHERE level_number = 1 LIMIT 1");
    const mcqRes = await pool.query("SELECT id FROM question_types WHERE name = 'mcq' LIMIT 1");
    const fillRes = await pool.query("SELECT id FROM question_types WHERE name = 'fill' LIMIT 1");

    if (!subjectRes.rows[0] || !levelRes.rows[0] || !mcqRes.rows[0]) {
      console.error('Error: Required subjects, levels, or question types not found');
      process.exit(1);
    }

    const subject_id = subjectRes.rows[0].id;
    const level_id = levelRes.rows[0].id;
    const mcq_type_id = mcqRes.rows[0].id;
    const fill_type_id = fillRes.rows[0].id;

    // Insert MCQ Question
    const q1Res = await pool.query(
      `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
       VALUES ($1, $2, $3, $4, 30, 'admin')
       RETURNING id`,
      [subject_id, level_id, mcq_type_id, 'What is the capital of Mauritius?']
    );
    const q1_id = q1Res.rows[0].id;

    // Insert MCQ Options
    await pool.query(
      `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
       VALUES 
       ($1, 1, 'Port Louis', true),
       ($1, 2, 'Curepipe', false),
       ($1, 3, 'Vacoas', false),
       ($1, 4, 'Beau Bassin', false)`,
      [q1_id]
    );
    console.log('✓ Added MCQ question: What is the capital of Mauritius?');

    // Insert Fill-in-the-blank Question
    const q2Res = await pool.query(
      `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
       VALUES ($1, $2, $3, $4, 20, 'admin')
       RETURNING id`,
      [subject_id, level_id, fill_type_id, 'Mauritius gained independence in the year ______.']
    );
    const q2_id = q2Res.rows[0].id;

    // Insert Fill Answers
    await pool.query(
      `INSERT INTO fill_answers (question_id, answer_text)
       VALUES ($1, '1968')`,
      [q2_id]
    );
    console.log('✓ Added Fill question: Mauritius gained independence in the year ______.');

    // Insert another MCQ
    const q3Res = await pool.query(
      `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
       VALUES ($1, $2, $3, $4, 30, 'admin')
       RETURNING id`,
      [subject_id, level_id, mcq_type_id, 'Who was the first Prime Minister of Mauritius?']
    );
    const q3_id = q3Res.rows[0].id;

    await pool.query(
      `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
       VALUES 
       ($1, 1, 'Sir Seewoosagur Ramgoolam', true),
       ($1, 2, 'Paul Bérenger', false),
       ($1, 3, 'Anerood Jugnauth', false),
       ($1, 4, 'Navin Ramgoolam', false)`,
      [q3_id]
    );
    console.log('✓ Added MCQ question: Who was the first Prime Minister of Mauritius?');

    console.log('\n✨ Test questions inserted successfully!');
    console.log('Now visit: https://history-of-mauritius-game.onrender.com/game?subject=history&level=1');

  } catch (error) {
    console.error('Error inserting questions:', error.message);
  } finally {
    await pool.end();
  }
}

insertTestQuestions();
