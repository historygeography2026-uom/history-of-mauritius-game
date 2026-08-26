import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

const VALID_TYPES = ["mcq", "matching", "fill", "reorder", "truefalse"]

async function requireAdmin(request: Request): Promise<NextResponse | null> {
  return verifyAdminToken(request)
}

// GET — List practice questions with optional filtering
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get("unit")
    const type = searchParams.get("type")

    let query = `
      SELECT pq.id, pq.question_text, pq.instruction, pq.image_url,
             pq.question_type, pq.answer_data, pq.is_active,
             pq.created_at, pq.updated_at,
             pu.unit_no, pu.unit_name
      FROM practice_questions pq
      JOIN practice_units pu ON pq.unit_id = pu.id
      WHERE 1=1
    `
    const params: any[] = []

    if (unitId && unitId !== "all") {
      params.push(Number(unitId))
      query += ` AND pq.unit_id = $${params.length}`
    }

    if (type && type !== "all") {
      params.push(type)
      query += ` AND pq.question_type = $${params.length}`
    }

    query += ` ORDER BY pq.created_at DESC`

    const result = await pool.query(query, params)
    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error("[admin/practice/questions] Error fetching:", error)
    return NextResponse.json({ error: "Failed to fetch questions", details: error?.message, stack: error?.stack }, { status: 500 })
  }
}

// POST — Create a new practice question
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { unit_id, question_type, question_text, instruction, image_url, answer_data } = body

    // Validate required fields
    if (!question_text || typeof question_text !== "string" || question_text.trim().length === 0) {
      return NextResponse.json({ error: "question_text is required" }, { status: 400 })
    }
    if (!VALID_TYPES.includes(question_type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 })
    }

    // Validate unit exists
    const unitResult = await pool.query("SELECT id FROM practice_units WHERE id = $1", [unit_id])
    if (unitResult.rows.length === 0) {
      return NextResponse.json({ error: "Invalid unit_id" }, { status: 400 })
    }

    // Validate answer_data per type
    const validation = validateAnswerData(question_type, answer_data)
    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO practice_questions
         (unit_id, question_type, question_text, instruction, image_url, answer_data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        unit_id,
        question_type,
        question_text.trim(),
        instruction || null,
        image_url || null,
        JSON.stringify(answer_data)
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    console.error("[admin/practice/questions] Error creating:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}

// PUT — Update a practice question
export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { id, unit_id, question_type, question_text, instruction, image_url, answer_data, is_active } = body

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    // Check question exists
    const existing = await pool.query("SELECT id FROM practice_questions WHERE id = $1", [id])
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Validate type if provided
    if (question_type && !VALID_TYPES.includes(question_type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 })
    }

    // Validate answer_data if provided
    if (answer_data && question_type) {
      const validation = validateAnswerData(question_type, answer_data)
      if (validation) {
        return NextResponse.json({ error: validation }, { status: 400 })
      }
    }

    // Resolve unit_id from unit_no if not provided directly
    let resolvedUnitId = unit_id || null
    if (!resolvedUnitId && body.unit_no) {
      const unitLookup = await pool.query("SELECT id FROM practice_units WHERE unit_no = $1 LIMIT 1", [body.unit_no])
      if (unitLookup.rows.length > 0) {
        resolvedUnitId = unitLookup.rows[0].id
      }
    }

    // Validate unit if resolved
    if (resolvedUnitId) {
      const unitResult = await pool.query("SELECT id FROM practice_units WHERE id = $1", [resolvedUnitId])
      if (unitResult.rows.length === 0) {
        return NextResponse.json({ error: "Invalid unit_id" }, { status: 400 })
      }
    }

    const result = await pool.query(
      `UPDATE practice_questions SET
         unit_id = COALESCE($1, unit_id),
         question_type = COALESCE($2, question_type),
         question_text = COALESCE($3, question_text),
         instruction = COALESCE($4, instruction),
         image_url = COALESCE($5, image_url),
         answer_data = COALESCE($6, answer_data),
         is_active = COALESCE($7, is_active),
         updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        resolvedUnitId,
        question_type || null,
        question_text?.trim() || null,
        instruction !== undefined ? instruction : null,
        image_url !== undefined ? image_url : null,
        answer_data ? JSON.stringify(answer_data) : null,
        is_active !== undefined ? is_active : null,
        id,
      ]
    )

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("[admin/practice/questions] Error updating:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

// DELETE — Delete a practice question
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id query param is required" }, { status: 400 })
    }

    const result = await pool.query(
      "DELETE FROM practice_questions WHERE id = $1 RETURNING id, question_text",
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Question deleted", question: result.rows[0] })
  } catch (error: any) {
    console.error("[admin/practice/questions] Error deleting:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}

// ── Answer data validation (mirrors gamified API validation) ──

function validateAnswerData(type: string, answerData: any): string | null {
  if (!answerData) return "answer_data is required"

  switch (type) {
    case "mcq":
      if (!answerData.options || !Array.isArray(answerData.options) || answerData.options.length < 2) {
        return "MCQ questions require at least 2 options"
      }
      if (!answerData.options.some((o: any) => o.is_correct)) {
        return "MCQ questions require at least one correct option"
      }
      if (answerData.options.some((o: any) => !o.text || typeof o.text !== "string" || o.text.trim().length === 0)) {
        return "MCQ option text cannot be empty"
      }
      break

    case "matching":
      if (!answerData.pairs || !Array.isArray(answerData.pairs) || answerData.pairs.length < 2) {
        return "Matching questions require at least 2 pairs"
      }
      break

    case "fill":
      if (!answerData.answers || !Array.isArray(answerData.answers) || answerData.answers.length === 0) {
        return "Fill questions require at least one answer"
      }
      if (answerData.answers.some((a: any) => !a || typeof a !== "string" || a.trim().length === 0)) {
        return "Fill answer text cannot be empty"
      }
      break

    case "reorder":
      if (!answerData.items || !Array.isArray(answerData.items) || answerData.items.length < 2) {
        return "Reorder questions require at least 2 items"
      }
      break

    case "truefalse":
      if (typeof answerData.correct_answer !== "boolean") {
        return "True/False questions require a boolean correct_answer"
      }
      break
  }

  return null
}
