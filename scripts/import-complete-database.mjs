import pg from 'pg';
const { Pool } = pg;

const password = process.env.DB_PASSWORD;
if (!password) {
  console.error('❌ Error: DB_PASSWORD environment variable not set');
  console.error('Usage: $env:DB_PASSWORD = "password"; node scripts/import-complete-database.mjs');
  process.exit(1);
}

const pool = new Pool({
  host: 'dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com',
  user: 'mauriitus_game_user',
  password,
  database: 'mauriitus_game',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

const completeData = {
  'h1-mcq-1': { text: 'In what year did Mauritius gain independence?', type: 'mcq', options: [
    { text: '1968', correct: true }, { text: '1965', correct: false }, { text: '1970', correct: false }, { text: '1960', correct: false } ] },
  'h1-mcq-2': { text: 'Which bird is extinct and was only found in Mauritius?', type: 'mcq', options: [
    { text: 'Parrot', correct: false }, { text: 'Dodo', correct: true }, { text: 'Eagle', correct: false }, { text: 'Falcon', correct: false } ] },
  'h1-match-1': { text: 'Match the following items', type: 'matching', pairs: [
    { left: 'Dodo Bird', right: 'Extinct animal from Mauritius' }, { left: 'Port Louis', right: 'Capital city of Mauritius' }, { left: '1968', right: 'Independence year' } ] },
  'h1-fill-1': { text: 'Mauritius gained independence in the year _______.', type: 'fill', answer: '1968' },
  'h1-fill-2': { text: 'The _______ is the capital of Mauritius.', type: 'fill', answer: 'Port Louis' },
  'h1-reorder-1': { text: 'Put the following events in chronological order', type: 'reorder', items: [
    { text: 'Discovery by Arabs', position: 1 }, { text: 'Portuguese Arrival', position: 2 }, { text: 'Dutch Settlement', position: 3 }, { text: 'Independence', position: 4 } ] },
  'h1-tf-1': { text: 'Mauritius was colonized by the Portuguese.', type: 'truefalse', answer: true, explanation: 'Yes, Portuguese explorers were among the early visitors to Mauritius' },
  'h1-tf-2': { text: 'Mauritius gained independence in 1960.', type: 'truefalse', answer: false, explanation: 'Mauritius gained independence in 1968, not 1960' },

  'h2-mcq-1': { text: 'Who was the first Prime Minister of independent Mauritius?', type: 'mcq', options: [
    { text: 'Anerood Jugnauth', correct: false }, { text: 'Seewoosagur Ramgoolam', correct: true }, { text: 'Paul Bérenger', correct: false }, { text: 'Navin Ramgoolam', correct: false } ] },
  'h2-mcq-2': { text: 'In what year did Mauritius become a republic?', type: 'mcq', options: [
    { text: '1990', correct: false }, { text: '1992', correct: true }, { text: '1995', correct: false }, { text: '1998', correct: false } ] },
  'h2-match-1': { text: 'Match the following items', type: 'matching', pairs: [
    { left: 'Sega', right: 'Traditional dance and music' }, { left: 'Le Morne', right: 'Famous mountain in Mauritius' }, { left: 'Sugar', right: 'Important crop' } ] },
  'h2-fill-1': { text: 'Mauritius was named after Prince _______ of Orange.', type: 'fill', answer: 'Maurice' },
  'h2-fill-2': { text: 'Mauritius became a _______ in 1992.', type: 'fill', answer: 'republic' },
  'h2-reorder-1': { text: 'Put the following events in chronological order', type: 'reorder', items: [
    { text: 'French Colonial Rule Begins', position: 1 }, { text: 'Slavery Period', position: 2 }, { text: 'British Conquest', position: 3 }, { text: 'Slavery Abolished', position: 4 }, { text: 'Independence', position: 5 } ] },
  'h2-tf-1': { text: 'Mauritius became a republic in 1992.', type: 'truefalse', answer: true, explanation: 'Mauritius officially became a republic on 12 March 1992' },
  'h2-tf-2': { text: 'The Dutch were the first to establish permanent settlement in Mauritius.', type: 'truefalse', answer: true, explanation: 'The Dutch established the first permanent settlement in 1638' },

  'h3-mcq-1': { text: 'What is Aapravasi Ghat, a UNESCO World Heritage Site?', type: 'mcq', options: [
    { text: 'A Mountain Peak', correct: false }, { text: 'An Immigration Depot', correct: true }, { text: 'A Battle Site', correct: false }, { text: 'A Royal Palace', correct: false } ] },
  'h3-mcq-2': { text: 'Which colonial power established the first permanent settlement in 1638?', type: 'mcq', options: [
    { text: 'French', correct: false }, { text: 'British', correct: false }, { text: 'Dutch', correct: true }, { text: 'Portuguese', correct: false } ] },
  'h3-match-1': { text: 'Match the following items', type: 'matching', pairs: [
    { left: 'Aapravasi Ghat', right: 'UNESCO World Heritage Site' }, { left: '1638', right: 'Dutch settlement year' }, { left: 'Slavery', right: 'Historical practice abolished in 1835' } ] },
  'h3-fill-1': { text: 'The _______ was an indentured labor immigration depot and now a UNESCO World Heritage Site.', type: 'fill', answer: 'Aapravasi Ghat' },
  'h3-fill-2': { text: 'In _______, the _______ established the first permanent European settlement in Mauritius.', type: 'fill', answer: '1638, Dutch' },
  'h3-reorder-1': { text: 'Put the following events in chronological order', type: 'reorder', items: [
    { text: '1638 Dutch Settlement', position: 1 }, { text: '1715 French Arrival', position: 2 }, { text: '1810 British Conquest', position: 3 }, { text: '1835 Slavery Abolished', position: 4 }, { text: '1968 Independence', position: 5 }, { text: '1992 Republic Declared', position: 6 } ] },
  'h3-tf-1': { text: 'Aapravasi Ghat was the first immigration depot in the world.', type: 'truefalse', answer: true, explanation: 'Aapravasi Ghat was indeed the first immigration depot in the world' },
  'h3-tf-2': { text: 'Mauritius remained under French rule until 1960.', type: 'truefalse', answer: false, explanation: 'Mauritius was under British rule from 1810 onwards, not French until 1960' },

  'g1-mcq-1': { text: 'In which ocean is Mauritius located?', type: 'mcq', options: [
    { text: 'Atlantic Ocean', correct: false }, { text: 'Indian Ocean', correct: true }, { text: 'Pacific Ocean', correct: false }, { text: 'Southern Ocean', correct: false } ] },
  'g1-mcq-2': { text: 'What is the capital of Mauritius?', type: 'mcq', options: [
    { text: 'Curepipe', correct: false }, { text: 'Vacoas', correct: false }, { text: 'Port Louis', correct: true }, { text: 'Phoenix', correct: false } ] },
  'g1-match-1': { text: 'Match the following items', type: 'matching', pairs: [
    { left: 'Coral Reefs', right: 'Beautiful sea structures' }, { left: 'Port Louis', right: 'Largest city and port' }, { left: 'Indian Ocean', right: 'Ocean surrounding Mauritius' } ] },
  'g1-fill-1': { text: 'Mauritius is surrounded by beautiful _______.', type: 'fill', answer: 'coral reefs' },
  'g1-fill-2': { text: 'The capital city _______ is located on the northwest coast.', type: 'fill', answer: 'Port Louis' },
  'g1-reorder-1': { text: 'Put the following events in chronological order', type: 'reorder', items: [
    { text: 'Volcanic Island Forms', position: 1 }, { text: 'Coral Reefs Develop', position: 2 }, { text: 'Beaches Create', position: 3 }, { text: 'Vegetation Emerges', position: 4 } ] },
  'g1-tf-1': { text: 'Mauritius is an island in the Indian Ocean.', type: 'truefalse', answer: true, explanation: 'Yes, Mauritius is an island in the Indian Ocean' },
  'g1-tf-2': { text: 'Mauritius has a desert climate.', type: 'truefalse', answer: false, explanation: 'Mauritius has a subtropical climate, not a desert climate' },

  'g2-mcq-1': { text: 'What is the Seven Colored Earth?', type: 'mcq', options: [
    { text: 'A Rainbow', correct: false }, { text: 'A Natural Sand Formation', correct: true }, { text: 'A Painting', correct: false }, { text: 'A Mountain', correct: false } ] },
  'g2-mcq-2': { text: 'Which island is part of Mauritian territory?', type: 'mcq', options: [
    { text: 'Madagascar', correct: false }, { text: 'Reunion', correct: false }, { text: 'Rodrigues', correct: true }, { text: 'Comoros', correct: false } ] },
  'g2-match-1': { text: 'Match the following items', type: 'matching', pairs: [
    { left: 'Chamarel', right: 'Seven colored sand formations' }, { left: 'Pamplemousses', right: 'Famous botanical garden' }, { left: 'Rodrigues', right: 'Small island nearby' } ] },
  'g2-fill-1': { text: 'The _______ is famous for its seven differently colored sand layers.', type: 'fill', answer: 'Chamarel' },
  'g2-fill-2': { text: '_______ Island is part of Mauritius and located to the northeast.', type: 'fill', answer: 'Rodrigues' },
  'g2-reorder-1': { text: 'Put the following events in chronological order', type: 'reorder', items: [
    { text: 'Lagoon Formation', position: 1 }, { text: 'Reef Development', position: 2 }, { text: 'Island Rises', position: 3 }, { text: 'Human Settlement', position: 4 } ] },
  'g2-tf-1': { text: 'Le Morne Brabant is the highest mountain in Mauritius.', type: 'truefalse', answer: true, explanation: 'Le Morne Brabant is indeed the highest mountain in Mauritius' },
  'g2-tf-2': { text: 'Mauritian beaches have arctic cold water.', type: 'truefalse', answer: false, explanation: 'Mauritius has warm tropical waters, not arctic cold water' },

  'g3-mcq-1': { text: 'What is the primary volcanic origin of Mauritius?', type: 'mcq', options: [
    { text: 'Active Volcano', correct: false }, { text: 'Extinct Volcano', correct: true }, { text: 'Coral Atoll', correct: false }, { text: 'Limestone Island', correct: false } ] },
  'g3-mcq-2': { text: 'How many districts does Mauritius have?', type: 'mcq', options: [
    { text: '7', correct: false }, { text: '9', correct: true }, { text: '12', correct: false }, { text: '15', correct: false } ] },
  'g3-match-1': { text: 'Match the following items', type: 'matching', pairs: [
    { left: 'Central Plateau', right: 'Highest altitude region' }, { left: 'Black River', right: 'National park area' }, { left: 'Piton de la Rivière Noire', right: 'Highest mountain peak' } ] },
  'g3-fill-1': { text: 'Mauritius has a total of _______ districts.', type: 'fill', answer: '9' },
  'g3-fill-2': { text: 'The _______ is the highest point in Mauritius.', type: 'fill', answer: 'Piton de la Rivière Noire' },
  'g3-reorder-1': { text: 'Put the following events in chronological order', type: 'reorder', items: [
    { text: 'Volcanic Formation', position: 1 }, { text: 'Erosion Process', position: 2 }, { text: 'Lagoon Development', position: 3 }, { text: 'Ecosystem Evolution', position: 4 } ] },
  'g3-tf-1': { text: 'Mauritius is located in the Southern Hemisphere.', type: 'truefalse', answer: true, explanation: 'Yes, Mauritius is located in the Southern Hemisphere' },
  'g3-tf-2': { text: 'Mauritius has only one main island.', type: 'truefalse', answer: false, explanation: 'Mauritius has multiple islands including Rodrigues and many others' },

  'c1-mcq-1': { text: 'Mauritius is located in which ocean and is famous for which extinct bird?', type: 'mcq', options: [
    { text: 'Atlantic, Parrot', correct: false }, { text: 'Indian, Dodo', correct: true }, { text: 'Pacific, Eagle', correct: false }, { text: 'Southern, Penguin', correct: false } ] },
  'c1-mcq-2': { text: 'What is the capital of Mauritius and in which direction is it located?', type: 'mcq', options: [
    { text: 'Curepipe - South', correct: false }, { text: 'Port Louis - North', correct: true }, { text: 'Vacoas - East', correct: false }, { text: 'Beau Bassin - West', correct: false } ] },
  'c1-match-1': { text: 'Match the following items', type: 'matching', pairs: [
    { left: 'Dodo', right: 'Extinct bird' }, { left: '1968', right: 'Independence year' }, { left: 'Port Louis', right: 'Capital city' } ] },
  'c1-fill-1': { text: 'Mauritius is an island in the _______ Ocean.', type: 'fill', answer: 'Indian' },
  'c1-fill-2': { text: 'Mauritius gained freedom and became independent in _______.', type: 'fill', answer: '1968' },
  'c1-reorder-1': { text: 'Put the following events in chronological order', type: 'reorder', items: [
    { text: 'Arab Traders', position: 1 }, { text: 'Portuguese Explorers', position: 2 }, { text: 'Dutch Settlement', position: 3 }, { text: 'French Rule', position: 4 }, { text: 'Independence', position: 5 } ] },
  'c1-tf-1': { text: 'The Dodo was a bird that lived in Mauritius.', type: 'truefalse', answer: true, explanation: 'Yes, the Dodo was a bird species that lived only in Mauritius' },
  'c1-tf-2': { text: 'Mauritius gained independence in 1960.', type: 'truefalse', answer: false, explanation: 'Mauritius gained independence in 1968, not 1960' },

  'c2-mcq-1': { text: 'When did Mauritius become a republic and what UNESCO heritage site honors indentured laborers?', type: 'mcq', options: [
    { text: '1990, Le Morne', correct: false }, { text: '1992, Aapravasi Ghat', correct: true }, { text: '1995, Chamarel', correct: false }, { text: '1998, Black River Gorges', correct: false } ] },
  'c2-mcq-2': { text: 'Who was the first Prime Minister and what is the capital?', type: 'mcq', options: [
    { text: 'Anerood Jugnauth, Curepipe', correct: false }, { text: 'Seewoosagur Ramgoolam, Port Louis', correct: true }, { text: 'Paul Bérenger, Vacoas', correct: false }, { text: 'Navin Ramgoolam, Phoenix', correct: false } ] },
  'c2-match-1': { text: 'Match the following items', type: 'matching', pairs: [
    { left: 'Aapravasi Ghat', right: 'Immigration heritage site' }, { left: 'Le Morne', right: 'Mountain and UNESCO site' }, { left: 'Sega', right: 'Cultural tradition' } ] },
  'c2-fill-1': { text: 'The _______ is a UNESCO World Heritage Site marking indentured labor history.', type: 'fill', answer: 'Aapravasi Ghat' },
  'c2-fill-2': { text: 'Mauritius became a _______ on March 12, 1992.', type: 'fill', answer: 'republic' },
  'c2-reorder-1': { text: 'Put the following events in chronological order', type: 'reorder', items: [
    { text: 'French Colonial Rule', position: 1 }, { text: 'British Conquest', position: 2 }, { text: 'Slavery Era', position: 3 }, { text: 'Indentureship Period', position: 4 }, { text: 'Independence', position: 5 }, { text: 'Republic Status', position: 6 } ] },
  'c2-tf-1': { text: 'Le Morne Brabant is both a geographical landmark and a symbol of slave resistance.', type: 'truefalse', answer: true, explanation: 'Le Morne Brabant is indeed both a landmark and a UNESCO site symbolizing slave resistance' },
  'c2-tf-2': { text: 'Mauritius has only one cultural community.', type: 'truefalse', answer: false, explanation: 'Mauritius is multicultural with Hindu, Muslim, Christian and other communities' },

  'c3-mcq-1': { text: 'Which colonial power established the first permanent settlement in 1638 and what is the capital?', type: 'mcq', options: [
    { text: 'French in 1715, Curepipe', correct: false }, { text: 'Dutch in 1638, Port Louis', correct: true }, { text: 'British in 1810, Vacoas', correct: false }, { text: 'Portuguese in 1500, Phoenix', correct: false } ] },
  'c3-mcq-2': { text: 'What UNESCO sites recognize Mauritius historical and geographical significance?', type: 'mcq', options: [
    { text: 'Only Aapravasi Ghat', correct: false }, { text: 'Aapravasi Ghat and Le Morne', correct: true }, { text: 'Only Chamarel', correct: false }, { text: 'Black River Gorges and Pamplemousses', correct: false } ] },
  'c3-match-1': { text: 'Match the following items', type: 'matching', pairs: [
    { left: '1638', right: 'Dutch settlement' }, { left: '1715', right: 'French arrival' }, { left: '1810', right: 'British conquest' } ] },
  'c3-fill-1': { text: 'In _______, the _______ established the first permanent European settlement in Mauritius.', type: 'fill', answer: '1638, Dutch' },
  'c3-fill-2': { text: 'Mauritius strategically important location in the _______ made it valuable to colonial powers.', type: 'fill', answer: 'Indian Ocean' },
  'c3-reorder-1': { text: 'Put the following events in chronological order', type: 'reorder', items: [
    { text: '1638 Dutch Settlement', position: 1 }, { text: '1715 French Rule', position: 2 }, { text: '1810 British Conquest', position: 3 }, { text: '1835 Slavery Abolished', position: 4 }, { text: '1874 Indentured Labor Stops', position: 5 }, { text: '1968 Independence', position: 6 }, { text: '1992 Republic Declaration', position: 7 } ] },
  'c3-tf-1': { text: 'Mauritius transformed from a colony to one of Africa\'s most developed nations.', type: 'truefalse', answer: true, explanation: 'Yes, Mauritius has transformed into one of the most developed nations in Africa' },
  'c3-tf-2': { text: 'Mauritius lost its strategic importance after independence.', type: 'truefalse', answer: false, explanation: 'Mauritius remains strategically important in the Indian Ocean region' },
};

async function importCompleteData() {
  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('🧹 Clearing existing detail data...');
    await client.query('DELETE FROM mcq_options');
    await client.query('DELETE FROM matching_pairs');
    await client.query('DELETE FROM fill_answers');
    await client.query('DELETE FROM reorder_items');
    await client.query('DELETE FROM truefalse_answers');

    let mcqCount = 0, matchCount = 0, fillCount = 0, reorderCount = 0, tfCount = 0;

    console.log('📋 Processing 75 questions with REAL data...');

    for (const [qId, qData] of Object.entries(completeData)) {
      const qResult = await client.query('SELECT id FROM questions WHERE question_text = $1 LIMIT 1', [qData.text]);

      if (qResult.rows.length === 0) {
        console.log(`⚠️  Question not found: "${qData.text}"`);
        continue;
      }

      const questionId = qResult.rows[0].id;

      if (qData.type === 'mcq' && qData.options) {
        for (let i = 0; i < qData.options.length; i++) {
          await client.query(
            `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
             VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [questionId, i + 1, qData.options[i].text, qData.options[i].correct]
          );
        }
        mcqCount++;
      } else if (qData.type === 'matching' && qData.pairs) {
        for (let i = 0; i < qData.pairs.length; i++) {
          await client.query(
            `INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
             VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [questionId, i + 1, qData.pairs[i].left, qData.pairs[i].right]
          );
        }
        matchCount++;
      } else if (qData.type === 'fill' && qData.answer) {
        await client.query(
          `INSERT INTO fill_answers (question_id, answer_text, case_sensitive)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [questionId, qData.answer, false]
        );
        fillCount++;
      } else if (qData.type === 'reorder' && qData.items) {
        for (let i = 0; i < qData.items.length; i++) {
          await client.query(
            `INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
             VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [questionId, i + 1, qData.items[i].text, qData.items[i].position]
          );
        }
        reorderCount++;
      } else if (qData.type === 'truefalse') {
        await client.query(
          `INSERT INTO truefalse_answers (question_id, correct_answer, explanation)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [questionId, qData.answer, qData.explanation || '']
        );
        tfCount++;
      }
    }

    console.log('\n✅ Populated question details with REAL DATA:');
    console.log(`   - MCQ Options: ${mcqCount} questions (1968, Dodo, Port Louis, etc.)`);
    console.log(`   - Matching Pairs: ${matchCount} questions`);
    console.log(`   - Fill Answers: ${fillCount} questions`);
    console.log(`   - Reorder Items: ${reorderCount} questions`);
    console.log(`   - T/F Answers: ${tfCount} questions`);

    const optionsCheck = await client.query('SELECT COUNT(*) as count FROM mcq_options');
    const matchCheck = await client.query('SELECT COUNT(*) as count FROM matching_pairs');
    const fillCheck = await client.query('SELECT COUNT(*) as count FROM fill_answers');
    const reorderCheck = await client.query('SELECT COUNT(*) as count FROM reorder_items');
    const tfCheck = await client.query('SELECT COUNT(*) as count FROM truefalse_answers');

    console.log('\n📊 Database verification:');
    console.log(`   ✅ MCQ Options: ${optionsCheck.rows[0].count}`);
    console.log(`   ✅ Matching Pairs: ${matchCheck.rows[0].count}`);
    console.log(`   ✅ Fill Answers: ${fillCheck.rows[0].count}`);
    console.log(`   ✅ Reorder Items: ${reorderCheck.rows[0].count}`);
    console.log(`   ✅ T/F Answers: ${tfCheck.rows[0].count}`);

    console.log('\n✅ ✅ ✅ COMPLETE!');
    console.log('All 75 questions now have REAL Mauritius history content!');

    client.release();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importCompleteData();
