-- Create RPC function to delete and insert question type-specific data
CREATE OR REPLACE FUNCTION delete_and_insert_question_data(
  p_question_id BIGINT,
  p_question_type TEXT,
  p_options TEXT[],
  p_pairs JSONB,
  p_answer TEXT,
  p_reorder_items TEXT[]
) RETURNS VOID AS $$
DECLARE
  i INT;
  pair JSONB;
  correct_option TEXT;
BEGIN
  -- Delete existing type-specific data for this question
  DELETE FROM mcq_options WHERE question_id = p_question_id;
  DELETE FROM matching_pairs WHERE question_id = p_question_id;
  DELETE FROM fill_answers WHERE question_id = p_question_id;
  DELETE FROM reorder_items WHERE question_id = p_question_id;
  DELETE FROM truefalse_answers WHERE question_id = p_question_id;

  -- Insert new data based on question type
  IF p_question_type = 'mcq' THEN
    -- For MCQ, p_options contains [A, B, C, D] and p_answer contains the correct letter (A/B/C/D)
    -- Or p_answer might be the correct option text itself
    FOR i IN 1..array_length(p_options, 1) LOOP
      INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
      VALUES (
        p_question_id, 
        i, 
        p_options[i],
        -- Check if answer matches option letter (A=1, B=2, etc) or the text itself
        (p_answer = chr(64 + i) OR p_answer = p_options[i])
      );
    END LOOP;
    
  ELSIF p_question_type = 'matching' THEN
    -- p_pairs is a JSONB array of {left, right} objects
    i := 1;
    FOR pair IN SELECT * FROM jsonb_array_elements(p_pairs) LOOP
      INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
      VALUES (p_question_id, i, pair->>'left', pair->>'right');
      i := i + 1;
    END LOOP;
    
  ELSIF p_question_type = 'fill' THEN
    -- p_answer contains the correct answer text
    INSERT INTO fill_answers (question_id, answer_text, case_sensitive)
    VALUES (p_question_id, p_answer, FALSE);
    
  ELSIF p_question_type = 'reorder' THEN
    -- p_reorder_items contains items in correct order
    FOR i IN 1..array_length(p_reorder_items, 1) LOOP
      INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
      VALUES (p_question_id, i, p_reorder_items[i], i);
    END LOOP;
    
  ELSIF p_question_type = 'truefalse' THEN
    -- p_answer should be 'true' or 'false' as text
    INSERT INTO truefalse_answers (question_id, correct_answer, explanation)
    VALUES (p_question_id, LOWER(p_answer) = 'true', NULL);
    
  END IF;
END;
$$ LANGUAGE plpgsql;
