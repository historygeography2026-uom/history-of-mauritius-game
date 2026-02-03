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

const testQuestions = [
  {
    subject: "history",
    level: 1,
    type: "matching",
    question: "Match each colour of the Mauritian flag with its correct meaning.",
    imageUrl: "",
    timer: 45,
    leftItem1: "Red",
    rightItem1: "Struggle for freedom",
    leftItem2: "Blue",
    rightItem2: "Indian Ocean",
    leftItem3: "Yellow",
    rightItem3: "Sunshine",
    leftItem4: "Green",
    rightItem4: "Fertile land",
  }
]

const formData = new FormData()
formData.append("questions", JSON.stringify(testQuestions))
formData.append("createdBy", "MIE")

console.log("[v0] Sending test matching question to API...")
console.log("[v0] Questions:", JSON.stringify(testQuestions, null, 2))

fetch("http://localhost:3001/api/import-excel", {
  method: "POST",
  body: formData,
})
  .then((res) => res.json())
  .then((data) => {
    console.log("[v0] API Response:", data)
    process.exit(0)
  })
  .catch((err) => {
    console.error("[v0] Error:", err)
    process.exit(1)
  })
