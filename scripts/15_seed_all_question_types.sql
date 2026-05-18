-- ============================================================
-- Migration 15: Seed comprehensive questions of ALL 5 types
-- for every subject × level combination.
--
-- Types covered: mcq, matching, fill, reorder, truefalse
-- Subjects: history, geography
-- Levels: 1, 2, 3
--
-- Run this script once against the production database to
-- ensure every level has a full variety of question types.
-- Existing questions are NOT deleted – this only adds new ones.
-- ============================================================

-- ============================================================
-- HISTORY  –  LEVEL 1
-- ============================================================

-- ── MCQ ──────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='mcq'),'Who were the first Europeans to discover Mauritius?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'The Portuguese',true,1),((SELECT id FROM q),'The Dutch',false,2),((SELECT id FROM q),'The French',false,3),((SELECT id FROM q),'The British',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='mcq'),'In which year did Mauritius gain independence?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'1960',false,1),((SELECT id FROM q),'1965',false,2),((SELECT id FROM q),'1968',true,3),((SELECT id FROM q),'1972',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='mcq'),'What is the capital city of Mauritius?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Curepipe',false,1),((SELECT id FROM q),'Port Louis',true,2),((SELECT id FROM q),'Vacoas',false,3),((SELECT id FROM q),'Rose Hill',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='mcq'),'Which colonial power ruled Mauritius from 1810 until independence?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'France',false,1),((SELECT id FROM q),'The Netherlands',false,2),((SELECT id FROM q),'Britain',true,3),((SELECT id FROM q),'Portugal',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='mcq'),'The Dodo bird is the national symbol of Mauritius. When did it become extinct?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Late 1500s',false,1),((SELECT id FROM q),'Late 1600s',true,2),((SELECT id FROM q),'Early 1700s',false,3),((SELECT id FROM q),'Early 1800s',false,4);

-- ── MATCHING ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='matching'),'Match each colonial power with its period of rule in Mauritius',45,'Drag each flag on the left to the correct period on the right','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Dutch',      '1638 – 1710', 1),
  ((SELECT id FROM q),'French',     '1715 – 1810', 2),
  ((SELECT id FROM q),'British',    '1810 – 1968', 3),
  ((SELECT id FROM q),'Independent','1968 – present',4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='matching'),'Match each famous Mauritian landmark with its description',45,'Drag each landmark to its correct description','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Aapravasi Ghat', 'UNESCO indenture immigration site', 1),
  ((SELECT id FROM q),'Le Morne Brabant','UNESCO slave refuge mountain',       2),
  ((SELECT id FROM q),'Port Louis',      'Capital and main harbour city',      3),
  ((SELECT id FROM q),'Pamplemousses',   'Famous botanical garden',            4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='matching'),'Match each historical figure with their role',45,'Drag each person to their correct role','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Sir Seewoosagur Ramgoolam','First Prime Minister of Mauritius',1),
  ((SELECT id FROM q),'Mahé de La Bourdonnais',   'French Governor who built Port Louis',2),
  ((SELECT id FROM q),'Bernardin de Saint-Pierre', 'Author who wrote Paul et Virginie',3),
  ((SELECT id FROM q),'Rajiv Gandhi',              'Indian leader who visited Mauritius',4);

-- ── FILL IN THE BLANK ────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='fill'),'The _______ was the first European ship known to visit Mauritius, arriving in 1507.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Portuguese',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='fill'),'Mauritius gained independence on 12 March _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'1968',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='fill'),'The national bird of Mauritius, the _______, is now extinct.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Dodo',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='fill'),'The _______ Ghat in Port Louis is a UNESCO World Heritage Site that commemorates the arrival of indentured labourers.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Aapravasi',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='fill'),'The first Governor of the French colony of Mauritius was Mahé de La _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Bourdonnais',false);

-- ── REORDER (drag-and-drop chronology) ───────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='reorder'),'Put the following events in the correct chronological order',45,'Drag the events into the correct order from first to last','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Portuguese sailors first sight Mauritius',          1,1),
  ((SELECT id FROM q),'Dutch settlers arrive and name the island',         2,2),
  ((SELECT id FROM q),'French establish Port Louis as capital',            3,3),
  ((SELECT id FROM q),'British take control after Battle of Grand Port',   4,4),
  ((SELECT id FROM q),'Mauritius gains independence',                      5,5);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='reorder'),'Arrange the colonial rulers of Mauritius in the correct order',40,'Drag the rulers into chronological order','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Dutch rule',    1,1),
  ((SELECT id FROM q),'French rule',   2,2),
  ((SELECT id FROM q),'British rule',  3,3),
  ((SELECT id FROM q),'Independence',  4,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='reorder'),'Put these steps of indentured labour arrival in order',40,'Drag the steps into the correct order','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Slavery abolished in Mauritius',              1,1),
  ((SELECT id FROM q),'First indentured labourers arrive from India', 2,2),
  ((SELECT id FROM q),'Aapravasi Ghat built as reception depot',      3,3),
  ((SELECT id FROM q),'Indenture system ends',                        4,4);

-- ── TRUE / FALSE ─────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius was uninhabited before the arrival of European settlers.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='truefalse'),'The Dutch were the first Europeans to colonise Mauritius.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius gained independence in 1972.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='truefalse'),'The Aapravasi Ghat is a UNESCO World Heritage Site.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='truefalse'),'Sugar cane was the main crop grown by indentured labourers in Mauritius.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

-- ============================================================
-- HISTORY  –  LEVEL 2
-- ============================================================

-- ── MCQ ──────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='mcq'),'What was the name of Mauritius under French colonial rule?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Île de France',true,1),((SELECT id FROM q),'Île Maurice',false,2),((SELECT id FROM q),'Île Bourbon',false,3),((SELECT id FROM q),'Île Rodrigues',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='mcq'),'In which year did slavery officially end in Mauritius?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'1810',false,1),((SELECT id FROM q),'1833',true,2),((SELECT id FROM q),'1845',false,3),((SELECT id FROM q),'1900',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='mcq'),'Which UNESCO World Heritage Site in Mauritius is linked to the history of slavery?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Aapravasi Ghat',false,1),((SELECT id FROM q),'Le Morne Cultural Landscape',true,2),((SELECT id FROM q),'Pamplemousses Garden',false,3),((SELECT id FROM q),'Port Louis Waterfront',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='mcq'),'Which crop was the backbone of the Mauritian economy during colonial times?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Tea',false,1),((SELECT id FROM q),'Coffee',false,2),((SELECT id FROM q),'Sugar cane',true,3),((SELECT id FROM q),'Cotton',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='mcq'),'The traditional music and dance of Mauritius that originated from African slaves is called?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Reggae',false,1),((SELECT id FROM q),'Sega',true,2),((SELECT id FROM q),'Calypso',false,3),((SELECT id FROM q),'Bhojpuri',false,4);

-- ── MATCHING ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='matching'),'Match each historical event with its correct year',45,'Drag each event to its correct year','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Dutch settle in Mauritius',   '1638',1),
  ((SELECT id FROM q),'French take control',         '1715',2),
  ((SELECT id FROM q),'Slavery abolished',           '1835',3),
  ((SELECT id FROM q),'Mauritius independence',      '1968',4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='matching'),'Match each ethnic community with its origin',40,'Drag each community name to its correct origin','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Creole community',  'Descendants of African slaves',            1),
  ((SELECT id FROM q),'Indo-Mauritian',    'Descendants of Indian indentured labourers',2),
  ((SELECT id FROM q),'Sino-Mauritian',    'Descendants of Chinese traders',           3),
  ((SELECT id FROM q),'Franco-Mauritian',  'Descendants of French settlers',           4);

-- ── FILL ─────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='fill'),'Under French rule Mauritius was known as Île de _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'France',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='fill'),'The traditional Mauritian dance that has African origins is called _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Sega',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='fill'),'Slavery was officially abolished in Mauritius in _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'1835',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='fill'),'Le Morne Brabant is a UNESCO World Heritage Site linked to the history of _______ in Mauritius.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'slavery',false);

-- ── REORDER ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='reorder'),'Place these events about indentured labour in the correct order',45,'Drag the events into chronological order','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Abolition of slavery in Mauritius',              1,1),
  ((SELECT id FROM q),'First ship of Indian labourers arrives',          2,2),
  ((SELECT id FROM q),'Aapravasi Ghat opened as immigration depot',     3,3),
  ((SELECT id FROM q),'Over 450,000 indentured labourers have arrived', 4,4),
  ((SELECT id FROM q),'Indenture system formally abolished',             5,5);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='reorder'),'Arrange the development of sugar industry in Mauritius in order',40,'Drag the steps into the correct order','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'French introduce large-scale sugar cane farming',1,1),
  ((SELECT id FROM q),'Slaves work the sugar estates',                  2,2),
  ((SELECT id FROM q),'Indentured labourers replace freed slaves',      3,3),
  ((SELECT id FROM q),'Sugar becomes main export of Mauritius',        4,4);

-- ── TRUE / FALSE ─────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='truefalse'),'Under French rule, Mauritius was called Île de France.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='truefalse'),'Indentured labourers in Mauritius came mainly from China.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='truefalse'),'Le Morne Brabant is a UNESCO World Heritage Site.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='truefalse'),'Sega is a traditional dance that has French origins.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='truefalse'),'Sugar cane was one of the most important crops in colonial Mauritius.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

-- ============================================================
-- HISTORY  –  LEVEL 3
-- ============================================================

-- ── MCQ ──────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='mcq'),'What does "Aapravasi" mean in Hindi?',35,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Freedom fighter',false,1),((SELECT id FROM q),'Immigrant',true,2),((SELECT id FROM q),'Sugar worker',false,3),((SELECT id FROM q),'Slave',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='mcq'),'Which governor transformed Port Louis into a major trading port?',35,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Mahé de La Bourdonnais',true,1),((SELECT id FROM q),'William Farquhar',false,2),((SELECT id FROM q),'Count de Malartic',false,3),((SELECT id FROM q),'Sir John Pope Hennessy',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='mcq'),'In which year did Mauritius become a Republic?',35,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'1968',false,1),((SELECT id FROM q),'1978',false,2),((SELECT id FROM q),'1992',true,3),((SELECT id FROM q),'2000',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='mcq'),'How many UNESCO World Heritage Sites does Mauritius have?',35,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'1',false,1),((SELECT id FROM q),'2',true,2),((SELECT id FROM q),'3',false,3),((SELECT id FROM q),'4',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='mcq'),'Which organisation declared Le Morne Cultural Landscape a World Heritage Site?',35,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'African Union',false,1),((SELECT id FROM q),'Commonwealth',false,2),((SELECT id FROM q),'UNESCO',true,3),((SELECT id FROM q),'United Nations',false,4);

-- ── MATCHING ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='matching'),'Match each Mauritian leader with their achievement',45,'Drag each leader to their correct achievement','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Sir Seewoosagur Ramgoolam', 'Led Mauritius to independence in 1968',      1),
  ((SELECT id FROM q),'Sir Anerood Jugnauth',       'Became first President of the Republic',     2),
  ((SELECT id FROM q),'Paul Bérenger',              'First non-Hindu Prime Minister',             3),
  ((SELECT id FROM q),'Navin Ramgoolam',            'Son of the first PM, also served as PM',    4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='matching'),'Match each historical document or law with its significance',45,'Drag each law to its correct description','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Slavery Abolition Act 1833',   'Ended slavery in British colonies',           1),
  ((SELECT id FROM q),'Independence Constitution 1968','Established Mauritius as independent state', 2),
  ((SELECT id FROM q),'Republic Act 1992',            'Made Mauritius a Republic',                  3),
  ((SELECT id FROM q),'Labour Act',                   'Protected workers'' rights',                  4);

-- ── FILL ─────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='fill'),'Mauritius became a Republic in _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'1992',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='fill'),'The two UNESCO World Heritage Sites of Mauritius are Aapravasi Ghat and Le Morne _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Brabant',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='fill'),'Sir Seewoosagur _______ was the first Prime Minister of independent Mauritius.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Ramgoolam',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='fill'),'Under French rule, Mauritius was renamed Île de _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'France',false);

-- ── REORDER ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='reorder'),'Put the major milestones in Mauritius political history in order',50,'Drag the milestones from earliest to most recent','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'First elections under universal adult suffrage',  1,1),
  ((SELECT id FROM q),'Mauritius gains independence from Britain',       2,2),
  ((SELECT id FROM q),'Mauritius joins the United Nations',             3,3),
  ((SELECT id FROM q),'Mauritius becomes a Republic',                   4,4),
  ((SELECT id FROM q),'Mauritius joins the African Union',              5,5);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='reorder'),'Arrange the UNESCO Heritage Site inscription events in order',40,'Drag the inscriptions into chronological order','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Aapravasi Ghat nominated for UNESCO consideration',1,1),
  ((SELECT id FROM q),'Aapravasi Ghat inscribed as World Heritage Site', 2,2),
  ((SELECT id FROM q),'Le Morne nominated for UNESCO consideration',      3,3),
  ((SELECT id FROM q),'Le Morne inscribed as World Heritage Site',        4,4);

-- ── TRUE / FALSE ─────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius became a Republic in 1968.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='truefalse'),'Sir Seewoosagur Ramgoolam was the first Prime Minister of Mauritius.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius has three UNESCO World Heritage Sites.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='truefalse'),'The Dutch were the first to colonise Mauritius and stayed for over 200 years.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='history'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='truefalse'),'Mahé de La Bourdonnais developed Port Louis into a major harbour city.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

-- ============================================================
-- GEOGRAPHY  –  LEVEL 1
-- ============================================================

-- ── MCQ ──────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='mcq'),'In which ocean is Mauritius located?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Atlantic Ocean',false,1),((SELECT id FROM q),'Pacific Ocean',false,2),((SELECT id FROM q),'Indian Ocean',true,3),((SELECT id FROM q),'Arctic Ocean',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='mcq'),'What is the approximate area of Mauritius island?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'500 km²',false,1),((SELECT id FROM q),'1,865 km²',true,2),((SELECT id FROM q),'3,500 km²',false,3),((SELECT id FROM q),'5,000 km²',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='mcq'),'Which island is a dependency of Mauritius?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Réunion',false,1),((SELECT id FROM q),'Rodrigues',true,2),((SELECT id FROM q),'Comoros',false,3),((SELECT id FROM q),'Maldives',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='mcq'),'What type of island is Mauritius?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Continental island',false,1),((SELECT id FROM q),'Coral atoll',false,2),((SELECT id FROM q),'Volcanic island',true,3),((SELECT id FROM q),'Artificial island',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='mcq'),'Where is the Central Plateau of Mauritius located?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'In the north of the island',false,1),((SELECT id FROM q),'In the centre of the island',true,2),((SELECT id FROM q),'On the east coast',false,3),((SELECT id FROM q),'On the west coast',false,4);

-- ── MATCHING ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='matching'),'Match each island or territory to Mauritius',45,'Drag each island or territory to its correct relationship with Mauritius','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Rodrigues',         'Island dependency of Mauritius',1),
  ((SELECT id FROM q),'Agaléga',           'Remote outer island of Mauritius',2),
  ((SELECT id FROM q),'Cargados Carajos',  'Outer island group (St Brandon)',3),
  ((SELECT id FROM q),'Réunion',           'French overseas territory nearby',4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='matching'),'Match each geographic feature with its description',40,'Drag each feature to its correct description','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Central Plateau',   'Highland area in the centre of the island',1),
  ((SELECT id FROM q),'Black River Gorges','Largest national park and forest reserve', 2),
  ((SELECT id FROM q),'Grand Port',        'Largest natural bay in Mauritius',          3),
  ((SELECT id FROM q),'Mahébourg',         'Historic town on the south-east coast',    4);

-- ── FILL ─────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='fill'),'Mauritius is located in the _______ Ocean.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Indian',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='fill'),'The capital city of Mauritius is _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Port Louis',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='fill'),'The island dependency of Mauritius is called _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Rodrigues',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='fill'),'Mauritius is a _______ island, formed by volcanic activity.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'volcanic',false);

-- ── REORDER ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='reorder'),'Arrange the geographic regions of Mauritius from highest to lowest elevation',45,'Drag the regions from highest to lowest altitude','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Central Plateau (highest elevation)', 1,1),
  ((SELECT id FROM q),'Mountain ranges',                     2,2),
  ((SELECT id FROM q),'Coastal plains',                      3,3),
  ((SELECT id FROM q),'Sea level coastline (lowest)',         4,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='reorder'),'Order the following Mauritian cities from north to south',45,'Drag the cities from the northernmost to the southernmost','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Grand Baie (north)',    1,1),
  ((SELECT id FROM q),'Port Louis (north-west)',2,2),
  ((SELECT id FROM q),'Curepipe (centre)',      3,3),
  ((SELECT id FROM q),'Mahébourg (south-east)', 4,4);

-- ── TRUE / FALSE ─────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius is located in the Indian Ocean.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius shares a land border with Madagascar.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='truefalse'),'Rodrigues is a dependency of Mauritius.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius is a flat island with no mountains.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=1),(SELECT id FROM question_types WHERE name='truefalse'),'Port Louis is the capital city of Mauritius.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

-- ============================================================
-- GEOGRAPHY  –  LEVEL 2
-- ============================================================

-- ── MCQ ──────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='mcq'),'What is the highest peak in Mauritius?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Le Morne Brabant',false,1),((SELECT id FROM q),'Piton de la Petite Rivière Noire',true,2),((SELECT id FROM q),'Corps de Garde',false,3),((SELECT id FROM q),'Pouce Mountain',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='mcq'),'The Seven Coloured Earths is found in which district?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Pamplemousses',false,1),((SELECT id FROM q),'Grand Port',false,2),((SELECT id FROM q),'Savanne',true,3),((SELECT id FROM q),'Rivière du Rempart',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='mcq'),'How many districts does Mauritius have?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'7',false,1),((SELECT id FROM q),'9',true,2),((SELECT id FROM q),'12',false,3),((SELECT id FROM q),'5',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='mcq'),'Which nature reserve in Mauritius is famous for the Pink Pigeon and Echo Parakeet?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Pamplemousses Garden',false,1),((SELECT id FROM q),'Black River Gorges National Park',true,2),((SELECT id FROM q),'Ile aux Aigrettes',false,3),((SELECT id FROM q),'Casela Nature Park',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='mcq'),'The Pamplemousses Garden is officially known as?',30,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Royal Botanical Gardens',false,1),((SELECT id FROM q),'Sir Seewoosagur Ramgoolam National Botanical Garden',true,2),((SELECT id FROM q),'Mauritius National Garden',false,3),((SELECT id FROM q),'Le Jardin de France',false,4);

-- ── MATCHING ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='matching'),'Match each district of Mauritius with a feature it is known for',45,'Drag each district to its correct feature','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Pamplemousses', 'Home of the famous Botanical Garden',   1),
  ((SELECT id FROM q),'Savanne',       'Location of the Seven Coloured Earths', 2),
  ((SELECT id FROM q),'Rivière Noire', 'Highest mountain and national park',    3),
  ((SELECT id FROM q),'Grand Port',    'Site of the famous naval battle',        4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='matching'),'Match each Mauritian beach or coastal area with its description',45,'Drag each beach to its correct description','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Flic en Flac',    'Popular west coast beach near Wolmar',    1),
  ((SELECT id FROM q),'Belle Mare',      'Long white sand beach on the east coast', 2),
  ((SELECT id FROM q),'Le Morne',        'Iconic beach at the south-western tip',   3),
  ((SELECT id FROM q),'Blue Bay',        'Marine park in the south-east',           4);

-- ── FILL ─────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='fill'),'The highest mountain in Mauritius is Piton de la Petite Rivière _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Noire',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='fill'),'The Seven Coloured Earths is a geological feature found in the _______ district.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Savanne',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='fill'),'Mauritius has _______ administrative districts.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'9',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='fill'),'The largest national park in Mauritius is Black River _______ National Park.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'Gorges',false);

-- ── REORDER ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='reorder'),'Order the main land use zones of Mauritius from the coast going inland',45,'Drag the zones from the coast to the interior','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Sandy beaches and lagoon',           1,1),
  ((SELECT id FROM q),'Coastal lowlands and urban areas',   2,2),
  ((SELECT id FROM q),'Sugar cane fields on slopes',        3,3),
  ((SELECT id FROM q),'Central Plateau forests and towns',  4,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='reorder'),'Order these rivers of Mauritius from shortest to longest',40,'Drag the rivers in order from shortest to longest','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Rivière Sèche (shortest)',   1,1),
  ((SELECT id FROM q),'Rivière du Poste',            2,2),
  ((SELECT id FROM q),'Grand River South East',      3,3),
  ((SELECT id FROM q),'Grand River North West (longest)',4,4);

-- ── TRUE / FALSE ─────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius has 9 administrative districts.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='truefalse'),'The Seven Coloured Earths is found in the north of Mauritius.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='truefalse'),'The Black River Gorges is the largest national park in Mauritius.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='truefalse'),'Flic en Flac is a beach located on the east coast of Mauritius.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=2),(SELECT id FROM question_types WHERE name='truefalse'),'Piton de la Petite Rivière Noire is the highest mountain in Mauritius.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

-- ============================================================
-- GEOGRAPHY  –  LEVEL 3
-- ============================================================

-- ── MCQ ──────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='mcq'),'What is the approximate population of Mauritius?',35,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'500,000',false,1),((SELECT id FROM q),'1.3 million',true,2),((SELECT id FROM q),'5 million',false,3),((SELECT id FROM q),'200,000',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='mcq'),'Which type of climate does most of Mauritius experience?',35,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Desert climate',false,1),((SELECT id FROM q),'Tropical maritime climate',true,2),((SELECT id FROM q),'Temperate oceanic climate',false,3),((SELECT id FROM q),'Continental climate',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='mcq'),'Which side of Mauritius receives more rainfall due to the south-east trade winds?',35,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'The north',false,1),((SELECT id FROM q),'The west',false,2),((SELECT id FROM q),'The east and south-east',true,3),((SELECT id FROM q),'The centre only',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='mcq'),'What is the main environmental threat to Mauritius coral reefs?',35,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'Volcanic eruptions',false,1),((SELECT id FROM q),'Climate change and coral bleaching',true,2),((SELECT id FROM q),'Tidal waves',false,3),((SELECT id FROM q),'Oil drilling',false,4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='mcq'),'What is the Exclusive Economic Zone (EEZ) of Mauritius approximately?',35,'MES') RETURNING id)
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
  ((SELECT id FROM q),'50,000 km²',false,1),((SELECT id FROM q),'500,000 km²',false,2),((SELECT id FROM q),'2.3 million km²',true,3),((SELECT id FROM q),'10,000 km²',false,4);

-- ── MATCHING ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='matching'),'Match each environmental issue with its impact on Mauritius',45,'Drag each issue to its correct impact','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Climate change',        'Rising sea levels threatening coastal areas',1),
  ((SELECT id FROM q),'Deforestation',         'Loss of endemic species and biodiversity',   2),
  ((SELECT id FROM q),'Coral bleaching',       'Destruction of reef ecosystems',             3),
  ((SELECT id FROM q),'Invasive species',      'Threatening native flora and fauna',         4);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='matching'),'Match each economic sector with its contribution to Mauritius',45,'Drag each sector to its correct contribution','MES') RETURNING id)
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
  ((SELECT id FROM q),'Tourism',         'Major foreign exchange earner',                   1),
  ((SELECT id FROM q),'Sugar industry',  'Historical backbone of the economy',              2),
  ((SELECT id FROM q),'Financial sector','Growing offshore banking and services hub',       3),
  ((SELECT id FROM q),'ICT sector',      'Emerging digital and technology industry',        4);

-- ── FILL ─────────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='fill'),'The south-east _______ winds bring heavy rainfall to the eastern side of Mauritius.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'trade',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='fill'),'The Exclusive Economic Zone of Mauritius covers approximately 2.3 million _______ .',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'km²',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='fill'),'The tropical _______ season in Mauritius runs from November to April.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'cyclone',false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='fill'),'Mauritius has a _______ maritime climate, keeping temperatures warm all year round.',30,'MES') RETURNING id)
INSERT INTO fill_answers (question_id, answer_text, case_sensitive) VALUES ((SELECT id FROM q),'tropical',false);

-- ── REORDER ─────────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='reorder'),'Order the main economic sectors of Mauritius from oldest to most recent',50,'Drag the sectors from the oldest to the most recently developed','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Sugar cane agriculture (colonial era)',       1,1),
  ((SELECT id FROM q),'Textile and manufacturing industry (1970s)', 2,2),
  ((SELECT id FROM q),'Tourism development (1980s)',                3,3),
  ((SELECT id FROM q),'Financial services sector (1990s)',          4,4),
  ((SELECT id FROM q),'ICT and digital economy (2000s–present)',    5,5);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, instruction, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='reorder'),'Order these environmental conservation milestones in Mauritius from earliest to latest',45,'Drag the milestones into chronological order','MES') RETURNING id)
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
  ((SELECT id FROM q),'Last Dodo sighted – extinct by late 1600s',          1,1),
  ((SELECT id FROM q),'Black River Gorges declared a National Park (1994)', 2,2),
  ((SELECT id FROM q),'Blue Bay Marine Park established (2000)',             3,3),
  ((SELECT id FROM q),'Mauritius joins Paris Climate Agreement',             4,4);

-- ── TRUE / FALSE ─────────────────────────────────────────────
WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='truefalse'),'The east side of Mauritius receives more rainfall than the west side.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius is not at risk from cyclones.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='truefalse'),'Tourism is one of the main pillars of the Mauritius economy.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius has no coral reefs.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),false);

WITH q AS (INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds, created_by)
  VALUES ((SELECT id FROM subjects WHERE name='geography'),(SELECT id FROM levels WHERE level_number=3),(SELECT id FROM question_types WHERE name='truefalse'),'Mauritius has a tropical maritime climate.',25,'MES') RETURNING id)
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES ((SELECT id FROM q),true);
