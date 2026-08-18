import { db } from './lib/db.js';

async function check() {
  const leaderboardCount = db.prepare("SELECT count(*) as count FROM leaderboard").get();
  console.log("Leaderboard rows:", leaderboardCount.count);
  
  const userProgressCount = db.prepare("SELECT count(*) as count FROM user_progress").get();
  console.log("User progress rows:", userProgressCount.count);
}
check();
