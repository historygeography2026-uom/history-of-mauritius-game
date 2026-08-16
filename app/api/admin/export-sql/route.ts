import { pool } from "@/lib/db"
import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

/**
 * GET /api/admin/export-sql
 * Exports the entire database as SQL INSERT statements for backup/recovery.
 * Requires admin authentication.
 */
export async function GET(request: Request) {
  const authError = verifyAdminToken(request)
  if (authError) return authError

  try {
    const now = new Date()
    const timestamp = now.toISOString().replace(/[-:]/g, "").replace("T", "_").slice(0, 15)
    const filename = `mauritius_game_backup_${timestamp}.sql`

    // Tables to export in dependency order
    const tables = [
      "subjects",
      "levels",
      "question_types",
      "users",
      "questions",
      "mcq_options",
      "matching_pairs",
      "fill_answers",
      "reorder_items",
      "truefalse_answers",
      "leaderboard",
      "user_progress",
      "practice_units",
      "practice_questions",
      "practice_sessions",
      "practice_attempts",
    ]

    let sql = `-- Mauritius Learning Hub — Database Backup\n`
    sql += `-- Generated: ${now.toISOString()}\n`
    sql += `-- ==========================================\n\n`

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT * FROM ${table}`)
        if (result.rows.length === 0) {
          sql += `-- Table "${table}": (empty)\n\n`
          continue
        }

        const columns = Object.keys(result.rows[0])
        sql += `-- Table "${table}": ${result.rows.length} rows\n`

        // Check if table has GENERATED ALWAYS AS IDENTITY column
        const identityCheck = await pool.query(
          `SELECT column_name FROM information_schema.columns 
           WHERE table_name = $1 AND is_identity = 'YES'`,
          [table]
        )
        const identityCols = new Set(identityCheck.rows.map((r: any) => r.column_name))
        const insertCols = columns.filter(c => !identityCols.has(c))

        if (insertCols.length === 0) {
          sql += `-- (all columns are identity, skipping)\n\n`
          continue
        }

        for (const row of result.rows) {
          const values = insertCols.map((col) => {
            const val = row[col]
            if (val === null || val === undefined) return "NULL"
            if (typeof val === "boolean") return val ? "TRUE" : "FALSE"
            if (typeof val === "number") return String(val)
            if (val instanceof Date) return `'${val.toISOString()}'`
            if (typeof val === "object") {
              // JSONB or array
              return `'${JSON.stringify(val).replace(/'/g, "''")}'`
            }
            return `'${String(val).replace(/'/g, "''")}'`
          })
          sql += `INSERT INTO ${table} (${insertCols.join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT DO NOTHING;\n`
        }
        sql += "\n"
      } catch (tableErr: any) {
        sql += `-- Table "${table}": ERROR — ${tableErr.message?.replace(/--/g, "")}\n\n`
      }
    }

    // Add sequence resets for identity columns
    sql += `-- ==========================================\n`
    sql += `-- Reset identity sequences to max values\n`
    sql += `-- ==========================================\n`
    for (const table of tables) {
      try {
        const identityCheck = await pool.query(
          `SELECT column_name FROM information_schema.columns 
           WHERE table_name = $1 AND is_identity = 'YES'`,
          [table]
        )
        for (const row of identityCheck.rows) {
          const col = row.column_name
          sql += `SELECT setval(pg_get_serial_sequence('${table}', '${col}'), COALESCE((SELECT MAX(${col}) FROM ${table}), 1));\n`
        }
      } catch {
        // skip
      }
    }

    return new NextResponse(sql, {
      status: 200,
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[admin/export-sql] Error:", error)
    return NextResponse.json({ error: "Failed to export database" }, { status: 500 })
  }
}
