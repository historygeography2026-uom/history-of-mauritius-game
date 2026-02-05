import { config } from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { Pool } from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, "../.env.local") })

// Use external database URL for local connections
const databaseUrl = process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL

if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL or DATABASE_URL_EXTERNAL not set")
  process.exit(1)
}

console.log("Connecting to database...")

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

async function createQuestionsSchema() {
  try {
    console.log("Creating questions schema in PostgreSQL...")

    // Create subjects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log("✓ subjects table created")

    // Create levels table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS levels (
        id SERIAL PRIMARY KEY,
        level_number INT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log("✓ levels table created")

    // Create question_types table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log("✓ question_types table created")

    // Create questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        subject_id INT NOT NULL,
        level_id INT NOT NULL,
        question_type_id INT NOT NULL,
        question_text TEXT NOT NULL,
        image_url VARCHAR(500),
        timer_seconds INT DEFAULT 30,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
        FOREIGN KEY (question_type_id) REFERENCES question_types(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ questions table created")

    // Create mcq_options table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mcq_options (
        id SERIAL PRIMARY KEY,
        question_id INT NOT NULL,
        option_order INT NOT NULL,
        option_text VARCHAR(500) NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        UNIQUE(question_id, option_order)
      )
    `)
    console.log("✓ mcq_options table created")

    // Create matching_pairs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matching_pairs (
        id SERIAL PRIMARY KEY,
        question_id INT NOT NULL,
        pair_order INT NOT NULL,
        left_item VARCHAR(500) NOT NULL,
        right_item VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        UNIQUE(question_id, pair_order)
      )
    `)
    console.log("✓ matching_pairs table created")

    // Create fill_answers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fill_answers (
        id SERIAL PRIMARY KEY,
        question_id INT NOT NULL,
        answer_text VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ fill_answers table created")

    // Create reorder_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reorder_items (
        id SERIAL PRIMARY KEY,
        question_id INT NOT NULL,
        item_order INT NOT NULL,
        item_text VARCHAR(500) NOT NULL,
        correct_position INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        UNIQUE(question_id, item_order)
      )
    `)
    console.log("✓ reorder_items table created")

    // Create truefalse_answers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS truefalse_answers (
        id SERIAL PRIMARY KEY,
        question_id INT NOT NULL,
        correct_answer BOOLEAN NOT NULL,
        explanation VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ truefalse_answers table created")

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_subject_level 
      ON questions(subject_id, level_id)
    `)
    console.log("✓ Index on questions(subject_id, level_id) created")

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_type 
      ON questions(question_type_id)
    `)
    console.log("✓ Index on questions(question_type_id) created")

    // Insert default subjects if they don't exist
    const subjectsCheck = await pool.query(
      "SELECT COUNT(*) as count FROM subjects"
    )
    if (subjectsCheck.rows[0].count === 0) {
      await pool.query(
        "INSERT INTO subjects (name) VALUES ('history'), ('geography'), ('combined')"
      )
      console.log("✓ Default subjects inserted")
    }

    // Insert default levels if they don't exist
    const levelsCheck = await pool.query(
      "SELECT COUNT(*) as count FROM levels"
    )
    if (levelsCheck.rows[0].count === 0) {
      await pool.query(
        "INSERT INTO levels (level_number) VALUES (1), (2), (3)"
      )
      console.log("✓ Default levels inserted")
    }

    // Insert default question types if they don't exist
    const typesCheck = await pool.query(
      "SELECT COUNT(*) as count FROM question_types"
    )
    if (typesCheck.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO question_types (name) VALUES 
        ('mcq'), ('matching'), ('fill'), ('reorder'), ('truefalse')
      `)
      console.log("✓ Default question types inserted")
    }

    console.log("✨ Questions schema created successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Error creating schema:", error)
    process.exit(1)
  }
}

// Run the migration
createQuestionsSchema()
