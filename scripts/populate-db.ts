import { createClient } from "@supabase/supabase-js"

// This script populates Supabase with all questions from the hardcoded database
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// All questions data from the hardcoded database
const questionsData = {
  history: {
    1: {
      mcq: [
        {
          question: "What is the capital of Mauritius?",
          options: ["Port Louis", "Curepipe", "Rose Hill", "Vacoas"],
          correct: "Port Louis",
          image: "/port-louis-harbor.jpg",
        },
        {
          question: "In which year did Mauritius gain independence?",
          options: ["1960", "1968", "1965", "1970"],
          correct: "1968",
          image: "/mauritius-independence-1968.jpg",
        },
      ],
      matching: [
        {
          pairs: [
            { left: "Dodo", right: "Extinct bird" },
            { left: "Port Louis", right: "Capital city" },
            { left: "1968", right: "Independence year" },
          ],
        },
      ],
      fill: [
        {
          question: "The Dodo was an extinct bird found only in ______.",
          answer: "Mauritius",
        },
        {
          question: "Port ______ is the capital of Mauritius.",
          answer: "Louis",
        },
      ],
      reorder: [
        {
          items: ["British rule", "French colonization", "Dutch settlement", "Independence"],
          correctOrder: ["Dutch settlement", "French colonization", "British rule", "Independence"],
        },
      ],
      truefalse: [
        {
          statement: "Mauritius gained independence in 1968.",
          correct: true,
        },
        {
          statement: "The Dodo bird still exists in Mauritius today.",
          correct: false,
        },
      ],
    },
    2: {
      mcq: [
        {
          question: "What is the main language spoken in Mauritius?",
          options: ["French", "English", "Creole", "Hindi"],
          correct: "English",
          image: "/mauritius-languages.jpg",
        },
        {
          question: "Which mountain is a UNESCO World Heritage Site?",
          options: ["Piton de la Rivière Noire", "Le Morne Brabant", "Tourelle de Tamarin", "Montagne du Lion"],
          correct: "Le Morne Brabant",
          image: "/le-morne-mountain.jpg",
        },
      ],
      matching: [
        {
          pairs: [
            { left: "Sega", right: "Traditional dance" },
            { left: "Le Morne", right: "UNESCO site" },
            { left: "Sugar", right: "Main crop" },
          ],
        },
      ],
      fill: [
        {
          question: "Le Morne Brabant is a ______ in Mauritius.",
          answer: "mountain",
        },
        {
          question: "The Sega is a traditional ______ from Mauritius.",
          answer: "dance",
        },
      ],
      reorder: [
        {
          items: ["Level 2 Q1", "Level 2 Q2", "Level 2 Q3", "Level 2 Q4"],
          correctOrder: ["Level 2 Q1", "Level 2 Q2", "Level 2 Q3", "Level 2 Q4"],
        },
      ],
      truefalse: [
        {
          statement: "English is the official language of Mauritius.",
          correct: true,
        },
        {
          statement: "Le Morne Brabant was used as a prison.",
          correct: false,
        },
      ],
    },
    3: {
      mcq: [
        {
          question: "In what year did the Dutch first settle in Mauritius?",
          options: ["1605", "1638", "1650", "1660"],
          correct: "1638",
          image: "/dutch-settlement-1638.jpg",
        },
        {
          question: "What is the Aapravasi Ghat?",
          options: ["A mountain peak", "An immigration depot", "A beach resort", "A sugar plantation"],
          correct: "An immigration depot",
          image: "/aapravasi-ghat.jpg",
        },
      ],
      matching: [
        {
          pairs: [
            { left: "1638", right: "Dutch arrival" },
            { left: "Aapravasi Ghat", right: "UNESCO World Heritage" },
            { left: "Slavery", right: "Historical hardship" },
          ],
        },
      ],
      fill: [
        {
          question: "The ______ arrived in Mauritius in 1638.",
          answer: "Dutch",
        },
        {
          question: "Aapravasi Ghat is a UNESCO ______ Site.",
          answer: "World Heritage",
        },
      ],
      reorder: [
        {
          items: ["Dutch era", "French rule", "British rule", "Independence"],
          correctOrder: ["Dutch era", "French rule", "British rule", "Independence"],
        },
      ],
      truefalse: [
        {
          statement: "The Dutch settled Mauritius in 1638.",
          correct: true,
        },
        {
          statement: "Aapravasi Ghat is still an active immigration center.",
          correct: false,
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
          correct: "Indian",
          image: "/indian-ocean.jpg",
        },
        {
          question: "What is the main type of coral reef in Mauritius?",
          options: ["Barrier reef", "Fringing reef", "Atoll", "Platform reef"],
          correct: "Fringing reef",
          image: "/coral-reefs-mauritius.jpg",
        },
      ],
      matching: [
        {
          pairs: [
            { left: "Coral reefs", right: "Marine protection" },
            { left: "Port Louis", right: "Main harbor" },
            { left: "Indian Ocean", right: "Surrounding water" },
          ],
        },
      ],
      fill: [
        {
          question: "Mauritius is located in the ______ Ocean.",
          answer: "Indian",
        },
        {
          question: "The island is surrounded by beautiful ______ reefs.",
          answer: "coral",
        },
      ],
      reorder: [
        {
          items: ["Beaches", "Mountains", "Plateaus", "Lagoons"],
          correctOrder: ["Beaches", "Lagoons", "Plateaus", "Mountains"],
        },
      ],
      truefalse: [
        {
          statement: "Mauritius is in the Indian Ocean.",
          correct: true,
        },
        {
          statement: "Mauritius has no coral reefs.",
          correct: false,
        },
      ],
    },
    2: {
      mcq: [
        {
          question: "What is the Seven Colored Earth?",
          options: ["A painting", "A natural geological formation", "A theme park", "A market"],
          correct: "A natural geological formation",
          image: "/seven-colored-earth-chamarel.jpg",
        },
        {
          question: "Where is the Pamplemousses Garden located?",
          options: ["Curepipe", "Rose Hill", "Pamplemousses", "Vacoas"],
          correct: "Pamplemousses",
          image: "/pamplemousses-botanical-garden.jpg",
        },
      ],
      matching: [
        {
          pairs: [
            { left: "Chamarel", right: "Colored Earth" },
            { left: "Pamplemousses", right: "Botanical garden" },
            { left: "Rodrigues", right: "Nearby island" },
          ],
        },
      ],
      fill: [
        {
          question: "The Seven ______ Earth is in Chamarel.",
          answer: "Colored",
        },
        {
          question: "Pamplemousses is known for its ______ garden.",
          answer: "botanical",
        },
      ],
      reorder: [
        {
          items: ["Level 2 G1", "Level 2 G2", "Level 2 G3", "Level 2 G4"],
          correctOrder: ["Level 2 G1", "Level 2 G2", "Level 2 G3", "Level 2 G4"],
        },
      ],
      truefalse: [
        {
          statement: "The Seven Colored Earth is a natural formation.",
          correct: true,
        },
        {
          statement: "Pamplemousses is famous for its beach.",
          correct: false,
        },
      ],
    },
    3: {
      mcq: [
        {
          question: "What is the highest peak in Mauritius?",
          options: ["Le Morne Brabant", "Piton de la Rivière Noire", "Tourelle de Tamarin", "Montagne du Lion"],
          correct: "Piton de la Rivière Noire",
          image: "/piton-riviere-noire.jpg",
        },
        {
          question: "Which region is known as the Central Plateau?",
          options: ["Curepipe", "Port Louis", "Vacoas", "Beau Bassin"],
          correct: "Curepipe",
          image: "/central-plateau-curepipe.jpg",
        },
      ],
      matching: [
        {
          pairs: [
            { left: "Black River", right: "River name" },
            { left: "Central Plateau", right: "Highland region" },
            { left: "Piton", right: "Mountain peak" },
          ],
        },
      ],
      fill: [
        {
          question: "The ______ Plateau is the highland region of Mauritius.",
          answer: "Central",
        },
        {
          question: "Piton de la Rivière ______ is the highest peak.",
          answer: "Noire",
        },
      ],
      reorder: [
        {
          items: ["Coastal areas", "Plateaus", "Mountain peaks"],
          correctOrder: ["Coastal areas", "Plateaus", "Mountain peaks"],
        },
      ],
      truefalse: [
        {
          statement: "Piton de la Rivière Noire is the highest peak in Mauritius.",
          correct: true,
        },
        {
          statement: "The Central Plateau is below sea level.",
          correct: false,
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
          correct: "Port Louis, Indian Ocean",
        },
        {
          question: "When did Mauritius gain independence and where is it located?",
          options: ["1960, Atlantic Ocean", "1968, Indian Ocean", "1965, Pacific Ocean", "1970, Arctic Ocean"],
          correct: "1968, Indian Ocean",
        },
      ],
      matching: [
        {
          pairs: [
            { left: "Dodo", right: "Extinct bird" },
            { left: "Port Louis", right: "Capital" },
            { left: "Coral reefs", right: "Marine life" },
          ],
        },
      ],
      fill: [
        {
          question: "Mauritius is located in the ______ Ocean and gained independence in ______.",
          answer: "Indian, 1968",
        },
      ],
      reorder: [
        {
          items: ["Settlement", "Independence", "Modern era"],
          correctOrder: ["Settlement", "Independence", "Modern era"],
        },
      ],
      truefalse: [
        {
          statement: "Mauritius is in the Indian Ocean.",
          correct: true,
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
          correct: "Aapravasi Ghat - immigration depot",
        },
        {
          question: "Name one traditional Mauritian cultural element and its origin.",
          options: ["Sega - traditional dance", "Dodo - extinct bird", "Rum - local drink", "Cyclone - weather event"],
          correct: "Sega - traditional dance",
        },
      ],
      matching: [
        {
          pairs: [
            { left: "Sega", right: "Dance" },
            { left: "Le Morne", right: "Mountain" },
            { left: "Sugar", right: "Crop" },
          ],
        },
      ],
      fill: [
        {
          question: "The ______ is a traditional Mauritian ______ and ______ is a UNESCO site.",
          answer: "Sega, dance, Aapravasi Ghat",
        },
      ],
      reorder: [
        {
          items: ["Colonial period", "Cultural development", "Modern Mauritius"],
          correctOrder: ["Colonial period", "Cultural development", "Modern Mauritius"],
        },
      ],
      truefalse: [
        {
          statement: "Sega is a traditional Mauritian dance.",
          correct: true,
        },
      ],
    },
    3: {
      mcq: [
        {
          question: "Which European power first settled Mauritius in 1638?",
          options: ["Portuguese", "Dutch", "French", "British"],
          correct: "Dutch",
        },
        {
          question: "In which year did the French arrive in Mauritius?",
          options: ["1638", "1710", "1715", "1810"],
          correct: "1715",
        },
        {
          question: "When did the British conquer Mauritius?",
          options: ["1800", "1805", "1810", "1815"],
          correct: "1810",
        },
      ],
      matching: [
        {
          pairs: [
            { left: "1638", right: "Dutch settlement" },
            { left: "1715", right: "French arrival" },
            { left: "1810", right: "British conquest" },
          ],
        },
      ],
      fill: [
        {
          question:
            "The ______ settled Mauritius in 1638, the ______ arrived in 1715, and the ______ conquered it in 1810.",
          answer: "Dutch, French, British",
        },
      ],
      reorder: [
        {
          items: ["1810", "1638", "1715"],
          correctOrder: ["1638", "1715", "1810"],
        },
      ],
      truefalse: [
        {
          statement: "The Dutch were the first European settlers in Mauritius.",
          correct: true,
        },
      ],
    },
  },
}

async function populateDatabase() {
  try {
    console.log("Starting database population...")

    // Insert subjects
    const { data: subjectsData, error: subjectsError } = await supabase.from("subjects").insert([
      { name: "History", description: "Learn about the history of Mauritius" },
      { name: "Geography", description: "Learn about the geography of Mauritius" },
      { name: "Combined", description: "Learn both history and geography of Mauritius" },
    ])

    if (subjectsError) console.error("Error inserting subjects:", subjectsError)

    // Insert levels
    const { data: levelsData, error: levelsError } = await supabase.from("levels").insert([
      { level_number: 1, difficulty: "Easy" },
      { level_number: 2, difficulty: "Medium" },
      { level_number: 3, difficulty: "Hard" },
    ])

    if (levelsError) console.error("Error inserting levels:", levelsError)

    // Insert question types
    const { data: typesData, error: typesError } = await supabase.from("question_types").insert([
      { name: "mcq", description: "Multiple Choice Question" },
      { name: "matching", description: "Matching Pairs" },
      { name: "fill", description: "Fill in the Blanks" },
      { name: "reorder", description: "Reorder Items" },
      { name: "truefalse", description: "True or False" },
    ])

    if (typesError) console.error("Error inserting question types:", typesError)

    console.log("Database population completed!")
  } catch (error) {
    console.error("Error during population:", error)
  }
}

populateDatabase()
