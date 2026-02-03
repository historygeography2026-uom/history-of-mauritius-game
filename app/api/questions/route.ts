import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get("subject") || "history"
    const level = searchParams.get("level") || "1"

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

    const { data: questions, error } = await supabase
      .from("questions")
      .select(
        `id,question_text,timer_seconds,
         subject_id,level_id,
         question_types(name),
         subjects!inner(name),
         levels!inner(level_number),
         mcq_options (option_order, option_text, is_correct),
         matching_pairs (pair_order, left_item, right_item),
         fill_answers (answer_text),
         reorder_items (item_order, item_text, correct_position),
         truefalse_answers (correct_answer, explanation)
        `,
      )
      .eq("subjects.name", subject)
      .eq("levels.level_number", Number.parseInt(level))

    if (error) {
      console.error("[v0] Error fetching questions:", error)
      return NextResponse.json({ error: "Failed to fetch questions", details: error }, { status: 500 })
    }

    console.log(`[v0] Found ${questions?.length || 0} questions for subject=${subject}, level=${level}`)

    // Transform questions to match frontend expected format
    const transformed = (questions || []).map((q: any) => {
      const type = q.question_types?.name || "unknown"
      const baseQuestion = {
        id: q.id,
        title: q.question_text,
        type,
        timer: q.timer_seconds,
      }

      // Add type-specific data
      if (type === "mcq" && q.mcq_options?.length) {
        return {
          ...baseQuestion,
          question: q.question_text,
          options: q.mcq_options
            .sort((a: any, b: any) => a.option_order - b.option_order)
            .map((opt: any) => opt.option_text),
          correct: q.mcq_options.findIndex((opt: any) => opt.is_correct) + 1,
        }
      } else if (type === "matching" && q.matching_pairs?.length) {
        return {
          ...baseQuestion,
          question: q.question_text,
          pairs: q.matching_pairs
            .sort((a: any, b: any) => a.pair_order - b.pair_order)
            .map((pair: any) => ({
              left: pair.left_item,
              right: pair.right_item,
            })),
        }
      } else if (type === "fill" && q.fill_answers?.length) {
        return {
          ...baseQuestion,
          answer: q.fill_answers[0].answer_text,
          question: q.question_text,
        }
      } else if (type === "reorder" && q.reorder_items?.length) {
        return {
          ...baseQuestion,
          question: q.question_text,
          items: q.reorder_items
            .sort((a: any, b: any) => a.item_order - b.item_order)
            .map((item: any) => item.item_text),
          correct: q.reorder_items
            .sort((a: any, b: any) => a.correct_position - b.correct_position)
            .map((item: any) => item.item_text),
        }
      } else if (type === "truefalse" && q.truefalse_answers?.length) {
        return {
          ...baseQuestion,
          correct: q.truefalse_answers[0].correct_answer,
          question: q.question_text,
        }
      }

      return baseQuestion
    })

    console.log(`[v0] Transformed ${transformed.length} questions:`, JSON.stringify(transformed.map(q => ({ id: q.id, type: q.type, title: q.title?.substring(0, 50) }))))

    return NextResponse.json(transformed)
  } catch (error: any) {
    console.error("[v0] Error in GET /api/questions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
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

    const { questionData } = body

    // Get subject and level IDs
    const { data: subjectData } = await supabase.from("subjects").select("id").eq("name", questionData.subject).single()

    const { data: levelData } = await supabase
      .from("levels")
      .select("id")
      .eq("level_number", questionData.level)
      .single()

    const { data: typeData } = await supabase.from("question_types").select("id").eq("name", questionData.type).single()

    const { data: question, error: questionError } = await supabase
      .from("questions")
      .insert({
        subject_id: subjectData?.id,
        level_id: levelData?.id,
        question_type_id: typeData?.id,
        question_text: questionData.question,
        timer_seconds: questionData.timer || 30,
        created_by: questionData.createdBy || "admin",
      })
      .select()
      .single()

    if (questionError) throw questionError

    if (questionData.type === "mcq") {
      for (let i = 0; i < (questionData.options?.length || 0); i++) {
        await supabase.from("mcq_options").insert({
          question_id: question.id,
          option_order: i,
          option_text: questionData.options[i],
          is_correct: questionData.answer === i.toString() || questionData.answer === String.fromCharCode(65 + i),
        })
      }
    } else if (questionData.type === "matching") {
      for (let i = 0; i < (questionData.pairs?.length || 0); i++) {
        await supabase.from("matching_pairs").insert({
          question_id: question.id,
          pair_order: i,
          left_item: questionData.pairs[i].left,
          right_item: questionData.pairs[i].right,
        })
      }
    } else if (questionData.type === "fill") {
      await supabase.from("fill_answers").insert({
        question_id: question.id,
        answer_text: questionData.answer,
      })
    } else if (questionData.type === "reorder") {
      for (let i = 0; i < (questionData.options?.length || 0); i++) {
        await supabase.from("reorder_items").insert({
          question_id: question.id,
          item_order: i,
          item_text: questionData.options[i],
          correct_position: i,
        })
      }
    } else if (questionData.type === "truefalse") {
      await supabase.from("truefalse_answers").insert({
        question_id: question.id,
        correct_answer: questionData.answer === "true" || questionData.answer === true,
      })
    }

    return NextResponse.json(question, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating question:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, questionData } = body

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

    // Get subject, level, and type IDs
    const { data: subjectData } = await supabase.from("subjects").select("id").eq("name", questionData.subject).single()
    const { data: levelData } = await supabase
      .from("levels")
      .select("id")
      .eq("level_number", questionData.level)
      .single()
    const { data: typeData } = await supabase.from("question_types").select("id").eq("name", questionData.type).single()

    // Update main question
    const { error: questionError } = await supabase
      .from("questions")
      .update({
        subject_id: subjectData?.id,
        level_id: levelData?.id,
        question_type_id: typeData?.id,
        question_text: questionData.question,
        timer_seconds: questionData.timer || 30,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (questionError) throw questionError

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("[v0] Error updating question:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Question ID required" }, { status: 400 })
    }

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

    // First, get the question to check if it has an image
    const { data: question } = await supabase
      .from("questions")
      .select("image_url")
      .eq("id", id)
      .single()

    // If question has an image stored in Supabase Storage, delete it
    if (question?.image_url && question.image_url.includes("question-images")) {
      try {
        // Extract filename from URL
        const match = question.image_url.match(/\/question-images\/(.+)$/)
        if (match) {
          const filePath = match[1]
          await supabase.storage.from("question-images").remove([filePath])
          console.log(`[v0] Deleted image: ${filePath}`)
        }
      } catch (imgError) {
        console.error("[v0] Error deleting image (continuing with question delete):", imgError)
      }
    }

    // Delete question (cascade will delete related data)
    const { error } = await supabase.from("questions").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("[v0] Error deleting question:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
