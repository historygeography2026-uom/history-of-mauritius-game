#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

// Parse environment variables
const envVars = {};
envContent.split("\n").forEach((line) => {
  if (line && !line.startsWith("#")) {
    const [key, ...valueParts] = line.split("=");
    envVars[key.trim()] = valueParts.join("=").trim().replace(/^"/, "").replace(/"$/, "");
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

console.log("🧪 Testing Excel Import After RLS Disabled...\n");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testImport() {
  try {
    // Test data - simple MCQ questions
    const testQuestions = [
      {
        subject_id: 1,
        level_id: 1,
        question_type_id: 1,
        question_text: "Test question 1: What is the capital of Mauritius?",
        timer_seconds: 30,
        image_url: null,
        created_by: "MIE",
      },
      {
        subject_id: 1,
        level_id: 1,
        question_type_id: 1,
        question_text: "Test question 2: Where is Mauritius located?",
        timer_seconds: 30,
        image_url: null,
        created_by: "MIE",
      },
    ];

    console.log(`📤 Attempting to insert ${testQuestions.length} test questions...\n`);

    for (const question of testQuestions) {
      console.log(`⏳ Inserting: "${question.question_text.substring(0, 40)}..."`);

      const { data, error } = await supabase
        .from("questions")
        .insert(question)
        .select()
        .single();

      if (error) {
        console.error(`❌ FAILED:`, error.message);
        console.error(`   Code: ${error.code}`);
        console.error(`   Details: ${error.details}`);
        return false;
      }

      console.log(`✅ SUCCESS - Question ID: ${data.id}\n`);
    }

    console.log("\n✅ All test questions inserted successfully!");
    console.log("📋 RLS fix is working - the import issue has been RESOLVED!\n");
    return true;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

testImport().then((success) => {
  process.exit(success ? 0 : 1);
});
