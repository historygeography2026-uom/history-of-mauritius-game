require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');
const fs = require('fs');

// Helper to generate admin session token
function getAdminToken() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("No secret found");
  const payload = {
    username: "MES",
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

const baseUrl = "http://localhost:3000";
const adminCookie = `admin-session=${getAdminToken()}`;

const adminHeaders = {
  "Cookie": adminCookie,
  "Origin": baseUrl,
  "Referer": `${baseUrl}/admin`
};

async function runVerification() {
  console.log("=======================================================================");
  console.log("🔍 COMPREHENSIVE END-TO-END VERIFICATION OF ALL 5 USER REQUIREMENTS");
  console.log("=======================================================================\n");

  let allPassed = true;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. BULK UPLOAD FOR GRADE 4
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("👉 1. Testing Bulk Upload for Grade 4 (/api/admin/practice/import)...");
  try {
    const testImportQuestions = [
      {
        unit: 11,
        type: "mcq",
        question: "AUTOMATED_TEST_BULK_UPLOAD_FINAL: What is a key feature of a map?",
        instruction: "Select the correct option",
        optionA: "Scale",
        optionB: "Pages",
        optionC: "Ink",
        optionD: "Music",
        correctAnswer: "Scale"
      },
      {
        unit: 12,
        type: "truefalse",
        question: "AUTOMATED_TEST_BULK_UPLOAD_FINAL: Pieter Both is a mountain in Mauritius.",
        instruction: "Select True or False",
        isTrue: "True"
      }
    ];

    const formData = new FormData();
    formData.append("questions", JSON.stringify(testImportQuestions));
    formData.append("createdBy", "MES");

    const importRes = await fetch(`${baseUrl}/api/admin/practice/import`, {
      method: "POST",
      headers: adminHeaders,
      body: formData
    });

    const importData = await importRes.json();
    console.log("   HTTP Status:", importRes.status);
    console.log("   Response:", JSON.stringify(importData));

    if (importRes.ok && importData.successCount === 2) {
      console.log("   ✅ Bulk upload for Grade 4 passed! (2 questions imported successfully)\n");
    } else {
      console.error("   ❌ Bulk upload failed:", importData);
      allPassed = false;
    }
  } catch (err) {
    console.error("   ❌ Error during bulk upload test:", err);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. EDIT GRADE 4 QUESTION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("👉 2. Testing Edit Grade 4 Question (/api/admin/practice/questions)...");
  try {
    const listRes = await fetch(`${baseUrl}/api/admin/practice/questions?unit=all`, {
      headers: adminHeaders
    });
    const allQuestions = await listRes.json();
    const g4Question = allQuestions.find(q => q.question_text.includes("AUTOMATED_TEST_BULK_UPLOAD_FINAL") && q.unit_no === 11);

    if (!g4Question) {
      throw new Error("Could not find imported Grade 4 test question");
    }

    const editPayload = {
      id: g4Question.id,
      unit_no: 11,
      question_type: "mcq",
      question_text: "AUTOMATED_TEST_BULK_UPLOAD_EDITED_SUCCESS: What is a primary element of a map?",
      instruction: "Updated instruction for Grade 4",
      image_url: "/api/images/g4-u11-pic1.jpg",
      answer_data: {
        options: [
          { text: "Compass Rose & Scale", is_correct: true },
          { text: "Audio Speaker", is_correct: false },
          { text: "Video Screen", is_correct: false },
          { text: "Batteries", is_correct: false }
        ]
      }
    };

    const putRes = await fetch(`${baseUrl}/api/admin/practice/questions`, {
      method: "PUT",
      headers: {
        ...adminHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(editPayload)
    });

    const putData = await putRes.json();
    console.log("   HTTP Status:", putRes.status);
    console.log("   Updated Question Text:", putData.question_text);
    console.log("   Updated Image URL:", putData.image_url);

    if (putRes.ok && putData.question_text === editPayload.question_text) {
      console.log("   ✅ Edit Grade 4 question passed!\n");
    } else {
      console.error("   ❌ Edit Grade 4 failed:", putData);
      allPassed = false;
    }

    // Clean up temporary test questions
    await fetch(`${baseUrl}/api/admin/practice/questions?id=${g4Question.id}`, {
      method: "DELETE",
      headers: adminHeaders
    });
    const g4Q2 = allQuestions.find(q => q.question_text.includes("AUTOMATED_TEST_BULK_UPLOAD_FINAL") && q.unit_no === 12);
    if (g4Q2) {
      await fetch(`${baseUrl}/api/admin/practice/questions?id=${g4Q2.id}`, {
        method: "DELETE",
        headers: adminHeaders
      });
    }
    console.log("   (Cleaned up temporary test questions)\n");
  } catch (err) {
    console.error("   ❌ Error during edit test:", err);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. UPLOADING IMAGE FOR GRADE 4
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("👉 3. Testing Uploading Image (/api/upload-image)...");
  try {
    const tinyPngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    const imageBlob = new Blob([tinyPngBuffer], { type: "image/png" });
    const imgFormData = new FormData();
    imgFormData.append("file", imageBlob, "test-g4-verify.png");
    imgFormData.append("questionId", "g4verify");

    const uploadRes = await fetch(`${baseUrl}/api/upload-image`, {
      method: "POST",
      headers: adminHeaders,
      body: imgFormData
    });

    const uploadData = await uploadRes.json();
    console.log("   HTTP Status:", uploadRes.status);
    console.log("   Returned URL:", uploadData.url);

    const imgFetchRes = await fetch(`${baseUrl}${uploadData.url}`);
    console.log("   GET image verification HTTP Status:", imgFetchRes.status);

    if (uploadRes.ok && uploadData.url && imgFetchRes.status === 200) {
      console.log("   ✅ Uploading image for Grade 4 passed! (Successfully uploaded and served via /api/images/...)\n");
    } else {
      console.error("   ❌ Image upload verification failed:", uploadData);
      allPassed = false;
    }
  } catch (err) {
    console.error("   ❌ Error during image upload test:", err);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. QUESTIONS POPULATION ON G4 PAGE
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("👉 4. Testing Questions Population on G4 Page...");
  try {
    const g4UnitsRes = await fetch(`${baseUrl}/api/g4/units`);
    const g4Units = await g4UnitsRes.json();
    console.log(`   Step 4a: /api/g4/units returned ${g4Units.length} units.`);

    for (const unit of g4Units) {
      console.log(`     - Unit ${unit.unit_no}: "${unit.unit_name}" (Questions in DB: ${unit.question_count})`);
    }

    if (!Array.isArray(g4Units) || g4Units.length !== 6) {
      throw new Error(`Expected 6 Grade 4 units, got ${g4Units?.length}`);
    }

    console.log("\n   Step 4b: Testing question retrieval via /api/practice/session for all 6 units:");
    for (const unit of g4Units) {
      const sessionRes = await fetch(`${baseUrl}/api/practice/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": baseUrl,
          "Referer": `${baseUrl}/g4`
        },
        body: JSON.stringify({ unit_id: Number(unit.id) })
      });

      const sessionData = await sessionRes.json();
      const qCount = sessionData?.questions?.length || 0;
      const sampleQ = sessionData?.questions?.[0];
      const hasImage = sessionData?.questions?.some(q => q.image_url);

      console.log(`     ▶ Unit ${unit.unit_no} (${unit.unit_name}): Session #${sessionData.session_id} served ${qCount} questions. Sample: "${sampleQ?.question_text.slice(0, 35)}..." [Images present: ${hasImage ? 'Yes' : 'No'}]`);

      if (!sessionRes.ok || qCount === 0) {
        throw new Error(`Failed to populate questions for Unit ${unit.unit_no}`);
      }
    }

    console.log("   ✅ Questions population on /g4 page passed for all 6 Grade 4 units!\n");
  } catch (err) {
    console.error("   ❌ Error during G4 questions population test:", err);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. STATISTICS IN ADMIN FOR GRADE 4
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("👉 5. Testing Statistics in Admin for Grade 4 (/api/admin/practice/stats)...");
  try {
    const overviewRes = await fetch(`${baseUrl}/api/admin/practice/stats?view=overview`, {
      headers: adminHeaders
    });
    const overview = await overviewRes.json();
    console.log("   Overview stats:", {
      total_sessions: overview.total_sessions,
      total_attempts: overview.total_attempts,
      unique_students: overview.unique_students,
      avg_accuracy: overview.avg_accuracy + "%"
    });

    const unitsStatsRes = await fetch(`${baseUrl}/api/admin/practice/stats?view=units`, {
      headers: adminHeaders
    });
    const unitStats = await unitsStatsRes.json();
    console.log(`   Units stats returned ${unitStats.length} units total.`);

    const g4Stats = unitStats.filter(u => u.unit_no >= 11 && u.unit_no <= 16);
    console.log(`   Grade 4 units in admin statistics (${g4Stats.length} found):`);
    g4Stats.forEach(u => {
      console.log(`     - Unit ${u.unit_no} (${u.unit_name}): questions=${u.question_count}, sessions=${u.total_sessions}, attempts=${u.total_attempts}, accuracy=${u.avg_accuracy || 0}%`);
    });

    if (g4Stats.length === 6) {
      console.log("   ✅ Statistics in admin for Grade 4 passed! All 6 Grade 4 units are actively tracked.\n");
    } else {
      console.error("   ❌ Expected 6 Grade 4 units in stats, got", g4Stats.length);
      allPassed = false;
    }
  } catch (err) {
    console.error("   ❌ Error during admin stats test:", err);
    allPassed = false;
  }

  console.log("=======================================================================");
  if (allPassed) {
    console.log("🎉 ALL 5 USER REQUIREMENTS VERIFIED AND WORKING 100%!");
  } else {
    console.log("⚠️ SOME CHECKS FAILED. PLEASE REVIEW LOGS ABOVE.");
  }
  console.log("=======================================================================");
}

runVerification().catch(console.error);
