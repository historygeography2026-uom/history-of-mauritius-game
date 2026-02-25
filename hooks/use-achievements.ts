"use client"

import { useCallback, useEffect, useState } from "react"

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "progress" | "performance" | "special" | "streak"
  requirement: number
  currentProgress: number
  isUnlocked: boolean
  unlockedAt?: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface AchievementData {
  achievements: Achievement[]
  totalPoints: number
  unlockedCount: number
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "currentProgress" | "isUnlocked" | "unlockedAt">[] = [
  // Progress achievements
  {
    id: "first_question",
    title: "First Steps",
    description: "Answer your first question",
    icon: "👶",
    category: "progress",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "ten_questions",
    title: "Getting Started",
    description: "Answer 10 questions",
    icon: "🚶",
    category: "progress",
    requirement: 10,
    rarity: "common",
  },
  {
    id: "fifty_questions",
    title: "Knowledge Seeker",
    description: "Answer 50 questions",
    icon: "🎓",
    category: "progress",
    requirement: 50,
    rarity: "rare",
  },
  {
    id: "hundred_questions",
    title: "Mauritius Scholar",
    description: "Answer 100 questions",
    icon: "📚",
    category: "progress",
    requirement: 100,
    rarity: "epic",
  },
  {
    id: "first_level",
    title: "Level Up!",
    description: "Complete your first level",
    icon: "🎮",
    category: "progress",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "all_levels_history",
    title: "History Master",
    description: "Complete all History levels",
    icon: "📜",
    category: "progress",
    requirement: 3,
    rarity: "epic",
  },
  {
    id: "all_levels_geography",
    title: "Geography Expert",
    description: "Complete all Geography levels",
    icon: "🗺️",
    category: "progress",
    requirement: 3,
    rarity: "epic",
  },
  // Performance achievements
  {
    id: "perfect_level",
    title: "Perfect Score",
    description: "Complete a level with all stars",
    icon: "⭐",
    category: "performance",
    requirement: 1,
    rarity: "rare",
  },
  {
    id: "three_perfect",
    title: "Star Collector",
    description: "Get 3 perfect level scores",
    icon: "🌟",
    category: "performance",
    requirement: 3,
    rarity: "epic",
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Complete a level with 50% time remaining",
    icon: "⚡",
    category: "performance",
    requirement: 1,
    rarity: "rare",
  },
  {
    id: "ten_stars",
    title: "Rising Star",
    description: "Earn 10 stars total",
    icon: "✨",
    category: "performance",
    requirement: 10,
    rarity: "common",
  },
  {
    id: "fifty_stars",
    title: "Star Champion",
    description: "Earn 50 stars total",
    icon: "🏆",
    category: "performance",
    requirement: 50,
    rarity: "epic",
  },
  // Special achievements
  {
    id: "dodo_friend",
    title: "Dodo's Friend",
    description: "Play 5 games",
    icon: "🦤",
    category: "special",
    requirement: 5,
    rarity: "common",
  },
  {
    id: "island_explorer",
    title: "Island Explorer",
    description: "Try all question types",
    icon: "🏝️",
    category: "special",
    requirement: 5,
    rarity: "rare",
  },
  {
    id: "daily_player",
    title: "Dedicated Learner",
    description: "Play 3 days in a row",
    icon: "📅",
    category: "special",
    requirement: 3,
    rarity: "rare",
  },
  {
    id: "mauritius_expert",
    title: "Mauritius Expert",
    description: "Unlock all other achievements",
    icon: "👑",
    category: "special",
    requirement: 17,
    rarity: "legendary",
  },
]

const STORAGE_KEY = "mauritius_game_achievements"
const STATS_KEY = "mauritius_game_stats"

interface GameStats {
  questionsAnswered: number
  levelsCompleted: number
  totalStars: number
  perfectLevels: number
  speedLevels: number
  gamesPlayed: number
  questionTypesPlayed: string[]
  lastPlayDate: string
  consecutiveDays: number
  historyLevelsCompleted: number
  geographyLevelsCompleted: number
}

const DEFAULT_STATS: GameStats = {
  questionsAnswered: 0,
  levelsCompleted: 0,
  totalStars: 0,
  perfectLevels: 0,
  speedLevels: 0,
  gamesPlayed: 0,
  questionTypesPlayed: [],
  lastPlayDate: "",
  consecutiveDays: 0,
  historyLevelsCompleted: 0,
  geographyLevelsCompleted: 0,
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS)
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedStats = localStorage.getItem(STATS_KEY)
    const loadedStats: GameStats = savedStats ? JSON.parse(savedStats) : DEFAULT_STATS
    setStats(loadedStats)

    const savedAchievements = localStorage.getItem(STORAGE_KEY)
    const unlockedMap: Record<string, { unlockedAt: string }> = savedAchievements
      ? JSON.parse(savedAchievements)
      : {}

    const processedAchievements = ACHIEVEMENT_DEFINITIONS.map((def) => {
      const progress = getProgressForAchievement(def.id, loadedStats)
      const isUnlocked = unlockedMap[def.id] !== undefined
      return {
        ...def,
        currentProgress: progress,
        isUnlocked,
        unlockedAt: unlockedMap[def.id]?.unlockedAt,
      }
    })

    setAchievements(processedAchievements)
  }, [])

  const getProgressForAchievement = (id: string, currentStats: GameStats): number => {
    switch (id) {
      case "first_question":
      case "ten_questions":
      case "fifty_questions":
      case "hundred_questions":
        return currentStats.questionsAnswered
      case "first_level":
        return currentStats.levelsCompleted
      case "all_levels_history":
        return currentStats.historyLevelsCompleted
      case "all_levels_geography":
        return currentStats.geographyLevelsCompleted
      case "perfect_level":
      case "three_perfect":
        return currentStats.perfectLevels
      case "speed_demon":
        return currentStats.speedLevels
      case "ten_stars":
      case "fifty_stars":
        return currentStats.totalStars
      case "dodo_friend":
        return currentStats.gamesPlayed
      case "island_explorer":
        return currentStats.questionTypesPlayed.length
      case "daily_player":
        return currentStats.consecutiveDays
      case "mauritius_expert":
        return achievements.filter((a) => a.isUnlocked && a.id !== "mauritius_expert").length
      default:
        return 0
    }
  }

  const saveStats = useCallback((newStats: GameStats) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats))
  }, [])

  const saveAchievements = useCallback((unlocked: Record<string, { unlockedAt: string }>) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
  }, [])

  const checkAndUnlockAchievements = useCallback(
    (newStats: GameStats) => {
      const savedAchievements = localStorage.getItem(STORAGE_KEY)
      const unlockedMap: Record<string, { unlockedAt: string }> = savedAchievements
        ? JSON.parse(savedAchievements)
        : {}

      const newUnlocks: Achievement[] = []

      const updatedAchievements = ACHIEVEMENT_DEFINITIONS.map((def) => {
        const progress = getProgressForAchievement(def.id, newStats)
        const wasUnlocked = unlockedMap[def.id] !== undefined
        const shouldUnlock = progress >= def.requirement && !wasUnlocked

        if (shouldUnlock) {
          unlockedMap[def.id] = { unlockedAt: new Date().toISOString() }
          const newAchievement: Achievement = {
            ...def,
            currentProgress: progress,
            isUnlocked: true,
            unlockedAt: unlockedMap[def.id].unlockedAt,
          }
          newUnlocks.push(newAchievement)
        }

        return {
          ...def,
          currentProgress: progress,
          isUnlocked: unlockedMap[def.id] !== undefined,
          unlockedAt: unlockedMap[def.id]?.unlockedAt,
        }
      })

      if (newUnlocks.length > 0) {
        saveAchievements(unlockedMap)
        setNewlyUnlocked(newUnlocks)
      }

      setAchievements(updatedAchievements)
      return newUnlocks
    },
    [saveAchievements]
  )

  const recordQuestionAnswered = useCallback(
    (isCorrect: boolean, questionType: string) => {
      setStats((prev) => {
        const newStats = {
          ...prev,
          questionsAnswered: prev.questionsAnswered + 1,
          questionTypesPlayed: prev.questionTypesPlayed.includes(questionType)
            ? prev.questionTypesPlayed
            : [...prev.questionTypesPlayed, questionType],
        }
        saveStats(newStats)
        checkAndUnlockAchievements(newStats)
        return newStats
      })
    },
    [saveStats, checkAndUnlockAchievements]
  )

  const recordLevelCompleted = useCallback(
    (subject: string, stars: number, maxStars: number, timeRemainingPercent: number) => {
      setStats((prev) => {
        const isPerfect = stars === maxStars
        const isSpeedRun = timeRemainingPercent >= 50

        const newStats = {
          ...prev,
          levelsCompleted: prev.levelsCompleted + 1,
          totalStars: prev.totalStars + stars,
          perfectLevels: isPerfect ? prev.perfectLevels + 1 : prev.perfectLevels,
          speedLevels: isSpeedRun ? prev.speedLevels + 1 : prev.speedLevels,
          historyLevelsCompleted:
            subject === "history"
              ? prev.historyLevelsCompleted + 1
              : prev.historyLevelsCompleted,
          geographyLevelsCompleted:
            subject === "geography"
              ? prev.geographyLevelsCompleted + 1
              : prev.geographyLevelsCompleted,
        }
        saveStats(newStats)
        checkAndUnlockAchievements(newStats)
        return newStats
      })
    },
    [saveStats, checkAndUnlockAchievements]
  )

  const recordGameStarted = useCallback(() => {
    setStats((prev) => {
      const today = new Date().toDateString()
      const lastPlay = prev.lastPlayDate
      const isConsecutive =
        lastPlay &&
        new Date(today).getTime() - new Date(lastPlay).getTime() === 86400000

      const newStats = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        lastPlayDate: today,
        consecutiveDays: isConsecutive ? prev.consecutiveDays + 1 : 1,
      }
      saveStats(newStats)
      checkAndUnlockAchievements(newStats)
      return newStats
    })
  }, [saveStats, checkAndUnlockAchievements])

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([])
  }, [])

  const getStats = useCallback(() => stats, [stats])

  return {
    achievements,
    stats,
    newlyUnlocked,
    recordQuestionAnswered,
    recordLevelCompleted,
    recordGameStarted,
    clearNewlyUnlocked,
    getStats,
  }
}

// Achievement rarity colors
export const RARITY_COLORS = {
  common: "from-gray-400 to-gray-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-500",
}

export const RARITY_BORDER = {
  common: "border-gray-400",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-yellow-500",
}
