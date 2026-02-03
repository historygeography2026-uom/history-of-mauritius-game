import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function insertMatchingPairs() {
  try {
    console.log("[v0] Inserting matching pairs for question 974...")
    
    const pairs = [
      { question_id: 974, pair_order: 1, left_item: "Red", right_item: "Struggle for freedom" },
      { question_id: 974, pair_order: 2, left_item: "Blue", right_item: "Indian Ocean" },
      { question_id: 974, pair_order: 3, left_item: "Yellow", right_item: "Sunshine" },
      { question_id: 974, pair_order: 4, left_item: "Green", right_item: "Fertile land" },
    ]

    const { data, error } = await supabase
      .from("matching_pairs")
      .insert(pairs)

    if (error) {
      console.error("[v0] Error inserting pairs:", error)
      process.exit(1)
    }

    console.log("[v0] ✓ Successfully inserted matching pairs!")
    console.log("[v0] Pairs inserted:")
    pairs.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.left_item} → ${p.right_item}`)
    })
    
    process.exit(0)
  } catch (err) {
    console.error("[v0] Error:", err)
    process.exit(1)
  }
}

insertMatchingPairs()
