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
  instruction?: string
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

// Helper function to create clear error messages
function createErrorMessage(rowNum: number, questionPreview: string, field: string, reason: string, details?: string): string {
  let msg = `❌ Row ${rowNum}: "${questionPreview}"`
  msg += `\n   Field: ${field}`
  msg += `\n   Issue: ${reason}`
  if (details) {
    msg += `\n   Details: ${details}`
  }
  return msg
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
        const rowNum = questions.indexOf(q) + 2 // Excel row (1-indexed + header)
        const questionPreview = (q.question || "").substring(0, 40) || "[Empty Question]"

        // Get subject ID
        const subjectResult = await pool.query(
          `SELECT id FROM subjects WHERE LOWER(name) = LOWER($1) LIMIT 1`,
          [q.subject]
        )
        if (subjectResult.rows.length === 0) {
          const reason = `Subject "${q.subject}" does not exist in the system`
          const details = `Valid subjects are: "history", "geography". Provided: "${q.subject}". Check spelling and spacing.`
          errors.push(createErrorMessage(rowNum, questionPreview, 'subject', reason, details))
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
          const reason = `Level "${q.level}" is not valid`
          const details = `Difficulty level must be 1 (Easy), 2 (Medium), or 3 (Hard). Provided: "${q.level}". Make sure it's a number without text.`
          errors.push(createErrorMessage(rowNum, questionPreview, 'level', reason, details))
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
          const reason = `Question type "${q.type}" does not exist`
          const details = `Valid types are: "mcq", "matching", "fill", "reorder", "truefalse". Provided: "${q.type}". Ensure type matches the Excel sheet name.`
          errors.push(createErrorMessage(rowNum, questionPreview, 'type', reason, details))
          errorCount++
          continue
        }
        const typeId = typeResult.rows[0].id

        // Handle image: download external images to Render persistent disk
        let finalImageUrl: string | null = null
        if (q.imageUrl && isExternalUrl(q.imageUrl)) {
          try {
            const downloadedUrl = await downloadAndStoreImage(q.imageUrl)
            finalImageUrl = downloadedUrl
            if (!downloadedUrl) {
              console.warn(`[import] Image download failed (non-fatal): ${q.imageUrl}`)
            }
          } catch (imgError) {
            console.error(`[import] Failed to download/store image: ${imgError}`)
          }
        } else if (q.imageUrl) {
          // Already a local URL (e.g. /api/images/...) — keep as-is
          finalImageUrl = q.imageUrl
        }

        // Insert question using pg pool (Render PostgreSQL)
        let questionId: number
        try {
          const questionResult = await pool.query(
            `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, instruction, image_url, timer_seconds, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [subjectId, levelId, typeId, q.question, q.instruction || null, finalImageUrl, q.timer || 30, createdBy]
          )
          questionId = questionResult.rows[0].id
        } catch (dbError: any) {
          const reason = `Database error while creating question`
          const details = `The question text may be too long or contain invalid characters. Error: ${dbError?.message?.substring(0, 80) || 'Unknown error'}`
          errors.push(createErrorMessage(rowNum, questionPreview, 'question', reason, details))
          errorCount++
          continue
        }

        // Insert type-specific data with better error handling
        try {
          if (q.type === "mcq") {
            // Validate MCQ structure
            if (!q.optionA || !q.optionB || !q.optionC || !q.optionD) {
              const missingOptions = []
              if (!q.optionA) missingOptions.push('A')
              if (!q.optionB) missingOptions.push('B')
              if (!q.optionC) missingOptions.push('C')
              if (!q.optionD) missingOptions.push('D')
              const reason = `MCQ missing option(s): ${missingOptions.join(', ')}`
              const details = `All four options (A, B, C, D) are required. Missing: ${missingOptions.join(', ')}.`
              errors.push(createErrorMessage(rowNum, questionPreview, `option${missingOptions[0]}`, reason, details))
              errorCount++
              continue
            }

            // Normalize correctAnswer for robust matching with 3-tier fallback system
            const correctAnswerNorm = (q.correctAnswer || "").toString().trim().toLowerCase()
            const options = [
              { text: (q.optionA || "").toString().trim(), order: 1, label: 'A' },
              { text: (q.optionB || "").toString().trim(), order: 2, label: 'B' },
              { text: (q.optionC || "").toString().trim(), order: 3, label: 'C' },
              { text: (q.optionD || "").toString().trim(), order: 4, label: 'D' },
            ]
            
            // Tier 1: Exact text match (normalized)
            let foundIndex = -1
            for (let i = 0; i < options.length; i++) {
              if (options[i].text.toLowerCase() === correctAnswerNorm) {
                foundIndex = i
                break
              }
            }

            // Tier 2: Single letter match (A, B, C, D)
            if (foundIndex === -1 && correctAnswerNorm.length === 1) {
              const letterChar = correctAnswerNorm.charCodeAt(0)
              const aCharCode = 'a'.charCodeAt(0)
              const letterIndex = letterChar - aCharCode
              if (letterIndex >= 0 && letterIndex < 4) {
                foundIndex = letterIndex
              }
            }

            // Tier 3: Partial match (first 10 characters)
            if (foundIndex === -1 && correctAnswerNorm.length > 0) {
              const searchPrefix = correctAnswerNorm.substring(0, Math.min(10, correctAnswerNorm.length))
              for (let i = 0; i < options.length; i++) {
                if (options[i].text.toLowerCase().startsWith(searchPrefix)) {
                  foundIndex = i
                  break
                }
              }
            }

            // Critical validation: must find a correct answer
            if (foundIndex === -1) {
              const reason = `Cannot determine correct answer - no match found after all matching attempts`
              const details = `Correct Answer: "${q.correctAnswer}". Options are: A="${q.optionA}", B="${q.optionB}", C="${q.optionC}", D="${q.optionD}". Ensure correctAnswer matches at least the first few characters of one option.`
              errors.push(createErrorMessage(rowNum, questionPreview, 'correctAnswer', reason, details))
              errorCount++
              // Delete the question we just created since we can't determine correct answer
              await pool.query(`DELETE FROM questions WHERE id = $1`, [questionId])
              continue
            }

            // Now safely insert all options with only ONE marked as correct
            for (let i = 0; i < options.length; i++) {
              const isCorrect = i === foundIndex
              await pool.query(
                `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
                 VALUES ($1, $2, $3, $4)`,
                [questionId, options[i].order, options[i].text, isCorrect]
              )
            }
          } else if (q.type === "matching") {
            // Validate matching pairs
            const pairs = []
            let pairErrors = []
            
            if ((q.leftItem1 || q.rightItem1) && !(q.leftItem1 && q.rightItem1)) {
              pairErrors.push('Pair 1: both left and right items required')
            } else if (q.leftItem1 && q.rightItem1) {
              pairs.push({ left: q.leftItem1, right: q.rightItem1 })
            }

            if ((q.leftItem2 || q.rightItem2) && !(q.leftItem2 && q.rightItem2)) {
              pairErrors.push('Pair 2: both left and right items required')
            } else if (q.leftItem2 && q.rightItem2) {
              pairs.push({ left: q.leftItem2, right: q.rightItem2 })
            }

            if ((q.leftItem3 || q.rightItem3) && !(q.leftItem3 && q.rightItem3)) {
              pairErrors.push('Pair 3: both left and right items required')
            } else if (q.leftItem3 && q.rightItem3) {
              pairs.push({ left: q.leftItem3, right: q.rightItem3 })
            }

            if ((q.leftItem4 || q.rightItem4) && !(q.leftItem4 && q.rightItem4)) {
              pairErrors.push('Pair 4: both left and right items required')
            } else if (q.leftItem4 && q.rightItem4) {
              pairs.push({ left: q.leftItem4, right: q.rightItem4 })
            }

            if (pairErrors.length > 0) {
              const reason = `Incomplete matching pairs detected`
              const details = `Issues: ${pairErrors.join('. ')}. Complete pairs need both left and right items. Incomplete pairs will be ignored.`
              errors.push(createErrorMessage(rowNum, questionPreview, 'matching_pairs', reason, details))
            }

            if (pairs.length < 2) {
              const reason = `Insufficient matching pairs`
              const details = `Found ${pairs.length} complete pair(s). Minimum 2 pairs required. Check that each left item has a matching right item.`
              errors.push(createErrorMessage(rowNum, questionPreview, 'matching_pairs', reason, details))
              errorCount++
              continue
            }

            for (let i = 0; i < pairs.length; i++) {
              await pool.query(
                `INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
                 VALUES ($1, $2, $3, $4)`,
                [questionId, i + 1, pairs[i].left, pairs[i].right]
              )
            }
          } else if (q.type === "fill") {
            if (!q.answer) {
              const reason = `Fill question answer is empty`
              const details = `The "answer" field must contain the correct word/phrase that fills the blank. Example: if question is "Mauritius is in the ______ Ocean", answer should be "Indian".`
              errors.push(createErrorMessage(rowNum, questionPreview, 'answer', reason, details))
              errorCount++
              continue
            }
            await pool.query(
              `INSERT INTO fill_answers (question_id, answer_text, case_sensitive)
               VALUES ($1, $2, $3)`,
              [questionId, q.answer || "", false]
            )
          } else if (q.type === "reorder") {
            const items = []
            let itemCount = 0
            if (q.step1) { items.push({ text: q.step1, pos: 1 }); itemCount++ }
            if (q.step2) { items.push({ text: q.step2, pos: 2 }); itemCount++ }
            if (q.step3) { items.push({ text: q.step3, pos: 3 }); itemCount++ }
            if (q.step4) { items.push({ text: q.step4, pos: 4 }); itemCount++ }

            if (itemCount < 2) {
              const reason = `Insufficient reorder steps`
              const details = `Found ${itemCount} step(s). Minimum 2 steps required. Steps are entered in: step1, step2, step3, step4 columns.`
              errors.push(createErrorMessage(rowNum, questionPreview, 'steps', reason, details))
              errorCount++
              continue
            }

            for (let i = 0; i < items.length; i++) {
              await pool.query(
                `INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
                 VALUES ($1, $2, $3, $4)`,
                [questionId, i + 1, items[i].text, items[i].pos]
              )
            }
          } else if (q.type === "truefalse") {
            const isTrueValue = (q.isTrue || "").toString().toLowerCase().trim()
            if (isTrueValue !== 'true' && isTrueValue !== 'false') {
              const reason = `Invalid True/False value`
              const details = `The "isTrue" field must be "True" or "False" (case-insensitive). Provided: "${q.isTrue}". Check for typos.`
              errors.push(createErrorMessage(rowNum, questionPreview, 'isTrue', reason, details))
              errorCount++
              continue
            }
            await pool.query(
              `INSERT INTO truefalse_answers (question_id, correct_answer, explanation)
               VALUES ($1, $2, $3)`,
              [questionId, isTrueValue === "true", null]
            )
          }
        } catch (typeError: any) {
          const reason = `Error storing ${q.type} answer data`
          const details = `Database error: ${typeError?.message?.substring(0, 100) || 'Unknown error'}. Check that answer fields match the template.`
          errors.push(createErrorMessage(rowNum, questionPreview, `${q.type}_answers`, reason, details))
          errorCount++
          continue
        }

        successCount++
      } catch (error: any) {
        const rowNum = questions.indexOf(q) + 2
        const questionPreview = (q.question || "").substring(0, 40) || "[Empty Question]"
        const reason = `Unexpected error during import`
        const details = `${error?.message || 'Unknown error'}. Check question data and try again.`
        errors.push(createErrorMessage(rowNum, questionPreview, 'general', reason, details))
        errorCount++
      }
    }

    // Build summary message
    let summaryMessage = ""
    if (successCount > 0) {
      summaryMessage += `✅ Success: ${successCount} question(s) imported successfully.\n`
    }
    if (errorCount > 0) {
      summaryMessage += `❌ Failed: ${errorCount} question(s) failed to import.\n`
    }
    if (errors.length > 0) {
      summaryMessage += `\n📋 Error Details (showing first ${Math.min(errors.length, 15)} issues):\n\n`
      summaryMessage += errors.slice(0, 15).join('\n\n')
      
      if (errors.length > 15) {
        summaryMessage += `\n\n... and ${errors.length - 15} more error(s) not shown. Check your data and try again.`
      }
    }

    return NextResponse.json({
      message: summaryMessage || "Import completed.",
      successCount,
      errorCount,
      totalProcessed: successCount + errorCount,
      errors: errors,
    })
  } catch (error) {
    console.error("[import] Import error:", error)
    return NextResponse.json({ error: "Failed to import questions" }, { status: 500 })
  }
}
