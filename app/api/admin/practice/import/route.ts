import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

function isAllowedImportedImageUrl(url: string): boolean {
  const trimmed = url.trim()
  return trimmed === "" || trimmed.startsWith("/api/images/")
}

interface PracticeImportQuestion {
  unit: number
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
  const type = q.type.toLowerCase()

  if (type === "mcq") {
    const options = [q.optionA, q.optionB, q.optionC, q.optionD]
      .filter((o) => o && String(o).trim().length > 0)
      .map((text) => ({
        text: String(text).trim(),
        is_correct:
          String(text).trim().toLowerCase() === String(q.correctAnswer || "").trim().toLowerCase(),
      }))
    return { options }
  } else if (type === "matching") {
    const pairs: Array<{ left: string; right: string }> = []
    for (let i = 1; i <= 4; i++) {
      const left = (q as any)[`leftItem${i}`]
      const right = (q as any)[`rightItem${i}`]
      if (left && right && String(left).trim() && String(right).trim()) {
        pairs.push({ left: String(left).trim(), right: String(right).trim() })
      }
    }
    return { pairs }
  } else if (type === "fill") {
    return { answers: [String(q.answer || "").trim()] }
  } else if (type === "reorder") {
    const items: Array<{ text: string; correct_position: number }> = []
    for (let i = 1; i <= 4; i++) {
      const step = (q as any)[`step${i}`]
      if (step && String(step).trim()) {
        items.push({ text: String(step).trim(), correct_position: i })
      }
    }
    return { items }
  } else if (type === "truefalse") {
    return {
      correct_answer: String(q.isTrue || "").trim().toLowerCase() === "true",
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
    const createdBy = createdByRaw.trim().toUpperCase()

    if (!questionsJson) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 })
    }

    const questions: PracticeImportQuestion[] = JSON.parse(questionsJson)
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "No questions in JSON" }, { status: 400 })
    }

    console.log("[practice-import] Starting import of", questions.length, "questions with createdBy:", createdBy)

    // Validate createdBy
    if (!createdBy || (createdBy !== "MES" && createdBy !== "MIE")) {
      return NextResponse.json({
        error: `Invalid createdBy value: "${createdBy}". Must be "MES" or "MIE"`,
        successCount: 0,
        errorCount: questions.length,
        errors: [`Invalid createdBy: "${createdBy}". Must be "MES" or "MIE".`],
      }, { status: 400 })
    }

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    const unitStats: Record<string, { success: number; errors: string[] }> = {}

    const addUnitError = (q: any, errMsg: string) => {
      const uKey = q.unit ? "Unit " + q.unit : "Unknown Unit"
      if (!unitStats[uKey]) unitStats[uKey] = { success: 0, errors: [] }
      unitStats[uKey].errors.push(errMsg)
    }

    const addUnitSuccess = (q: any) => {
      const uKey = q.unit ? "Unit " + q.unit : "Unknown Unit"
      if (!unitStats[uKey]) unitStats[uKey] = { success: 0, errors: [] }
      unitStats[uKey].success++
    }

    const VALID_TYPES = ["mcq", "matching", "fill", "reorder", "truefalse"]

    for (const q of questions) {
      try {
        const rowNum = questions.indexOf(q) + 2
        const questionPreview = String(q.question || "").substring(0, 40) || "[Empty Question]"

        // Resolve unit
        const unitNum = Number(q.unit)
        if (!Number.isInteger(unitNum) || unitNum < 1) {
          const errMsg = createErrorMessage(rowNum, questionPreview, "unit", `Unit "${q.unit}" is not a valid integer`, "Enter a positive integer (e.g. 1, 2, 3).")
          errors.push(errMsg)
          addUnitError(q, errMsg)
          errorCount++
          continue
        }

        const unitResult = await pool.query(
          "SELECT id FROM practice_units WHERE unit_no = $1 LIMIT 1",
          [unitNum]
        )
        if (unitResult.rows.length === 0) {
          const errMsg = createErrorMessage(rowNum, questionPreview, "unit", `Unit ${unitNum} does not exist`, `Available units: 1 through 6. Create the unit first in the admin panel.`)
          errors.push(errMsg)
          addUnitError(q, errMsg)
          errorCount++
          continue
        }
        const unitId = unitResult.rows[0].id

        // Validate type
        const type = String(q.type || "").trim().toLowerCase()
        if (!VALID_TYPES.includes(type)) {
          const errMsg = createErrorMessage(rowNum, questionPreview, "type", `Type "${q.type}" is not recognized`, `Must be one of: ${VALID_TYPES.join(", ")}`)
          errors.push(errMsg)
          addUnitError(q, errMsg)
          errorCount++
          continue
        }

        // Validate question text
        if (!q.question || String(q.question).trim().length === 0) {
          const errMsg = createErrorMessage(rowNum, questionPreview, "question", "Question text is empty")
          errors.push(errMsg)
          addUnitError(q, errMsg)
          errorCount++
          continue
        }

        // Validate imageUrl if present
        const imageUrl = String(q.imageUrl || "").trim()
        if (imageUrl && !isAllowedImportedImageUrl(imageUrl)) {
          const errMsg = createErrorMessage(rowNum, questionPreview, "imageUrl", `External image URLs are not allowed: "${imageUrl}"`, "Upload the image first via the admin panel, then use the /api/images/... path.")
          errors.push(errMsg)
          addUnitError(q, errMsg)
          errorCount++
          continue
        }

        // Build answer_data
        const answerData = buildAnswerData({ ...q, type })

        // Insert question
        await pool.query(
          `INSERT INTO practice_questions
             (unit_id, question_type, question_text, instruction, image_url, answer_data)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            unitId,
            type,
            String(q.question).trim(),
            q.instruction ? String(q.instruction).trim() : null,
            imageUrl || null,
            JSON.stringify(answerData)
          ]
        )

        successCount++
        addUnitSuccess(q)
      } catch (err: any) {
        const rowNum = questions.indexOf(q) + 2
        const questionPreview = String(q.question || "").substring(0, 40) || "[Empty Question]"
        console.error(`[practice-import] Error on row ${rowNum}:`, err)
        const errMsg = createErrorMessage(rowNum, questionPreview, "database", `Database error: ${err?.message || "Unknown"}`)
        errors.push(errMsg)
        addUnitError(q, errMsg)
        errorCount++
      }
    }

    return NextResponse.json({
      successCount,
      errorCount,
      totalProcessed: questions.length,
      errors,
      unitStats,
      message: errorCount === 0 ? "All questions imported successfully!" : undefined,
    })
  } catch (error: any) {
    console.error("[practice-import] Fatal error:", error)
    return NextResponse.json({ error: "Import failed: " + (error?.message || "Unknown error") }, { status: 500 })
  }
}
