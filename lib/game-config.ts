/**
 * Game Configuration
 * 
 * This file contains configurable settings for the game.
 * Modify these values to adjust game behavior without changing code logic.
 */

export const GAME_CONFIG = {
  /**
   * Number of questions to display per level per subject.
   * The game will randomly select this many questions from the question bank.
   * If the bank has fewer questions, all available questions will be used.
   */
  QUESTIONS_PER_LEVEL: 20,

  /**
   * Default timer duration (in seconds) per question.
   * Used when a question doesn't have a custom timer set.
   */
  DEFAULT_QUESTION_TIMER: 30,

  /**
   * Points awarded per star earned.
   */
  POINTS_PER_STAR: 100,

  /**
   * Demo/Guest account credentials for quick login.
   * This account should be pre-created in Supabase.
   */
  DEMO_ACCOUNT: {
    EMAIL: "demo@mauritius-game.com",
    PASSWORD: "demo123456",
  },
}
