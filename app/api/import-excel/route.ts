import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// Render persistent disk (or local fallback for dev)
const IMAGES_DIR = process.env.RENDER_DISK_PATH
  ? path.join(process.env.RENDER_DISK_PATH, "question-images")
  : path.join(process.cwd(), "public", "uploads")

// Helper to check if URL is external
function isExternalUrl(url: string): boolean {
  if (!url || url.trim() === '') return false
  if (url.startsWith('data:')) return false
  if (url.startsWith('/api/images/')) return false
  if (url.startsWith('/')) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

// Download external image and store on Render persistent disk
async function downloadAndStoreImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    if (!contentType.startsWith('image/')) {
      console.error('[import] Invalid content type:', contentType)
      return null
    }

    if (buffer.byteLength > 5 * 1024 * 1024) {
      console.error('[import] Downloaded image exceeds 5MB limit')
      return null
    }

    // Determine extension from content type
    let ext = 'jpg'
    if (contentType.includes('png')) ext = 'png'
    else if (contentType.includes('gif')) ext = 'gif'
    else if (contentType.includes('webp')) ext = 'webp'

    const filename = `imported-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    const filePath = path.join(IMAGES_DIR, filename)

    await mkdir(IMAGES_DIR, { recursive: true })
    await writeFile(filePath, buffer)

    return `/api/images/${filename}`
  } catch (error) {
    console.error('[import] Error downloading/storing image:', error)
    return null
  }
}

interface ExcelQuestion {
  subject: string
  level: number
  type: string
  question: string
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
  statement?: string
  isTrue?: string
  timer: number
  imageUrl?: string
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const questionsJson = formData.get("questions") as string
    const createdByRaw = (formData.get("createdBy") as string) || "MES"
    const createdBy = createdByRaw.trim().toUpperCase()

    if (!questionsJson) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 })
    }

    const questions: ExcelQuestion[] = JSON.parse(questionsJson)
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "No questions in JSON" }, { status: 400 })
    }

    console.log('[import] Starting import of', questions.length, 'questions with createdBy:', createdBy)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Validate createdBy immediately
    if (!createdBy || (createdBy !== 'MES' && createdBy !== 'MIE')) {
      return NextResponse.json({
        error: `Invalid createdBy value: "${createdBy}". Must be "MES" or "MIE"`,
        successCount: 0,
        errorCount: questions.length,
        errors: [`Invalid createdBy: "${createdBy}". Must be "MES" or "MIE".`]
      }, { status: 400 })
    }

    for (const q of questions) {
      try {
        // Get subject ID
        const subjectResult = await pool.query(
          `SELECT id FROM subjects WHERE LOWER(name) = LOWER($1) LIMIT 1`,
          [q.subject]
        )
        if (subjectResult.rows.length === 0) {
          errors.push(`Subject not found: ${q.subject}`)
          errorCount++
          continue
        }
        const subjectId = subjectResult.rows[0].id

        // Get level ID
        const levelResult = await pool.query(
          `SELECT id FROM levels WHERE level_number = $1 LIMIT 1`,
          [q.level]
        )
        if (levelResult.rows.length === 0) {
          errors.push(`Level not found: ${q.level}`)
          errorCount++
          continue
        }
        const levelId = levelResult.rows[0].id

        // Get question type ID
        const typeResult = await pool.query(
          `SELECT id FROM question_types WHERE name = $1 LIMIT 1`,
          [q.type]
        )
        if (typeResult.rows.length === 0) {
          errors.push(`Question type not found: ${q.type}`)
          errorCount++
          continue
        }
        const typeId = typeResult.rows[0].id

        // Handle image: download external images to Render persistent disk
        let finalImageUrl: string | null = null
        if (q.imageUrl && isExternalUrl(q.imageUrl)) {
          try {
            finalImageUrl = await downloadAndStoreImage(q.imageUrl)
          } catch (imgError) {
            console.error(`[import] Failed to download/store image: ${imgError}`)
          }
        } else if (q.imageUrl) {
          // Already a local URL (e.g. /api/images/...) — keep as-is
          finalImageUrl = q.imageUrl
        }

        // Insert question using pg pool (Render PostgreSQL)
        const questionResult = await pool.query(
          `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, image_url, timer_seconds, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [subjectId, levelId, typeId, q.question, finalImageUrl, q.timer || 30, createdBy]
        )
        const questionId = questionResult.rows[0].id

        // Insert type-specific data
        if (q.type === "mcq") {
          const options = [
            { text: q.optionA || "", correct: q.correctAnswer === q.optionA },
            { text: q.optionB || "", correct: q.correctAnswer === q.optionB },
            { text: q.optionC || "", correct: q.correctAnswer === q.optionC },
            { text: q.optionD || "", correct: q.correctAnswer === q.optionD },
          ]
          for (let i = 0; i < options.length; i++) {
            await pool.query(
              `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
               VALUES ($1, $2, $3, $4)`,
              [questionId, i + 1, options[i].text, options[i].correct]
            )
          }
        } else if (q.type === "matching") {
          const pairs = []
          if (q.leftItem1 && q.rightItem1) pairs.push({ left: q.leftItem1, right: q.rightItem1 })
          if (q.leftItem2 && q.rightItem2) pairs.push({ left: q.leftItem2, right: q.rightItem2 })
          if (q.leftItem3 && q.rightItem3) pairs.push({ left: q.leftItem3, right: q.rightItem3 })
          if (q.leftItem4 && q.rightItem4) pairs.push({ left: q.leftItem4, right: q.rightItem4 })

          for (let i = 0; i < pairs.length; i++) {
            await pool.query(
              `INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
               VALUES ($1, $2, $3, $4)`,
              [questionId, i + 1, pairs[i].left, pairs[i].right]
            )
          }
        } else if (q.type === "fill") {
          await pool.query(
            `INSERT INTO fill_answers (question_id, answer_text, case_sensitive)
             VALUES ($1, $2, $3)`,
            [questionId, q.answer || "", false]
          )
        } else if (q.type === "reorder") {
          const items = []
          if (q.step1) items.push({ text: q.step1, pos: 1 })
          if (q.step2) items.push({ text: q.step2, pos: 2 })
          if (q.step3) items.push({ text: q.step3, pos: 3 })
          if (q.step4) items.push({ text: q.step4, pos: 4 })

          for (let i = 0; i < items.length; i++) {
            await pool.query(
              `INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
               VALUES ($1, $2, $3, $4)`,
              [questionId, i + 1, items[i].text, items[i].pos]
            )
          }
        } else if (q.type === "truefalse") {
          await pool.query(
            `INSERT INTO truefalse_answers (question_id, correct_answer, explanation)
             VALUES ($1, $2, $3)`,
            [questionId, q.isTrue?.toLowerCase() === "true", null]
          )
        }

        successCount++
      } catch (error: any) {
        const errorMessage = error?.message || String(error)
        console.error("[import] Error importing question:", errorMessage)
        errors.push(`Failed: ${q.question?.substring(0, 30)}... - ${errorMessage}`)
        errorCount++
      }
    }

    return NextResponse.json({
      message: `Imported ${successCount} questions successfully. ${errorCount} failed.`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10),
    })
  } catch (error) {
    console.error("[import] Import error:", error)
    return NextResponse.json({ error: "Failed to import questions" }, { status: 500 })
  }
}
