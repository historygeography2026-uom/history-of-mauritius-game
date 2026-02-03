-- Fixed subject names to use lowercase to match base data
INSERT INTO questions (subject_id, level_id, question_type_id, question_text, timer_seconds) VALUES
-- History Level 1 Questions
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='mcq'), 'What is the capital of Mauritius?', 30),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='mcq'), 'In what year did Mauritius gain independence?', 30),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='matching'), 'Match the historical facts', 40),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='fill'), 'The Dodo bird was found in ___', 25),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='reorder'), 'Put in Order', 45),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='truefalse'), 'Mauritius gained independence in 1960', 20),

-- History Level 2 Questions
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='mcq'), 'What traditional dance is famous in Mauritius?', 30),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='mcq'), 'Which year saw the arrival of the French in Mauritius?', 30),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='matching'), 'Match cultural and historical sites', 40),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='fill'), 'Le Morne Brabant is a ___ mountain', 25),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='reorder'), 'Put historical periods in order', 45),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='truefalse'), 'Sugar was never important in Mauritius', 20),

-- History Level 3 Questions
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='mcq'), 'What is the Aapravasi Ghat?', 35),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='mcq'), 'In what year did the Dutch settle?', 35),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='matching'), 'Match advanced historical facts', 40),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='fill'), 'The ___ arrived in 1638', 25),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='reorder'), 'Colonial periods in order', 45),
((SELECT id FROM subjects WHERE name='history'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='truefalse'), 'Mauritius was inhabited before European settlement', 20),

-- Geography Level 1 Questions  
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='mcq'), 'In which ocean is Mauritius located?', 30),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='mcq'), 'What is the capital of Mauritius?', 30),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='matching'), 'Match geography basics', 40),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='fill'), 'Mauritius is surrounded by the ___ Ocean', 25),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='reorder'), 'Geographic hierarchy', 45),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='truefalse'), 'Mauritius is in the Pacific Ocean', 20),

-- Geography Level 2 Questions
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='mcq'), 'What is the Seven Colored Earth?', 30),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='mcq'), 'Where is the Seven Colored Earth located?', 30),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='matching'), 'Match geographic landmarks', 40),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='fill'), 'The Seven Colored Earth is in ___', 25),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='reorder'), 'Geographic regions', 45),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='truefalse'), 'The Pamplemousses is an ancient temple', 20),

-- Geography Level 3 Questions
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='mcq'), 'What is the highest mountain?', 35),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='mcq'), 'Which area has the Central Plateau?', 35),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='matching'), 'Match advanced geography', 40),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='fill'), 'The ___ is the main geographic plateau', 25),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='reorder'), 'Landscape types', 45),
((SELECT id FROM subjects WHERE name='geography'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='truefalse'), 'Mauritius has no mountains', 20),

-- Combined Level 1 Questions
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='mcq'), 'Mauritius is in the ___ Ocean and gained independence in ___', 30),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='mcq'), 'What is unique about the Dodo bird?', 30),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='matching'), 'Match combined facts', 40),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='fill'), '___ is the capital in the Indian Ocean', 25),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='reorder'), 'Historical timeline', 45),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=1), (SELECT id FROM question_types WHERE name='truefalse'), 'Mauritius is a large continent', 20),

-- Combined Level 2 Questions
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='mcq'), 'Aapravasi Ghat and Le Morne are UNESCO sites', 30),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='mcq'), 'What connects history and geography?', 30),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='matching'), 'Match history and geography', 40),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='fill'), 'Sega is a traditional ___ of Mauritius', 25),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='reorder'), 'Development timeline', 45),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=2), (SELECT id FROM question_types WHERE name='truefalse'), 'Mauritius has diverse landscapes', 20),

-- Combined Level 3 Questions
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='mcq'), 'The Dutch settlement in 1638 shaped geography', 35),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='mcq'), 'UNESCO heritage and island identity', 35),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='matching'), 'Match complex history-geography', 40),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='fill'), 'Colonial periods shaped ___ and culture', 25),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='reorder'), 'Complex timeline', 45),
((SELECT id FROM subjects WHERE name='combined'), (SELECT id FROM levels WHERE level_number=3), (SELECT id FROM question_types WHERE name='truefalse'), 'Island history defines modern Mauritius', 20);
