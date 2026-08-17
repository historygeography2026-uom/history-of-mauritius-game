import { pool } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * Student API — End a practice session.
 * Open to all students & visitors (login optional).
 *
 * POST { session_id, exit_reason }
 *
 * exit_reason: "completed" | "exited" | "abandoned"
 */
export async function POST(request: Request) {
  try {
    const { session_id, exit_reason } = await request.json()

    if (!session_id) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 })
    }

    const validReasons = ["completed", "exited", "abandoned"]
    const reason = exit_reason || "abandoned"
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: `exit_reason must be one of: ${validReasons.join(", ")}` },
        { status: 400 }
      )
    }

    // Update the session if not already ended
    const result = await pool.query(
      `UPDATE practice_sessions
       SET ended_at = NOW(), exit_reason = $1
       WHERE id = $2 AND ended_at IS NULL
       RETURNING id, ended_at, exit_reason`,
      [reason, session_id]
    )

    if (result.rows.length === 0) {
      // Check if session exists but is already ended
      const existsResult = await pool.query(
        "SELECT id, ended_at FROM practice_sessions WHERE id = $1",
        [session_id]
      )

      if (existsResult.rows.length === 0) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }

      if (existsResult.rows[0].ended_at) {
        // Session already ended — idempotent, return success
        return NextResponse.json({
          success: true,
          already_ended: true,
          session_id: existsResult.rows[0].id,
        })
      }

      return NextResponse.json({ error: "Could not end session" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session_id: result.rows[0].id,
      ended_at: result.rows[0].ended_at,
      exit_reason: result.rows[0].exit_reason,
    })
  } catch (error: any) {
    console.error("[practice/session/end] Error:", error)
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 })
  }
}
