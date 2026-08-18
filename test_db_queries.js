require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    let query = `
      SELECT 
        q.id, q.question_text, q.instruction, q.image_url, q.timer_seconds, 
        q.created_at, q.updated_at,
        s.name as subject, l.level_number as level, qt.name as question_type
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      JOIN levels l ON q.level_id = l.id
      JOIN question_types qt ON q.question_type_id = qt.id
      WHERE 1=1
    `;
    const result = await pool.query(query, []);
    console.log('Got', result.rows.length, 'questions');
    
    // Enrich each question with type-specific details
    const enrichedQuestions = await Promise.all(
      result.rows.map(async (q) => {
        const qType = q.question_type;
        let details = {};

        if (qType === 'mcq') {
          const opts = await pool.query(
            'SELECT option_text, is_correct, option_order FROM mcq_options WHERE question_id = $1 ORDER BY option_order',
            [q.id]
          );
          details.mcq_options = opts.rows;
        } else if (qType === 'matching') {
          const pairs = await pool.query(
            'SELECT left_item, right_item, pair_order FROM matching_pairs WHERE question_id = $1 ORDER BY pair_order',
            [q.id]
          );
          details.matching_pairs = pairs.rows;
        } else if (qType === 'fill') {
          const ans = await pool.query(
            'SELECT answer_text FROM fill_answers WHERE question_id = $1',
            [q.id]
          );
          details.fill_answers = ans.rows;
        } else if (qType === 'reorder') {
          const items = await pool.query(
            'SELECT item_text, item_order FROM reorder_items WHERE question_id = $1 ORDER BY item_order',
            [q.id]
          );
          details.reorder_items = items.rows;
        } else if (qType === 'truefalse') {
          const tf = await pool.query(
            'SELECT correct_answer FROM truefalse_answers WHERE question_id = $1',
            [q.id]
          );
          details.truefalse_answers = tf.rows;
        }

        return { ...q, ...details };
      })
    );
    console.log('Enriched successfully! First:', enrichedQuestions[0]);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    pool.end();
  }
}
run();
