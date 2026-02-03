"use client"

import { useEffect, useState } from "react"
import { Flame } from "lucide-react"

interface StreakCounterProps {
  currentStreak: number
  showMultiplier?: boolean
  size?: "sm" | "md" | "lg"
}

export function StreakCounter({ currentStreak, showMultiplier = true, size = "md" }: StreakCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevStreak, setPrevStreak] = useState(currentStreak)

  useEffect(() => {
    if (currentStreak > prevStreak) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
    setPrevStreak(currentStreak)
  }, [currentStreak, prevStreak])

  const getMultiplier = () => {
    if (currentStreak >= 10) return 3.0
    if (currentStreak >= 7) return 2.5
    if (currentStreak >= 5) return 2.0
    if (currentStreak >= 3) return 1.5
    return 1.0
  }

  const getFlameColor = () => {
    if (currentStreak >= 10) return "text-purple-500"
    if (currentStreak >= 7) return "text-blue-500"
    if (currentStreak >= 5) return "text-orange-500"
    if (currentStreak >= 3) return "text-yellow-500"
    return "text-gray-400"
  }

  const getBackgroundGradient = () => {
    if (currentStreak >= 10) return "from-purple-500/20 to-pink-500/20 border-purple-400"
    if (currentStreak >= 7) return "from-blue-500/20 to-cyan-500/20 border-blue-400"
    if (currentStreak >= 5) return "from-orange-500/20 to-red-500/20 border-orange-400"
    if (currentStreak >= 3) return "from-yellow-500/20 to-orange-500/20 border-yellow-400"
    return "from-gray-200 to-gray-300 border-gray-400"
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  if (currentStreak < 2) return null

  return (
    <div
      className={`relative flex items-center gap-2 rounded-full border-2 bg-gradient-to-r ${getBackgroundGradient()} ${sizeClasses[size]} ${
        isAnimating ? "animate-bounce-in" : ""
      }`}
    >
      {/* Flame icon */}
      <div className={`relative ${isAnimating ? "animate-wiggle" : ""}`}>
        <Flame className={`${iconSizes[size]} ${getFlameColor()} fill-current`} />
        {currentStreak >= 5 && (
          <Flame
            className={`${iconSizes[size]} ${getFlameColor()} fill-current absolute inset-0 animate-ping opacity-50`}
          />
        )}
      </div>

      {/* Streak count */}
      <span className={`font-bold ${getFlameColor()}`}>{currentStreak}</span>

      {/* Multiplier */}
      {showMultiplier && currentStreak >= 3 && (
        <div
          className={`ml-1 px-2 py-0.5 rounded-full bg-white/80 font-bold text-xs ${
            isAnimating ? "animate-pulse" : ""
          }`}
        >
          <span className={getFlameColor()}>×{getMultiplier()}</span>
        </div>
      )}

      {/* Fire particles */}
      {currentStreak >= 5 && (
        <div className="absolute -top-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-orange-400 rounded-full animate-float opacity-70"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Streak milestone celebration component
interface StreakMilestoneProps {
  streak: number
  onClose: () => void
}

export function StreakMilestone({ streak, onClose }: StreakMilestoneProps) {
  const getMilestoneData = () => {
    if (streak === 10) {
      return {
        title: "LEGENDARY STREAK!",
        emoji: "👑",
        color: "from-purple-500 to-pink-500",
        message: "10 in a row! You're unstoppable!",
        multiplier: "3×",
      }
    }
    if (streak === 7) {
      return {
        title: "MEGA STREAK!",
        emoji: "💎",
        color: "from-blue-500 to-cyan-500",
        message: "7 correct! Amazing focus!",
        multiplier: "2.5×",
      }
    }
    if (streak === 5) {
      return {
        title: "SUPER STREAK!",
        emoji: "🔥",
        color: "from-orange-500 to-red-500",
        message: "5 in a row! You're on fire!",
        multiplier: "2×",
      }
    }
    return {
      title: "STREAK!",
      emoji: "⚡",
      color: "from-yellow-500 to-orange-500",
      message: "3 correct in a row!",
      multiplier: "1.5×",
    }
  }

  const data = getMilestoneData()

  useEffect(() => {
    const timer = setTimeout(onClose, 1200) // Shorter display time
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className={`bg-gradient-to-br ${data.color} text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce-in`}>
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">{data.emoji}</div>
          <h2 className="text-xl font-black mb-1">{data.title}</h2>
          <p className="text-sm opacity-90">{data.message}</p>
          <div className="mt-2 inline-block bg-white/20 px-3 py-1 rounded-full">
            <span className="font-bold text-lg">{data.multiplier} Points!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
