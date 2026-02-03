import fetch from "node-fetch";
import fs from "fs";

// Test data
const testQuestions = [
  {
    subject: "Mauritius Geography",
    level: 1,
    type: "mcq",
    question: "What is the capital of Mauritius?",
    optionA: "Port Louis",
    optionB: "Curepipe",
    optionC: "Vacoas",
    optionD: "Beau Bassin",
    correctAnswer: "A",
    timer: 30,
    imageFileName: null,
  },
  {
    subject: "Mauritius Geography",
    level: 2,
    type: "mcq",
    question: "Mauritius is located in which ocean?",
    optionA: "Atlantic Ocean",
    optionB: "Indian Ocean",
    optionC: "Pacific Ocean",
    optionD: "Arctic Ocean",
    correctAnswer: "B",
    timer: 30,
    imageFileName: null,
  },
];

async function testImport() {
  console.log("🧪 Testing Excel Import API...\n");

  try {
    const formData = new FormData();
    formData.append("questions", JSON.stringify(testQuestions));
    formData.append("createdBy", "MIE");

    console.log("📤 Sending test questions to import API...");
    const response = await fetch("http://localhost:3001/api/import-excel", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`❌ API returned status ${response.status}`);
      const error = await response.text();
      console.error("Error response:", error);
      process.exit(1);
    }

    const result = await response.json();
    console.log("✅ Import successful!\n");
    console.log("Result:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log(`\n✅ ${result.importedCount} questions imported successfully!`);
    } else if (result.errors && result.errors.length > 0) {
      console.log(`\n❌ Import had errors:`);
      result.errors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testImport();
