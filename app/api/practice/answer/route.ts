import { pool } from "@/lib/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { checkAnswer } from "@/lib/practice-answer-checker"
import type { QuestionType } from "@/lib/practice-answer-checker"

/**
 * Student API — Submit a single practice answer.
 * Open for testing (authentication optional).
 *
 * POST { session_id, question_id, student_answer }
 *
 * - Evaluates answer server-side
 * - Logs to practice_attempts (student_id nullable for anonymous testing)
 * - Returns { is_correct, correct_answer } for immediate feedback
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const studentId = session?.user?.id ? parseInt(session.user.id) : null

  try {
    const { session_id, question_id, student_answer } = await request.json()

    if (!session_id || !question_id) {
      return NextResponse.json(
        { error: "session_id and question_id are required" },
        { status: 400 }
      )
    }

    // Validate session exists and is still open
    const sessionResult = await pool.query(
      `SELECT id, unit_id, ended_at FROM practice_sessions
       WHERE id = $1`,
      [session_id]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (sessionResult.rows[0].ended_at) {
      return NextResponse.json({ error: "Session has already ended" }, { status: 400 })
    }

    const unitId = sessionResult.rows[0].unit_id

    // Fetch the question's correct answer from practice_questions
    const questionResult = await pool.query(
      "SELECT id, question_type, answer_data FROM practice_questions WHERE id = $1",
      [question_id]
    )

    if (questionResult.rows.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const question = questionResult.rows[0]
    const answerData =
      typeof question.answer_data === "string"
        ? JSON.parse(question.answer_data)
        : question.answer_data

    // Evaluate the answer
    const result = checkAnswer(
      question.question_type as QuestionType,
      answerData,
      student_answer
    )

    // Log the attempt — student_id is nullable
    await pool.query(
      `INSERT INTO practice_attempts
         (session_id, student_id, unit_id, question_id, student_answer, is_correct)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        session_id,
        studentId,
        unitId,
        question_id,
        student_answer !== undefined ? JSON.stringify(student_answer) : null,
        result.is_correct,
      ]
    )

    return NextResponse.json({
      is_correct: result.is_correct,
      correct_answer: result.correct_answer,
    })
  } catch (error: any) {
    console.error("[practice/answer] Error:", error)
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 })
  }
}
