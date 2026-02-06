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

async function populateAnswers() {
  try {
    console.log('🔄 Populating answer options based on question text...\n');

    // Get all MCQ questions
    const mcqQuestions = await pool.query(
      `SELECT id, question_text FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE name = 'mcq')`
    );

    let mcqCount = 0;
    for (const q of mcqQuestions.rows) {
      const text = q.question_text.toLowerCase();
      let options = [];
      let correctIndex = 0;

      // Detect question type and provide answers
      if (text.includes('capital')) {
        options = ['Port Louis', 'Curepipe', 'Vacoas', 'Beau Bassin'];
        correctIndex = 0;
      } else if (text.includes('independence') && text.includes('year')) {
        options = ['1968', '1960', '1970', '1965'];
        correctIndex = 0;
      } else if (text.includes('ocean')) {
        options = ['Indian Ocean', 'Atlantic Ocean', 'Pacific Ocean', 'Arctic Ocean'];
        correctIndex = 0;
      } else if (text.includes('dance')) {
        options = ['Sega', 'Moutya', 'Bollywood', 'Jazz'];
        correctIndex = 0;
      } else {
        // Skip questions without matching patterns
        continue;
      }

      // Insert options
      for (let i = 0; i < options.length; i++) {
        await pool.query(
          `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [q.id, i + 1, options[i], i === correctIndex]
        );
      }
      mcqCount++;
    }

    console.log(`✓ MCQ options populated: ${mcqCount} questions`);

    // Populate fill-in answers
    const fillQuestions = await pool.query(
      `SELECT id, question_text FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE name = 'fill')`
    );

    let fillCount = 0;
    for (const q of fillQuestions.rows) {
      const text = q.question_text.toLowerCase();
      let answer = '';

      if (text.includes('dodo')) {
        answer = 'Mauritius';
      } else if (text.includes('capital')) {
        answer = 'Port Louis';
      } else if (text.includes('independence')) {
        answer = '1968';
      } else {
        continue;
      }

      await pool.query(
        `INSERT INTO fill_answers (question_id, answer_text)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [q.id, answer]
      );
      fillCount++;
    }

    console.log(`✓ Fill-in answers populated: ${fillCount} questions`);

    // Populate true/false answers
    const tfQuestions = await pool.query(
      `SELECT id, question_text FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE name = 'truefalse')`
    );

    let tfCount = 0;
    for (const q of tfQuestions.rows) {
      const text = q.question_text.toLowerCase();
      let correct = false;
      let explanation = '';

      if (text.includes('1960')) {
        correct = false;
        explanation = 'Mauritius gained independence in 1968, not 1960';
      } else if (text.includes('sugar')) {
        correct = false;
        explanation = 'Sugar was very important in Mauritius economy';
      } else {
        correct = true;
        explanation = 'This statement is true';
      }

      await pool.query(
        `INSERT INTO truefalse_answers (question_id, correct_answer, explanation)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [q.id, correct, explanation]
      );
      tfCount++;
    }

    console.log(`✓ True/False answers populated: ${tfCount} questions`);

    console.log('\n✨ All answer options populated!');
    console.log('🎮 Test: https://history-of-mauritius-game.onrender.com/api/questions');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

populateAnswers();
