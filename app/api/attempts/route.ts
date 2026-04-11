import { pool } from "@/lib/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  // Require authentication
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  // Always use the authenticated user's ID — ignore client-provided user_id
  const userId = session.user.id
  const subject = searchParams.get("subject")
  const limitParam = searchParams.get("limit")
  const limit = Math.min(Number.parseInt(limitParam || "50"), 200)

  try {
    const conditions: string[] = []
    const params: any[] = []

    // Always filter by authenticated user
    params.push(userId)
    conditions.push(`lb.user_id = $${params.length}`)

    // Filter by subject
    if (subject && subject !== "all") {
      params.push(subject)
      conditions.push(`s.name = $${params.length}`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const query = `
      SELECT 
        lb.id, lb.player_name, lb.total_points, lb.stars_earned, lb.created_at,
        lb.user_id, lb.questions_completed, lb.total_questions, lb.timed_out,
        s.name as subject_name,
        l.level_number
      FROM leaderboard lb
      JOIN subjects s ON lb.subject_id = s.id
      JOIN levels l ON lb.level_id = l.id
      ${whereClause}
      ORDER BY lb.created_at DESC
      LIMIT $${params.length + 1}
    `
    params.push(limit)

    const result = await pool.query(query, params)

    const attempts = result.rows.map((r) => ({
      id: r.id,
      player_name: r.player_name,
      user_id: r.user_id,
      subject: r.subject_name,
      level: r.level_number,
      total_points: r.total_points,
      stars_earned: r.stars_earned,
      questions_completed: r.questions_completed || 0,
      total_questions: r.total_questions || 0,
      timed_out: r.timed_out || false,
      created_at: r.created_at,
    }))

    // Calculate summary stats
    const totalAttempts = attempts.length
    const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.total_points)) : 0
    const totalStarsEarned = attempts.reduce((sum, a) => sum + a.stars_earned, 0)
    const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.total_points, 0) / totalAttempts) : 0
    const completedWithoutTimeout = attempts.filter(a => !a.timed_out).length
    
    // Per-subject stats
    const subjectStats: Record<string, { attempts: number; bestScore: number; bestStars: number }> = {}
    for (const a of attempts) {
      const key = `${a.subject}-L${a.level}`
      if (!subjectStats[key]) {
        subjectStats[key] = { attempts: 0, bestScore: 0, bestStars: 0 }
      }
      subjectStats[key].attempts++
      subjectStats[key].bestScore = Math.max(subjectStats[key].bestScore, a.total_points)
      subjectStats[key].bestStars = Math.max(subjectStats[key].bestStars, a.stars_earned)
    }

    return NextResponse.json({
      attempts,
      summary: {
        totalAttempts,
        bestScore,
        totalStarsEarned,
        avgScore,
        completedWithoutTimeout,
        subjectStats,
      },
    })
  } catch (error: any) {
    console.error("Error fetching attempt history:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
