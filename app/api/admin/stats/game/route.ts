import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // e.g., '2026-08'
    const view = searchParams.get('view') || 'daily' // 'daily', 'subject', 'level'

    // We get attempts from the leaderboard table as it records all finished games.
    if (view === 'daily') {
      const sql = `
        SELECT 
          TO_CHAR(l.game_date, 'YYYY-MM-DD') as day,
          s.name as subject,
          lev.level_number as level,
          COUNT(l.id) as attempts
        FROM leaderboard l
        LEFT JOIN subjects s ON l.subject_id = s.id
        LEFT JOIN levels lev ON l.level_id = lev.id
        WHERE l.game_date IS NOT NULL
        GROUP BY TO_CHAR(l.game_date, 'YYYY-MM-DD'), s.name, lev.level_number
        ORDER BY day DESC
      `
      const rawData = await query(sql)
      
      // Transform into a pivot format for the charts
      // Each day will have total, subject_history, subject_geography, subject_combined, level_1, level_2, level_3
      const dailyMap = new Map<string, any>()
      
      for (const row of rawData) {
        if (!dailyMap.has(row.day)) {
          dailyMap.set(row.day, {
            day: row.day,
            total_attempts: 0,
            subject_history: 0,
            subject_geography: 0,
            subject_combined: 0,
            level_1: 0,
            level_2: 0,
            level_3: 0,
          })
        }
        
        const dayRecord = dailyMap.get(row.day)
        const count = parseInt(row.attempts) || 0
        
        dayRecord.total_attempts += count
        
        if (row.subject === 'history') dayRecord.subject_history += count
        else if (row.subject === 'geography') dayRecord.subject_geography += count
        else if (row.subject === 'combined') dayRecord.subject_combined += count
        
        if (row.level === 1) dayRecord.level_1 += count
        else if (row.level === 2) dayRecord.level_2 += count
        else if (row.level === 3) dayRecord.level_3 += count
      }
      
      return NextResponse.json(Array.from(dailyMap.values()))
    }

    return NextResponse.json({ error: 'Invalid view' }, { status: 400 })
  } catch (error) {
    console.error('API Error /admin/stats/game:', error)
    return NextResponse.json({ error: 'Failed to fetch game stats' }, { status: 500 })
  }
}
