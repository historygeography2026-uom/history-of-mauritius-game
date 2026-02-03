import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fetchFlagQuestion() {
  try {
    console.log("[v0] Searching for Mauritian flag matching question...\n")

    // Search for the question containing "Match each colour of the Mauritian flag"
    const { data: questions, error } = await supabase
      .from("questions")
      .select(`
        id,
        question_text,
        question_type_id,
        subject_id,
        level_id,
        image_url,
        timer_seconds,
        created_by,
        question_types(name),
        subjects(name),
        levels(level_number),
        question_options(
          id,
          option_number,
          option_text,
          correct_answer
        )
      `)
      .ilike("question_text", "%Match each colour of the Mauritian flag%")
      .limit(1)

    if (error) {
      console.error("[v0] Error fetching question:", error)
      return
    }

    if (!questions || questions.length === 0) {
      console.log("[v0] No matching question found with that text")
      return
    }

    const question = questions[0]
    
    console.log("════════════════════════════════════════════════════════════════")
    console.log("🚩 MAURITIAN FLAG MATCHING QUESTION")
    console.log("════════════════════════════════════════════════════════════════\n")
    
    console.log(`📌 Question ID: ${question.id}`)
    console.log(`📚 Subject: ${question.subjects.name}`)
    console.log(`📊 Level: ${question.levels.level_number}`)
    console.log(`⏱️  Timer: ${question.timer_seconds} seconds`)
    console.log(`🏷️  Type: ${question.question_types.name}`)
    console.log(`👤 Created By: ${question.created_by}`)
    if (question.image_url) {
      console.log(`🖼️  Image: ${question.image_url}`)
    }
    
    console.log("\n" + "─".repeat(60))
    console.log("❓ QUESTION:")
    console.log("─".repeat(60))
    console.log(question.question_text)
    
    if (question.question_options && question.question_options.length > 0) {
      console.log("\n" + "─".repeat(60))
      console.log("🔗 MATCHING OPTIONS:")
      console.log("─".repeat(60))
      
      question.question_options.forEach((opt, index) => {
        console.log(`\n[Option ${index + 1}]`)
        console.log(`  Left Item: ${opt.option_text}`)
        console.log(`  Right Item: ${opt.correct_answer}`)
        console.log(`  ✓ Correct Answer: ${opt.correct_answer}`)
      })
    }
    
    console.log("\n" + "════════════════════════════════════════════════════════════════\n")

  } catch (error) {
    console.error("[v0] Error:", error)
  }
}

fetchFlagQuestion()
