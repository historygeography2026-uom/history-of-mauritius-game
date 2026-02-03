-- ===========================
-- HISTORY LEVEL 1 QUESTIONS
-- ===========================

-- History Level 1 - MCQ 1: Independence Year
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 1, 1, 'Independence Year', 'What year did Mauritius gain independence?', 30);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, '1968', true FROM questions WHERE question_text = 'What year did Mauritius gain independence?' LIMIT 1
UNION ALL
SELECT id, 2, '1965', false FROM questions WHERE question_text = 'What year did Mauritius gain independence?' LIMIT 1
UNION ALL
SELECT id, 3, '1970', false FROM questions WHERE question_text = 'What year did Mauritius gain independence?' LIMIT 1
UNION ALL
SELECT id, 4, '1960', false FROM questions WHERE question_text = 'What year did Mauritius gain independence?' LIMIT 1;

-- History Level 1 - MCQ 2: Extinct Bird
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 1, 1, 'Extinct Bird', 'Which bird is extinct and was only found in Mauritius?', 25);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'Parrot', false FROM questions WHERE question_text = 'Which bird is extinct and was only found in Mauritius?' LIMIT 1
UNION ALL
SELECT id, 2, 'Dodo', true FROM questions WHERE question_text = 'Which bird is extinct and was only found in Mauritius?' LIMIT 1
UNION ALL
SELECT id, 3, 'Eagle', false FROM questions WHERE question_text = 'Which bird is extinct and was only found in Mauritius?' LIMIT 1
UNION ALL
SELECT id, 4, 'Falcon', false FROM questions WHERE question_text = 'Which bird is extinct and was only found in Mauritius?' LIMIT 1;

-- History Level 1 - Matching
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 1, 2, 'Match It!', 'Match the items related to Mauritius history', 40);

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
SELECT id, 1, 'Dodo Bird', 'Extinct animal from Mauritius' FROM questions WHERE question_text = 'Match the items related to Mauritius history' AND question_type_id = 2 LIMIT 1
UNION ALL
SELECT id, 2, 'Port Louis', 'Capital city of Mauritius' FROM questions WHERE question_text = 'Match the items related to Mauritius history' AND question_type_id = 2 LIMIT 1
UNION ALL
SELECT id, 3, '1968', 'Independence year' FROM questions WHERE question_text = 'Match the items related to Mauritius history' AND question_type_id = 2 LIMIT 1;

-- History Level 1 - Fill Blanks 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 1, 3, 'Fill the Blank', 'Mauritius gained independence in the year _______', 20);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, '1968' FROM questions WHERE question_text = 'Mauritius gained independence in the year _______' LIMIT 1;

-- History Level 1 - Fill Blanks 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 1, 3, 'Fill the Blank', 'The _______ is the capital of Mauritius', 20);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'Port Louis' FROM questions WHERE question_text = 'The _______ is the capital of Mauritius' LIMIT 1;

-- History Level 1 - Reorder
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 1, 4, 'Put in Order', 'Order the historical events chronologically', 45);

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
SELECT id, 1, 'Discovery by Arabs', 1 FROM questions WHERE question_text = 'Order the historical events chronologically' AND question_type_id = 4 LIMIT 1
UNION ALL
SELECT id, 2, 'Portuguese Arrival', 2 FROM questions WHERE question_text = 'Order the historical events chronologically' AND question_type_id = 4 LIMIT 1
UNION ALL
SELECT id, 3, 'Dutch Settlement', 3 FROM questions WHERE question_text = 'Order the historical events chronologically' AND question_type_id = 4 LIMIT 1
UNION ALL
SELECT id, 4, 'Independence', 4 FROM questions WHERE question_text = 'Order the historical events chronologically' AND question_type_id = 4 LIMIT 1;

-- History Level 1 - True/False 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 1, 5, 'True or False', 'Mauritius was colonized by the Portuguese', 15);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, true FROM questions WHERE question_text = 'Mauritius was colonized by the Portuguese' AND question_type_id = 5 LIMIT 1;

-- History Level 1 - True/False 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 1, 5, 'True or False', 'Mauritius gained independence in 1960', 15);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, false FROM questions WHERE question_text = 'Mauritius gained independence in 1960' AND question_type_id = 5 LIMIT 1;

-- ===========================
-- HISTORY LEVEL 2 QUESTIONS
-- ===========================

-- History Level 2 - MCQ 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 2, 1, 'First PM', 'Who was the first Prime Minister of independent Mauritius?', 35);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'Anerood Jugnauth', false FROM questions WHERE question_text = 'Who was the first Prime Minister of independent Mauritius?' LIMIT 1
UNION ALL
SELECT id, 2, 'Seewoosagur Ramgoolam', true FROM questions WHERE question_text = 'Who was the first Prime Minister of independent Mauritius?' LIMIT 1
UNION ALL
SELECT id, 3, 'Paul Bérenger', false FROM questions WHERE question_text = 'Who was the first Prime Minister of independent Mauritius?' LIMIT 1
UNION ALL
SELECT id, 4, 'Navin Ramgoolam', false FROM questions WHERE question_text = 'Who was the first Prime Minister of independent Mauritius?' LIMIT 1;

-- History Level 2 - MCQ 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 2, 1, 'Republic Year', 'In what year did Mauritius become a republic?', 30);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, '1990', false FROM questions WHERE question_text = 'In what year did Mauritius become a republic?' LIMIT 1
UNION ALL
SELECT id, 2, '1992', true FROM questions WHERE question_text = 'In what year did Mauritius become a republic?' LIMIT 1
UNION ALL
SELECT id, 3, '1995', false FROM questions WHERE question_text = 'In what year did Mauritius become a republic?' LIMIT 1
UNION ALL
SELECT id, 4, '1998', false FROM questions WHERE question_text = 'In what year did Mauritius become a republic?' LIMIT 1;

-- History Level 2 - Matching
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 2, 2, 'Match It!', 'Match cultural and historical items', 45);

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
SELECT id, 1, 'Sega', 'Traditional dance and music' FROM questions WHERE question_text = 'Match cultural and historical items' AND subject_id = 1 AND level_id = 2 LIMIT 1
UNION ALL
SELECT id, 2, 'Le Morne', 'Famous mountain in Mauritius' FROM questions WHERE question_text = 'Match cultural and historical items' AND subject_id = 1 AND level_id = 2 LIMIT 1
UNION ALL
SELECT id, 3, 'Sugar', 'Important crop' FROM questions WHERE question_text = 'Match cultural and historical items' AND subject_id = 1 AND level_id = 2 LIMIT 1;

-- History Level 2 - Fill 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 2, 3, 'Fill the Blank', 'Mauritius was named after Prince _______ of Orange', 25);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'Maurice' FROM questions WHERE question_text = 'Mauritius was named after Prince _______ of Orange' LIMIT 1;

-- History Level 2 - Fill 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 2, 3, 'Fill the Blank', 'Mauritius became a _______ in 1992', 25);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'republic' FROM questions WHERE question_text = 'Mauritius became a _______ in 1992' LIMIT 1;

-- History Level 2 - Reorder
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 2, 4, 'Put in Order', 'Order the major historical periods', 50);

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
SELECT id, 1, 'French Colonial Rule Begins', 1 FROM questions WHERE question_text = 'Order the major historical periods' AND subject_id = 1 AND level_id = 2 LIMIT 1
UNION ALL
SELECT id, 2, 'Slavery Period', 2 FROM questions WHERE question_text = 'Order the major historical periods' AND subject_id = 1 AND level_id = 2 LIMIT 1
UNION ALL
SELECT id, 3, 'British Conquest', 3 FROM questions WHERE question_text = 'Order the major historical periods' AND subject_id = 1 AND level_id = 2 LIMIT 1
UNION ALL
SELECT id, 4, 'Slavery Abolished', 4 FROM questions WHERE question_text = 'Order the major historical periods' AND subject_id = 1 AND level_id = 2 LIMIT 1
UNION ALL
SELECT id, 5, 'Independence', 5 FROM questions WHERE question_text = 'Order the major historical periods' AND subject_id = 1 AND level_id = 2 LIMIT 1;

-- History Level 2 - TF 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 2, 5, 'True or False', 'Mauritius became a republic in 1992', 20);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, true FROM questions WHERE question_text = 'Mauritius became a republic in 1992' AND question_type_id = 5 LIMIT 1;

-- History Level 2 - TF 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 2, 5, 'True or False', 'The Dutch were the first to establish permanent settlement in Mauritius', 20);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, true FROM questions WHERE question_text = 'The Dutch were the first to establish permanent settlement in Mauritius' AND question_type_id = 5 LIMIT 1;

-- ===========================
-- HISTORY LEVEL 3 QUESTIONS
-- ===========================

-- History Level 3 - MCQ 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 3, 1, 'Aapravasi Ghat', 'What is Aapravasi Ghat, a UNESCO World Heritage Site?', 40);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'A Mountain Peak', false FROM questions WHERE question_text = 'What is Aapravasi Ghat, a UNESCO World Heritage Site?' LIMIT 1
UNION ALL
SELECT id, 2, 'An Immigration Depot', true FROM questions WHERE question_text = 'What is Aapravasi Ghat, a UNESCO World Heritage Site?' LIMIT 1
UNION ALL
SELECT id, 3, 'A Battle Site', false FROM questions WHERE question_text = 'What is Aapravasi Ghat, a UNESCO World Heritage Site?' LIMIT 1
UNION ALL
SELECT id, 4, 'A Royal Palace', false FROM questions WHERE question_text = 'What is Aapravasi Ghat, a UNESCO World Heritage Site?' LIMIT 1;

-- History Level 3 - MCQ 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 3, 1, 'Dutch Settlement', 'Which colonial power established the first permanent settlement in 1638?', 35);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'French', false FROM questions WHERE question_text = 'Which colonial power established the first permanent settlement in 1638?' LIMIT 1
UNION ALL
SELECT id, 2, 'British', false FROM questions WHERE question_text = 'Which colonial power established the first permanent settlement in 1638?' LIMIT 1
UNION ALL
SELECT id, 3, 'Dutch', true FROM questions WHERE question_text = 'Which colonial power established the first permanent settlement in 1638?' LIMIT 1
UNION ALL
SELECT id, 4, 'Portuguese', false FROM questions WHERE question_text = 'Which colonial power established the first permanent settlement in 1638?' LIMIT 1;

-- History Level 3 - Matching
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 3, 2, 'Match It!', 'Match historical sites and events', 50);

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
SELECT id, 1, 'Aapravasi Ghat', 'UNESCO World Heritage Site' FROM questions WHERE question_text = 'Match historical sites and events' AND subject_id = 1 AND level_id = 3 LIMIT 1
UNION ALL
SELECT id, 2, '1638', 'Dutch settlement year' FROM questions WHERE question_text = 'Match historical sites and events' AND subject_id = 1 AND level_id = 3 LIMIT 1
UNION ALL
SELECT id, 3, 'Slavery', 'Historical practice abolished in 1835' FROM questions WHERE question_text = 'Match historical sites and events' AND subject_id = 1 AND level_id = 3 LIMIT 1;

-- History Level 3 - Fill 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 3, 3, 'Fill the Blank', 'The _______ was an indentured labor immigration depot and now a UNESCO World Heritage Site', 30);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'Aapravasi Ghat' FROM questions WHERE question_text = 'The _______ was an indentured labor immigration depot and now a UNESCO World Heritage Site' LIMIT 1;

-- History Level 3 - Fill 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 3, 3, 'Fill the Blank', 'In _______, the _______ established the first permanent European settlement in Mauritius', 35);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, '1638, Dutch' FROM questions WHERE question_text = 'In _______, the _______ established the first permanent European settlement in Mauritius' LIMIT 1;

-- History Level 3 - Reorder
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 3, 4, 'Put in Order', 'Order the chronological events of Mauritian history', 60);

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
SELECT id, 1, '1638 Dutch Settlement', 1 FROM questions WHERE question_text = 'Order the chronological events of Mauritian history' AND subject_id = 1 AND level_id = 3 LIMIT 1
UNION ALL
SELECT id, 2, '1715 French Arrival', 2 FROM questions WHERE question_text = 'Order the chronological events of Mauritian history' AND subject_id = 1 AND level_id = 3 LIMIT 1
UNION ALL
SELECT id, 3, '1810 British Conquest', 3 FROM questions WHERE question_text = 'Order the chronological events of Mauritian history' AND subject_id = 1 AND level_id = 3 LIMIT 1
UNION ALL
SELECT id, 4, '1835 Slavery Abolished', 4 FROM questions WHERE question_text = 'Order the chronological events of Mauritian history' AND subject_id = 1 AND level_id = 3 LIMIT 1
UNION ALL
SELECT id, 5, '1968 Independence', 5 FROM questions WHERE question_text = 'Order the chronological events of Mauritian history' AND subject_id = 1 AND level_id = 3 LIMIT 1
UNION ALL
SELECT id, 6, '1992 Republic Declared', 6 FROM questions WHERE question_text = 'Order the chronological events of Mauritian history' AND subject_id = 1 AND level_id = 3 LIMIT 1;

-- History Level 3 - TF 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 3, 5, 'True or False', 'Aapravasi Ghat is a UNESCO World Heritage Site', 25);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, true FROM questions WHERE question_text = 'Aapravasi Ghat is a UNESCO World Heritage Site' AND question_type_id = 5 LIMIT 1;

-- History Level 3 - TF 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (1, 3, 5, 'True or False', 'The British were the first colonial power to settle in Mauritius', 25);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, false FROM questions WHERE question_text = 'The British were the first colonial power to settle in Mauritius' AND question_type_id = 5 LIMIT 1;

-- ===========================
-- GEOGRAPHY LEVEL 1 QUESTIONS
-- ===========================

-- Geography Level 1 - MCQ 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 1, 1, 'Capital City', 'What is the capital of Mauritius?', 30);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'Port Louis', true FROM questions WHERE question_text = 'What is the capital of Mauritius?' AND subject_id = 2 LIMIT 1
UNION ALL
SELECT id, 2, 'Curepipe', false FROM questions WHERE question_text = 'What is the capital of Mauritius?' AND subject_id = 2 LIMIT 1
UNION ALL
SELECT id, 3, 'Rose Hill', false FROM questions WHERE question_text = 'What is the capital of Mauritius?' AND subject_id = 2 LIMIT 1
UNION ALL
SELECT id, 4, 'Vacoas', false FROM questions WHERE question_text = 'What is the capital of Mauritius?' AND subject_id = 2 LIMIT 1;

-- Geography Level 1 - MCQ 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 1, 1, 'Ocean Location', 'In which ocean is Mauritius located?', 25);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'Atlantic Ocean', false FROM questions WHERE question_text = 'In which ocean is Mauritius located?' LIMIT 1
UNION ALL
SELECT id, 2, 'Indian Ocean', true FROM questions WHERE question_text = 'In which ocean is Mauritius located?' LIMIT 1
UNION ALL
SELECT id, 3, 'Pacific Ocean', false FROM questions WHERE question_text = 'In which ocean is Mauritius located?' LIMIT 1
UNION ALL
SELECT id, 4, 'Arctic Ocean', false FROM questions WHERE question_text = 'In which ocean is Mauritius located?' LIMIT 1;

-- Geography Level 1 - Matching
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 1, 2, 'Match It!', 'Match geographical features', 40);

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
SELECT id, 1, 'Coral Reefs', 'Protection from waves' FROM questions WHERE question_text = 'Match geographical features' AND subject_id = 2 AND level_id = 1 LIMIT 1
UNION ALL
SELECT id, 2, 'Port Louis', 'Major harbor city' FROM questions WHERE question_text = 'Match geographical features' AND subject_id = 2 AND level_id = 1 LIMIT 1
UNION ALL
SELECT id, 3, 'Indian Ocean', 'Surrounding body of water' FROM questions WHERE question_text = 'Match geographical features' AND subject_id = 2 AND level_id = 1 LIMIT 1;

-- Geography Level 1 - Fill 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 1, 3, 'Fill the Blank', 'Mauritius is surrounded by the _______ Ocean', 20);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'Indian' FROM questions WHERE question_text = 'Mauritius is surrounded by the _______ Ocean' LIMIT 1;

-- Geography Level 1 - Fill 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 1, 3, 'Fill the Blank', 'The capital city is _______', 20);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'Port Louis' FROM questions WHERE question_text = 'The capital city is _______' LIMIT 1;

-- Geography Level 1 - Reorder
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 1, 4, 'Put in Order', 'Order islands by size', 45);

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
SELECT id, 1, 'Rodrigues', 1 FROM questions WHERE question_text = 'Order islands by size' AND subject_id = 2 AND level_id = 1 LIMIT 1
UNION ALL
SELECT id, 2, 'Mauritius', 2 FROM questions WHERE question_text = 'Order islands by size' AND subject_id = 2 AND level_id = 1 LIMIT 1;

-- Geography Level 1 - TF 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 1, 5, 'True or False', 'Mauritius is located in the Indian Ocean', 15);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, true FROM questions WHERE question_text = 'Mauritius is located in the Indian Ocean' AND question_type_id = 5 LIMIT 1;

-- Geography Level 1 - TF 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 1, 5, 'True or False', 'Port Louis is a small town', 15);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, false FROM questions WHERE question_text = 'Port Louis is a small town' AND question_type_id = 5 LIMIT 1;

-- ===========================
-- GEOGRAPHY LEVEL 2 QUESTIONS
-- ===========================

-- Geography Level 2 - MCQ 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 2, 1, 'Famous Site', 'Which site in Mauritius is famous for its colored sand?', 35);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'Chamarel', true FROM questions WHERE question_text = 'Which site in Mauritius is famous for its colored sand?' LIMIT 1
UNION ALL
SELECT id, 2, 'Black River', false FROM questions WHERE question_text = 'Which site in Mauritius is famous for its colored sand?' LIMIT 1
UNION ALL
SELECT id, 3, 'Grand Baie', false FROM questions WHERE question_text = 'Which site in Mauritius is famous for its colored sand?' LIMIT 1
UNION ALL
SELECT id, 4, 'Beau Bassin', false FROM questions WHERE question_text = 'Which site in Mauritius is famous for its colored sand?' LIMIT 1;

-- Geography Level 2 - MCQ 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 2, 1, 'Garden', 'What is the Pamplemousses Botanical Garden known for?', 30);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'Rose collection', false FROM questions WHERE question_text = 'What is the Pamplemousses Botanical Garden known for?' LIMIT 1
UNION ALL
SELECT id, 2, 'Water lilies', true FROM questions WHERE question_text = 'What is the Pamplemousses Botanical Garden known for?' LIMIT 1
UNION ALL
SELECT id, 3, 'Orchids', false FROM questions WHERE question_text = 'What is the Pamplemousses Botanical Garden known for?' LIMIT 1
UNION ALL
SELECT id, 4, 'Ferns', false FROM questions WHERE question_text = 'What is the Pamplemousses Botanical Garden known for?' LIMIT 1;

-- Geography Level 2 - Matching
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 2, 2, 'Match It!', 'Match natural landmarks', 45);

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
SELECT id, 1, 'Chamarel', 'Colored sand dunes' FROM questions WHERE question_text = 'Match natural landmarks' AND subject_id = 2 AND level_id = 2 LIMIT 1
UNION ALL
SELECT id, 2, 'Pamplemousses', 'Botanical garden' FROM questions WHERE question_text = 'Match natural landmarks' AND subject_id = 2 AND level_id = 2 LIMIT 1
UNION ALL
SELECT id, 3, 'Rodrigues', 'Island' FROM questions WHERE question_text = 'Match natural landmarks' AND subject_id = 2 AND level_id = 2 LIMIT 1;

-- Geography Level 2 - Fill 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 2, 3, 'Fill the Blank', 'Chamarel is famous for its _______ sand dunes', 25);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'colored' FROM questions WHERE question_text = 'Chamarel is famous for its _______ sand dunes' LIMIT 1;

-- Geography Level 2 - Fill 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 2, 3, 'Fill the Blank', 'The _______ Botanical Garden is a major tourist attraction', 25);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'Pamplemousses' FROM questions WHERE question_text = 'The _______ Botanical Garden is a major tourist attraction' LIMIT 1;

-- Geography Level 2 - Reorder
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 2, 4, 'Put in Order', 'Order regions by population', 50);

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
SELECT id, 1, 'Plaines Wilhems', 1 FROM questions WHERE question_text = 'Order regions by population' AND subject_id = 2 AND level_id = 2 LIMIT 1
UNION ALL
SELECT id, 2, 'Port Louis', 2 FROM questions WHERE question_text = 'Order regions by population' AND subject_id = 2 AND level_id = 2 LIMIT 1;

-- Geography Level 2 - TF 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 2, 5, 'True or False', 'Chamarel is known for its colored sand', 20);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, true FROM questions WHERE question_text = 'Chamarel is known for its colored sand' AND question_type_id = 5 LIMIT 1;

-- Geography Level 2 - TF 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 2, 5, 'True or False', 'Pamplemousses Garden is in the south', 20);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, false FROM questions WHERE question_text = 'Pamplemousses Garden is in the south' AND question_type_id = 5 LIMIT 1;

-- ===========================
-- GEOGRAPHY LEVEL 3 QUESTIONS
-- ===========================

-- Geography Level 3 - MCQ 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 3, 1, 'Plateau', 'What is the Central Plateau of Mauritius known for?', 40);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'Its elevation and coolness', true FROM questions WHERE question_text = 'What is the Central Plateau of Mauritius known for?' LIMIT 1
UNION ALL
SELECT id, 2, 'Its beaches', false FROM questions WHERE question_text = 'What is the Central Plateau of Mauritius known for?' LIMIT 1
UNION ALL
SELECT id, 3, 'Its forests', false FROM questions WHERE question_text = 'What is the Central Plateau of Mauritius known for?' LIMIT 1
UNION ALL
SELECT id, 4, 'Its caves', false FROM questions WHERE question_text = 'What is the Central Plateau of Mauritius known for?' LIMIT 1;

-- Geography Level 3 - MCQ 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 3, 1, 'Mountain Peak', 'What is the highest mountain in Mauritius?', 35);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'Piton de la Rivière Noire', true FROM questions WHERE question_text = 'What is the highest mountain in Mauritius?' LIMIT 1
UNION ALL
SELECT id, 2, 'Le Morne Brabant', false FROM questions WHERE question_text = 'What is the highest mountain in Mauritius?' LIMIT 1
UNION ALL
SELECT id, 3, 'Rempart Mountain', false FROM questions WHERE question_text = 'What is the highest mountain in Mauritius?' LIMIT 1
UNION ALL
SELECT id, 4, 'Piton du Milieu', false FROM questions WHERE question_text = 'What is the highest mountain in Mauritius?' LIMIT 1;

-- Geography Level 3 - Matching
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 3, 2, 'Match It!', 'Match geographical regions and features', 50);

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
SELECT id, 1, 'Central Plateau', 'High elevation region' FROM questions WHERE question_text = 'Match geographical regions and features' AND subject_id = 2 AND level_id = 3 LIMIT 1
UNION ALL
SELECT id, 2, 'Black River', 'National park' FROM questions WHERE question_text = 'Match geographical regions and features' AND subject_id = 2 AND level_id = 3 LIMIT 1
UNION ALL
SELECT id, 3, 'Piton de la Rivière Noire', 'Highest mountain' FROM questions WHERE question_text = 'Match geographical regions and features' AND subject_id = 2 AND level_id = 3 LIMIT 1;

-- Geography Level 3 - Fill 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 3, 3, 'Fill the Blank', 'The _______ is the highest mountain in Mauritius', 30);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'Piton de la Rivière Noire' FROM questions WHERE question_text = 'The _______ is the highest mountain in Mauritius' LIMIT 1;

-- Geography Level 3 - Fill 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 3, 3, 'Fill the Blank', 'The Black River is part of a national _______', 35);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'park' FROM questions WHERE question_text = 'The Black River is part of a national _______' LIMIT 1;

-- Geography Level 3 - Reorder
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 3, 4, 'Put in Order', 'Order mountains by height', 60);

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
SELECT id, 1, 'Le Morne Brabant', 1 FROM questions WHERE question_text = 'Order mountains by height' AND subject_id = 2 AND level_id = 3 LIMIT 1
UNION ALL
SELECT id, 2, 'Piton de la Rivière Noire', 2 FROM questions WHERE question_text = 'Order mountains by height' AND subject_id = 2 AND level_id = 3 LIMIT 1;

-- Geography Level 3 - TF 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 3, 5, 'True or False', 'Piton de la Rivière Noire is the highest mountain', 25);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, true FROM questions WHERE question_text = 'Piton de la Rivière Noire is the highest mountain' AND question_type_id = 5 LIMIT 1;

-- Geography Level 3 - TF 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (2, 3, 5, 'True or False', 'The Central Plateau is the lowest region', 25);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, false FROM questions WHERE question_text = 'The Central Plateau is the lowest region' AND question_type_id = 5 LIMIT 1;

-- ===========================
-- COMBINED LEVEL 1 QUESTIONS (Sample - Can be expanded)
-- ===========================

-- Combined Level 1 - MCQ 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (3, 1, 1, 'Capital', 'What is the capital of Mauritius?', 30);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, 'Port Louis', true FROM questions WHERE question_text = 'What is the capital of Mauritius?' AND subject_id = 3 LIMIT 1
UNION ALL
SELECT id, 2, 'Curepipe', false FROM questions WHERE question_text = 'What is the capital of Mauritius?' AND subject_id = 3 LIMIT 1
UNION ALL
SELECT id, 3, 'Rose Hill', false FROM questions WHERE question_text = 'What is the capital of Mauritius?' AND subject_id = 3 LIMIT 1
UNION ALL
SELECT id, 4, 'Vacoas', false FROM questions WHERE question_text = 'What is the capital of Mauritius?' AND subject_id = 3 LIMIT 1;

-- Combined Level 1 - MCQ 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (3, 1, 1, 'Independence', 'When did Mauritius gain independence?', 25);

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
SELECT id, 1, '1968', true FROM questions WHERE question_text = 'When did Mauritius gain independence?' LIMIT 1
UNION ALL
SELECT id, 2, '1965', false FROM questions WHERE question_text = 'When did Mauritius gain independence?' LIMIT 1
UNION ALL
SELECT id, 3, '1970', false FROM questions WHERE question_text = 'When did Mauritius gain independence?' LIMIT 1
UNION ALL
SELECT id, 4, '1960', false FROM questions WHERE question_text = 'When did Mauritius gain independence?' LIMIT 1;

-- Combined Level 1 - Matching
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (3, 1, 2, 'Match It!', 'Match Mauritian facts', 40);

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
SELECT id, 1, 'Dodo', 'Extinct bird' FROM questions WHERE question_text = 'Match Mauritian facts' AND subject_id = 3 AND level_id = 1 LIMIT 1
UNION ALL
SELECT id, 2, 'Port Louis', 'Capital city' FROM questions WHERE question_text = 'Match Mauritian facts' AND subject_id = 3 AND level_id = 1 LIMIT 1
UNION ALL
SELECT id, 3, '1968', 'Independence year' FROM questions WHERE question_text = 'Match Mauritian facts' AND subject_id = 3 AND level_id = 1 LIMIT 1;

-- Combined Level 1 - Fill 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (3, 1, 3, 'Fill the Blank', 'Mauritius gained independence in _______', 20);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, '1968' FROM questions WHERE question_text = 'Mauritius gained independence in _______' AND subject_id = 3 LIMIT 1;

-- Combined Level 1 - Fill 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (3, 1, 3, 'Fill the Blank', 'The _______ is the capital of Mauritius', 20);

INSERT INTO fill_answers (question_id, answer_text)
SELECT id, 'Port Louis' FROM questions WHERE question_text = 'The _______ is the capital of Mauritius' AND subject_id = 3 LIMIT 1;

-- Combined Level 1 - Reorder
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (3, 1, 4, 'Put in Order', 'Order events chronologically', 45);

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
SELECT id, 1, 'Dutch arrival', 1 FROM questions WHERE question_text = 'Order events chronologically' AND subject_id = 3 AND level_id = 1 LIMIT 1
UNION ALL
SELECT id, 2, 'French arrival', 2 FROM questions WHERE question_text = 'Order events chronologically' AND subject_id = 3 AND level_id = 1 LIMIT 1
UNION ALL
SELECT id, 3, 'Independence', 3 FROM questions WHERE question_text = 'Order events chronologically' AND subject_id = 3 AND level_id = 1 LIMIT 1;

-- Combined Level 1 - TF 1
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (3, 1, 5, 'True or False', 'Mauritius is in the Indian Ocean', 15);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, true FROM questions WHERE question_text = 'Mauritius is in the Indian Ocean' AND question_type_id = 5 LIMIT 1;

-- Combined Level 1 - TF 2
INSERT INTO questions (subject_id, level_id, question_type_id, display_title, question_text, timer_seconds)
VALUES (3, 1, 5, 'True or False', 'The Dodo still exists in Mauritius', 15);

INSERT INTO truefalse_answers (question_id, correct_answer)
SELECT id, false FROM questions WHERE question_text = 'The Dodo still exists in Mauritius' AND question_type_id = 5 LIMIT 1;

-- ===========================
-- SAMPLE LEADERBOARD DATA
-- ===========================

INSERT INTO leaderboard (player_name, subject_id, level_id, total_points, stars_earned, badge)
VALUES
('Aisha Ahmed', 1, 1, 250, 12, 'Star Scholar'),
('Ravi Patel', 1, 1, 230, 11, 'History Master'),
('Emma Wilson', 1, 1, 220, 10, 'Quick Learner'),
('Zara Khan', 2, 1, 260, 13, 'Geography Guru'),
('Lucas Silva', 2, 1, 240, 11, 'World Explorer'),
('Sophia Lee', 3, 1, 270, 13, 'All-Star Scholar'),
('Marco Rossi', 1, 2, 310, 15, 'History Champion'),
('Priya Sharma', 2, 2, 320, 16, 'Geography Ace'),
('Kai Tanaka', 3, 2, 330, 17, 'Ultimate Scholar'),
('Nina Perez', 1, 3, 380, 19, 'History Legend');
