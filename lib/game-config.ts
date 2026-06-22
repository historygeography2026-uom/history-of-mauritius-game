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
   * Level difficulty multipliers.
   * Higher levels award more points per star to reward progression.
   */
  LEVEL_MULTIPLIERS: {
    1: 1.0,   // Easy: base points
    2: 1.5,   // Medium: 50% bonus
    3: 2.0,   // Hard: double points
  } as Record<number, number>,

  /**
   * Time bonus — maximum extra percentage awarded for fast completion.
   * Scales linearly with the fraction of time remaining.
   * E.g. 50 means up to 50% extra points if finished with all time left.
   */
  TIME_BONUS_MAX_PERCENT: 50,
}
