import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

async function requireAdmin(request: Request): Promise<NextResponse | null> {
  return verifyAdminToken(request)
}

// GET — List all units with question counts
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const result = await pool.query(`
      SELECT pu.id, pu.unit_no, pu.unit_name, pu.is_active,
             pu.created_at, pu.updated_at,
             COUNT(pq.id) FILTER (WHERE pq.is_active = true) AS question_count
      FROM practice_units pu
      LEFT JOIN practice_questions pq ON pq.unit_id = pu.id
      GROUP BY pu.id
      ORDER BY pu.unit_no
    `)

    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error("[admin/practice/units] Error fetching units:", error)
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 })
  }
}

// POST — Create a new unit
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { unit_no, unit_name } = await request.json()

    if (!Number.isInteger(unit_no) || unit_no < 1) {
      return NextResponse.json({ error: "unit_no must be a positive integer" }, { status: 400 })
    }
    if (!unit_name || typeof unit_name !== "string" || unit_name.trim().length === 0) {
      return NextResponse.json({ error: "unit_name is required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO practice_units (unit_no, unit_name)
       VALUES ($1, $2)
       RETURNING *`,
      [unit_no, unit_name.trim()]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "A unit with that number already exists" }, { status: 409 })
    }
    console.error("[admin/practice/units] Error creating unit:", error)
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 })
  }
}

// PUT — Update a unit
export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id, unit_name, is_active } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const updates: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (unit_name !== undefined) {
      if (typeof unit_name !== "string" || unit_name.trim().length === 0) {
        return NextResponse.json({ error: "unit_name cannot be empty" }, { status: 400 })
      }
      updates.push(`unit_name = $${paramIndex++}`)
      params.push(unit_name.trim())
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`)
      params.push(Boolean(is_active))
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
    }

    updates.push(`updated_at = NOW()`)
    params.push(id)

    const result = await pool.query(
      `UPDATE practice_units SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      params
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("[admin/practice/units] Error updating unit:", error)
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 })
  }
}

// DELETE — Delete a unit (only if no questions exist)
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id query param is required" }, { status: 400 })
    }

    // Check for existing questions
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM practice_questions WHERE unit_id = $1",
      [id]
    )
    const questionCount = parseInt(countResult.rows[0].count)

    if (questionCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete unit: it has ${questionCount} question(s). Delete the questions first or deactivate the unit.` },
        { status: 409 }
      )
    }

    const result = await pool.query(
      "DELETE FROM practice_units WHERE id = $1 RETURNING *",
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Unit deleted successfully", unit: result.rows[0] })
  } catch (error: any) {
    console.error("[admin/practice/units] Error deleting unit:", error)
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 })
  }
}
