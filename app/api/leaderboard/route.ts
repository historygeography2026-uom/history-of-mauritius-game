import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get("subject") // subject name or "all"
  const levelParam = searchParams.get("level") // optional level number
  const limitParam = searchParams.get("limit") // optional result limit
  const limit = Math.min(Number.parseInt(limitParam || "50"), 100)
  const showAllAttempts = searchParams.get("all") === "true" // if true, show all attempts not just best per user

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", { ...options, maxAge: 0 })
        },
      },
    },
  )

  try {
    // Resolve filters to IDs when needed
    let subjectId: string | null = null
    if (subject && subject !== "all") {
      const { data: subjectData, error: subjErr } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", subject)
        .single()
      if (subjErr) throw subjErr
      subjectId = subjectData?.id ?? null
    }

    let levelId: string | null = null
    if (levelParam) {
      const { data: levelData, error: lvlErr } = await supabase
        .from("levels")
        .select("id")
        .eq("level_number", Number.parseInt(levelParam))
        .single()
      if (lvlErr) throw lvlErr
      levelId = levelData?.id ?? null
    }

    // Fetch a reasonably-sized candidate set ordered by points
    let query = supabase.from("leaderboard").select(
      `id,user_id,player_name,total_points,stars_earned,created_at,subject_id,level_id,subjects(name),levels(level_number)`,
    )

    if (subjectId) query = query.eq("subject_id", subjectId)
    if (levelId) query = query.eq("level_id", levelId)

    const { data: rows, error } = await query.order("total_points", { ascending: false }).limit(500)
    if (error) throw error

    // Reduce to best score per user per subject+level (unless showAllAttempts is true)
    let bestRows: (typeof rows)[number][]
    
    if (showAllAttempts) {
      // Show all attempts, just sort and limit
      bestRows = (rows || [])
        .sort((a, b) => b.total_points - a.total_points || new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())
        .slice(0, limit)
    } else {
      // Keep only the best score per user per subject+level
      type Key = string
      const bestMap = new Map<Key, (typeof rows)[number]>()
      for (const r of rows || []) {
        const key = `${r.user_id}::${r.subject_id}::${r.level_id}`
        const prev = bestMap.get(key)
        if (!prev || r.total_points > prev.total_points) {
          bestMap.set(key, r)
        }
      }

      bestRows = Array.from(bestMap.values())
        .sort((a, b) => b.total_points - a.total_points || new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())
        .slice(0, limit)
    }

    // Fetch profile info for display
    const userIds = Array.from(new Set(bestRows.map((r) => r.user_id).filter(Boolean))) as string[]
    let profilesById = new Map<string, { full_name: string | null; avatar_url: string | null }>()
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id,full_name,avatar_url")
        .in("id", userIds)
      for (const p of profiles || []) {
        profilesById.set(p.id as string, { full_name: p.full_name ?? null, avatar_url: p.avatar_url ?? null })
      }
    }

    const payload = bestRows.map((r) => {
      const prof = r.user_id ? profilesById.get(r.user_id) : undefined
      return {
        id: r.id,
        user_id: r.user_id,
        display_name: (prof?.full_name || r.player_name || "Player") as string,
        avatar_url: prof?.avatar_url || null,
        total_points: r.total_points,
        stars_earned: r.stars_earned,
        created_at: r.created_at,
        subject: r.subjects?.name ?? null,
        level: r.levels?.level_number ?? null,
      }
    })

    return NextResponse.json(payload)
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", { ...options, maxAge: 0 })
        },
      },
    },
  )

  try {
    const body = await request.json()
    const { player_name, subject, level, total_points, stars_earned } = body

    // Ensure user is authenticated (required by RLS insert policy)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get subject ID
    const { data: subjectData } = await supabase.from("subjects").select("id").eq("name", subject).single()

    // Get level ID
    const { data: levelData } = await supabase
      .from("levels")
      .select("id")
      .eq("level_number", Number.parseInt(level))
      .single()

    if (!subjectData || !levelData) {
      return NextResponse.json({ error: "Subject or Level not found" }, { status: 404 })
    }

    // Try to derive player name from profile when not provided
    let resolvedPlayerName = player_name as string | undefined
    if (!resolvedPlayerName) {
      const { data: profile } = await supabase.from("public_profiles").select("full_name").eq("id", user.id).single()
      resolvedPlayerName = profile?.full_name || user.email || "Player"
    }

    const { data: entry, error } = await supabase
      .from("leaderboard")
      .insert([
        {
          player_name: resolvedPlayerName,
          subject_id: subjectData.id,
          level_id: levelData.id,
          total_points,
          stars_earned,
          user_id: user.id,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(entry)
  } catch (error: any) {
    console.error("Error adding leaderboard entry:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
