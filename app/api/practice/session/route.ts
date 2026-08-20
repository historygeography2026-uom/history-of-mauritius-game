import { pool } from "@/lib/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const QUESTIONS_PER_SESSION = 20

/**
 * Student API — Start a new practice session.
 * Open to all students & visitors (login optional).
 *
 * POST { unit_id }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const studentId = session?.user?.id ? parseInt(session.user.id) : null

  try {
    const { unit_id } = await request.json()

    if (!unit_id) {
      return NextResponse.json({ error: "unit_id is required" }, { status: 400 })
    }

    // Verify unit exists and is active
    const unitResult = await pool.query(
      "SELECT id, unit_no, unit_name FROM practice_units WHERE id = $1 AND is_active = true",
      [unit_id]
    )
    if (unitResult.rows.length === 0) {
      return NextResponse.json({ error: "Unit not found or inactive" }, { status: 404 })
    }

    // Load all active questions for this unit
    const questionsResult = await pool.query(
      `SELECT id, question_type, question_text, instruction, image_url, answer_data
       FROM practice_questions
       WHERE unit_id = $1 AND is_active = true`,
      [unit_id]
    )

    if (questionsResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No questions available for this unit yet. Check back later!" },
        { status: 404 }
      )
    }

    // Fisher-Yates shuffle
    const allQuestions = [...questionsResult.rows]
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]]
    }

    // Take first N
    const selectedQuestions = allQuestions.slice(0, QUESTIONS_PER_SESSION)
    const questionIds = selectedQuestions.map((q) => q.id)

    // Create session (studentId can be null for guests)
    const sessionResult = await pool.query(
      `INSERT INTO practice_sessions (student_id, unit_id, questions_served)
       VALUES ($1, $2, $3)
       RETURNING id, started_at`,
      [studentId, unit_id, questionIds]
    )

    const practiceSession = sessionResult.rows[0]

    // Strip correct answers from questions before sending to client
    const clientQuestions = selectedQuestions.map((q) => {
      const sanitized: any = {
        id: q.id,
        question_type: q.question_type,
        question_text: q.question_text,
        instruction: q.instruction,
        image_url: q.image_url,
      }

      // Send options/items without revealing correct answers
      const answerData = typeof q.answer_data === "string" ? JSON.parse(q.answer_data) : q.answer_data

      if (q.question_type === "mcq" && answerData?.options) {
        // Shuffle MCQ options, send text only (no is_correct)
        const opts = [...answerData.options]
        for (let i = opts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[opts[i], opts[j]] = [opts[j], opts[i]]
        }
        sanitized.options = opts.map((o: any) => (typeof o === "string" ? o : o.text))
      } else if (q.question_type === "matching" && answerData?.pairs) {
        // Send left items in order, right items shuffled
        const lefts = answerData.pairs.map((p: any) => p.left)
        const rights = [...answerData.pairs.map((p: any) => p.right)]
        for (let i = rights.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[rights[i], rights[j]] = [rights[j], rights[i]]
        }
        sanitized.left_items = lefts
        sanitized.right_items = rights
      } else if (q.question_type === "reorder" && answerData?.items) {
        // Send items in shuffled order
        const items = [...answerData.items.map((i: any) => i.text)]
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[items[i], items[j]] = [items[j], items[i]]
        }
        sanitized.items = items
      }

      return sanitized
    })

    return NextResponse.json({
      session_id: practiceSession.id,
      started_at: practiceSession.started_at,
      unit: unitResult.rows[0],
      total_questions: clientQuestions.length,
      questions: clientQuestions,
    })
  } catch (error: any) {
    console.error("[practice/session] Error starting session:", error)
    return NextResponse.json({ error: "Failed to start practice session" }, { status: 500 })
  }
}

/**
 * Student API — Retrieve an existing session by ID.
 * GET ?id=123
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("id")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  try {
    const sessionRes = await pool.query(
      `SELECT ps.id, ps.unit_id, ps.questions_served, ps.started_at, pu.unit_no, pu.unit_name
       FROM practice_sessions ps
       JOIN practice_units pu ON ps.unit_id = pu.id
       WHERE ps.id = $1`,
      [sessionId]
    )

    if (sessionRes.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const sessionRow = sessionRes.rows[0]
    const questionIds: number[] = sessionRow.questions_served || []

    if (questionIds.length === 0) {
      return NextResponse.json({
        session_id: sessionRow.id,
        started_at: sessionRow.started_at,
        unit: { id: sessionRow.unit_id, unit_no: sessionRow.unit_no, unit_name: sessionRow.unit_name },
        total_questions: 0,
        questions: [],
      })
    }

    const questionsRes = await pool.query(
      `SELECT id, question_type, question_text, instruction, image_url, answer_data
       FROM practice_questions
       WHERE id = ANY($1::int[])`,
      [questionIds]
    )

    // Preserve the served questions order
    const clientQuestions = questionIds
      .map((id) => {
        const q = questionsRes.rows.find((row) => row.id === id)
        if (!q) return null
        const sanitized: any = {
          id: q.id,
          question_type: q.question_type,
          question_text: q.question_text,
          instruction: q.instruction,
          image_url: q.image_url,
        }

        const answerData = typeof q.answer_data === "string" ? JSON.parse(q.answer_data) : q.answer_data

        if (q.question_type === "mcq" && answerData?.options) {
          sanitized.options = answerData.options.map((o: any) => (typeof o === "string" ? o : o.text))
        } else if (q.question_type === "matching" && answerData?.pairs) {
          sanitized.left_items = answerData.pairs.map((p: any) => p.left)
          sanitized.right_items = answerData.pairs.map((p: any) => p.right)
        } else if (q.question_type === "reorder" && answerData?.items) {
          sanitized.items = answerData.items.map((i: any) => i.text)
        }

        return sanitized
      })
      .filter(Boolean)

    return NextResponse.json({
      session_id: sessionRow.id,
      started_at: sessionRow.started_at,
      unit: { id: sessionRow.unit_id, unit_no: sessionRow.unit_no, unit_name: sessionRow.unit_name },
      total_questions: clientQuestions.length,
      questions: clientQuestions,
    })
  } catch (error: any) {
    console.error("[practice/session] Error retrieving session:", error)
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 })
  }
}
