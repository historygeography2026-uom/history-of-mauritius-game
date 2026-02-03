import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Import the hardcoded questions database
const questionsDatabase = {
  history: {
    1: {
      mcq: [
        {
          id: "h1_mcq_1",
          question: "What is the capital of Mauritius?",
          options: ["Port Louis", "Curepipe", "Rose Hill", "Vacoas"],
          correct: 0,
          timer: 30,
          title: "MCQ: Capital of Mauritius",
          type: "mcq",
        },
        {
          id: "h1_mcq_2",
          question: "In what year did Mauritius gain independence?",
          options: ["1965", "1968", "1970", "1972"],
          correct: 1,
          timer: 30,
          title: "MCQ: Mauritius Independence",
          type: "mcq",
        },
      ],
      matching: [
        {
          id: "h1_matching_1",
          question: "Match It!",
          pairs: [
            { left: "Dodo Bird", right: "Extinct bird" },
            { left: "Port Louis", right: "Capital city" },
            { left: "1968", right: "Independence year" },
          ],
          timer: 40,
          title: "Matching: History Facts",
          type: "matching",
        },
      ],
      fill: [
        {
          id: "h1_fill_1",
          question: "The Dodo bird was found in ___.",
          answer: "Mauritius",
          timer: 25,
          title: "Fill: Dodo Bird Habitat",
          type: "fill",
        },
      ],
      reorder: [
        {
          id: "h1_reorder_1",
          question: "Put in Order",
          items: ["1638 Dutch Settlement", "1715 French Arrival", "1810 British Conquest", "1968 Independence"],
          correct: ["1638 Dutch Settlement", "1715 French Arrival", "1810 British Conquest", "1968 Independence"],
          timer: 45,
          title: "Reorder: Historical Timeline",
          type: "reorder",
        },
      ],
      truefalse: [
        {
          id: "h1_tf_1",
          question: "Mauritius gained independence in 1960.",
          correct: false,
          timer: 20,
          title: "True/False: Independence Date",
          type: "truefalse",
        },
      ],
    },
    2: {
      mcq: [
        {
          id: "h2_mcq_1",
          question: "What traditional dance is famous in Mauritius?",
          options: ["Sega", "Tango", "Salsa", "Flamenco"],
          correct: 0,
          timer: 30,
          title: "MCQ: Mauritian Dance",
          type: "mcq",
        },
      ],
      matching: [
        {
          id: "h2_matching_1",
          question: "Match It!",
          pairs: [
            { left: "Sega", right: "Traditional dance" },
            { left: "Le Morne", right: "Mountain and UNESCO site" },
            { left: "Sugar", right: "Main crop" },
          ],
          timer: 40,
          title: "Matching: Culture & Sites",
          type: "matching",
        },
      ],
      fill: [
        {
          id: "h2_fill_1",
          question: "Le Morne Brabant is a ___ mountain in Mauritius.",
          answer: "sacred",
          timer: 25,
          title: "Fill: Le Morne Description",
          type: "fill",
        },
      ],
      reorder: [
        {
          id: "h2_reorder_1",
          question: "Put in Order",
          items: ["Settlement", "Development", "Trade Growth", "Modern Era"],
          correct: ["Settlement", "Development", "Trade Growth", "Modern Era"],
          timer: 45,
          title: "Reorder: Historical Periods",
          type: "reorder",
        },
      ],
      truefalse: [
        {
          id: "h2_tf_1",
          question: "Sugar was never an important crop in Mauritius.",
          correct: false,
          timer: 20,
          title: "True/False: Sugar Industry",
          type: "truefalse",
        },
      ],
    },
    3: {
      mcq: [
        {
          id: "h3_mcq_1",
          question: "What is the Aapravasi Ghat?",
          options: ["Hindu temple", "Historical immigration depot", "Royal palace", "Ancient fortress"],
          correct: 1,
          timer: 35,
          title: "MCQ: Aapravasi Ghat",
          type: "mcq",
        },
      ],
      matching: [
        {
          id: "h3_matching_1",
          question: "Match It!",
          pairs: [
            { left: "Aapravasi Ghat", right: "UNESCO World Heritage Site" },
            { left: "1638", right: "Dutch settlement year" },
            { left: "Slavery", right: "Historical practice" },
          ],
          timer: 40,
          title: "Matching: Advanced History",
          type: "matching",
        },
      ],
      fill: [
        {
          id: "h3_fill_1",
          question: "The ___ arrived in 1638 and settled in Mauritius.",
          answer: "Dutch",
          timer: 25,
          title: "Fill: Early Settlement",
          type: "fill",
        },
      ],
      reorder: [
        {
          id: "h3_reorder_1",
          question: "Put in Order",
          items: ["Dutch Era", "French Period", "British Rule", "Independence"],
          correct: ["Dutch Era", "French Period", "British Rule", "Independence"],
          timer: 45,
          title: "Reorder: Colonial Periods",
          type: "reorder",
        },
      ],
      truefalse: [
        {
          id: "h3_tf_1",
          question: "Mauritius was inhabited before European settlement.",
          correct: false,
          timer: 20,
          title: "True/False: Pre-Colonial Settlement",
          type: "truefalse",
        },
      ],
    },
  },
  geography: {
    1: {
      mcq: [
        {
          id: "g1_mcq_1",
          question: "In which ocean is Mauritius located?",
          options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
          correct: 1,
          timer: 30,
          title: "MCQ: Ocean Location",
          type: "mcq",
        },
      ],
      matching: [
        {
          id: "g1_matching_1",
          question: "Match It!",
          pairs: [
            { left: "Coral reefs", right: "Marine ecosystem" },
            { left: "Port Louis", right: "Coastal city" },
            { left: "Indian Ocean", right: "Surrounding water" },
          ],
          timer: 40,
          title: "Matching: Geography Basics",
          type: "matching",
        },
      ],
      fill: [
        {
          id: "g1_fill_1",
          question: "Mauritius is surrounded by the ___ Ocean.",
          answer: "Indian",
          timer: 25,
          title: "Fill: Ocean Name",
          type: "fill",
        },
      ],
      reorder: [
        {
          id: "g1_reorder_1",
          question: "Put in Order",
          items: ["Island", "Region", "Country", "Nation"],
          correct: ["Island", "Region", "Country", "Nation"],
          timer: 45,
          title: "Reorder: Geographic Hierarchy",
          type: "reorder",
        },
      ],
      truefalse: [
        {
          id: "g1_tf_1",
          question: "Mauritius is located in the Pacific Ocean.",
          correct: false,
          timer: 20,
          title: "True/False: Ocean Location",
          type: "truefalse",
        },
      ],
    },
    2: {
      mcq: [
        {
          id: "g2_mcq_1",
          question: "What is the Seven Colored Earth?",
          options: ["A painted mountain", "Natural sand formations", "An art installation", "A geological wonder"],
          correct: 3,
          timer: 30,
          title: "MCQ: Seven Colored Earth",
          type: "mcq",
        },
      ],
      matching: [
        {
          id: "g2_matching_1",
          question: "Match It!",
          pairs: [
            { left: "Chamarel", right: "Colored earth location" },
            { left: "Pamplemousses", right: "Botanical garden" },
            { left: "Rodrigues", right: "Sister island" },
          ],
          timer: 40,
          title: "Matching: Geographic Landmarks",
          type: "matching",
        },
      ],
      fill: [
        {
          id: "g2_fill_1",
          question: "The Seven Colored Earth is located in ___.",
          answer: "Chamarel",
          timer: 25,
          title: "Fill: Colored Earth Location",
          type: "fill",
        },
      ],
      reorder: [
        {
          id: "g2_reorder_1",
          question: "Put in Order",
          items: ["Northern Region", "Central Plateau", "Southern Coast", "Eastern Area"],
          correct: ["Northern Region", "Central Plateau", "Southern Coast", "Eastern Area"],
          timer: 45,
          title: "Reorder: Geographic Regions",
          type: "reorder",
        },
      ],
      truefalse: [
        {
          id: "g2_tf_1",
          question: "The Pamplemousses is an ancient temple.",
          correct: false,
          timer: 20,
          title: "True/False: Pamplemousses",
          type: "truefalse",
        },
      ],
    },
    3: {
      mcq: [
        {
          id: "g3_mcq_1",
          question: "What is the highest mountain in Mauritius?",
          options: ["Le Morne Brabant", "Piton de la Rivière Noire", "Black River Peak", "Chamarel Peak"],
          correct: 1,
          timer: 35,
          title: "MCQ: Highest Mountain",
          type: "mcq",
        },
      ],
      matching: [
        {
          id: "g3_matching_1",
          question: "Match It!",
          pairs: [
            { left: "Central Plateau", right: "Inland area" },
            { left: "Black River", right: "Gorge and valley" },
            { left: "Piton de la Rivière Noire", right: "Highest peak" },
          ],
          timer: 40,
          title: "Matching: Advanced Geography",
          type: "matching",
        },
      ],
      fill: [
        {
          id: "g3_fill_1",
          question: "The ___ is the main geographic plateau of Mauritius.",
          answer: "Central Plateau",
          timer: 25,
          title: "Fill: Plateau Name",
          type: "fill",
        },
      ],
      reorder: [
        {
          id: "g3_reorder_1",
          question: "Put in Order",
          items: ["Beach areas", "Plateau regions", "Mountain ranges", "Coastal zones"],
          correct: ["Beach areas", "Plateau regions", "Mountain ranges", "Coastal zones"],
          timer: 45,
          title: "Reorder: Landscape Types",
          type: "reorder",
        },
      ],
      truefalse: [
        {
          id: "g3_tf_1",
          question: "Mauritius has no mountains.",
          correct: false,
          timer: 20,
          title: "True/False: Mountains",
          type: "truefalse",
        },
      ],
    },
  },
  combined: {
    1: {
      mcq: [
        {
          id: "c1_mcq_1",
          question: "Mauritius is in the ___ Ocean and gained independence in ___.",
          options: ["Indian, 1968", "Atlantic, 1965", "Pacific, 1970", "Arctic, 1972"],
          correct: 0,
          timer: 30,
          title: "MCQ: Location & Independence",
          type: "mcq",
        },
      ],
      matching: [
        {
          id: "c1_matching_1",
          question: "Match It!",
          pairs: [
            { left: "Dodo", right: "Extinct bird" },
            { left: "1968", right: "Independence" },
            { left: "Port Louis", right: "Capital" },
          ],
          timer: 40,
          title: "Matching: Combined Facts",
          type: "matching",
        },
      ],
      fill: [
        {
          id: "c1_fill_1",
          question: "___ is the capital of Mauritius in the Indian Ocean.",
          answer: "Port Louis",
          timer: 25,
          title: "Fill: Capital Name",
          type: "fill",
        },
      ],
      reorder: [
        {
          id: "c1_reorder_1",
          question: "Put in Order",
          items: ["Discovery", "Settlement", "Development", "Independence"],
          correct: ["Discovery", "Settlement", "Development", "Independence"],
          timer: 45,
          title: "Reorder: Historical Timeline",
          type: "reorder",
        },
      ],
      truefalse: [
        {
          id: "c1_tf_1",
          question: "Mauritius is a large continent.",
          correct: false,
          timer: 20,
          title: "True/False: Size",
          type: "truefalse",
        },
      ],
    },
    2: {
      mcq: [
        {
          id: "c2_mcq_1",
          question: "Aapravasi Ghat and Le Morne are both ___ in Mauritius.",
          options: ["Mountains", "UNESCO World Heritage Sites", "Cities", "Beaches"],
          correct: 1,
          timer: 30,
          title: "MCQ: UNESCO Sites",
          type: "mcq",
        },
      ],
      matching: [
        {
          id: "c2_matching_1",
          question: "Match It!",
          pairs: [
            { left: "Aapravasi Ghat", right: "Immigration history" },
            { left: "Le Morne", right: "Slave history" },
            { left: "Sega", right: "Cultural dance" },
          ],
          timer: 40,
          title: "Matching: Culture & Heritage",
          type: "matching",
        },
      ],
      fill: [
        {
          id: "c2_fill_1",
          question: "The ___ is a UNESCO site related to slavery history.",
          answer: "Le Morne",
          timer: 25,
          title: "Fill: UNESCO Site",
          type: "fill",
        },
      ],
      reorder: [
        {
          id: "c2_reorder_1",
          question: "Put in Order",
          items: ["Early Settlement", "Colonial Period", "Modern Development", "Contemporary Era"],
          correct: ["Early Settlement", "Colonial Period", "Modern Development", "Contemporary Era"],
          timer: 45,
          title: "Reorder: Historical Periods",
          type: "reorder",
        },
      ],
      truefalse: [
        {
          id: "c2_tf_1",
          question: "Mauritius has no cultural heritage sites.",
          correct: false,
          timer: 20,
          title: "True/False: Heritage",
          type: "truefalse",
        },
      ],
    },
    3: {
      mcq: [
        {
          id: "c3_mcq_1",
          question: "Which event occurred in 1638 in Mauritius?",
          options: ["Independence", "Dutch settlement", "British conquest", "French arrival"],
          correct: 1,
          timer: 35,
          title: "MCQ: 1638 Event",
          type: "mcq",
        },
      ],
      matching: [
        {
          id: "c3_matching_1",
          question: "Match It!",
          pairs: [
            { left: "1638", right: "Dutch arrival" },
            { left: "1715", right: "French arrival" },
            { left: "1810", right: "British conquest" },
          ],
          timer: 40,
          title: "Matching: Colonial Timeline",
          type: "matching",
        },
      ],
      fill: [
        {
          id: "c3_fill_1",
          question: "Mauritius became independent in ___.",
          answer: "1968",
          timer: 25,
          title: "Fill: Independence Year",
          type: "fill",
        },
      ],
      reorder: [
        {
          id: "c3_reorder_1",
          question: "Put in Order",
          items: ["1638 Dutch", "1715 French", "1810 British", "1968 Independence"],
          correct: ["1638 Dutch", "1715 French", "1810 British", "1968 Independence"],
          timer: 45,
          title: "Reorder: Complete Timeline",
          type: "reorder",
        },
      ],
      truefalse: [
        {
          id: "c3_tf_1",
          question: "Mauritius was the last colony to gain independence in Africa.",
          correct: false,
          timer: 20,
          title: "True/False: Independence",
          type: "truefalse",
        },
      ],
    },
  },
}

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

    console.log("[v0] Checking for existing questions...")
    const { data: existingQuestions } = await supabase.from("questions").select("id").limit(1)

    if (existingQuestions && existingQuestions.length > 0) {
      console.log("[v0] Questions already seeded")
      return NextResponse.json({ success: true, message: "Questions already seeded" })
    }

    console.log("[v0] Seeding questions...")

    // Get subject and type IDs
    const { data: subjects } = await supabase.from("subjects").select("id, name")
    const { data: levels } = await supabase.from("levels").select("id, level_number")
    const { data: types } = await supabase.from("question_types").select("id, name")

    const subjectMap = Object.fromEntries(subjects?.map((s: any) => [s.name, s.id]) || [])
    const levelMap = Object.fromEntries(levels?.map((l: any) => [l.level_number, l.id]) || [])
    const typeMap = Object.fromEntries(types?.map((t: any) => [t.name, t.id]) || [])

    let totalInserted = 0

    // Insert all questions
    for (const [subjectName, subjectData] of Object.entries(questionsDatabase)) {
      for (const [levelNum, levelData] of Object.entries(subjectData as any)) {
        for (const [questionType, questions] of Object.entries(levelData as any)) {
          for (const question of questions as any[]) {
            const { data: insertedQuestion, error: qError } = await supabase
              .from("questions")
              .insert({
                subject_id: subjectMap[subjectName],
                level_id: levelMap[Number(levelNum)],
                question_type_id: typeMap[questionType],
                question_text: question.question,
                display_title: question.title,
                timer_seconds: question.timer || 30,
              })
              .select()
              .single()

            if (qError) {
              console.error("[v0] Error inserting question:", qError)
              continue
            }

            // Insert type-specific data
            if (questionType === "mcq" && question.options) {
              for (let i = 0; i < question.options.length; i++) {
                await supabase.from("mcq_options").insert({
                  question_id: insertedQuestion.id,
                  option_order: i,
                  option_text: question.options[i],
                  is_correct: i === question.correct,
                })
              }
            } else if (questionType === "matching" && question.pairs) {
              for (let i = 0; i < question.pairs.length; i++) {
                await supabase.from("matching_pairs").insert({
                  question_id: insertedQuestion.id,
                  pair_order: i,
                  left_item: question.pairs[i].left,
                  right_item: question.pairs[i].right,
                })
              }
            } else if (questionType === "fill" && question.answer) {
              await supabase.from("fill_answers").insert({
                question_id: insertedQuestion.id,
                answer_text: question.answer,
              })
            } else if (questionType === "reorder" && question.items) {
              for (let i = 0; i < question.items.length; i++) {
                await supabase.from("reorder_items").insert({
                  question_id: insertedQuestion.id,
                  item_order: i,
                  item_text: question.items[i],
                  correct_position: question.correct?.indexOf(question.items[i]) || i,
                })
              }
            } else if (questionType === "truefalse" && question.correct !== undefined) {
              await supabase.from("truefalse_answers").insert({
                question_id: insertedQuestion.id,
                correct_answer: question.correct,
              })
            }

            totalInserted++
          }
        }
      }
    }

    console.log(`[v0] Seeded ${totalInserted} questions successfully`)
    return NextResponse.json({ success: true, message: `Seeded ${totalInserted} questions` })
  } catch (error: any) {
    console.error("[v0] Seed error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
