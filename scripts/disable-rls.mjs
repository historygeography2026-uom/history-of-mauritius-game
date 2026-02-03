import pg from "pg";
import fs from "fs";
import path from "path";

// Read .env.local file
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

const postgresUrl = envVars.POSTGRES_URL;

if (!postgresUrl) {
  console.error("❌ Missing POSTGRES_URL in .env.local");
  process.exit(1);
}

// Clean up the connection string - remove supa=base-pooler.x and pgbouncer if present
let cleanUrl = postgresUrl
  .replace("?sslmode=require&supa=base-pooler.x", "")
  .replace("?sslmode=require&pgbouncer=true", "");

console.log("🔧 Disabling RLS on all tables...");
console.log("=========================================\n");

const client = new pg.Client({
  connectionString: cleanUrl,
  ssl: {
    rejectUnauthorized: false,
    ca: undefined,
  },
});

const tables = [
  "subjects",
  "levels",
  "question_types",
  "questions",
  "mcq_options",
  "matching_pairs",
  "fill_answers",
  "reorder_items",
  "truefalse_answers",
  "user_profiles",
  "leaderboard",
];

async function disableRLS() {
  try {
    console.log("🔌 Connecting to database...");
    await client.connect();
    console.log("✅ Connected!\n");

    for (const table of tables) {
      console.log(`⏳ Disabling RLS on ${table}...`);
      try {
        await client.query(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`);
        console.log(`  ✅ ${table}: RLS disabled`);
      } catch (error) {
        if (error.message.includes("does not exist")) {
          console.log(`  ℹ️  ${table}: Table doesn't exist (skipping)`);
        } else {
          console.warn(`  ⚠️  ${table}: ${error.message}`);
        }
      }
    }

    console.log("\n✅ RLS has been disabled on all tables!");
    console.log("📝 Admin panel should now be able to import questions.\n");
  } catch (error) {
    console.error("❌ Connection error:", error.message);
  } finally {
    await client.end();
    console.log("🔌 Disconnected from database.");
  }
}

disableRLS();
