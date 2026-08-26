import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

function isAllowedImportedImageUrl(url: string): boolean {
  const trimmed = url.trim()
  return trimmed === "" || trimmed.startsWith("/api/images/") || trimmed.startsWith("http")
}

interface PracticeImportQuestion {
  unit: number | string
  type: string
  question: string
  instruction?: string
  imageUrl?: string
  timer?: number
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctAnswer?: string
  leftItem1?: string
  rightItem1?: string
  leftItem2?: string
  rightItem2?: string
  leftItem3?: string
  rightItem3?: string
  leftItem4?: string
  rightItem4?: string
  answer?: string
  step1?: string
  step2?: string
  step3?: string
  step4?: string
  isTrue?: string
  subject?: string
  level?: number | string
}

function createErrorMessage(rowNum: number, questionPreview: string, field: string, reason: string, details?: string): string {
  let msg = `❌ Row ${rowNum}: "${questionPreview}"\n`
  msg += `   Error in Field: ${field}\n`
  msg += `   What Went Wrong: ${reason}\n`
  if (details) {
    msg += `   How to Fix: ${details}`
  }
  return msg
}

/**
 * Build JSONB answer_data from an import question (server-side).
 */
function buildAnswerData(q: PracticeImportQuestion): any {
  const type = String(q.type || "").toLowerCase().replace(/[-_\s]+/g, "")

  if (type === "mcq" || type === "multiplechoice" || type === "choice") {
    const optA = String(q.optionA || "").trim()
    const optB = String(q.optionB || "").trim()
    const optC = String(q.optionC || "").trim()
    const optD = String(q.optionD || "").trim()

    let correctText = String(q.correctAnswer || "").trim()
    const upperCorrect = correctText.toUpperCase()
    if (upperCorrect === "A" || upperCorrect === "OPTIONA" || upperCorrect === "OPTION A") {
      correctText = optA
    } else if (upperCorrect === "B" || upperCorrect === "OPTIONB" || upperCorrect === "OPTION B") {
      correctText = optB
    } else if (upperCorrect === "C" || upperCorrect === "OPTIONC" || upperCorrect === "OPTION C") {
      correctText = optC
    } else if (upperCorrect === "D" || upperCorrect === "OPTIOND" || upperCorrect === "OPTION D") {
      correctText = optD
    }

    const options = [optA, optB, optC, optD]
      .filter((o) => o.length > 0)
      .map((text) => ({
        text,
        is_correct: text.toLowerCase() === correctText.toLowerCase(),
      }))
    return { options }
  } else if (type === "matching" || type === "match" || type === "pairs") {
    const pairs: Array<{ left: string; right: string }> = []
    for (let i = 1; i <= 4; i++) {
      const left = (q as any)[`leftItem${i}`] || (q as any)[`left${i}`]
      const right = (q as any)[`rightItem${i}`] || (q as any)[`right${i}`]
      if (left && right && String(left).trim() && String(right).trim()) {
        pairs.push({ left: String(left).trim(), right: String(right).trim() })
      }
    }
    return { pairs }
  } else if (type === "fill" || type === "fillintheblanks" || type === "fillin" || type === "blank") {
    return { answers: [String(q.answer || q.correctAnswer || "").trim()] }
  } else if (type === "reorder" || type === "ordering" || type === "order" || type === "sequence") {
    const items: Array<{ text: string; correct_position: number }> = []
    for (let i = 1; i <= 4; i++) {
      const step = (q as any)[`step${i}`] || (q as any)[`item${i}`]
      if (step && String(step).trim()) {
        items.push({ text: String(step).trim(), correct_position: i })
      }
    }
    return { items }
  } else if (type === "truefalse" || type === "tf" || type === "boolean") {
    const rawVal = String(q.isTrue || q.answer || q.correctAnswer || "").trim().toLowerCase()
    const isTrue = rawVal === "true" || rawVal === "t" || rawVal === "1" || rawVal === "yes" || rawVal === "vrai"
    return {
      correct_answer: isTrue,
      explanation: "",
    }
  }
  return {}
}

export async function POST(req: NextRequest) {
  const authError = verifyAdminToken(req)
  if (authError) return authError

  try {
    const formData = await req.formData()
    const questionsJson = formData.get("questions") as string
    const createdByRaw = (formData.get("createdBy") as string) || "MES"
    const createdBy = createdByRaw.trim().toUpperCase() || "MES"

    if (!questionsJson) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 })
    }

    const questions: PracticeImportQuestion[] = JSON.parse(questionsJson)
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "No questions found in data" }, { status: 400 })
    }

    console.log("[practice-import] Starting import of", questions.length, "questions by", createdBy)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    const unitStats: Record<string, { success: number; errors: string[] }> = {}

    const addUnitError = (uNum: any, errMsg: string) => {
      const uKey = uNum ? "Unit " + uNum : "Unknown Unit"
      if (!unitStats[uKey]) unitStats[uKey] = { success: 0, errors: [] }
      unitStats[uKey].errors.push(errMsg)
    }

    const addUnitSuccess = (uNum: any) => {
      const uKey = uNum ? "Unit " + uNum : "Unknown Unit"
      if (!unitStats[uKey]) unitStats[uKey] = { success: 0, errors: [] }
      unitStats[uKey].success++
    }

    const VALID_TYPES = ["mcq", "matching", "fill", "reorder", "truefalse"]

    for (const q of questions) {
      const rowNum = questions.indexOf(q) + 2
      const questionPreview = String(q.question || "").substring(0, 40) || "[Empty Question]"

      try {
        // Resolve unit number
        let unitNum: number = 1
        const rawUnitVal = q.unit ?? (q as any).Unit ?? (q as any).unitno ?? (q as any).unit_no ?? (q as any)["Unit No"] ?? (q as any)["Unit Number"] ?? (q as any).theme
        if (rawUnitVal !== undefined && rawUnitVal !== null && String(rawUnitVal).trim() !== "") {
          const rawUnit = String(rawUnitVal).trim()
          const g6Match = rawUnit.match(/grade\s*6\s*unit\s*(\d+)/i)
          const g5Match = rawUnit.match(/grade\s*5\s*unit\s*(\d+)/i)
          if (g6Match) {
            unitNum = 5 + parseInt(g6Match[1], 10)
          } else if (g5Match) {
            unitNum = parseInt(g5Match[1], 10)
          } else {
            const numMatch = rawUnit.match(/\d+/)
            if (numMatch) {
              unitNum = parseInt(numMatch[0], 10)
            }
          }
        } else if (q.level !== undefined && q.level !== null) {
          const lvl = parseInt(String(q.level).replace(/\D/g, ""), 10) || 1
          const subj = String(q.subject || "").toLowerCase()
          unitNum = subj.includes("geo") ? Math.min(2 + lvl, 5) : Math.min(lvl, 5)
        }

        if (unitNum < 1 || unitNum > 10) {
          unitNum = 1
        }

        // Query database for unit ID
        let unitResult = await pool.query(
          "SELECT id FROM practice_units WHERE unit_no = $1 LIMIT 1",
          [unitNum]
        )

        // Fallback: If not matched by unit_no, try by ID or unit_name
        if (unitResult.rows.length === 0) {
          unitResult = await pool.query(
            "SELECT id FROM practice_units WHERE id = $1 OR unit_name ILIKE $2 LIMIT 1",
            [unitNum, `%Unit ${unitNum}%`]
          )
        }

        if (unitResult.rows.length === 0) {
          const errMsg = createErrorMessage(
            rowNum,
            questionPreview,
            "unit",
            `Unit ${unitNum} does not exist in the database`,
            "Please check unit numbers in Admin panel (Units 1-10)."
          )
          errors.push(errMsg)
          addUnitError(unitNum, errMsg)
          errorCount++
          continue
        }

        const unitId = unitResult.rows[0].id

        // Validate and normalize type
        let rawType = String(q.type || "").trim().toLowerCase().replace(/[-_\s]+/g, "")
        if (rawType === "multiplechoice" || rawType === "choice") rawType = "mcq"
        if (rawType === "match" || rawType === "pairs") rawType = "matching"
        if (rawType === "fillintheblanks" || rawType === "fillin" || rawType === "blank") rawType = "fill"
        if (rawType === "ordering" || rawType === "order" || rawType === "sequence") rawType = "reorder"
        if (rawType === "tf" || rawType === "boolean") rawType = "truefalse"

        if (!VALID_TYPES.includes(rawType)) {
          const errMsg = createErrorMessage(
            rowNum,
            questionPreview,
            "type",
            `Type "${q.type}" is not recognized`,
            `Must be one of: ${VALID_TYPES.join(", ")}`
          )
          errors.push(errMsg)
          addUnitError(unitNum, errMsg)
          errorCount++
          continue
        }

        // Validate question text
        if (!q.question || String(q.question).trim().length === 0) {
          const errMsg = createErrorMessage(rowNum, questionPreview, "question", "Question text is empty")
          errors.push(errMsg)
          addUnitError(unitNum, errMsg)
          errorCount++
          continue
        }

        // Validate imageUrl
        const imageUrl = String(q.imageUrl || "").trim()

        // Build answer_data
        const answerData = buildAnswerData({ ...q, type: rawType })

        // Insert question into database
        await pool.query(
          `INSERT INTO practice_questions
             (unit_id, question_type, question_text, instruction, image_url, answer_data, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true)`,
          [
            unitId,
            rawType,
            String(q.question).trim(),
            q.instruction ? String(q.instruction).trim() : null,
            imageUrl || null,
            JSON.stringify(answerData),
          ]
        )

        successCount++
        addUnitSuccess(unitNum)
      } catch (err: any) {
        console.error(`[practice-import] Error on row ${rowNum}:`, err)
        const errMsg = createErrorMessage(
          rowNum,
          questionPreview,
          "database",
          `Database error: ${err?.message || "Unknown"}`
        )
        errors.push(errMsg)
        addUnitError(q.unit, errMsg)
        errorCount++
      }
    }

    return NextResponse.json({
      successCount,
      errorCount,
      totalProcessed: questions.length,
      errors,
      unitStats,
      message: errorCount === 0 ? "All practice questions imported successfully!" : undefined,
    })
  } catch (error: any) {
    console.error("[practice-import] Fatal error:", error)
    return NextResponse.json({ error: "Import failed: " + (error?.message || "Unknown error") }, { status: 500 })
  }
}
