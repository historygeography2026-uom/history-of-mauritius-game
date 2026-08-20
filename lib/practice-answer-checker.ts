/**
 * Practice Mode — Answer Checker
 *
 * Server-side answer evaluation for all 5 question types.
 * Used by /api/practice/answer to determine correctness.
 *
 * answer_data shapes (stored in practice_questions.answer_data JSONB):
 *   mcq:       { options: [{ text, is_correct }] }
 *   matching:  { pairs: [{ left, right }] }
 *   fill:      { answers: [string] }
 *   reorder:   { items: [{ text, correct_position }] }
 *   truefalse: { correct_answer: boolean }
 */

export type QuestionType = "mcq" | "matching" | "fill" | "reorder" | "truefalse"

export interface CheckResult {
  is_correct: boolean
  correct_answer: any // returned to student for learning
}

/**
 * Evaluate a student's answer against the correct answer data.
 *
 * @param questionType  - one of the 5 supported types
 * @param answerData    - the correct answer payload from practice_questions.answer_data
 * @param studentAnswer - whatever the student submitted (varies by type)
 * @returns CheckResult with correctness and the correct answer for feedback
 */
export function checkAnswer(
  questionType: QuestionType,
  answerData: any,
  studentAnswer: any
): CheckResult {
  switch (questionType) {
    case "mcq":
      return checkMcq(answerData, studentAnswer)
    case "matching":
      return checkMatching(answerData, studentAnswer)
    case "fill":
      return checkFill(answerData, studentAnswer)
    case "reorder":
      return checkReorder(answerData, studentAnswer)
    case "truefalse":
      return checkTrueFalse(answerData, studentAnswer)
    default:
      return { is_correct: false, correct_answer: null }
  }
}

/**
 * MCQ: student submits the index (0-based) of the selected option.
 * answerData.options = [{ text, is_correct }, ...]
 */
function checkMcq(answerData: any, studentAnswer: any): CheckResult {
  const options = answerData?.options
  if (!Array.isArray(options)) {
    return { is_correct: false, correct_answer: null }
  }

  let correctText = ""
  
  // Support both legacy [{text, is_correct}] and new ["opt1", "opt2"] formats
  if (typeof options[0] === "string") {
    // New format (from Excel): correct_answer is stored at the root of answerData
    correctText = String(answerData.correct_answer || "").trim()
  } else {
    // Legacy format: correct_answer is embedded in the object array
    const correctIndex = options.findIndex((o: any) => o.is_correct)
    if (correctIndex >= 0) {
      correctText = String(options[correctIndex]?.text || "").trim()
    }
  }

  // studentAnswer can be the option text (string) or an index (number)
  let isCorrect = false
  if (typeof studentAnswer === "string") {
    // Check if the student answer exactly matches the correct text
    if (correctText.toLowerCase() === studentAnswer.trim().toLowerCase()) {
      isCorrect = true
    } else {
      // Fallback check if student submitted letter "A", "B", etc.
      const letterIndex = "ABCDEFGHIJ".indexOf(studentAnswer.toUpperCase())
      if (letterIndex >= 0) {
        // Resolve the text for that letter index
        const optText = typeof options[letterIndex] === "string" 
                          ? options[letterIndex] 
                          : options[letterIndex]?.text
        
        if (optText && String(optText).trim().toLowerCase() === correctText.toLowerCase()) {
          isCorrect = true
        }
      }
    }
  }

  return {
    is_correct: isCorrect,
    correct_answer: correctText || null,
  }
}

/**
 * Matching: student submits an array of { left, right } pairs.
 * All pairs must match the correct pairs (order-independent).
 * answerData.pairs = [{ left, right }, ...]
 */
function checkMatching(answerData: any, studentAnswer: any): CheckResult {
  const correctPairs: Array<{ left: string; right: string }> = answerData?.pairs || []

  if (!Array.isArray(studentAnswer)) {
    return {
      is_correct: false,
      correct_answer: correctPairs,
    }
  }

  // Build a Set of "left→right" for correct answers
  const correctSet = new Set(
    correctPairs.map((p: any) => `${String(p?.left ?? "").trim().toLowerCase()}→${String(p?.right ?? "").trim().toLowerCase()}`)
  )

  // Check that every student pair is in the correct set and count matches
  const studentPairs: Array<{ left: string; right: string }> = studentAnswer
  const studentSet = new Set(
    studentPairs.map(
      (p: any) => `${String(p?.left ?? "").trim().toLowerCase()}→${String(p?.right ?? "").trim().toLowerCase()}`
    )
  )

  // All correct pairs must be matched
  const allCorrect =
    correctSet.size === studentSet.size &&
    [...correctSet].every((pair) => studentSet.has(pair))

  return {
    is_correct: allCorrect,
    correct_answer: correctPairs,
  }
}

/**
 * Fill in the blanks: student submits a string.
 * Case-insensitive comparison against accepted answers.
 * answerData.answers = [string, ...]
 */
function checkFill(answerData: any, studentAnswer: any): CheckResult {
  const acceptedAnswers: any[] = answerData?.answers || []
  const studentText = String(studentAnswer ?? "").trim().toLowerCase()

  const isCorrect = acceptedAnswers.some(
    (a) => String(a ?? "").trim().toLowerCase() === studentText
  )

  return {
    is_correct: isCorrect,
    correct_answer: acceptedAnswers[0] != null ? String(acceptedAnswers[0]) : null,
  }
}

/**
 * Reorder: student submits items in their chosen order.
 * answerData.items = [{ text, correct_position }, ...]
 * Student submits an array of texts in order.
 */
function checkReorder(answerData: any, studentAnswer: any): CheckResult {
  const items: Array<{ text: any; correct_position: number }> = answerData?.items || []
  const correctOrder = [...items]
    .sort((a, b) => (Number(a?.correct_position) || 0) - (Number(b?.correct_position) || 0))
    .map((i) => String(i?.text ?? "").trim().toLowerCase())

  if (!Array.isArray(studentAnswer)) {
    return {
      is_correct: false,
      correct_answer: correctOrder,
    }
  }

  const studentOrder = studentAnswer.map((s: any) => String(s ?? "").trim().toLowerCase())

  const isCorrect =
    correctOrder.length === studentOrder.length &&
    correctOrder.every((item, idx) => item === studentOrder[idx])

  return {
    is_correct: isCorrect,
    correct_answer: correctOrder,
  }
}

/**
 * True/False: student submits a boolean.
 * answerData.correct_answer = boolean
 */
function checkTrueFalse(answerData: any, studentAnswer: any): CheckResult {
  const correctAnswer = Boolean(answerData?.correct_answer)

  // Normalize student answer: accept boolean, string "true"/"false", etc.
  let studentBool: boolean
  if (typeof studentAnswer === "boolean") {
    studentBool = studentAnswer
  } else if (typeof studentAnswer === "string") {
    studentBool = studentAnswer.toLowerCase().trim() === "true"
  } else {
    studentBool = Boolean(studentAnswer)
  }

  return {
    is_correct: studentBool === correctAnswer,
    correct_answer: correctAnswer,
  }
}
