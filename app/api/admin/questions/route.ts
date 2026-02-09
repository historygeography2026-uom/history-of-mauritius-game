import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET all questions with filtering + type-specific details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get("subject")
    const level = searchParams.get("level")
    const type = searchParams.get("type")

    let query = `
      SELECT 
        q.id, q.question_text, q.image_url, q.timer_seconds, 
        q.created_by, q.created_at, q.updated_at,
        s.name as subject, l.level_number as level, qt.name as question_type
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      JOIN levels l ON q.level_id = l.id
      JOIN question_types qt ON q.question_type_id = qt.id
      WHERE 1=1
    `
    const params: any[] = []

    if (subject && subject !== "all") {
      query += ` AND LOWER(s.name) = LOWER($${params.length + 1})`
      params.push(subject)
    }

    if (level && level !== "all") {
      query += ` AND l.level_number = $${params.length + 1}`
      params.push(Number(level))
    }

    if (type && type !== "all") {
      query += ` AND qt.name = $${params.length + 1}`
      params.push(type)
    }

    query += ` ORDER BY q.created_at DESC`

    const result = await pool.query(query, params)

    // Enrich each question with type-specific details
    const enrichedQuestions = await Promise.all(
      result.rows.map(async (q: any) => {
        const qType = q.question_type
        let details: any = {}

        if (qType === "mcq") {
          const opts = await pool.query(
            "SELECT option_text, is_correct, option_order FROM mcq_options WHERE question_id = $1 ORDER BY option_order",
            [q.id]
          )
          details.mcq_options = opts.rows
        } else if (qType === "matching") {
          const pairs = await pool.query(
            "SELECT left_item, right_item, pair_order FROM matching_pairs WHERE question_id = $1 ORDER BY pair_order",
            [q.id]
          )
          details.matching_pairs = pairs.rows
        } else if (qType === "fill") {
          const ans = await pool.query(
            "SELECT answer_text FROM fill_answers WHERE question_id = $1",
            [q.id]
          )
          details.fill_answers = ans.rows
        } else if (qType === "reorder") {
          const items = await pool.query(
            "SELECT item_text, item_order FROM reorder_items WHERE question_id = $1 ORDER BY item_order",
            [q.id]
          )
          details.reorder_items = items.rows
        } else if (qType === "truefalse") {
          const tf = await pool.query(
            "SELECT correct_answer FROM truefalse_answers WHERE question_id = $1",
            [q.id]
          )
          details.truefalse_answers = tf.rows
        }

        return { ...q, ...details }
      })
    )

    return NextResponse.json(enrichedQuestions)
  } catch (error: any) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions", details: error?.message }, { status: 500 })
  }
}

// POST - Create new question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, level, type, question_text, image_url, timer_seconds, answer_data, created_by } = body

    // Get IDs from names
    const [subjectResult, levelResult, typeResult] = await Promise.all([
      pool.query("SELECT id FROM subjects WHERE name = $1", [subject]),
      pool.query("SELECT id FROM levels WHERE level_number = $1", [level]),
      pool.query("SELECT id FROM question_types WHERE name = $1", [type]),
    ])

    if (!subjectResult.rows[0] || !levelResult.rows[0] || !typeResult.rows[0]) {
      return NextResponse.json({ error: "Invalid subject, level, or type" }, { status: 400 })
    }

    // Create question
    const questionResult = await pool.query(
      `INSERT INTO questions (subject_id, level_id, question_type_id, question_text, image_url, timer_seconds, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        subjectResult.rows[0].id,
        levelResult.rows[0].id,
        typeResult.rows[0].id,
        question_text,
        image_url || null,
        timer_seconds || 30,
        created_by || "MES",
      ]
    )

    const questionId = questionResult.rows[0].id

    // Insert answer data based on type
    if (type === "mcq" && answer_data?.options) {
      for (const [index, option] of answer_data.options.entries()) {
        await pool.query(
          `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
           VALUES ($1, $2, $3, $4)`,
          [questionId, index, option.text, option.is_correct]
        )
      }
    } else if (type === "matching" && answer_data?.pairs) {
      for (const [index, pair] of answer_data.pairs.entries()) {
        await pool.query(
          `INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
           VALUES ($1, $2, $3, $4)`,
          [questionId, index, pair.left, pair.right]
        )
      }
    } else if (type === "fill" && answer_data?.answers) {
      for (const answer of answer_data.answers) {
        await pool.query(
          `INSERT INTO fill_answers (question_id, answer_text) VALUES ($1, $2)`,
          [questionId, answer]
        )
      }
    } else if (type === "reorder" && answer_data?.items) {
      for (const [index, item] of answer_data.items.entries()) {
        await pool.query(
          `INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
           VALUES ($1, $2, $3, $4)`,
          [questionId, index, item.text, item.correct_position]
        )
      }
    } else if (type === "truefalse" && answer_data) {
      await pool.query(
        `INSERT INTO truefalse_answers (question_id, correct_answer, explanation)
         VALUES ($1, $2, $3)`,
        [questionId, answer_data.correct_answer, answer_data.explanation || ""]
      )
    }

    return NextResponse.json({ id: questionId, ...body })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}

// PUT - Update question
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, subject, level, type, question_text, image_url, timer_seconds, answer_data, created_by } = body

    // Get IDs
    const [subjectResult, levelResult, typeResult] = await Promise.all([
      pool.query("SELECT id FROM subjects WHERE name = $1", [subject]),
      pool.query("SELECT id FROM levels WHERE level_number = $1", [level]),
      pool.query("SELECT id FROM question_types WHERE name = $1", [type]),
    ])

    // Update question
    await pool.query(
      `UPDATE questions 
       SET subject_id = $1, level_id = $2, question_type_id = $3, 
           question_text = $4, image_url = $5, timer_seconds = $6, updated_at = NOW()
       WHERE id = $7`,
      [
        subjectResult.rows[0].id,
        levelResult.rows[0].id,
        typeResult.rows[0].id,
        question_text,
        image_url || null,
        timer_seconds || 30,
        id,
      ]
    )

    // Delete old answer data
    await Promise.all([
      pool.query("DELETE FROM mcq_options WHERE question_id = $1", [id]),
      pool.query("DELETE FROM matching_pairs WHERE question_id = $1", [id]),
      pool.query("DELETE FROM fill_answers WHERE question_id = $1", [id]),
      pool.query("DELETE FROM reorder_items WHERE question_id = $1", [id]),
      pool.query("DELETE FROM truefalse_answers WHERE question_id = $1", [id]),
    ])

    // Insert new answer data (same as POST)
    if (type === "mcq" && answer_data?.options) {
      for (const [index, option] of answer_data.options.entries()) {
        await pool.query(
          `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
           VALUES ($1, $2, $3, $4)`,
          [id, index, option.text, option.is_correct]
        )
      }
    } else if (type === "matching" && answer_data?.pairs) {
      for (const [index, pair] of answer_data.pairs.entries()) {
        await pool.query(
          `INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item)
           VALUES ($1, $2, $3, $4)`,
          [id, index, pair.left, pair.right]
        )
      }
    } else if (type === "fill" && answer_data?.answers) {
      for (const answer of answer_data.answers) {
        await pool.query(
          `INSERT INTO fill_answers (question_id, answer_text) VALUES ($1, $2)`,
          [id, answer]
        )
      }
    } else if (type === "reorder" && answer_data?.items) {
      for (const [index, item] of answer_data.items.entries()) {
        await pool.query(
          `INSERT INTO reorder_items (question_id, item_order, item_text, correct_position)
           VALUES ($1, $2, $3, $4)`,
          [id, index, item.text, item.correct_position]
        )
      }
    } else if (type === "truefalse" && answer_data) {
      await pool.query(
        `INSERT INTO truefalse_answers (question_id, correct_answer, explanation)
         VALUES ($1, $2, $3)`,
        [id, answer_data.correct_answer, answer_data.explanation || ""]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

// DELETE - Delete question
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Question ID required" }, { status: 400 })
    }

    // Delete question (cascades to answer tables due to ON DELETE CASCADE)
    const result = await pool.query("DELETE FROM questions WHERE id = $1 RETURNING id", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
