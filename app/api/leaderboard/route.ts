import { pool } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get("subject") // subject name or "all"
  const levelParam = searchParams.get("level") // optional level number
  const limitParam = searchParams.get("limit") // optional result limit
  const limit = Math.min(Number.parseInt(limitParam || "50"), 100)
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
      LIMIT 500
    `

    const result = await pool.query(query, params)
    const rows = result.rows

    let bestRows: typeof rows

    if (showAllAttempts) {
      bestRows = rows.slice(0, limit)
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
        .slice(0, limit)
    }

    const payload = bestRows.map((r) => ({
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

    return NextResponse.json(payload)
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { player_name, user_id, subject, level, total_points, stars_earned, questions_completed, total_questions, timed_out } = body

    if (!player_name || !subject || !level) {
      return NextResponse.json({ error: "player_name, subject, and level are required" }, { status: 400 })
    }

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
        player_name,
        user_id || null,
        subjectResult.rows[0].id,
        levelResult.rows[0].id,
        total_points || 0,
        stars_earned || 0,
        questions_completed || 0,
        total_questions || 0,
        timed_out || false,
      ]
    )

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("Error adding leaderboard entry:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
