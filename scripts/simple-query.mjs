import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

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

async function main() {
  console.log("Querying question 974...")
  
  try {
    const { data, error } = await supabase
      .rpc('get_question_with_pairs', { p_question_id: 974 })

    if (error) throw error
    console.log("Result:", data)
    process.exit(0)
  } catch (err) {
    console.error("RPC error, trying direct query...")
    
    try {
      const { data: pairs, error: err2 } = await supabase
        .from("matching_pairs")
        .select("*")
        .eq("question_id", 974)
      
      if (err2) throw err2
      console.log("\nMatching Pairs for Question 974:")
      console.log(JSON.stringify(pairs, null, 2))
      process.exit(0)
    } catch (e) {
      console.error("Error:", e)
      process.exit(1)
    }
  }
}

setTimeout(() => {
  console.error("Timeout - request took too long")
  process.exit(1)
}, 5000)

main()
