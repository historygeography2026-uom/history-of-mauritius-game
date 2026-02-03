-- Add MCQ options for existing questions
-- Question 1: What is the capital of Mauritius?
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
(1, 'Port Louis', true, 1),
(1, 'Curepipe', false, 2),
(1, 'Vacoas', false, 3),
(1, 'Rose Hill', false, 4);

-- Question 2: In what year did Mauritius gain independence?
INSERT INTO mcq_options (question_id, option_text, is_correct, option_order) VALUES
(2, '1968', true, 1),
(2, '1960', false, 2),
(2, '1975', false, 3),
(2, '1950', false, 4);

-- Add matching pairs for Question 3: Match the historical facts
INSERT INTO matching_pairs (question_id, left_item, right_item, pair_order) VALUES
(3, 'Dodo Bird', 'Extinct animal', 1),
(3, 'Port Louis', 'Capital city', 2),
(3, 'Sugar Cane', 'Important crop', 3),
(3, 'Le Morne', 'UNESCO mountain', 4);

-- Add fill answer for Question 4: The Dodo bird was found in ___
INSERT INTO fill_answers (question_id, answer_text) VALUES
(4, 'Mauritius');

-- Add reorder items for Question 5: Put in Order
INSERT INTO reorder_items (question_id, item_text, correct_position, item_order) VALUES
(5, 'Dutch arrive in Mauritius', 1, 1),
(5, 'French take control', 2, 2),
(5, 'British rule begins', 3, 3),
(5, 'Mauritius becomes independent', 4, 4);

-- Add true/false answer for Question 6: Mauritius gained independence in 1960
INSERT INTO truefalse_answers (question_id, correct_answer) VALUES
(6, false);
