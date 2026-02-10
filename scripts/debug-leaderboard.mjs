import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com',
  port: 5432,
  database: 'mauriitus_game',
  user: 'mauriitus_game_user',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

try {
  // Check table structure
  const cols = await pool.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leaderboard' ORDER BY ordinal_position`
  );
  console.log('Leaderboard columns:', JSON.stringify(cols.rows, null, 2));

  // Check row count
  const count = await pool.query('SELECT COUNT(*) FROM leaderboard');
  console.log('Row count:', count.rows[0].count);

  // Test the actual query from the API
  const result = await pool.query(`
    SELECT 
      lb.id, lb.player_name, lb.total_points, lb.stars_earned, lb.created_at,
      lb.subject_id, lb.level_id,
      s.name as subject_name,
      l.level_number
    FROM leaderboard lb
    JOIN subjects s ON lb.subject_id = s.id
    JOIN levels l ON lb.level_id = l.id
    ORDER BY lb.total_points DESC
    LIMIT 10
  `);
  console.log('Query result rows:', result.rows.length);
  console.log('Query result:', JSON.stringify(result.rows, null, 2));

  // Check subjects
  const subjects = await pool.query('SELECT id, name FROM subjects');
  console.log('Subjects:', JSON.stringify(subjects.rows, null, 2));

  // Check levels
  const levels = await pool.query('SELECT id, level_number, name FROM levels');
  console.log('Levels:', JSON.stringify(levels.rows, null, 2));

} catch (e) {
  console.error('ERROR:', e.message);
  console.error('Stack:', e.stack);
} finally {
  await pool.end();
}
