const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, question_type, question_text, answer_data FROM practice_questions");
    console.log(`Checking ${res.rows.length} remaining questions...`);
    
    let issues = [];
    
    for (const q of res.rows) {
      const { id, question_type, question_text } = q;
      const answerData = typeof q.answer_data === 'string' ? JSON.parse(q.answer_data) : q.answer_data;
      
      if (!question_type) {
        issues.push({ id, type: 'missing_question_type', text: question_text });
        continue;
      }
      
      if (question_type === 'mcq') {
        if (!answerData.options || !Array.isArray(answerData.options) || answerData.options.length < 2) {
          issues.push({ id, type: 'mcq_invalid_options', text: question_text });
        } else {
          // Check if options are just 'A', 'B', 'C', 'D'
          let justLetters = answerData.options.every(o => ['A', 'B', 'C', 'D', 'E'].includes(String(o).toUpperCase().trim()));
          if (justLetters) {
             issues.push({ id, type: 'mcq_options_are_just_letters', text: question_text });
          }
          
          let hasEmptyText = false;
          let stringOptsCount = 0;
          let objOptsCount = 0;
          for (let o of answerData.options) {
             if (typeof o === 'string') {
                stringOptsCount++;
                if (!o.trim()) hasEmptyText = true;
             } else if (typeof o === 'object' && o !== null) {
                objOptsCount++;
                if (!o.text || !o.text.trim()) hasEmptyText = true;
             } else {
                hasEmptyText = true;
             }
          }
          if (hasEmptyText) {
             issues.push({ id, type: 'mcq_empty_option_text', text: question_text });
          }
          if (stringOptsCount > 0 && objOptsCount > 0) {
             issues.push({ id, type: 'mcq_mixed_options_format', text: question_text });
          }
        }
        
        let hasCorrect = false;
        if (typeof answerData.options[0] === 'string') {
           hasCorrect = !!answerData.correct_answer;
        } else {
           hasCorrect = answerData.options.some(o => o.is_correct);
        }
        
        if (!hasCorrect) {
           issues.push({ id, type: 'mcq_no_correct_answer', text: question_text });
        }
      } else if (question_type === 'matching') {
         if (!answerData.pairs || !Array.isArray(answerData.pairs) || answerData.pairs.length === 0) {
            issues.push({ id, type: 'matching_invalid_pairs', text: question_text });
         } else {
            for (let p of answerData.pairs) {
               if (!p.left || !p.right) {
                  issues.push({ id, type: 'matching_missing_side', text: question_text });
                  break;
               }
            }
         }
      } else if (question_type === 'fill') {
         if (!answerData.answers || !Array.isArray(answerData.answers) || answerData.answers.length === 0) {
            issues.push({ id, type: 'fill_missing_answers', text: question_text });
         }
      } else if (question_type === 'reorder') {
         if (!answerData.items || !Array.isArray(answerData.items) || answerData.items.length < 2) {
            issues.push({ id, type: 'reorder_missing_items', text: question_text });
         }
      } else if (question_type === 'truefalse') {
         if (answerData.correct_answer === undefined) {
            issues.push({ id, type: 'truefalse_missing_correct_answer', text: question_text });
         }
      }
    }
    
    if (issues.length === 0) {
       console.log("✅ All questions passed structural and option validation!");
    } else {
       console.log(`❌ Found ${issues.length} issues in remaining questions:`);
       console.table(issues);
    }
    
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
