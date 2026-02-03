import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = await cookies()
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

    console.log("[v0] Initializing base data...")

    // Insert subjects if they don't exist
    const { error: subjectError } = await supabase.from("subjects").insert(
      [
        { name: "history", description: "History of Mauritius" },
        { name: "geography", description: "Geography of Mauritius" },
        { name: "combined", description: "Combined History and Geography" },
      ],
      { ignoreConflicts: true },
    )

    if (subjectError && !subjectError.message.includes("duplicate")) {
      console.log("[v0] Subjects already exist or initialized")
    }

    // Insert levels if they don't exist
    const { error: levelError } = await supabase.from("levels").insert(
      [
        { level_number: 1, name: "Level 1", difficulty: "Beginner" },
        { level_number: 2, name: "Level 2", difficulty: "Intermediate" },
        { level_number: 3, name: "Level 3", difficulty: "Advanced" },
      ],
      { ignoreConflicts: true },
    )

    if (levelError && !levelError.message.includes("duplicate")) {
      console.log("[v0] Levels already exist or initialized")
    }

    // Insert question types if they don't exist
    const { error: typeError } = await supabase.from("question_types").insert(
      [
        { name: "mcq", description: "Multiple Choice Question" },
        { name: "matching", description: "Matching Pairs" },
        { name: "fill", description: "Fill in the Blanks" },
        { name: "reorder", description: "Put in Order" },
        { name: "truefalse", description: "True or False" },
      ],
      { ignoreConflicts: true },
    )

    if (typeError && !typeError.message.includes("duplicate")) {
      console.log("[v0] Question types already exist or initialized")
    }

    console.log("[v0] Base data initialization completed")
    return NextResponse.json({ success: true, message: "Base data initialized" })
  } catch (error: any) {
    console.error("[v0] Initialization error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
