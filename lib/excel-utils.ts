import * as XLSX from "xlsx"

export interface ExcelQuestion {
  subject: string
  level: number
  type: "mcq" | "matching" | "fill" | "reorder" | "truefalse"
  question: string
  imageUrl?: string
  timer: number
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

export const generateExcelTemplate = () => {
  const workbook = XLSX.utils.book_new()

  // Instructions Sheet
  const instructionsData = [
    { Instructions: "📚 Mauritius History & Geography Quiz - Excel Import Guide" },
    { Instructions: "" },
    { Instructions: "HOW TO USE THIS TEMPLATE:" },
    { Instructions: "1. Each sheet contains sample questions for a different question type" },
    { Instructions: "2. Delete the sample questions and add your own" },
    { Instructions: "3. Keep the column headers exactly as they are" },
    { Instructions: "4. Save the file and upload it back to the admin panel" },
    { Instructions: "" },
    { Instructions: "REQUIRED FIELDS FOR ALL QUESTIONS:" },
    { Instructions: "• subject: 'history', 'geography', or 'combined'" },
    { Instructions: "• level: 1, 2, or 3 (difficulty level)" },
    { Instructions: "• type: 'mcq', 'matching', 'fill', 'reorder', or 'truefalse'" },
    { Instructions: "• question: The question text" },
    { Instructions: "• timer: Time in seconds (default: 30)" },
    { Instructions: "" },
    { Instructions: "OPTIONAL FIELDS:" },
    { Instructions: "• imageUrl: Direct URL to an image (http/https, will be downloaded and stored in Supabase)" },
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
    { Instructions: "• Images will be automatically resized to max 800x600 pixels" },
    { Instructions: "• You can leave imageUrl empty if no image is needed" },
  ]
  const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData)
  instructionsSheet["!cols"] = [{ wch: 80 }]
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions")

  // MCQ Template
  const mcqData: ExcelQuestion[] = [
    {
      subject: "history",
      level: 1,
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
    {
      subject: "history",
      level: 1,
      type: "mcq",
      question: "When did Mauritius gain independence?",
      imageUrl: "",
      timer: 30,
      optionA: "1965",
      optionB: "1968",
      optionC: "1970",
      optionD: "1972",
      correctAnswer: "1968",
    },
  ]

  const mcqSheet = XLSX.utils.json_to_sheet(mcqData)
  mcqSheet["!cols"] = [
    { wch: 12 }, // subject
    { wch: 6 },  // level
    { wch: 8 },  // type
    { wch: 50 }, // question
    { wch: 40 }, // imageUrl

    { wch: 6 },  // timer
    { wch: 20 }, // optionA
    { wch: 20 }, // optionB
    { wch: 20 }, // optionC
    { wch: 20 }, // optionD
    { wch: 20 }, // correctAnswer
  ]
  XLSX.utils.book_append_sheet(workbook, mcqSheet, "MCQ")

  // Matching Template
  const matchingData: ExcelQuestion[] = [
    {
      subject: "history",
      level: 1,
      type: "matching",
      question: "Match the following pairs",
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

  const matchingSheet = XLSX.utils.json_to_sheet(matchingData)
  matchingSheet["!cols"] = [
    { wch: 12 }, // subject
    { wch: 6 },  // level
    { wch: 10 }, // type
    { wch: 40 }, // question
    { wch: 30 }, // imageUrl
    { wch: 10 }, // timer
    { wch: 6 },  // timer
    { wch: 20 }, // leftItem1
    { wch: 20 }, // rightItem1
    { wch: 20 }, // leftItem2
    { wch: 20 }, // rightItem2
    { wch: 20 }, // leftItem3
    { wch: 20 }, // rightItem3
    { wch: 20 }, // leftItem4
    { wch: 20 }, // rightItem4
  ]
  XLSX.utils.book_append_sheet(workbook, matchingSheet, "Matching")

  // Fill in the Blanks Template
  const fillData: ExcelQuestion[] = [
    {
      subject: "history",
      level: 1,
      type: "fill",
      question: "The Dodo bird is _______ and no longer exists.",
      imageUrl: "",
      timer: 30,
      answer: "extinct",
    },
    {
      subject: "geography",
      level: 1,
      type: "fill",
      question: "Mauritius is located in the _______ Ocean.",
      imageUrl: "",
      timer: 30,
      answer: "Indian",
    },
  ]

  const fillSheet = XLSX.utils.json_to_sheet(fillData)
  fillSheet["!cols"] = [
    { wch: 12 }, // subject
    { wch: 6 },  // level
    { wch: 8 },  // type
    { wch: 50 }, // question
    { wch: 40 }, // imageUrl

    { wch: 6 },  // timer
    { wch: 20 }, // answer
  ]
  XLSX.utils.book_append_sheet(workbook, fillSheet, "Fill")

  // Reorder/Put in Order Template
  const reorderData: ExcelQuestion[] = [
    {
      subject: "history",
      level: 1,
      type: "reorder",
      question: "Arrange the following events in chronological order",
      imageUrl: "",
      timer: 45,
      step1: "1638 - Dutch settlement",
      step2: "1715 - French arrival",
      step3: "1810 - British conquest",
      step4: "1968 - Independence",
    },
  ]

  const reorderSheet = XLSX.utils.json_to_sheet(reorderData)
  reorderSheet["!cols"] = [
    { wch: 12 }, // subject
    { wch: 6 },  // level
    { wch: 10 }, // type
    { wch: 50 }, // question
    { wch: 40 }, // imageUrl
    { wch: 6 },  // timer
    { wch: 30 }, // step1
    { wch: 30 }, // step2
    { wch: 30 }, // step3
    { wch: 30 }, // step4
  ]
  XLSX.utils.book_append_sheet(workbook, reorderSheet, "Reorder")

  // True/False Template
  const trueFalseData: ExcelQuestion[] = [
    {
      subject: "history",
      level: 1,
      type: "truefalse",
      question: "The Dodo bird still exists in Mauritius today.",
      imageUrl: "",
      timer: 25,
      isTrue: "False",
    },
    {
      subject: "geography",
      level: 1,
      type: "truefalse",
      question: "Mauritius is an island in the Indian Ocean.",
      imageUrl: "",
      timer: 25,
      isTrue: "True",
    },
  ]

  const trueFalseSheet = XLSX.utils.json_to_sheet(trueFalseData)
  trueFalseSheet["!cols"] = [
    { wch: 12 }, // subject
    { wch: 6 },  // level
    { wch: 12 }, // type
    { wch: 50 }, // question
    { wch: 40 }, // imageUrl
    { wch: 6 },  // timer
    { wch: 8 },  // isTrue
  ]
  XLSX.utils.book_append_sheet(workbook, trueFalseSheet, "TrueFalse")

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "Mauritius_Quiz_Template.xlsx"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const parseExcelFile = async (file: File): Promise<ExcelQuestion[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const allQuestions: ExcelQuestion[] = []

        workbook.SheetNames.forEach((sheetName) => {
          // Skip the Instructions sheet
          if (sheetName.toLowerCase() === 'instructions') return
          
          const sheet = workbook.Sheets[sheetName]
          const sheetData = XLSX.utils.sheet_to_json<ExcelQuestion>(sheet)
          allQuestions.push(...sheetData)
        })

        resolve(allQuestions)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = (error) => reject(error)
    reader.readAsBinaryString(file)
  })
}

export interface ValidationError {
  row: number
  field: string
  message: string
  question?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  validQuestions: ExcelQuestion[]
  skippedCount: number
}

const VALID_SUBJECTS = ['history', 'geography', 'combined']
const VALID_TYPES = ['mcq', 'matching', 'fill', 'reorder', 'truefalse']
const VALID_LEVELS = [1, 2, 3]

// Helper to safely convert any value to trimmed string
const toStr = (val: any): string => {
  if (val === null || val === undefined) return ''
  return String(val).trim()
}

// Helper to check if a value is empty
const isEmpty = (val: any): boolean => {
  return toStr(val) === ''
}

export const validateExcelQuestions = (questions: ExcelQuestion[]): ValidationResult => {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const validQuestions: ExcelQuestion[] = []
  let skippedCount = 0

  questions.forEach((q, index) => {
    const row = index + 2 // Excel row (1-indexed + header row)
    const questionPreview = toStr(q.question).substring(0, 30) || 'Empty'
    let hasError = false

    // Required field validation
    if (isEmpty(q.subject)) {
      errors.push({ row, field: 'subject', message: 'Subject field is empty. You must specify a subject (e.g., History, Geography, Culture, Economy, Technology). This field cannot be left blank.', question: questionPreview })
      hasError = true
    } else if (!VALID_SUBJECTS.includes(toStr(q.subject).toLowerCase())) {
      errors.push({ row, field: 'subject', message: `Subject "${q.subject}" is not recognized. Please use one of these valid subjects: ${VALID_SUBJECTS.join(', ')}. Check for typos or extra spaces.`, question: questionPreview })
      hasError = true
    }

    if (!q.level || !VALID_LEVELS.includes(Number(q.level))) {
      errors.push({ row, field: 'level', message: `Level "${q.level}" is invalid. Difficulty level must be 1 (Easy), 2 (Medium), or 3 (Hard). Make sure the cell contains only a number without any text.`, question: questionPreview })
      hasError = true
    }

    if (isEmpty(q.type)) {
      errors.push({ row, field: 'type', message: 'Question Type field is empty. You must specify the type of question (mcq, matching, fill, reorder, or truefalse). This field cannot be left blank.', question: questionPreview })
      hasError = true
    } else if (!VALID_TYPES.includes(toStr(q.type).toLowerCase())) {
      errors.push({ row, field: 'type', message: `Question type "${q.type}" is not recognized. Use one of these types: ${VALID_TYPES.join(', ')}. Type must match the corresponding Excel sheet.`, question: questionPreview })
      hasError = true
    }

    if (isEmpty(q.question)) {
      errors.push({ row, field: 'question', message: 'Question text field is empty. You must provide the actual question that students will answer. This field cannot be left blank.', question: questionPreview })
      hasError = true
    }

    // Type-specific validation
    const type = toStr(q.type).toLowerCase()

    if (type === 'mcq') {
      if (isEmpty(q.optionA)) {
        errors.push({ row, field: 'optionA', message: 'Option A is missing. Multiple Choice questions require all four options (A, B, C, D). Please enter the text for Option A.', question: questionPreview })
        hasError = true
      }
      if (isEmpty(q.optionB)) {
        errors.push({ row, field: 'optionB', message: 'Option B is missing. Multiple Choice questions require all four options (A, B, C, D). Please enter the text for Option B.', question: questionPreview })
        hasError = true
      }
      if (isEmpty(q.optionC)) {
        errors.push({ row, field: 'optionC', message: 'Option C is missing. Multiple Choice questions require all four options (A, B, C, D). Please enter the text for Option C.', question: questionPreview })
        hasError = true
      }
      if (isEmpty(q.optionD)) {
        errors.push({ row, field: 'optionD', message: 'Option D is missing. Multiple Choice questions require all four options (A, B, C, D). Please enter the text for Option D.', question: questionPreview })
        hasError = true
      }
      if (isEmpty(q.correctAnswer)) {
        errors.push({ row, field: 'correctAnswer', message: 'Correct Answer field is empty. You must specify which option (A, B, C, or D) is the correct answer for this MCQ.', question: questionPreview })
        hasError = true
      } else {
        // Check if correctAnswer matches one of the options
        const options = [toStr(q.optionA), toStr(q.optionB), toStr(q.optionC), toStr(q.optionD)]
        if (!options.includes(toStr(q.correctAnswer))) {
          errors.push({ row, field: 'correctAnswer', message: `Correct Answer "${q.correctAnswer}" does not match any option. Make sure the correct answer text exactly matches one of the four options (A, B, C, D). Check for typos or extra spaces.`, question: questionPreview })
          hasError = true
        }
      }
    }

    if (type === 'matching') {
      let pairCount = 0
      if (!isEmpty(q.leftItem1) && !isEmpty(q.rightItem1)) pairCount++
      if (!isEmpty(q.leftItem2) && !isEmpty(q.rightItem2)) pairCount++
      if (!isEmpty(q.leftItem3) && !isEmpty(q.rightItem3)) pairCount++
      if (!isEmpty(q.leftItem4) && !isEmpty(q.rightItem4)) pairCount++
      
      if (pairCount < 2) {
        errors.push({ row, field: 'matching pairs', message: `Only ${pairCount} complete pair(s) found. Matching questions require at least 2 complete pairs (with both left and right items). Add more item pairs to reach the minimum requirement.`, question: questionPreview })
        hasError = true
      }
      
      // Check for incomplete pairs
      if ((!isEmpty(q.leftItem1) && isEmpty(q.rightItem1)) || (isEmpty(q.leftItem1) && !isEmpty(q.rightItem1))) {
        warnings.push({ row, field: 'pair 1', message: 'Pair 1 is incomplete: either the left item or right item is missing. Both sides must have values to create a complete matching pair.', question: questionPreview })
      }
      if ((!isEmpty(q.leftItem2) && isEmpty(q.rightItem2)) || (isEmpty(q.leftItem2) && !isEmpty(q.rightItem2))) {
        warnings.push({ row, field: 'pair 2', message: 'Pair 2 is incomplete: either the left item or right item is missing. Both sides must have values to create a complete matching pair.', question: questionPreview })
      }
      if ((!isEmpty(q.leftItem3) && isEmpty(q.rightItem3)) || (isEmpty(q.leftItem3) && !isEmpty(q.rightItem3))) {
        warnings.push({ row, field: 'pair 3', message: 'Pair 3 is incomplete: either the left item or right item is missing. Both sides must have values to create a complete matching pair.', question: questionPreview })
      }
      if ((!isEmpty(q.leftItem4) && isEmpty(q.rightItem4)) || (isEmpty(q.leftItem4) && !isEmpty(q.rightItem4))) {
        warnings.push({ row, field: 'pair 4', message: 'Pair 4 is incomplete: either the left item or right item is missing. Both sides must have values to create a complete matching pair.', question: questionPreview })
      }
    }

    if (type === 'fill') {
      if (isEmpty(q.answer)) {
        errors.push({ row, field: 'answer', message: 'Answer field is empty. You must provide the correct word or phrase that fills the blank in the question. This field cannot be left blank.', question: questionPreview })
        hasError = true
      }
      // Check if question contains blank marker
      if (q.question && !toStr(q.question).includes('_')) {
        warnings.push({ row, field: 'question', message: 'Question is missing a blank marker. "Fill in the Blanks" questions should contain one or more blank markers (underscores like _______) to indicate where students should fill in the missing word.', question: questionPreview })
      }
    }

    if (type === 'reorder') {
      let stepCount = 0
      if (!isEmpty(q.step1)) stepCount++
      if (!isEmpty(q.step2)) stepCount++
      if (!isEmpty(q.step3)) stepCount++
      if (!isEmpty(q.step4)) stepCount++
      
      if (stepCount < 2) {
        errors.push({ row, field: 'steps', message: `Only ${stepCount} step(s) found. Reorder questions require at least 2 steps for students to arrange. Add more steps (Step 1, Step 2, etc.) to create a valid reorder question.`, question: questionPreview })
        hasError = true
      }
    }

    if (type === 'truefalse') {
      const isTrueVal = toStr(q.isTrue).toLowerCase()
      if (isTrueVal !== 'true' && isTrueVal !== 'false') {
        errors.push({ row, field: 'isTrue', message: `The isTrue field contains "${q.isTrue}", which is invalid. For True/False questions, this field must contain either "True" or "False" (case-insensitive). Check for typos or extra spaces.`, question: questionPreview })
        hasError = true
      }
    }

    // Timer validation (warning only)
    if (q.timer && (Number(q.timer) < 10 || Number(q.timer) > 120)) {
      warnings.push({ row, field: 'timer', message: `Timer ${q.timer}s seems unusual (recommended: 10-120 seconds)`, question: questionPreview })
    }

    // Image URL validation (warning only)
    const imageUrl = toStr(q.imageUrl)
    if (imageUrl !== '') {
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        warnings.push({ row, field: 'imageUrl', message: 'Image URL should start with http:// or https://', question: questionPreview })
      }
    }

    if (!hasError) {
      // Normalize the question data - convert all values to strings where needed
      validQuestions.push({
        ...q,
        subject: toStr(q.subject).toLowerCase(),
        type: toStr(q.type).toLowerCase() as ExcelQuestion['type'],
        level: Number(q.level),
        timer: Number(q.timer) || 30,
        question: toStr(q.question),
        optionA: toStr(q.optionA),
        optionB: toStr(q.optionB),
        optionC: toStr(q.optionC),
        optionD: toStr(q.optionD),
        correctAnswer: toStr(q.correctAnswer),
        answer: toStr(q.answer),
        isTrue: toStr(q.isTrue),
        step1: toStr(q.step1),
        step2: toStr(q.step2),
        step3: toStr(q.step3),
        step4: toStr(q.step4),
        leftItem1: toStr(q.leftItem1),
        rightItem1: toStr(q.rightItem1),
        leftItem2: toStr(q.leftItem2),
        rightItem2: toStr(q.rightItem2),
        leftItem3: toStr(q.leftItem3),
        rightItem3: toStr(q.rightItem3),
        leftItem4: toStr(q.leftItem4),
        rightItem4: toStr(q.rightItem4),
        imageUrl: toStr(q.imageUrl),
      })
    } else {
      skippedCount++
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validQuestions,
    skippedCount
  }
}
