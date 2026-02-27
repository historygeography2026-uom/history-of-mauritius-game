import { pool } from "@/lib/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get("subject")
  const userId = searchParams.get("user_id")

  // Get session if available (for authenticated users)
  const session = await getServerSession(authOptions)
  const currentUserId = session?.user?.id

  try {
    if (!subject && !userId && !currentUserId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const conditions: string[] = []
    const params: any[] = []

    // If user_id is provided explicitly, use it
    if (userId) {
      params.push(userId)
      conditions.push(`user_id = $${params.length}`)
    } else if (currentUserId) {
      // Otherwise use current session user
      params.push(currentUserId)
      conditions.push(`user_id = $${params.length}`)
    }

    if (subject) {
      params.push(subject)
      conditions.push(`subject_name = $${params.length}`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const query = `
      SELECT id, user_id, subject_name, level_number, stars_earned, is_completed, 
             best_score, first_completed_at, last_attempted_at, created_at, updated_at
      FROM public.user_progress
      ${whereClause}
      ORDER BY level_number ASC
    `

    const result = await pool.query(query, params)
    const progressData = result.rows

    // Format for frontend
    const formatted = progressData.reduce(
      (acc, row) => {
        acc[row.level_number] = {
          stars: row.stars_earned,
          completed: row.is_completed,
          bestScore: row.best_score,
          firstCompletedAt: row.first_completed_at,
          lastAttemptedAt: row.last_attempted_at,
        }
        return acc
      },
      {} as Record<number, any>
    )

    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error("Error fetching user progress:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { subject, level, stars, completed } = body

    if (!subject || level === undefined || level === null || stars === undefined) {
      return NextResponse.json(
        { error: "subject, level, and stars are required" },
        { status: 400 }
      )
    }

    // Validate data types
    const levelNum = parseInt(level)
    const starsNum = parseInt(stars)
    const isCompleted = Boolean(completed)

    if (isNaN(levelNum) || isNaN(starsNum) || levelNum < 1 || starsNum < 0) {
      return NextResponse.json(
        { error: "Invalid level or stars value" },
        { status: 400 }
      )
    }

    // Upsert progress record
    const query = `
      INSERT INTO public.user_progress 
        (user_id, subject_name, level_number, stars_earned, is_completed, 
         best_score, first_completed_at, last_attempted_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 
              CASE WHEN $5 = TRUE AND first_completed_at IS NULL THEN NOW() ELSE first_completed_at END,
              NOW(), NOW())
      ON CONFLICT (user_id, subject_name, level_number) DO UPDATE SET
        stars_earned = GREATEST(public.user_progress.stars_earned, $4),
        is_completed = public.user_progress.is_completed OR $5,
        best_score = GREATEST(public.user_progress.best_score, $4),
        first_completed_at = COALESCE(public.user_progress.first_completed_at, 
                                       CASE WHEN $5 = TRUE THEN NOW() ELSE NULL END),
        last_attempted_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `

    const result = await pool.query(query, [userId, subject, levelNum, starsNum, isCompleted])
    const row = result.rows[0]

    return NextResponse.json({
      id: row.id,
      subject: row.subject_name,
      level: row.level_number,
      stars: row.stars_earned,
      completed: row.is_completed,
      bestScore: row.best_score,
      firstCompletedAt: row.first_completed_at,
      lastAttemptedAt: row.last_attempted_at,
    })
  } catch (error: any) {
    console.error("Error saving user progress:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
