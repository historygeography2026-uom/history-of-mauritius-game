import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, "../.env.local")
const envContent = fs.readFileSync(envPath, "utf-8")

envContent.split("\n").forEach((line) => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...valueParts] = trimmed.split("=")
    const value = valueParts.join("=").replace(/^"/, "").replace(/"$/, "")
    process.env[key.trim()] = value
  }
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fetchFlagQuestion() {
  try {
    // Get the question first - search for "Match each colour"
    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select("id, question_text, question_type_id")
      .ilike("question_text", "%Match each colour%")
      .limit(1)

    if (qError) {
      console.error("Error fetching question:", qError)
      process.exit(1)
    }

    if (!questions || questions.length === 0) {
      console.log("No matching question found")
      process.exit(0)
    }

    const question = questions[0]
    
    // Get the matching pairs
    const { data: pairs, error: pError } = await supabase
      .from("matching_pairs")
      .select("pair_order, left_item, right_item")
      .eq("question_id", question.id)
      .order("pair_order", { ascending: true })

    console.log("DEBUG - Pairs query result:", { pairsCount: pairs?.length, error: pError })

    if (pError) {
      console.error("Error fetching pairs:", pError)
      process.exit(1)
    }

    console.log("\n╔════════════════════════════════════════════════════════╗")
    console.log("║        🚩 MAURITIAN FLAG MATCHING QUESTION         ║")
    console.log("╚════════════════════════════════════════════════════════╝\n")
    
    console.log("Question ID:", question.id)
    console.log("\n📝 Question Text:")
    console.log(question.question_text)
    
    if (pairs && pairs.length > 0) {
      console.log("\n🔗 Matching Pairs:\n")
      pairs.forEach((pair, i) => {
        console.log(`  ${i + 1}. ${pair.left_item} → ${pair.right_item}`)
      })
    }
    
    console.log("\n")
    process.exit(0)
  } catch (err) {
    console.error("Error:", err)
    process.exit(1)
  }
}

fetchFlagQuestion()
