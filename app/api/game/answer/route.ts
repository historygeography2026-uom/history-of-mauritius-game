import { pool } from "@/lib/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Silent Game Mode answer logger (admin analytics only).
 * POST { question_id, student_answer }
 *
 * - Requires login (game mode is login-only).
 * - Correctness is re-evaluated server-side against the DB answer key;
 *   client-supplied correctness is never trusted.
 * - Always responds with a minimal body; the client ignores the result.
 */

const MAX_STR = 300
const MAX_ITEMS = 30

const normalizeText = (text: string) =>
  text.replace(/[\s\u00A0\u200B\u200C\u200D\uFEFF]+/g, " ").trim().toLowerCase()

const clip = (v: unknown) => String(v ?? "").slice(0, MAX_STR)

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const studentId = session?.user?.id ? parseInt(session.user.id) : null
  if (!studentId) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const questionId = Number(body?.question_id)
    const rawAnswer = body?.student_answer

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    // Reject oversized payloads early
    if (rawAnswer !== undefined && JSON.stringify(rawAnswer).length > 5000) {
      return NextResponse.json({ ok: false }, { status: 413 })
    }

    const qRes = await pool.query(
      `SELECT qt.name AS type
       FROM questions q
       JOIN question_types qt ON q.question_type_id = qt.id
       WHERE q.id = $1`,
      [questionId]
    )
    if (qRes.rows.length === 0) {
      return NextResponse.json({ ok: false }, { status: 404 })
    }
    const type: string = qRes.rows[0].type

    let answer: unknown = null
    let isCorrect = false

    switch (type) {
      case "mcq": {
        answer = clip(rawAnswer)
        const r = await pool.query(
          `SELECT option_text FROM mcq_options WHERE question_id = $1 AND is_correct = true`,
          [questionId]
        )
        isCorrect = r.rows.some((row) => normalizeText(row.option_text) === normalizeText(answer as string))
        break
      }
      case "truefalse": {
        if (typeof rawAnswer !== "boolean") return NextResponse.json({ ok: false }, { status: 400 })
        answer = rawAnswer
        const r = await pool.query(
          `SELECT correct_answer FROM truefalse_answers WHERE question_id = $1`,
          [questionId]
        )
        isCorrect = r.rows.length > 0 && Boolean(r.rows[0].correct_answer) === rawAnswer
        break
      }
      case "fill": {
        answer = clip(rawAnswer)
        const r = await pool.query(`SELECT answer_text FROM fill_answers WHERE question_id = $1`, [questionId])
        isCorrect = r.rows.some((row) => normalizeText(row.answer_text || "") === normalizeText(answer as string))
        break
      }
      case "reorder": {
        if (!Array.isArray(rawAnswer)) return NextResponse.json({ ok: false }, { status: 400 })
        const submitted = rawAnswer.slice(0, MAX_ITEMS).map(clip)
        answer = submitted
        const r = await pool.query(
          `SELECT item_text FROM reorder_items WHERE question_id = $1 ORDER BY correct_position`,
          [questionId]
        )
        const correct = r.rows.map((row) => row.item_text as string)
        isCorrect = correct.length === submitted.length && correct.every((t, i) => t === submitted[i])
        break
      }
      case "matching": {
        const wrongPairs = Array.isArray(rawAnswer?.wrong_pairs) ? rawAnswer.wrong_pairs : []
        const gaveUp = rawAnswer?.gave_up === true
        const pairs = wrongPairs
          .slice(0, MAX_ITEMS)
          .map((p: any) => ({ left: clip(p?.left), right: clip(p?.right) }))
        // Validate submitted "wrong" pairs are genuinely wrong against the answer key
        const r = await pool.query(`SELECT left_item, right_item FROM matching_pairs WHERE question_id = $1`, [
          questionId,
        ])
        const correctSet = new Set(r.rows.map((row) => `${row.left_item}\u0000${row.right_item}`))
        const genuineWrong = pairs.filter((p: { left: string; right: string }) => !correctSet.has(`${p.left}\u0000${p.right}`))
        answer = { wrong_pairs: genuineWrong, gave_up: gaveUp }
        isCorrect = !gaveUp && genuineWrong.length === 0
        break
      }
      default:
        return NextResponse.json({ ok: false }, { status: 400 })
    }

    await pool.query(
      `INSERT INTO game_attempts (question_id, student_id, student_answer, is_correct)
       VALUES ($1, $2, $3, $4)`,
      [questionId, studentId, JSON.stringify(answer), isCorrect]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[game/answer] Error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
