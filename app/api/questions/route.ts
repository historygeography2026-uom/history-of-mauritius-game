import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  // Require authentication to access questions (prevents answer leakage to anonymous users)
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
      // Handle combined subject: fetch from history, geography AND dedicated combined questions
      if (subject === "combined") {
        query += ` AND s.name IN ('history', 'geography', 'combined')`
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

    if (questions.length === 0) {
      return NextResponse.json([])
    }

    // Batch fetch all type-specific data in 5 queries (one per type) instead of N queries
    const ids = questions.map((q: any) => q.id)
    const idList = ids.join(",")

    const [mcqRows, matchingRows, fillRows, reorderRows, tfRows] = await Promise.all([
      pool.query(
        `SELECT question_id, option_order, option_text, is_correct FROM mcq_options WHERE question_id = ANY($1) ORDER BY question_id, option_order`,
        [ids]
      ),
      pool.query(
        `SELECT question_id, left_item, right_item, pair_order FROM matching_pairs WHERE question_id = ANY($1) ORDER BY question_id, pair_order`,
        [ids]
      ),
      pool.query(
        `SELECT question_id, answer_text FROM fill_answers WHERE question_id = ANY($1)`,
        [ids]
      ),
      pool.query(
        `SELECT question_id, item_text, correct_position, item_order FROM reorder_items WHERE question_id = ANY($1) ORDER BY question_id, item_order`,
        [ids]
      ),
      pool.query(
        `SELECT question_id, correct_answer, explanation FROM truefalse_answers WHERE question_id = ANY($1)`,
        [ids]
      ),
    ])

    // Index fetched rows by question_id for O(1) lookup
    const mcqByQ: Record<number, any[]> = {}
    for (const r of mcqRows.rows) {
      if (!mcqByQ[r.question_id]) mcqByQ[r.question_id] = []
      mcqByQ[r.question_id].push(r)
    }
    const matchingByQ: Record<number, any[]> = {}
    for (const r of matchingRows.rows) {
      if (!matchingByQ[r.question_id]) matchingByQ[r.question_id] = []
      matchingByQ[r.question_id].push(r)
    }
    const fillByQ: Record<number, any> = {}
    for (const r of fillRows.rows) fillByQ[r.question_id] = r
    const reorderByQ: Record<number, any[]> = {}
    for (const r of reorderRows.rows) {
      if (!reorderByQ[r.question_id]) reorderByQ[r.question_id] = []
      reorderByQ[r.question_id].push(r)
    }
    const tfByQ: Record<number, any> = {}
    for (const r of tfRows.rows) tfByQ[r.question_id] = r

    // Transform questions using pre-fetched data
    const transformed = questions.map((q: any) => {
      const type = q.question_type

      const baseQuestion = {
        id: q.id,
        title: q.question_text,
        instruction: q.instruction || undefined,
        type,
        timer: q.timer_seconds,
        image: q.image_url || undefined,
      }

      if (type === "mcq") {
        const opts = mcqByQ[q.id] || []
        const correctIndex = opts.findIndex((opt: any) => opt.is_correct)
        if (correctIndex === -1) {
          console.warn(`[questions API] No correct answer for MCQ id=${q.id}: "${q.question_text?.substring(0, 50)}"`)
        }
        return {
          ...baseQuestion,
          question: q.question_text,
          options: opts.map((opt: any) => opt.option_text),
          correct: correctIndex >= 0 ? correctIndex + 1 : 1,
        }
      } else if (type === "matching") {
        const pairs = matchingByQ[q.id] || []
        return {
          ...baseQuestion,
          question: q.question_text,
          pairs: pairs.map((pair: any) => ({ left: pair.left_item, right: pair.right_item })),
        }
      } else if (type === "fill") {
        const fillRow = fillByQ[q.id]
        if (!fillRow) {
          console.warn(`[questions API] No answer for fill id=${q.id}: "${q.question_text?.substring(0, 50)}"`)
        }
        return {
          ...baseQuestion,
          question: q.question_text,
          answer: fillRow?.answer_text || "",
        }
      } else if (type === "reorder") {
        const reorderItems = reorderByQ[q.id] || []
        const itemTexts = reorderItems.map((item: any) => item.item_text)
        const correctOrder = [...reorderItems]
          .sort((a: any, b: any) => a.correct_position - b.correct_position)
          .map((item: any) => item.item_text)
        return {
          ...baseQuestion,
          question: q.question_text,
          items: itemTexts,
          correct: correctOrder,
        }
      } else if (type === "truefalse") {
        const tfRow = tfByQ[q.id]
        return {
          ...baseQuestion,
          question: q.question_text,
          correct: tfRow?.correct_answer ? "true" : "false",
          explanation: tfRow?.explanation || "",
        }
      }

      return baseQuestion
    })

    console.log(
      `[questions API] Transformed ${transformed.length} questions:`,
      JSON.stringify(transformed.map((q: any) => ({ id: q.id, type: q.type, title: q.title?.substring(0, 50) })))
    )

    return NextResponse.json(transformed)
  } catch (error: any) {
    console.error("[questions API] Error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
