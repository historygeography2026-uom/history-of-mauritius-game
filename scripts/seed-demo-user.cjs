const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const hash = await bcrypt.hash('demo123456', 10);
  
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    ['demo@mauritius-game.com']
  );
  
  if (existing.rows.length > 0) {
    console.log('Demo user already exists with ID:', existing.rows[0].id);
  } else {
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash, email_verified, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW(), NOW()) RETURNING id, email, name',
      ['demo@mauritius-game.com', 'Demo Player', hash]
    );
    console.log('Demo user created:', result.rows[0]);
  }

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
