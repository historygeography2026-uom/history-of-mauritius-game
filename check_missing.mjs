import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

const missingPractice = db.prepare("SELECT count(*) as count FROM practice_questions WHERE unit_no IS NULL OR question_text IS NULL OR question_text = ''").get();
const missingGame = db.prepare("SELECT count(*) as count FROM questions WHERE unit_no IS NULL OR question_text IS NULL OR question_text = ''").get();

console.log("Practice Questions missing critical data:", missingPractice.count);
console.log("Game Questions missing critical data:", missingGame.count);
