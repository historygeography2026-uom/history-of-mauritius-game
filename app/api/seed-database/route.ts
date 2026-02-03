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

    // Check if subjects already exist
    const { data: existingSubjects } = await supabase.from("subjects").select("id").limit(1)

    if (existingSubjects && existingSubjects.length > 0) {
      console.log("[v0] Database already seeded")
      return NextResponse.json({ success: true, message: "Database already seeded" })
    }

    console.log("[v0] Seeding database with base data and questions...")

    const questionsData = {
      history: {
        1: {
          mcq: [
            {
              question: "What is the capital of Mauritius?",
              options: ["Port Louis", "Curepipe", "Rose Hill", "Vacoas"],
              correct: "A",
              timer: 30,
            },
            {
              question: "In which year did Mauritius gain independence?",
              options: ["1960", "1968", "1965", "1970"],
              correct: "B",
              timer: 30,
            },
          ],
          matching: [
            {
              question: "Match It!",
              pairs: [
                { left: "Dodo", right: "Extinct bird" },
                { left: "Port Louis", right: "Capital city" },
                { left: "1968", right: "Independence year" },
              ],
              timer: 45,
            },
          ],
          fill: [
            {
              question: "The Dodo was an extinct bird found only in ________.",
              answer: "Mauritius",
              timer: 30,
            },
            {
              question: "Port ________ is the capital of Mauritius.",
              answer: "Louis",
              timer: 30,
            },
          ],
          reorder: [
            {
              question: "Put in Order",
              items: ["British rule", "French colonization", "Dutch settlement", "Independence"],
              correct: ["Dutch settlement", "French colonization", "British rule", "Independence"],
              timer: 45,
            },
          ],
          truefalse: [
            {
              question: "Mauritius gained independence in 1968.",
              correct: true,
              timer: 20,
            },
            {
              question: "The Dodo bird still exists in Mauritius today.",
              correct: false,
              timer: 20,
            },
          ],
        },
        2: {
          mcq: [
            {
              question: "What is the main language spoken in Mauritius?",
              options: ["French", "English", "Creole", "Hindi"],
              correct: "B",
              timer: 30,
            },
            {
              question: "Which mountain is a UNESCO World Heritage Site?",
              options: ["Piton de la Rivière Noire", "Le Morne Brabant", "Tourelle de Tamarin", "Montagne du Lion"],
              correct: "B",
              timer: 30,
            },
          ],
          matching: [
            {
              question: "Match It!",
              pairs: [
                { left: "Sega", right: "Traditional dance" },
                { left: "Le Morne", right: "UNESCO site" },
                { left: "Sugar", right: "Main crop" },
              ],
              timer: 45,
            },
          ],
          fill: [
            {
              question: "Le Morne Brabant is a ________ in Mauritius.",
              answer: "mountain",
              timer: 30,
            },
            {
              question: "The Sega is a traditional ________ from Mauritius.",
              answer: "dance",
              timer: 30,
            },
          ],
          reorder: [
            {
              question: "Put in Order",
              items: ["Settlement", "Colonization", "Independence", "Modern era"],
              correct: ["Settlement", "Colonization", "Independence", "Modern era"],
              timer: 45,
            },
          ],
          truefalse: [
            {
              question: "English is the official language of Mauritius.",
              correct: true,
              timer: 20,
            },
            {
              question: "Le Morne Brabant was used as a prison.",
              correct: false,
              timer: 20,
            },
          ],
        },
        3: {
          mcq: [
            {
              question: "In what year did the Dutch first settle in Mauritius?",
              options: ["1605", "1638", "1650", "1660"],
              correct: "B",
              timer: 30,
            },
            {
              question: "What is the Aapravasi Ghat?",
              options: ["A mountain peak", "An immigration depot", "A beach resort", "A sugar plantation"],
              correct: "B",
              timer: 30,
            },
          ],
          matching: [
            {
              question: "Match It!",
              pairs: [
                { left: "1638", right: "Dutch arrival" },
                { left: "Aapravasi Ghat", right: "UNESCO World Heritage" },
                { left: "Slavery", right: "Historical hardship" },
              ],
              timer: 45,
            },
          ],
          fill: [
            {
              question: "The ________ arrived in Mauritius in 1638.",
              answer: "Dutch",
              timer: 30,
            },
            {
              question: "Aapravasi Ghat is a UNESCO ________ Site.",
              answer: "World Heritage",
              timer: 30,
            },
          ],
          reorder: [
            {
              question: "Put in Order",
              items: ["Dutch era", "French rule", "British rule", "Independence"],
              correct: ["Dutch era", "French rule", "British rule", "Independence"],
              timer: 45,
            },
          ],
          truefalse: [
            {
              question: "The Dutch settled Mauritius in 1638.",
              correct: true,
              timer: 20,
            },
            {
              question: "Aapravasi Ghat is still an active immigration center.",
              correct: false,
              timer: 20,
            },
          ],
        },
      },
      geography: {
        1: {
          mcq: [
            {
              question: "Which ocean surrounds Mauritius?",
              options: ["Atlantic", "Indian", "Pacific", "Arctic"],
              correct: "B",
              timer: 30,
            },
            {
              question: "What is the main type of coral reef in Mauritius?",
              options: ["Barrier reef", "Fringing reef", "Atoll", "Platform reef"],
              correct: "B",
              timer: 30,
            },
          ],
          matching: [
            {
              question: "Match It!",
              pairs: [
                { left: "Coral reefs", right: "Marine protection" },
                { left: "Port Louis", right: "Main harbor" },
                { left: "Indian Ocean", right: "Surrounding water" },
              ],
              timer: 45,
            },
          ],
          fill: [
            {
              question: "Mauritius is located in the ________ Ocean.",
              answer: "Indian",
              timer: 30,
            },
            {
              question: "The island is surrounded by beautiful ________ reefs.",
              answer: "coral",
              timer: 30,
            },
          ],
          reorder: [
            {
              question: "Put in Order",
              items: ["Beaches", "Mountains", "Plateaus", "Lagoons"],
              correct: ["Beaches", "Lagoons", "Plateaus", "Mountains"],
              timer: 45,
            },
          ],
          truefalse: [
            {
              question: "Mauritius is in the Indian Ocean.",
              correct: true,
              timer: 20,
            },
            {
              question: "Mauritius has no coral reefs.",
              correct: false,
              timer: 20,
            },
          ],
        },
        2: {
          mcq: [
            {
              question: "What is the Seven Colored Earth?",
              options: ["A painting", "A natural geological formation", "A theme park", "A market"],
              correct: "B",
              timer: 30,
            },
            {
              question: "Where is the Pamplemousses Garden located?",
              options: ["Curepipe", "Rose Hill", "Pamplemousses", "Vacoas"],
              correct: "C",
              timer: 30,
            },
          ],
          matching: [
            {
              question: "Match It!",
              pairs: [
                { left: "Chamarel", right: "Colored Earth" },
                { left: "Pamplemousses", right: "Botanical garden" },
                { left: "Rodrigues", right: "Nearby island" },
              ],
              timer: 45,
            },
          ],
          fill: [
            {
              question: "The Seven ________ Earth is in Chamarel.",
              answer: "Colored",
              timer: 30,
            },
            {
              question: "Pamplemousses is known for its ________ garden.",
              answer: "botanical",
              timer: 30,
            },
          ],
          reorder: [
            {
              question: "Put in Order",
              items: ["Exploration", "Settlement", "Development", "Tourism"],
              correct: ["Exploration", "Settlement", "Development", "Tourism"],
              timer: 45,
            },
          ],
          truefalse: [
            {
              question: "The Seven Colored Earth is a natural formation.",
              correct: true,
              timer: 20,
            },
            {
              question: "Pamplemousses is famous for its beach.",
              correct: false,
              timer: 20,
            },
          ],
        },
        3: {
          mcq: [
            {
              question: "What is the highest peak in Mauritius?",
              options: ["Le Morne Brabant", "Piton de la Rivière Noire", "Tourelle de Tamarin", "Montagne du Lion"],
              correct: "B",
              timer: 30,
            },
            {
              question: "Which region is known as the Central Plateau?",
              options: ["Curepipe", "Port Louis", "Vacoas", "Beau Bassin"],
              correct: "A",
              timer: 30,
            },
          ],
          matching: [
            {
              question: "Match It!",
              pairs: [
                { left: "Black River", right: "River name" },
                { left: "Central Plateau", right: "Highland region" },
                { left: "Piton", right: "Mountain peak" },
              ],
              timer: 45,
            },
          ],
          fill: [
            {
              question: "The ________ Plateau is the highland region of Mauritius.",
              answer: "Central",
              timer: 30,
            },
            {
              question: "Piton de la Rivière ________ is the highest peak.",
              answer: "Noire",
              timer: 30,
            },
          ],
          reorder: [
            {
              question: "Put in Order",
              items: ["Coastal areas", "Plateaus", "Mountain peaks"],
              correct: ["Coastal areas", "Plateaus", "Mountain peaks"],
              timer: 45,
            },
          ],
          truefalse: [
            {
              question: "Piton de la Rivière Noire is the highest peak in Mauritius.",
              correct: true,
              timer: 20,
            },
            {
              question: "The Central Plateau is below sea level.",
              correct: false,
              timer: 20,
            },
          ],
        },
      },
      combined: {
        1: {
          mcq: [
            {
              question: "What is the capital of Mauritius and which ocean surrounds it?",
              options: [
                "Port Louis, Indian Ocean",
                "Curepipe, Atlantic Ocean",
                "Rose Hill, Pacific Ocean",
                "Vacoas, Arctic Ocean",
              ],
              correct: "A",
              timer: 30,
            },
            {
              question: "When did Mauritius gain independence and where is it located?",
              options: ["1960, Atlantic Ocean", "1968, Indian Ocean", "1965, Pacific Ocean", "1970, Arctic Ocean"],
              correct: "B",
              timer: 30,
            },
          ],
          matching: [
            {
              question: "Match It!",
              pairs: [
                { left: "Dodo", right: "Extinct bird" },
                { left: "Port Louis", right: "Capital" },
                { left: "Coral reefs", right: "Marine life" },
              ],
              timer: 45,
            },
          ],
          fill: [
            {
              question: "Mauritius is located in the ________ Ocean and gained independence in ________.",
              answer: "Indian, 1968",
              timer: 30,
            },
          ],
          reorder: [
            {
              question: "Put in Order",
              items: ["Settlement", "Independence", "Modern era"],
              correct: ["Settlement", "Independence", "Modern era"],
              timer: 45,
            },
          ],
          truefalse: [
            {
              question: "Mauritius is in the Indian Ocean.",
              correct: true,
              timer: 20,
            },
          ],
        },
        2: {
          mcq: [
            {
              question: "What UNESCO site is in Mauritius and what is its historical significance?",
              options: [
                "Le Morne Brabant - mountain",
                "Aapravasi Ghat - immigration depot",
                "Seven Colored Earth - geological site",
                "Pamplemousses - botanical garden",
              ],
              correct: "B",
              timer: 30,
            },
            {
              question: "Name one traditional Mauritian cultural element and its origin.",
              options: [
                "Sega - traditional dance",
                "Dodo - extinct bird",
                "Rum - local drink",
                "Cyclone - weather event",
              ],
              correct: "A",
              timer: 30,
            },
          ],
          matching: [
            {
              question: "Match It!",
              pairs: [
                { left: "Sega", right: "Dance" },
                { left: "Le Morne", right: "Mountain" },
                { left: "Sugar", right: "Crop" },
              ],
              timer: 45,
            },
          ],
          fill: [
            {
              question: "The ________ is a traditional Mauritian ________ and ________ is a UNESCO site.",
              answer: "Sega, dance, Aapravasi Ghat",
              timer: 30,
            },
          ],
          reorder: [
            {
              question: "Put in Order",
              items: ["Colonial period", "Cultural development", "Modern Mauritius"],
              correct: ["Colonial period", "Cultural development", "Modern Mauritius"],
              timer: 45,
            },
          ],
          truefalse: [
            {
              question: "Sega is a traditional Mauritian dance.",
              correct: true,
              timer: 20,
            },
          ],
        },
        3: {
          mcq: [
            {
              question: "Which European power first settled Mauritius in 1638?",
              options: ["Portuguese", "Dutch", "French", "British"],
              correct: "B",
              timer: 30,
            },
            {
              question: "In which year did the French arrive in Mauritius?",
              options: ["1638", "1710", "1715", "1810"],
              correct: "C",
              timer: 30,
            },
            {
              question: "When did the British conquer Mauritius?",
              options: ["1800", "1805", "1810", "1815"],
              correct: "C",
              timer: 30,
            },
          ],
          matching: [
            {
              question: "Match It!",
              pairs: [
                { left: "1638", right: "Dutch settlement" },
                { left: "1715", right: "French arrival" },
                { left: "1810", right: "British conquest" },
              ],
              timer: 45,
            },
          ],
          fill: [
            {
              question:
                "The ________ settled Mauritius in 1638, the ________ arrived in 1715, and the ________ conquered it in 1810.",
              answer: "Dutch, French, British",
              timer: 30,
            },
          ],
          reorder: [
            {
              question: "Put in Order",
              items: ["1810", "1638", "1715"],
              correct: ["1638", "1715", "1810"],
              timer: 45,
            },
          ],
          truefalse: [
            {
              question: "The Dutch were the first European settlers in Mauritius.",
              correct: true,
              timer: 20,
            },
          ],
        },
      },
    }

    // Function to insert a question with all its type-specific data
    const insertQuestion = async (
      subjectId: number,
      levelId: number,
      typeId: number,
      questionText: string,
      timer: number,
      questionData: any,
    ) => {
      const { data: question, error: qError } = await supabase
        .from("questions")
        .insert({
          subject_id: subjectId,
          level_id: levelId,
          question_type_id: typeId,
          question_text: questionText,
          timer_seconds: timer,
          display_title: questionText.substring(0, 50),
        })
        .select()
        .single()

      if (qError) {
        console.error("[v0] Error inserting question:", qError)
        return
      }

      const qId = question.id

      // Insert type-specific data
      if (typeId === 1) {
        // MCQ
        const optionLetters = ["A", "B", "C", "D"]
        for (let i = 0; i < questionData.options.length; i++) {
          await supabase.from("mcq_options").insert({
            question_id: qId,
            option_order: i + 1,
            option_text: questionData.options[i],
            is_correct: optionLetters[i] === questionData.correct,
          })
        }
      } else if (typeId === 2) {
        // Matching
        for (let i = 0; i < questionData.pairs.length; i++) {
          await supabase.from("matching_pairs").insert({
            question_id: qId,
            pair_order: i + 1,
            left_item: questionData.pairs[i].left,
            right_item: questionData.pairs[i].right,
          })
        }
      } else if (typeId === 3) {
        // Fill
        await supabase.from("fill_answers").insert({
          question_id: qId,
          answer_text: questionData.answer,
          case_sensitive: false,
        })
      } else if (typeId === 4) {
        // Reorder
        for (let i = 0; i < questionData.items.length; i++) {
          const correctPos = questionData.correct.indexOf(questionData.items[i]) + 1
          await supabase.from("reorder_items").insert({
            question_id: qId,
            item_order: i + 1,
            item_text: questionData.items[i],
            correct_position: correctPos,
          })
        }
      } else if (typeId === 5) {
        // True/False
        await supabase.from("truefalse_answers").insert({
          question_id: qId,
          correct_answer: questionData.correct,
        })
      }
    }

    // Get IDs for insertion
    const { data: subjects } = await supabase.from("subjects").select("id, name")
    const { data: levels } = await supabase.from("levels").select("id, level_number")
    const { data: types } = await supabase.from("question_types").select("id, name")

    const subjectMap = Object.fromEntries(subjects?.map((s: any) => [s.name, s.id]) || [])
    const levelMap = Object.fromEntries(levels?.map((l: any) => [l.level_number, l.id]) || [])
    const typeMap = Object.fromEntries(types?.map((t: any) => [t.name, t.id]) || [])

    // Insert all questions
    for (const [subjectName, subjectQuestions] of Object.entries(questionsData)) {
      for (const [levelNum, levelQuestions] of Object.entries(subjectQuestions)) {
        for (const [typeName, typeQuestions] of Object.entries(levelQuestions)) {
          for (const q of typeQuestions as any[]) {
            await insertQuestion(
              subjectMap[subjectName],
              levelMap[Number(levelNum)],
              typeMap[typeName],
              q.question,
              q.timer || 30,
              q,
            )
          }
        }
      }
    }

    console.log("[v0] Database seeding completed successfully")
    return NextResponse.json({ success: true, message: "Database seeded with all questions" })
  } catch (error: any) {
    console.error("[v0] Seeding error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
