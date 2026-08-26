/**
 * Practice Mode — Excel Utilities
 *
 * Generates, parses, and validates practice-mode Excel templates.
 * Populated with realistic dummy questions for all 5 question types across Grade 5 and Grade 6.
 * Supports both Practice format (unit 1-10) and Game format (subject/level).
 */

import ExcelJS from "exceljs"
import { parseExcelFile } from "./excel-utils"

export interface PracticeExcelQuestion {
  unit: number
  type: "mcq" | "matching" | "fill" | "reorder" | "truefalse"
  question: string
  instruction?: string
  imageUrl?: string
  timer?: number // kept for compatibility, optional
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
 * Populated with realistic, curriculum-aligned dummy questions for all 5 question types across Grade 5 and Grade 6.
 */
export const generatePracticeExcelTemplate = async () => {
  const workbook = new ExcelJS.Workbook()

  // Instructions Sheet
  const instructionsData = [
    { Instructions: "📚 Mauritius History & Geography — Practice Mode Excel Import Guide" },
    { Instructions: "" },
    { Instructions: "HOW TO USE THIS TEMPLATE:" },
    { Instructions: "1. Each sheet contains sample/dummy questions for a different question type (MCQ, Matching, Fill, Reorder, TrueFalse)." },
    { Instructions: "2. You can edit or delete the sample questions and add your own new questions." },
    { Instructions: "3. Keep the column headers exactly as they are in each sheet." },
    { Instructions: "4. Save the file and upload it in the Admin Practice Questions -> Import Excel modal." },
    { Instructions: "" },
    { Instructions: "UNIT NUMBERING GUIDE:" },
    { Instructions: "• Grade 5 Units: Unit 1, 2, 3, 4, 5" },
    { Instructions: "• Grade 6 Units: Unit 6 (Grade 6 Unit 1), Unit 7 (Grade 6 Unit 2), Unit 8 (Grade 6 Unit 3), Unit 9 (Grade 6 Unit 4), Unit 10 (Grade 6 Unit 5)" },
    { Instructions: "• Note: You can enter numbers 1 to 10 directly in the 'unit' column." },
    { Instructions: "" },
    { Instructions: "REQUIRED FIELDS FOR ALL QUESTIONS:" },
    { Instructions: "• unit: Unit number (1 to 10)" },
    { Instructions: "• type: 'mcq', 'matching', 'fill', 'reorder', or 'truefalse'" },
    { Instructions: "• question: The question text / prompt" },
    { Instructions: "" },
    { Instructions: "OPTIONAL FIELDS:" },
    { Instructions: "• instruction: Custom instruction text displayed to the student" },
    { Instructions: "• imageUrl: Upload image via Admin panel first, then paste the returned /api/images/... path" },
    { Instructions: "• timer: Time in seconds (optional, default 30)" },
    { Instructions: "" },
    { Instructions: "QUESTION TYPE SPECIFIC FIELDS:" },
    { Instructions: "• MCQ: optionA, optionB, optionC, optionD, correctAnswer (e.g. 'Port Louis' or 'B')" },
    { Instructions: "• Matching: leftItem1-4, rightItem1-4 (pairs that match)" },
    { Instructions: "• Fill: answer (the missing word, use _______ in question)" },
    { Instructions: "• Reorder: step1, step2, step3, step4 (in correct chronological/sequential order)" },
    { Instructions: "• TrueFalse: isTrue ('True' or 'False')" },
  ]
  addWorksheet(workbook, "Instructions", instructionsData, [80])

  // MCQ Template (Sample questions for Grade 5 & Grade 6)
  const mcqData = [
    {
      unit: 1,
      type: "mcq",
      question: "What is the capital city of Mauritius?",
      instruction: "Select the correct city from the options below",
      imageUrl: "",
      timer: 30,
      optionA: "Curepipe",
      optionB: "Port Louis",
      optionC: "Rose Hill",
      optionD: "Vacoas",
      correctAnswer: "Port Louis",
    },
    {
      unit: 1,
      type: "mcq",
      question: "In which year did Mauritius gain its independence?",
      instruction: "Choose the correct year",
      imageUrl: "",
      timer: 30,
      optionA: "1965",
      optionB: "1968",
      optionC: "1972",
      optionD: "1992",
      correctAnswer: "1968",
    },
    {
      unit: 6,
      type: "mcq",
      question: "Who was the famous French Governor who built the port and developed Port Louis?",
      instruction: "Select the correct historical figure",
      imageUrl: "",
      timer: 30,
      optionA: "Mahé de Labourdonnais",
      optionB: "Pierre Poivre",
      optionC: "Charles Decaen",
      optionD: "Sir John Pope Hennessy",
      correctAnswer: "Mahé de Labourdonnais",
    },
    {
      unit: 7,
      type: "mcq",
      question: "Which mountain in the south-west of Mauritius is a UNESCO World Heritage site representing the struggle for freedom from slavery?",
      instruction: "Select the correct mountain name",
      imageUrl: "",
      timer: 30,
      optionA: "Pieter Both",
      optionB: "Le Morne Brabant",
      optionC: "Corps de Garde",
      optionD: "Lion Mountain",
      correctAnswer: "Le Morne Brabant",
    },
  ]
  addWorksheet(workbook, "MCQ", mcqData as Array<Record<string, string | number>>, [
    8, 10, 45, 30, 25, 8, 20, 20, 20, 20, 20,
  ])

  // Matching Template (Sample questions)
  const matchingData = [
    {
      unit: 1,
      type: "matching",
      question: "Match each Mauritian symbol and concept with its correct description",
      instruction: "Match each item on the left with the correct description on the right",
      imageUrl: "",
      timer: 45,
      leftItem1: "Dodo",
      rightItem1: "Extinct flightless bird",
      leftItem2: "Port Louis",
      rightItem2: "Capital city and main port",
      leftItem3: "Trochetia Boutoniana",
      rightItem3: "National flower of Mauritius",
      leftItem4: "Sega",
      rightItem4: "Traditional folk music and dance",
    },
    {
      unit: 6,
      type: "matching",
      question: "Match the key historical personalities with their historical achievements",
      instruction: "Match each leader with their contribution",
      imageUrl: "",
      timer: 45,
      leftItem1: "Mahé de Labourdonnais",
      rightItem1: "Developed Port Louis as a naval base",
      leftItem2: "Pierre Poivre",
      rightItem2: "Created the botanical garden at Pamplemousses",
      leftItem3: "Emmanuel Anquetil",
      rightItem3: "Pioneered the trade union movement",
      leftItem4: "Sir Seewoosagur Ramgoolam",
      rightItem4: "First Prime Minister of independent Mauritius",
    },
  ]
  addWorksheet(workbook, "Matching", matchingData as Array<Record<string, string | number>>, [
    8, 12, 45, 30, 25, 8, 25, 25, 25, 25, 25, 25, 25, 25,
  ])

  // Fill in the Blanks Template
  const fillData = [
    {
      unit: 2,
      type: "fill",
      question: "The Dodo bird is _______ and no longer lives on Earth.",
      instruction: "Type the missing word into the blank space",
      imageUrl: "",
      timer: 30,
      answer: "extinct",
    },
    {
      unit: 4,
      type: "fill",
      question: "Mauritius is an island located in the _______ Ocean.",
      instruction: "Fill in the missing ocean name",
      imageUrl: "",
      timer: 30,
      answer: "Indian",
    },
    {
      unit: 6,
      type: "fill",
      question: "In 1810, the _______ captured Isle de France from the French.",
      instruction: "Type the nationality of the conquering power",
      imageUrl: "",
      timer: 30,
      answer: "British",
    },
    {
      unit: 9,
      type: "fill",
      question: "The abolition of slavery in Mauritius took place in the year _______.",
      instruction: "Type the year slavery was officially abolished",
      imageUrl: "",
      timer: 30,
      answer: "1835",
    },
  ]
  addWorksheet(workbook, "Fill", fillData as Array<Record<string, string | number>>, [
    8, 10, 50, 30, 25, 8, 20,
  ])

  // Reorder Template
  const reorderData = [
    {
      unit: 3,
      type: "reorder",
      question: "Arrange the following colonial periods of Mauritius in chronological order",
      instruction: "Arrange the events from earliest to most recent",
      imageUrl: "",
      timer: 45,
      step1: "1598 - Dutch arrival and naming of Mauritius",
      step2: "1715 - French colonisation as Isle de France",
      step3: "1810 - British conquest and administration",
      step4: "1968 - Independence of Mauritius",
    },
    {
      unit: 7,
      type: "reorder",
      question: "Put these key modern historical milestones in sequential order",
      instruction: "Arrange the milestones from earliest to latest",
      imageUrl: "",
      timer: 45,
      step1: "1835 - Abolition of slavery",
      step2: "1834 to 1910 - Arrival of Indian indentured labourers",
      step3: "1958 - Introduction of universal adult suffrage",
      step4: "1992 - Mauritius became a Republic",
    },
  ]
  addWorksheet(workbook, "Reorder", reorderData as Array<Record<string, string | number>>, [
    8, 10, 50, 30, 25, 8, 35, 35, 35, 35,
  ])

  // True/False Template
  const trueFalseData = [
    {
      unit: 1,
      type: "truefalse",
      question: "The Dodo bird still lives in the forests of Mauritius today.",
      instruction: "Decide whether the statement is True or False",
      imageUrl: "",
      timer: 25,
      isTrue: "False",
    },
    {
      unit: 4,
      type: "truefalse",
      question: "Mauritius is surrounded by coral reefs that protect its calm coastal lagoons.",
      instruction: "Decide whether the statement is True or False",
      imageUrl: "",
      timer: 25,
      isTrue: "True",
    },
    {
      unit: 6,
      type: "truefalse",
      question: "Trou aux Cerfs in Curepipe is an active volcano that erupts regularly.",
      instruction: "Decide whether the statement is True or False",
      imageUrl: "",
      timer: 25,
      isTrue: "False",
    },
    {
      unit: 8,
      type: "truefalse",
      question: "The Battle of Grand Port in August 1810 was a major French naval victory.",
      instruction: "Decide whether the statement is True or False",
      imageUrl: "",
      timer: 25,
      isTrue: "True",
    },
  ]
  addWorksheet(workbook, "TrueFalse", trueFalseData as Array<Record<string, string | number>>, [
    8, 12, 50, 30, 25, 8, 10,
  ])

  const excelBuffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([excelBuffer], { type: EXCEL_MIME_TYPE })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "Practice_Questions_Import_Template.xlsx"
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
const MAX_UNIT = 10

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
 * Helper to normalize question type aliases
 */
export function normalizeQuestionType(rawType: any): PracticeExcelQuestion["type"] | null {
  const t = toStr(rawType).toLowerCase().replace(/[-_\s]+/g, "")
  if (t === "mcq" || t === "multiplechoice" || t === "choice") return "mcq"
  if (t === "matching" || t === "match" || t === "pairs") return "matching"
  if (t === "fill" || t === "fillintheblanks" || t === "fillin" || t === "blank") return "fill"
  if (t === "reorder" || t === "ordering" || t === "order" || t === "sequence") return "reorder"
  if (t === "truefalse" || t === "tf" || t === "boolean") return "truefalse"
  return null
}

/**
 * Helper to parse unit number from various inputs:
 * - Direct unit number (1 to 10)
 * - Strings like "Unit 1", "Grade 5 Unit 2", "G6U3"
 * - Fallback to subject + level if using game questions template
 */
export function parseUnitNumber(q: any): number {
  // 1. Direct unit property or common aliases
  const rawUnit = q.unit ?? q.Unit ?? q.UNIT ?? q.unitno ?? q.unit_no ?? q["Unit No"] ?? q["Unit Number"] ?? q["Unit #"] ?? q.level ?? q.Level ?? q.LEVEL ?? q.theme ?? q.Theme

  if (rawUnit !== undefined && rawUnit !== null && String(rawUnit).trim() !== "") {
    const rawStr = String(rawUnit).trim()
    const g6Match = rawStr.match(/grade\s*6\s*unit\s*(\d+)/i) || rawStr.match(/g6\s*u\s*(\d+)/i)
    if (g6Match) {
      const u = parseInt(g6Match[1], 10)
      if (u >= 1 && u <= 5) return 5 + u
    }
    const g5Match = rawStr.match(/grade\s*5\s*unit\s*(\d+)/i) || rawStr.match(/g5\s*u\s*(\d+)/i)
    if (g5Match) {
      const u = parseInt(g5Match[1], 10)
      if (u >= 1 && u <= 5) return u
    }
    const numMatch = rawStr.match(/\d+/)
    if (numMatch) {
      const val = parseInt(numMatch[0], 10)
      if (val >= 1 && val <= 10) return val
    }
  }

  // 2. Separate Grade and Unit columns
  if (q.grade !== undefined && q.grade !== null) {
    const gradeNum = parseInt(String(q.grade).replace(/\D/g, ""), 10)
    const unitPart = parseInt(String(q.unit || q.Unit || "1").replace(/\D/g, ""), 10) || 1
    if (gradeNum === 6) {
      return 5 + Math.min(Math.max(unitPart, 1), 5)
    }
    if (gradeNum === 5) {
      return Math.min(Math.max(unitPart, 1), 5)
    }
  }

  // 3. Subject + Level fallback
  const subject = toStr(q.subject || q.Subject).toLowerCase()
  const levelNum = parseInt(String(q.level || q.Level || "1").replace(/\D/g, ""), 10) || 1
  if (subject.includes("geo")) {
    return Math.min(2 + levelNum, 5)
  } else if (subject.includes("his")) {
    return Math.min(levelNum, 5)
  }

  // Safe fallback to Unit 1
  return 1
}

/**
 * Validate practice-mode questions parsed from Excel.
 * Supports both Practice format (with `unit`) and Game format (with `subject`/`level`).
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
    const rawQuestion = q.question ?? q.Question ?? q.QUESTION ?? q.question_text ?? q.prompt ?? q.Prompt ?? ""
    const questionPreview = toStr(rawQuestion).substring(0, 40) || "[Empty Question]"
    let hasError = false

    // Validate and resolve unit
    const unitNum = parseUnitNumber(q)
    if (unitNum < 1 || unitNum > MAX_UNIT) {
      errors.push({
        row: rowNum,
        field: "unit",
        message: `Unit must be a valid integer between 1 and ${MAX_UNIT}. Got: "${q.unit ?? q.level ?? ""}"`,
        question: questionPreview,
      })
      hasError = true
    }

    // Validate and normalize question type
    const rawType = q.type ?? q.Type ?? q.TYPE ?? q.question_type ?? q.questiontype ?? ""
    const normalizedType = normalizeQuestionType(rawType)
    if (!normalizedType) {
      errors.push({
        row: rowNum,
        field: "type",
        message: `Type must be one of: ${VALID_TYPES.join(", ")}. Got: "${rawType}"`,
        question: questionPreview,
      })
      hasError = true
    }

    // Validate question text
    if (isEmpty(rawQuestion)) {
      errors.push({
        row: rowNum,
        field: "question",
        message: "Question text is required",
        question: questionPreview,
      })
      hasError = true
    }

    // Validate imageUrl if present
    const rawImage = q.imageUrl ?? q.image ?? q.Image ?? q.ImageUrl ?? q.image_url ?? ""
    if (!isEmpty(rawImage) && !isAllowedImageUrl(rawImage)) {
      warnings.push({
        row: rowNum,
        field: "imageUrl",
        message: `External image URL will be stored as-is: "${toStr(rawImage).substring(0, 60)}"`,
        question: questionPreview,
      })
    }

    // Type-specific validation
    let resolvedCorrectAnswer: string | undefined = undefined
    let resolvedIsTrue: string | undefined = undefined

    if (!hasError && normalizedType) {
      if (normalizedType === "mcq") {
        const optA = toStr(q.optionA ?? q.optiona ?? q.OptionA ?? q.option1 ?? q.optA ?? q["Option A"] ?? q["option A"])
        const optB = toStr(q.optionB ?? q.optionb ?? q.OptionB ?? q.option2 ?? q.optB ?? q["Option B"] ?? q["option B"])
        const optC = toStr(q.optionC ?? q.optionc ?? q.OptionC ?? q.option3 ?? q.optC ?? q["Option C"] ?? q["option C"])
        const optD = toStr(q.optionD ?? q.optiond ?? q.OptionD ?? q.option4 ?? q.optD ?? q["Option D"] ?? q["option D"])

        if (isEmpty(optA) || isEmpty(optB)) {
          errors.push({ row: rowNum, field: "options", message: "MCQ requires at least optionA and optionB", question: questionPreview })
          hasError = true
        }

        const rawCorrect = toStr(q.correctAnswer ?? q.correctanswer ?? q.CorrectAnswer ?? q.answer ?? q.Answer ?? q.correct ?? q.Correct ?? q["Correct Answer"])
        if (isEmpty(rawCorrect)) {
          errors.push({ row: rowNum, field: "correctAnswer", message: "MCQ requires a correctAnswer", question: questionPreview })
          hasError = true
        } else {
          // Check if answer is given as letter "A", "B", "C", "D"
          const upperCorrect = rawCorrect.toUpperCase()
          if (upperCorrect === "A" || upperCorrect === "OPTIONA" || upperCorrect === "OPTION A") {
            resolvedCorrectAnswer = optA
          } else if (upperCorrect === "B" || upperCorrect === "OPTIONB" || upperCorrect === "OPTION B") {
            resolvedCorrectAnswer = optB
          } else if (upperCorrect === "C" || upperCorrect === "OPTIONC" || upperCorrect === "OPTION C") {
            resolvedCorrectAnswer = optC
          } else if (upperCorrect === "D" || upperCorrect === "OPTIOND" || upperCorrect === "OPTION D") {
            resolvedCorrectAnswer = optD
          } else {
            // Check if matches any option text directly
            const opts = [optA, optB, optC, optD].filter((o) => !isEmpty(o))
            const match = opts.find((o) => o.toLowerCase() === rawCorrect.toLowerCase())
            if (match) {
              resolvedCorrectAnswer = match
            } else {
              errors.push({
                row: rowNum,
                field: "correctAnswer",
                message: `correctAnswer "${rawCorrect}" does not match any option (A: "${optA}", B: "${optB}")`,
                question: questionPreview,
              })
              hasError = true
            }
          }
        }
      } else if (normalizedType === "matching") {
        const l1 = toStr(q.leftItem1 ?? q.leftitem1 ?? q["Left Item 1"] ?? q.left1 ?? q.left_item_1)
        const r1 = toStr(q.rightItem1 ?? q.rightitem1 ?? q["Right Item 1"] ?? q.right1 ?? q.right_item_1)
        const l2 = toStr(q.leftItem2 ?? q.leftitem2 ?? q["Left Item 2"] ?? q.left2 ?? q.left_item_2)
        const r2 = toStr(q.rightItem2 ?? q.rightitem2 ?? q["Right Item 2"] ?? q.right2 ?? q.right_item_2)
        if (isEmpty(l1) || isEmpty(r1) || isEmpty(l2) || isEmpty(r2)) {
          errors.push({ row: rowNum, field: "pairs", message: "Matching requires at least 2 pairs (leftItem1/rightItem1 & leftItem2/rightItem2)", question: questionPreview })
          hasError = true
        }
      } else if (normalizedType === "fill") {
        const ans = toStr(q.answer ?? q.Answer ?? q.correctAnswer ?? q.correctanswer ?? q.missingWord)
        if (isEmpty(ans)) {
          errors.push({ row: rowNum, field: "answer", message: "Fill questions require an answer", question: questionPreview })
          hasError = true
        }
      } else if (normalizedType === "reorder") {
        const s1 = toStr(q.step1 ?? q.step1 ?? q["Step 1"] ?? q.item1 ?? q["Item 1"])
        const s2 = toStr(q.step2 ?? q.step2 ?? q["Step 2"] ?? q.item2 ?? q["Item 2"])
        if (isEmpty(s1) || isEmpty(s2)) {
          errors.push({ row: rowNum, field: "steps", message: "Reorder requires at least 2 steps (step1, step2)", question: questionPreview })
          hasError = true
        }
      } else if (normalizedType === "truefalse") {
        const rawTf = toStr(q.isTrue ?? q.istrue ?? q.IsTrue ?? q["Is True"] ?? q.answer ?? q.Answer ?? q.correctAnswer).toLowerCase()
        if (rawTf === "true" || rawTf === "t" || rawTf === "1" || rawTf === "yes" || rawTf === "vrai") {
          resolvedIsTrue = "True"
        } else if (rawTf === "false" || rawTf === "f" || rawTf === "0" || rawTf === "no" || rawTf === "faux") {
          resolvedIsTrue = "False"
        } else {
          errors.push({ row: rowNum, field: "isTrue", message: `isTrue must be "True" or "False". Got: "${rawTf}"`, question: questionPreview })
          hasError = true
        }
      }
    }

    if (hasError || !normalizedType) {
      skippedCount++
    } else {
      const rawInstruction = q.instruction ?? q.Instruction ?? q.instructions ?? q.Instructions ?? ""
      validQuestions.push({
        unit: unitNum,
        type: normalizedType,
        question: toStr(rawQuestion),
        instruction: toStr(rawInstruction) || undefined,
        imageUrl: toStr(rawImage) || undefined,
        timer: Number(q.timer ?? q.Timer) || 30,
        optionA: toStr(q.optionA ?? q.optiona ?? q.OptionA ?? q.option1 ?? q.optA) || undefined,
        optionB: toStr(q.optionB ?? q.optionb ?? q.OptionB ?? q.option2 ?? q.optB) || undefined,
        optionC: toStr(q.optionC ?? q.optionc ?? q.OptionC ?? q.option3 ?? q.optC) || undefined,
        optionD: toStr(q.optionD ?? q.optiond ?? q.OptionD ?? q.option4 ?? q.optD) || undefined,
        correctAnswer: resolvedCorrectAnswer || toStr(q.correctAnswer ?? q.correctanswer ?? q.answer) || undefined,
        leftItem1: toStr(q.leftItem1 ?? q.leftitem1 ?? q.left1) || undefined,
        rightItem1: toStr(q.rightItem1 ?? q.rightitem1 ?? q.right1) || undefined,
        leftItem2: toStr(q.leftItem2 ?? q.leftitem2 ?? q.left2) || undefined,
        rightItem2: toStr(q.rightItem2 ?? q.rightitem2 ?? q.right2) || undefined,
        leftItem3: toStr(q.leftItem3 ?? q.leftitem3 ?? q.left3) || undefined,
        rightItem3: toStr(q.rightItem3 ?? q.rightitem3 ?? q.right3) || undefined,
        leftItem4: toStr(q.leftItem4 ?? q.leftitem4 ?? q.left4) || undefined,
        rightItem4: toStr(q.rightItem4 ?? q.rightitem4 ?? q.right4) || undefined,
        answer: toStr(q.answer ?? q.Answer ?? q.correctAnswer) || undefined,
        step1: toStr(q.step1 ?? q.step1 ?? q.item1) || undefined,
        step2: toStr(q.step2 ?? q.step2 ?? q.item2) || undefined,
        step3: toStr(q.step3 ?? q.step3 ?? q.item3) || undefined,
        step4: toStr(q.step4 ?? q.step4 ?? q.item4) || undefined,
        isTrue: resolvedIsTrue || toStr(q.isTrue ?? q.istrue) || undefined,
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
