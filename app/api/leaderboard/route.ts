import { pool } from "@/lib/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get("subject") // subject name or "all"
  const levelParam = searchParams.get("level") // optional level number
  const limitParam = searchParams.get("limit") // optional result limit
  const pageParam = searchParams.get("page") // optional page number (1-based)
  const limit = limitParam ? Math.min(Number.parseInt(limitParam), 200) : 50
  const page = pageParam ? Math.max(1, Number.parseInt(pageParam)) : 1
  const showAllAttempts = searchParams.get("all") === "true"

  try {
    // Build dynamic WHERE clauses
    const conditions: string[] = []
    const params: any[] = []

    if (subject && subject !== "all") {
      params.push(subject)
      conditions.push(`s.name = $${params.length}`)
    }

    if (levelParam) {
      params.push(Number.parseInt(levelParam))
      conditions.push(`l.level_number = $${params.length}`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Fetch leaderboard with JOINs
    const query = `
      SELECT 
        lb.id, lb.player_name, lb.total_points, lb.stars_earned, lb.created_at,
        lb.subject_id, lb.level_id, lb.user_id,
        lb.questions_completed, lb.total_questions, lb.timed_out,
        s.name as subject_name,
        l.level_number
      FROM leaderboard lb
      JOIN subjects s ON lb.subject_id = s.id
      JOIN levels l ON lb.level_id = l.id
      ${whereClause}
      ORDER BY lb.total_points DESC
    `

    const result = await pool.query(query, params)
    const rows = result.rows

    let bestRows: typeof rows

    if (showAllAttempts) {
      bestRows = rows
    } else {
      // Keep only the best score per player_name per subject+level
      const bestMap = new Map<string, (typeof rows)[number]>()
      for (const r of rows) {
        const key = `${r.player_name}::${r.subject_id}::${r.level_id}`
        const prev = bestMap.get(key)
        if (!prev || r.total_points > prev.total_points) {
          bestMap.set(key, r)
        }
      }
      bestRows = Array.from(bestMap.values())
        .sort((a, b) => b.total_points - a.total_points || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }

    const totalCount = bestRows.length
    const offset = (page - 1) * limit
    const paginatedRows = bestRows.slice(offset, offset + limit)

    const payload = paginatedRows.map((r) => ({
      id: r.id,
      user_id: r.user_id || null,
      display_name: r.player_name || "Player",
      avatar_url: null,
      total_points: r.total_points,
      stars_earned: r.stars_earned,
      created_at: r.created_at,
      subject: r.subject_name,
      level: r.level_number,
      questions_completed: r.questions_completed || 0,
      total_questions: r.total_questions || 0,
      timed_out: r.timed_out || false,
    }))

    return NextResponse.json({ data: payload, total: totalCount, page, limit })
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Require authentication to submit scores
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { player_name, subject, level, total_points, stars_earned, questions_completed, total_questions, timed_out } = body
    // Use session user_id instead of trusting client-provided value
    const user_id = session.user.id

    if (!player_name || !subject || !level) {
      return NextResponse.json({ error: "player_name, subject, and level are required" }, { status: 400 })
    }

    // Sanitize inputs
    const safeName = String(player_name).trim().slice(0, 50)
    const safePoints = Math.max(0, Math.min(6000, parseInt(total_points) || 0))
    const safeStars = Math.max(0, Math.min(60, parseInt(stars_earned) || 0))
    const safeCompleted = Math.max(0, Math.min(200, parseInt(questions_completed) || 0))
    const safeTotalQ = Math.max(0, Math.min(200, parseInt(total_questions) || 0))

    // Get subject ID
    const subjectResult = await pool.query("SELECT id FROM subjects WHERE name = $1", [subject])
    if (subjectResult.rows.length === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Get level ID
    const levelResult = await pool.query("SELECT id FROM levels WHERE level_number = $1", [Number.parseInt(level)])
    if (levelResult.rows.length === 0) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 })
    }

    const result = await pool.query(
      `INSERT INTO leaderboard (player_name, user_id, subject_id, level_id, total_points, stars_earned, questions_completed, total_questions, timed_out)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        safeName,
        user_id || null,
        subjectResult.rows[0].id,
        levelResult.rows[0].id,
        safePoints,
        safeStars,
        safeCompleted,
        safeTotalQ,
        timed_out || false,
      ]
    )

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("Error adding leaderboard entry:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
