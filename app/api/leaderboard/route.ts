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
  const search = searchParams.get("search")?.trim() || "" // search by player name
  const sortBy = searchParams.get("sortBy") || "total_points" // sort field
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "ASC" : "DESC"
  const limit = limitParam ? Math.min(Number.parseInt(limitParam), 200) : 20
  const page = pageParam ? Math.max(1, Number.parseInt(pageParam)) : 1

  // Whitelist allowed sort columns
  const allowedSorts: Record<string, string> = {
    total_points: "best.total_points",
    stars_earned: "best.stars_earned",
    played_at: "best.played_at",
    display_name: "best.player_name",
    level: "best.level_number",
  }
  const orderColumn = allowedSorts[sortBy] || "best.total_points"

  try {
    // Build WHERE conditions for the inner query
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

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`lb.player_name ILIKE $${params.length}`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // SQL-level deduplication: best score per player per subject+level
    // Uses DISTINCT ON to keep only the highest-scoring row per group
    const cteQuery = `
      WITH best AS (
        SELECT DISTINCT ON (lb.player_name, lb.subject_id, lb.level_id)
          lb.id, lb.player_name, lb.total_points, lb.stars_earned,
          lb.created_at AS played_at,
          lb.user_id, lb.questions_completed, lb.total_questions, lb.timed_out,
          s.name AS subject_name,
          l.level_number
        FROM leaderboard lb
        JOIN subjects s ON lb.subject_id = s.id
        JOIN levels l ON lb.level_id = l.id
        ${whereClause}
        ORDER BY lb.player_name, lb.subject_id, lb.level_id, lb.total_points DESC, lb.created_at ASC
      )
    `

    // Count query
    const countResult = await pool.query(
      `${cteQuery} SELECT COUNT(*)::int AS total FROM best`,
      params,
    )
    const totalCount: number = countResult.rows[0]?.total || 0

    // Data query with pagination + sorting
    const offset = (page - 1) * limit
    const dataResult = await pool.query(
      `${cteQuery}
       SELECT * FROM best
       ORDER BY ${orderColumn} ${sortOrder}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    )

    const payload = dataResult.rows.map((r) => ({
      id: r.id,
      user_id: r.user_id || null,
      display_name: r.player_name || "Player",
      avatar_url: null,
      total_points: r.total_points,
      stars_earned: r.stars_earned,
      played_at: r.played_at,
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
