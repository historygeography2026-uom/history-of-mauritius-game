import { createClient } from "@supabase/supabase-js"

// This script migrates all game questions from the hardcoded database to Supabase
// Run this manually or call it from an admin endpoint

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// All hardcoded questions from the game
const questionsDatabase = {
  history: {
    1: {
      mcq: [
        {
          id: "h1_mcq_1",
          question: "What is the capital of Mauritius?",
          options: ["Port Louis", "Curepipe", "Rose Hill", "Vacoas"],
          correct: 0,
          title: "Capital City",
          timer: 30,
        },
        {
          id: "h1_mcq_2",
          question: "In what year did Mauritius gain independence?",
          options: ["1965", "1968", "1972", "1975"],
          correct: 1,
          title: "Independence Year",
          timer: 30,
        },
      ],
      matching: [
        {
          id: "h1_match_1",
          title: "Match It!",
          pairs: [
            { left: "Dodo Bird", right: "Extinct bird" },
            { left: "Port Louis", right: "Capital city" },
            { left: "1968", right: "Independence year" },
          ],
          timer: 45,
        },
      ],
      fill: [
        {
          id: "h1_fill_1",
          question: "The Dodo bird is _____ and found only in Mauritius.",
          answer: "extinct",
          title: "Fill the Blank",
          timer: 30,
        },
      ],
      reorder: [
        {
          id: "h1_reorder_1",
          question: "Put in correct order",
          items: ["1638 - Dutch arrival", "1715 - French arrival", "1810 - British conquest"],
          title: "Order Events",
          timer: 40,
        },
      ],
      truefalse: [
        {
          id: "h1_tf_1",
          question: "Mauritius was a French colony before British rule",
          correct: true,
          title: "True or False",
          timer: 25,
        },
      ],
    },
    2: {
      mcq: [
        {
          id: "h2_mcq_1",
          question: "Which UNESCO heritage site is in Mauritius?",
          options: ["Aapravasi Ghat", "Colosseum", "Great Wall", "Taj Mahal"],
          correct: 0,
          title: "UNESCO Site",
          timer: 35,
        },
        {
          id: "h2_mcq_2",
          question: "What does Sega represent in Mauritian culture?",
          options: ["Food", "Dance", "Language", "Sport"],
          correct: 1,
          title: "Cultural Dance",
          timer: 30,
        },
      ],
      matching: [
        {
          id: "h2_match_1",
          title: "Match It!",
          pairs: [
            { left: "Sega", right: "Traditional dance" },
            { left: "Le Morne", right: "UNESCO mountain" },
            { left: "Sugar", right: "Main crop" },
          ],
          timer: 45,
        },
      ],
      fill: [
        {
          id: "h2_fill_1",
          question: "The _____ ghat is an important historical site in Mauritius.",
          answer: "Aapravasi",
          title: "Historical Site",
          timer: 35,
        },
      ],
      reorder: [
        {
          id: "h2_reorder_1",
          question: "Chronological order",
          items: ["Discovery by Portuguese", "Occupation by Dutch", "Colonization by French"],
          title: "Historical Timeline",
          timer: 45,
        },
      ],
      truefalse: [
        {
          id: "h2_tf_1",
          question: "Le Morne is a mountain and UNESCO World Heritage Site",
          correct: true,
          title: "Mountain Heritage",
          timer: 30,
        },
      ],
    },
    3: {
      mcq: [
        {
          id: "h3_mcq_1",
          question: "When was Aapravasi Ghat established?",
          options: ["1834", "1850", "1875", "1900"],
          correct: 0,
          title: "Ghat Year",
          timer: 40,
        },
        {
          id: "h3_mcq_2",
          question: "What historical event happened in 1638?",
          options: ["Independence", "Dutch settlement", "French arrival", "British conquest"],
          correct: 1,
          title: "1638 Event",
          timer: 35,
        },
      ],
      matching: [
        {
          id: "h3_match_1",
          title: "Match It!",
          pairs: [
            { left: "1638", right: "Dutch settlement" },
            { left: "1715", right: "French arrival" },
            { left: "1810", right: "British conquest" },
          ],
          timer: 50,
        },
      ],
      fill: [
        {
          id: "h3_fill_1",
          question: "Slavery in Mauritius was abolished due to the work at _____.",
          answer: "Aapravasi Ghat",
          title: "Abolition Site",
          timer: 40,
        },
      ],
      reorder: [
        {
          id: "h3_reorder_1",
          question: "Colonial timeline",
          items: ["1638 Dutch", "1715 French", "1810 British", "1968 Independent"],
          title: "Full Timeline",
          timer: 50,
        },
      ],
      truefalse: [
        {
          id: "h3_tf_1",
          question: "Mauritius was independent from the start of its colonial history",
          correct: false,
          title: "Independence Fact",
          timer: 30,
        },
      ],
    },
  },
  geography: {
    1: {
      mcq: [
        {
          id: "g1_mcq_1",
          question: "What surrounds Mauritius?",
          options: ["Indian Ocean", "Atlantic Ocean", "Pacific Ocean", "Arctic Ocean"],
          correct: 0,
          title: "Ocean Type",
          timer: 30,
        },
        {
          id: "g1_mcq_2",
          question: "Which animal is unique to Mauritius?",
          options: ["Lion", "Dodo", "Elephant", "Polar bear"],
          correct: 1,
          title: "Native Animal",
          timer: 30,
        },
      ],
      matching: [
        {
          id: "g1_match_1",
          title: "Match It!",
          pairs: [
            { left: "Coral reefs", right: "Underwater ecosystem" },
            { left: "Port Louis", right: "Coastal city" },
            { left: "Indian Ocean", right: "Surrounding water" },
          ],
          timer: 45,
        },
      ],
      fill: [
        {
          id: "g1_fill_1",
          question: "Mauritius is located in the _____ Ocean.",
          answer: "Indian",
          title: "Ocean Location",
          timer: 30,
        },
      ],
      reorder: [
        {
          id: "g1_reorder_1",
          question: "Size order (from smallest)",
          items: ["Rodrigues Island", "Mauritius Island", "Madagascar Island"],
          title: "Island Sizes",
          timer: 40,
        },
      ],
      truefalse: [
        {
          id: "g1_tf_1",
          question: "Mauritius is the largest island in the Indian Ocean",
          correct: false,
          title: "Island Size Fact",
          timer: 25,
        },
      ],
    },
    2: {
      mcq: [
        {
          id: "g2_mcq_1",
          question: "Where is the Seven Coloured Earth located?",
          options: ["Chamarel", "Port Louis", "Curepipe", "Rose Hill"],
          correct: 0,
          title: "Natural Wonder",
          timer: 35,
        },
        {
          id: "g2_mcq_2",
          question: "What is Pamplemousses known for?",
          options: ["Beach", "Botanical Garden", "Mountain", "Cave"],
          correct: 1,
          title: "Garden Location",
          timer: 30,
        },
      ],
      matching: [
        {
          id: "g2_match_1",
          title: "Match It!",
          pairs: [
            { left: "Chamarel", right: "Seven colored earth" },
            { left: "Pamplemousses", right: "Botanical garden" },
            { left: "Rodrigues", right: "Sister island" },
          ],
          timer: 45,
        },
      ],
      fill: [
        {
          id: "g2_fill_1",
          question: "The _____ Garden is a famous attraction in Pamplemousses.",
          answer: "Botanical",
          title: "Garden Name",
          timer: 35,
        },
      ],
      reorder: [
        {
          id: "g2_reorder_1",
          question: "Distance order from Port Louis",
          items: ["Chamarel", "Pamplemousses", "Black River"],
          title: "Location Distance",
          timer: 45,
        },
      ],
      truefalse: [
        {
          id: "g2_tf_1",
          question: "The Botanical Gardens of Pamplemousses have plants from all over the world",
          correct: true,
          title: "Garden Diversity",
          timer: 30,
        },
      ],
    },
    3: {
      mcq: [
        {
          id: "g3_mcq_1",
          question: "What is the highest point in Mauritius?",
          options: ["Le Morne", "Piton de la Rivière Noire", "Pouce", "Trou aux Cerfs"],
          correct: 1,
          title: "Highest Peak",
          timer: 40,
        },
        {
          id: "g3_mcq_2",
          question: "Which region forms the central plateau?",
          options: ["Curepipe", "Central Plateau", "Northern Region", "Southern Coast"],
          correct: 0,
          title: "Plateau Region",
          timer: 35,
        },
      ],
      matching: [
        {
          id: "g3_match_1",
          title: "Match It!",
          pairs: [
            { left: "Central Plateau", right: "Highland region" },
            { left: "Black River", right: "Mountain gorge" },
            { left: "Piton", right: "Peak mountain" },
          ],
          timer: 50,
        },
      ],
      fill: [
        {
          id: "g3_fill_1",
          question: "The _____ is the highest peak in Mauritius.",
          answer: "Piton de la Rivière Noire",
          title: "Peak Name",
          timer: 40,
        },
      ],
      reorder: [
        {
          id: "g3_reorder_1",
          question: "Elevation order",
          items: ["Piton de la Rivière Noire", "Le Morne", "Pouce"],
          title: "Height Order",
          timer: 50,
        },
      ],
      truefalse: [
        {
          id: "g3_tf_1",
          question: "The Black River Gorges is one of the most scenic areas in Mauritius",
          correct: true,
          title: "Scenic Location",
          timer: 30,
        },
      ],
    },
  },
  combined: {
    1: {
      mcq: [
        {
          id: "c1_mcq_1",
          question: "What is the capital of Mauritius and its location?",
          options: ["Port Louis on coast", "Curepipe inland", "Vacoas north", "Rose Hill south"],
          correct: 0,
          title: "Capital Location",
          timer: 30,
        },
        {
          id: "c1_mcq_2",
          question: "When and where is Mauritius located?",
          options: ["1968, Atlantic", "1968, Indian Ocean", "1975, Pacific", "1960, Arctic"],
          correct: 1,
          title: "Geographic Independence",
          timer: 30,
        },
      ],
      matching: [
        {
          id: "c1_match_1",
          title: "Match It!",
          pairs: [
            { left: "Dodo", right: "1968 independence" },
            { left: "Port Louis", right: "Capital city" },
            { left: "Indian Ocean", right: "Surrounding area" },
          ],
          timer: 45,
        },
      ],
      fill: [
        {
          id: "c1_fill_1",
          question: "The Dodo is extinct and Mauritius gained independence in _____.",
          answer: "1968",
          title: "Combined Facts",
          timer: 30,
        },
      ],
      reorder: [
        {
          id: "c1_reorder_1",
          question: "Historical and geographic order",
          items: ["Discovery", "French rule", "British rule", "Independence"],
          title: "Combined Timeline",
          timer: 40,
        },
      ],
      truefalse: [
        {
          id: "c1_tf_1",
          question: "Mauritius is in the Indian Ocean and is an independent nation",
          correct: true,
          title: "Combined Geography",
          timer: 25,
        },
      ],
    },
    2: {
      mcq: [
        {
          id: "c2_mcq_1",
          question: "What cultural dance is from the island in the Indian Ocean?",
          options: ["Samba", "Sega", "Flamenco", "Tango"],
          correct: 1,
          title: "Island Culture",
          timer: 35,
        },
        {
          id: "c2_mcq_2",
          question: "Which UNESCO site is on this independent island?",
          options: ["Great Wall", "Aapravasi Ghat", "Colosseum", "Angkor Wat"],
          correct: 1,
          title: "Cultural Heritage",
          timer: 30,
        },
      ],
      matching: [
        {
          id: "c2_match_1",
          title: "Match It!",
          pairs: [
            { left: "Aapravasi Ghat", right: "UNESCO site history" },
            { left: "Le Morne", right: "Mountain heritage" },
            { left: "Sega", right: "Cultural dance" },
          ],
          timer: 45,
        },
      ],
      fill: [
        {
          id: "c2_fill_1",
          question: "The _____ mountain is both a geographic landmark and UNESCO heritage site.",
          answer: "Le Morne",
          title: "Landmark Heritage",
          timer: 35,
        },
      ],
      reorder: [
        {
          id: "c2_reorder_1",
          question: "Cultural and colonial timeline",
          items: ["Dutch settlement", "French culture", "Sugar industry", "Independence"],
          title: "Combined History",
          timer: 45,
        },
      ],
      truefalse: [
        {
          id: "c2_tf_1",
          question: "Le Morne has both geographic and historical significance",
          correct: true,
          title: "Heritage Fact",
          timer: 30,
        },
      ],
    },
    3: {
      mcq: [
        {
          id: "c3_mcq_1",
          question: "How many peaks are higher than 800m and when did independence occur?",
          options: ["2 peaks, 1965", "3 peaks, 1968", "4 peaks, 1970", "5 peaks, 1972"],
          correct: 1,
          title: "Geography-History",
          timer: 40,
        },
        {
          id: "c3_mcq_2",
          question: "What is the combined significance of Piton and slavery history?",
          options: ["Mountain resort", "Geological and cultural landmark", "Military fort", "Prison"],
          correct: 1,
          title: "Landmark Significance",
          timer: 35,
        },
      ],
      matching: [
        {
          id: "c3_match_1",
          title: "Match It!",
          pairs: [
            { left: "1638", right: "Dutch settlement" },
            { left: "Aapravasi", right: "Slavery abolition" },
            { left: "Piton", right: "Highest peak" },
          ],
          timer: 50,
        },
      ],
      fill: [
        {
          id: "c3_fill_1",
          question: "The _____ was founded in 1638 and the _____ documents 1834-1920 slavery.",
          answer: "colony, Aapravasi Ghat",
          title: "Double Answer",
          timer: 40,
        },
      ],
      reorder: [
        {
          id: "c3_reorder_1",
          question: "Complete island journey",
          items: ["1638 Dutch arrival", "1715 French era", "1834 Slavery documented", "1968 Independence"],
          title: "Full Timeline",
          timer: 50,
        },
      ],
      truefalse: [
        {
          id: "c3_tf_1",
          question: "Mauritius has mountains over 800m and a complex multicultural history",
          correct: true,
          title: "Complex Nature",
          timer: 30,
        },
      ],
    },
  },
}

export async function migrateQuestions() {
  console.log("Starting data migration to Supabase...")

  try {
    // Insert all questions
    for (const [subject, levels] of Object.entries(questionsDatabase)) {
      for (const [level, types] of Object.entries(levels)) {
        for (const [type, questions] of Object.entries(types)) {
          for (const question of questions as any[]) {
            console.log(`Inserting ${type} for ${subject} level ${level}...`)

            // Get IDs for foreign keys
            const { data: subjectData } = await supabase.from("subjects").select("id").eq("name", subject).single()

            const { data: levelData } = await supabase
              .from("levels")
              .select("id")
              .eq("level_number", Number.parseInt(level))
              .single()

            const { data: typeData } = await supabase.from("question_types").select("id").eq("name", type).single()

            if (!subjectData || !levelData || !typeData) {
              console.error("Missing foreign key data")
              continue
            }

            // Insert question
            const { data: insertedQuestion, error: questionError } = await supabase
              .from("questions")
              .insert({
                subject_id: subjectData.id,
                level_id: levelData.id,
                question_type_id: typeData.id,
                question_text: question.question || question.title,
                timer_seconds: question.timer || 30,
              })
              .select()

            if (questionError) {
              console.error("Error inserting question:", questionError)
              continue
            }

            const questionId = insertedQuestion?.[0]?.id

            // Insert type-specific data
            if (type === "mcq") {
              await supabase.from("mcq_options").insert(
                question.options.map((opt: string, idx: number) => ({
                  question_id: questionId,
                  option_order: idx + 1,
                  option_text: opt,
                  is_correct: idx === question.correct,
                })),
              )
            } else if (type === "matching") {
              await supabase.from("matching_pairs").insert(
                question.pairs.map((pair: any, idx: number) => ({
                  question_id: questionId,
                  pair_order: idx + 1,
                  left_item: pair.left,
                  right_item: pair.right,
                })),
              )
            } else if (type === "fill") {
              await supabase.from("fill_answers").insert({
                question_id: questionId,
                answer_text: question.answer,
              })
            } else if (type === "reorder") {
              await supabase.from("reorder_items").insert(
                question.items.map((item: string, idx: number) => ({
                  question_id: questionId,
                  item_order: idx + 1,
                  item_text: item,
                  correct_position: idx + 1,
                })),
              )
            } else if (type === "truefalse") {
              await supabase.from("truefalse_answers").insert({
                question_id: questionId,
                correct_answer: question.correct,
              })
            }
          }
        }
      }
    }

    console.log("Migration completed successfully!")
  } catch (error) {
    console.error("Migration error:", error)
  }
}
