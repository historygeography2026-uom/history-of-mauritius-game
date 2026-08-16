/**
 * Practice Mode — Excel Utilities
 *
 * Generates, parses, and validates practice-mode Excel templates.
 * Adapts the existing gamified template format from lib/excel-utils.ts:
 *   - Replaces `subject` + `level` with a single `unit` column (integer 1–6)
 *   - Keeps `timer` column in template for familiarity but ignores it during import
 *   - All other columns (question, type, options, etc.) are identical
 *
 * Reuses parseExcelFile() from excel-utils.ts since it is column-agnostic.
 */

import ExcelJS from "exceljs"
import { parseExcelFile } from "./excel-utils"

export interface PracticeExcelQuestion {
  unit: number
  type: "mcq" | "matching" | "fill" | "reorder" | "truefalse"
  question: string
  instruction?: string
  imageUrl?: string
  timer?: number // kept for compatibility, ignored on import
  // MCQ fields
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctAnswer?: string
  // Matching fields
  leftItem1?: string
  rightItem1?: string
  leftItem2?: string
  rightItem2?: string
  leftItem3?: string
  rightItem3?: string
  leftItem4?: string
  rightItem4?: string
  // Fill fields
  answer?: string
  // Reorder fields
  step1?: string
  step2?: string
  step3?: string
  step4?: string
  // True/False fields
  isTrue?: string
}

const EXCEL_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

const addWorksheet = (
  workbook: ExcelJS.Workbook,
  name: string,
  rows: Array<Record<string, string | number>>,
  widths: number[]
) => {
  const headers = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key))
      return keys
    }, new Set<string>())
  )

  const worksheet = workbook.addWorksheet(name)
  worksheet.columns = headers.map((header, index) => ({
    header,
    key: header,
    width: widths[index] ?? 20,
  }))

  rows.forEach((row) => worksheet.addRow(row))
  return worksheet
}

/**
 * Generate and download a practice-mode Excel template.
 * Same structure as the gamified template but with `unit` instead of `subject`+`level`.
 */
export const generatePracticeExcelTemplate = async () => {
  const workbook = new ExcelJS.Workbook()

  // Instructions Sheet
  const instructionsData = [
    { Instructions: "📚 Practice Mode — Excel Import Guide" },
    { Instructions: "" },
    { Instructions: "HOW TO USE THIS TEMPLATE:" },
    { Instructions: "1. Each sheet contains sample questions for a different question type" },
    { Instructions: "2. Delete the sample questions and add your own" },
    { Instructions: "3. Keep the column headers exactly as they are" },
    { Instructions: "4. Save the file and upload it back to the admin panel" },
    { Instructions: "" },
    { Instructions: "REQUIRED FIELDS FOR ALL QUESTIONS:" },
    { Instructions: "• unit: Unit number (1 through 6)" },
    { Instructions: "• type: 'mcq', 'matching', 'fill', 'reorder', or 'truefalse'" },
    { Instructions: "• question: The question text" },
    { Instructions: "" },
    { Instructions: "OPTIONAL FIELDS:" },
    { Instructions: "• instruction: Custom instruction text displayed to the student" },
    { Instructions: "• imageUrl: Optional local uploaded image path such as /api/images/your-file.jpg" },
    { Instructions: "• timer: (IGNORED — practice mode has no timer, kept for template compatibility)" },
    { Instructions: "" },
    { Instructions: "QUESTION TYPE SPECIFIC FIELDS:" },
    { Instructions: "MCQ: optionA, optionB, optionC, optionD, correctAnswer (must match one option exactly)" },
    { Instructions: "Matching: leftItem1-4, rightItem1-4 (pairs to match)" },
    { Instructions: "Fill: answer (the word that fills the blank, use _______ in question)" },
    { Instructions: "Reorder: step1, step2, step3, step4 (in correct chronological order)" },
    { Instructions: "TrueFalse: isTrue ('True' or 'False')" },
    { Instructions: "" },
    { Instructions: "TIPS:" },
    { Instructions: "• For Fill questions, use _______ (underscores) to mark the blank" },
    { Instructions: "• You can import up to ~200 questions per unit, uploaded in batches" },
    { Instructions: "• Each play session randomly selects 20 questions from the unit pool" },
  ]
  addWorksheet(workbook, "Instructions", instructionsData, [80])

  // MCQ Template
  const mcqData = [
    {
      unit: 1,
      type: "mcq",
      question: "What is the capital of Mauritius?",
      imageUrl: "",
      timer: 30,
      optionA: "Port Louis",
      optionB: "Curepipe",
      optionC: "Rose Hill",
      optionD: "Vacoas",
      correctAnswer: "Port Louis",
    },
  ]
  addWorksheet(workbook, "MCQ", mcqData as Array<Record<string, string | number>>, [
    6, 8, 50, 40, 6, 20, 20, 20, 20, 20,
  ])

  // Matching Template
  const matchingData = [
    {
      unit: 1,
      type: "matching",
      question: "Match the following pairs",
      instruction: "Match each item on the left with its description on the right",
      imageUrl: "",
      timer: 45,
      leftItem1: "Dodo",
      rightItem1: "Extinct bird",
      leftItem2: "Port Louis",
      rightItem2: "Capital city",
      leftItem3: "1968",
      rightItem3: "Independence year",
      leftItem4: "Sega",
      rightItem4: "Traditional dance",
    },
  ]
  addWorksheet(workbook, "Matching", matchingData as Array<Record<string, string | number>>, [
    6, 10, 40, 30, 10, 6, 20, 20, 20, 20, 20, 20, 20, 20,
  ])

  // Fill in the Blanks Template
  const fillData = [
    {
      unit: 2,
      type: "fill",
      question: "The Dodo bird is _______ and no longer exists.",
      instruction: "Type the missing word to complete the sentence",
      imageUrl: "",
      timer: 30,
      answer: "extinct",
    },
  ]
  addWorksheet(workbook, "Fill", fillData as Array<Record<string, string | number>>, [
    6, 8, 50, 40, 6, 20,
  ])

  // Reorder Template
  const reorderData = [
    {
      unit: 3,
      type: "reorder",
      question: "Arrange the following events in chronological order",
      instruction: "Put these historical events in order from earliest to latest",
      imageUrl: "",
      timer: 45,
      step1: "1638 - Dutch settlement",
      step2: "1715 - French arrival",
      step3: "1810 - British conquest",
      step4: "1968 - Independence",
    },
  ]
  addWorksheet(workbook, "Reorder", reorderData as Array<Record<string, string | number>>, [
    6, 10, 50, 40, 6, 30, 30, 30, 30,
  ])

  // True/False Template
  const trueFalseData = [
    {
      unit: 1,
      type: "truefalse",
      question: "The Dodo bird still exists in Mauritius today.",
      imageUrl: "",
      timer: 25,
      isTrue: "False",
    },
  ]
  addWorksheet(workbook, "TrueFalse", trueFalseData as Array<Record<string, string | number>>, [
    6, 12, 50, 40, 6, 8,
  ])

  const excelBuffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([excelBuffer], { type: EXCEL_MIME_TYPE })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "Practice_Mode_Import_Template.xlsx"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Re-export parseExcelFile from the existing utility — it's column-agnostic.
 */
export const parsePracticeExcelFile = parseExcelFile

// ── Validation ──

export interface PracticeValidationError {
  row: number
  field: string
  message: string
  question?: string
}

export interface PracticeValidationResult {
  isValid: boolean
  errors: PracticeValidationError[]
  warnings: PracticeValidationError[]
  validQuestions: PracticeExcelQuestion[]
  skippedCount: number
}

const VALID_TYPES = ["mcq", "matching", "fill", "reorder", "truefalse"]
const MAX_UNIT = 6

const toStr = (val: any): string => {
  if (val === null || val === undefined) return ""
  return String(val).trim()
}

const isEmpty = (val: any): boolean => toStr(val) === ""

const isAllowedImageUrl = (val: any): boolean => {
  const text = toStr(val)
  return text === "" || text.startsWith("/api/images/")
}

/**
 * Validate practice-mode questions parsed from Excel.
 * Same validation rules as gamified, but checks `unit` instead of `subject`+`level`.
 */
export const validatePracticeExcelQuestions = (
  questions: any[]
): PracticeValidationResult => {
  const errors: PracticeValidationError[] = []
  const warnings: PracticeValidationError[] = []
  const validQuestions: PracticeExcelQuestion[] = []
  let skippedCount = 0

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const rowNum = i + 2 // Excel row (1-indexed + header)
    const questionPreview = toStr(q.question).substring(0, 40) || "[Empty Question]"
    let hasError = false

    // Validate unit
    const unitNum = Number(q.unit)
    if (!Number.isInteger(unitNum) || unitNum < 1 || unitNum > MAX_UNIT) {
      errors.push({
        row: rowNum,
        field: "unit",
        message: `Unit must be an integer between 1 and ${MAX_UNIT}. Got: "${q.unit}"`,
        question: questionPreview,
      })
      hasError = true
    }

    // Validate type
    const type = toStr(q.type).toLowerCase()
    if (!VALID_TYPES.includes(type)) {
      errors.push({
        row: rowNum,
        field: "type",
        message: `Type must be one of: ${VALID_TYPES.join(", ")}. Got: "${q.type}"`,
        question: questionPreview,
      })
      hasError = true
    }

    // Validate question text
    if (isEmpty(q.question)) {
      errors.push({
        row: rowNum,
        field: "question",
        message: "Question text is required",
        question: questionPreview,
      })
      hasError = true
    }

    // Validate imageUrl if present
    if (!isEmpty(q.imageUrl) && !isAllowedImageUrl(q.imageUrl)) {
      warnings.push({
        row: rowNum,
        field: "imageUrl",
        message: `External image URL will be kept as-is: "${toStr(q.imageUrl).substring(0, 60)}"`,
        question: questionPreview,
      })
    }

    // Type-specific validation
    if (!hasError) {
      if (type === "mcq") {
        if (isEmpty(q.optionA) || isEmpty(q.optionB)) {
          errors.push({ row: rowNum, field: "options", message: "MCQ requires at least optionA and optionB", question: questionPreview })
          hasError = true
        }
        if (isEmpty(q.correctAnswer)) {
          errors.push({ row: rowNum, field: "correctAnswer", message: "MCQ requires a correctAnswer", question: questionPreview })
          hasError = true
        }
        if (!hasError) {
          const opts = [q.optionA, q.optionB, q.optionC, q.optionD].filter((o) => !isEmpty(o)).map((o) => toStr(o))
          const correct = toStr(q.correctAnswer)
          if (!opts.some((o) => o.toLowerCase() === correct.toLowerCase())) {
            errors.push({
              row: rowNum,
              field: "correctAnswer",
              message: `correctAnswer "${correct}" does not match any option`,
              question: questionPreview,
            })
            hasError = true
          }
        }
      } else if (type === "matching") {
        if (isEmpty(q.leftItem1) || isEmpty(q.rightItem1) || isEmpty(q.leftItem2) || isEmpty(q.rightItem2)) {
          errors.push({ row: rowNum, field: "pairs", message: "Matching requires at least 2 pairs (leftItem1/rightItem1 + leftItem2/rightItem2)", question: questionPreview })
          hasError = true
        }
      } else if (type === "fill") {
        if (isEmpty(q.answer)) {
          errors.push({ row: rowNum, field: "answer", message: "Fill questions require an answer", question: questionPreview })
          hasError = true
        }
      } else if (type === "reorder") {
        if (isEmpty(q.step1) || isEmpty(q.step2)) {
          errors.push({ row: rowNum, field: "steps", message: "Reorder requires at least 2 steps (step1, step2)", question: questionPreview })
          hasError = true
        }
      } else if (type === "truefalse") {
        const isTrueVal = toStr(q.isTrue).toLowerCase()
        if (isTrueVal !== "true" && isTrueVal !== "false") {
          errors.push({ row: rowNum, field: "isTrue", message: `isTrue must be "True" or "False". Got: "${q.isTrue}"`, question: questionPreview })
          hasError = true
        }
      }
    }

    if (hasError) {
      skippedCount++
    } else {
      validQuestions.push({
        unit: unitNum,
        type: type as PracticeExcelQuestion["type"],
        question: toStr(q.question),
        instruction: toStr(q.instruction) || undefined,
        imageUrl: toStr(q.imageUrl) || undefined,
        timer: Number(q.timer) || 30,
        optionA: toStr(q.optionA) || undefined,
        optionB: toStr(q.optionB) || undefined,
        optionC: toStr(q.optionC) || undefined,
        optionD: toStr(q.optionD) || undefined,
        correctAnswer: toStr(q.correctAnswer) || undefined,
        leftItem1: toStr(q.leftItem1) || undefined,
        rightItem1: toStr(q.rightItem1) || undefined,
        leftItem2: toStr(q.leftItem2) || undefined,
        rightItem2: toStr(q.rightItem2) || undefined,
        leftItem3: toStr(q.leftItem3) || undefined,
        rightItem3: toStr(q.rightItem3) || undefined,
        leftItem4: toStr(q.leftItem4) || undefined,
        rightItem4: toStr(q.rightItem4) || undefined,
        answer: toStr(q.answer) || undefined,
        step1: toStr(q.step1) || undefined,
        step2: toStr(q.step2) || undefined,
        step3: toStr(q.step3) || undefined,
        step4: toStr(q.step4) || undefined,
        isTrue: toStr(q.isTrue) || undefined,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validQuestions,
    skippedCount,
  }
}

/**
 * Build the JSONB answer_data from a validated practice Excel question.
 * Same structure as buildAnswerData() in the admin API.
 */
export function buildPracticeAnswerData(q: PracticeExcelQuestion): any {
  if (q.type === "mcq") {
    const options = [q.optionA, q.optionB, q.optionC, q.optionD]
      .filter((o) => o && o.trim().length > 0)
      .map((text) => ({
        text: text!.trim(),
        is_correct: text!.trim().toLowerCase() === (q.correctAnswer || "").trim().toLowerCase(),
      }))
    return { options }
  } else if (q.type === "matching") {
    const pairs: Array<{ left: string; right: string }> = []
    for (let i = 1; i <= 4; i++) {
      const left = (q as any)[`leftItem${i}`]
      const right = (q as any)[`rightItem${i}`]
      if (left && right && left.trim() && right.trim()) {
        pairs.push({ left: left.trim(), right: right.trim() })
      }
    }
    return { pairs }
  } else if (q.type === "fill") {
    return { answers: [q.answer!.trim()] }
  } else if (q.type === "reorder") {
    const items: Array<{ text: string; correct_position: number }> = []
    for (let i = 1; i <= 4; i++) {
      const step = (q as any)[`step${i}`]
      if (step && step.trim()) {
        items.push({ text: step.trim(), correct_position: i })
      }
    }
    return { items }
  } else if (q.type === "truefalse") {
    return {
      correct_answer: (q.isTrue || "").trim().toLowerCase() === "true",
      explanation: "",
    }
  }
  return {}
}
