import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get("subject") || "history"
    const level = searchParams.get("level") || "1"
    const all = searchParams.get("all") === "true"

    // Fetch questions
    let query = `
      SELECT 
        q.id, q.question_text, q.instruction, q.timer_seconds, q.image_url,
        s.name as subject, l.level_number as level, qt.name as question_type
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      JOIN levels l ON q.level_id = l.id
      JOIN question_types qt ON q.question_type_id = qt.id
      WHERE 1=1
    `
    const params: any[] = []

    if (!all) {
      // "combined" means pull from BOTH history and geography banks
      if (subject === "combined") {
        query += ` AND s.name IN ('history', 'geography')`
      } else {
        query += ` AND s.name = $${params.length + 1}`
        params.push(subject)
      }
      query += ` AND l.level_number = $${params.length + 1}`
      params.push(Number(level))
    }

    query += ` ORDER BY q.id`

    const result = await pool.query(query, params)
    const questions = result.rows

    console.log(`[questions API] Found ${questions.length} questions for subject=${subject}, level=${level}`)

    // Transform questions to match frontend format
    const transformed = await Promise.all(
      questions.map(async (q: any) => {
        const type = q.question_type

        const baseQuestion = {
          id: q.id,
          title: q.question_text,
          instruction: q.instruction || undefined,
          type,
          timer: q.timer_seconds,
          image: q.image_url || undefined,
        }

        // Fetch type-specific data
        if (type === "mcq") {
          const options = await pool.query(
            `SELECT option_order, option_text, is_correct FROM mcq_options 
             WHERE question_id = $1 ORDER BY option_order`,
            [q.id]
          )
          const correctIndex = options.rows.findIndex((opt: any) => opt.is_correct)
          if (correctIndex === -1) {
            console.warn(`[questions API] No correct answer marked for MCQ question id=${q.id}: "${q.question_text?.substring(0, 50)}"`)
          }
          return {
            ...baseQuestion,
            question: q.question_text,
            options: options.rows.map((opt: any) => opt.option_text),
            correct: correctIndex >= 0 ? correctIndex + 1 : 1, // Fallback to 1 if none marked (should never happen with fixed import)
          }
        } else if (type === "matching") {
          const pairs = await pool.query(
            `SELECT left_item, right_item FROM matching_pairs 
             WHERE question_id = $1 ORDER BY pair_order`,
            [q.id]
          )
          return {
            ...baseQuestion,
            question: q.question_text,
            pairs: pairs.rows.map((pair: any) => ({
              left: pair.left_item,
              right: pair.right_item,
            })),
          }
        } else if (type === "fill") {
          const answers = await pool.query(
            `SELECT answer_text FROM fill_answers WHERE question_id = $1`,
            [q.id]
          )
          return {
            ...baseQuestion,
            question: q.question_text,
            answer: answers.rows[0]?.answer_text || "",
          }
        } else if (type === "reorder") {
          const items = await pool.query(
            `SELECT item_text, correct_position FROM reorder_items 
             WHERE question_id = $1 ORDER BY item_order`,
            [q.id]
          )
          // items: texts in shuffled/display order (by item_order)
          // correct: texts sorted by correct_position (the actual correct sequence)
          const itemTexts = items.rows.map((item: any) => item.item_text)
          const correctOrder = [...items.rows]
            .sort((a: any, b: any) => a.correct_position - b.correct_position)
            .map((item: any) => item.item_text)
          return {
            ...baseQuestion,
            question: q.question_text,
            items: itemTexts,
            correct: correctOrder,
          }
        } else if (type === "truefalse") {
          const answer = await pool.query(
            `SELECT correct_answer, explanation FROM truefalse_answers WHERE question_id = $1`,
            [q.id]
          )
          return {
            ...baseQuestion,
            question: q.question_text,
            correct: answer.rows[0]?.correct_answer ? "true" : "false",
            explanation: answer.rows[0]?.explanation || "",
          }
        }

        return baseQuestion
      })
    )

    console.log(
      `[questions API] Transformed ${transformed.length} questions:`,
      JSON.stringify(transformed.map((q: any) => ({ id: q.id, type: q.type, title: q.title?.substring(0, 50) })))
    )

    return NextResponse.json(transformed)
  } catch (error: any) {
    console.error("[questions API] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
