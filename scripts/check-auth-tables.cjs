const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  for (const table of ['users', 'sessions', 'accounts', 'verification_tokens']) {
    const r = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name=$1 ORDER BY ordinal_position`, [table]
    );
    const count = await pool.query(`SELECT COUNT(*) as c FROM ${table}`);
    console.log(`\n${table.toUpperCase()} (${count.rows[0].c} rows):`);
    r.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default || 'none'}`));
  }

  // Check if demo user exists
  const demo = await pool.query(`SELECT id, email, name, password_hash IS NOT NULL as has_password FROM users WHERE email = 'demo@mauritius-game.com'`);
  console.log('\nDEMO USER:', demo.rows.length > 0 ? demo.rows[0] : 'NOT FOUND');

  // List all users
  const users = await pool.query(`SELECT id, email, name, password_hash IS NOT NULL as has_password FROM users`);
  console.log('\nALL USERS:');
  users.rows.forEach(u => console.log(`  ${u.id}: ${u.email} (${u.name}) has_password=${u.has_password}`));

  // Check active sessions
  const sessions = await pool.query(`SELECT * FROM sessions`);
  console.log(`\nACTIVE SESSIONS: ${sessions.rows.length}`);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
