"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, Lock, CheckCircle, Trophy } from "lucide-react"

interface LevelData {
  id: number
  title: string
  difficulty: string
  icon: string
  isUnlocked: boolean
  isCompleted: boolean
  stars: number
  maxStars: number
}

interface ProgressMapProps {
  subject: string
  subjectColor: string
  subjectIcon: string
  onSelectLevel: (levelId: number) => void
  onBack: () => void
}

export function ProgressMap({ subject, subjectColor, subjectIcon, onSelectLevel, onBack }: ProgressMapProps) {
  const [levels, setLevels] = useState<LevelData[]>([])
  const [totalStars, setTotalStars] = useState(0)

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem(`progress_${subject}`)
    const progress = savedProgress ? JSON.parse(savedProgress) : {}

    const levelData: LevelData[] = [
      {
        id: 1,
        title: "Level 1",
        difficulty: "Easy",
        icon: "🌟",
        isUnlocked: true,
        isCompleted: progress[1]?.completed || false,
        stars: progress[1]?.stars || 0,
        maxStars: 5,
      },
      {
        id: 2,
        title: "Level 2",
        difficulty: "Medium",
        icon: "⭐⭐",
        isUnlocked: progress[1]?.completed || false,
        isCompleted: progress[2]?.completed || false,
        stars: progress[2]?.stars || 0,
        maxStars: 5,
      },
      {
        id: 3,
        title: "Level 3",
        difficulty: "Hard",
        icon: "⭐⭐⭐",
        isUnlocked: progress[2]?.completed || false,
        isCompleted: progress[3]?.completed || false,
        stars: progress[3]?.stars || 0,
        maxStars: 5,
      },
    ]

    setLevels(levelData)
    setTotalStars(levelData.reduce((sum, l) => sum + l.stars, 0))
  }, [subject])

  const getNodePosition = (index: number) => {
    // Create a winding path
    const positions = [
      { x: 20, y: 75 },
      { x: 50, y: 40 },
      { x: 80, y: 75 },
    ]
    return positions[index] || { x: 50, y: 50 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-green-200 p-4 md:p-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-400 to-transparent"></div>
      <div className="absolute bottom-10 left-10 text-4xl">🌴</div>
      <div className="absolute bottom-10 right-10 text-4xl">🌴</div>
      <div className="absolute bottom-5 left-1/4 text-3xl">🌺</div>
      <div className="absolute bottom-5 right-1/4 text-3xl">🌺</div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} className="bg-white/80 hover:bg-white text-primary shadow-lg">
            ← Back
          </Button>
          <div className="flex items-center gap-4 bg-white/90 rounded-full px-6 py-3 shadow-lg">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="text-2xl font-bold text-primary">{totalStars}</span>
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
          </div>
        </div>

        {/* Subject Title */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${subjectColor} text-white px-8 py-4 rounded-full shadow-xl`}>
            <span className="text-4xl">{subjectIcon}</span>
            <h1 className="text-3xl font-bold capitalize">{subject} Adventure</h1>
          </div>
        </div>

        {/* Progress Map */}
        <div className="relative h-[400px] md:h-[500px]">
          {/* Path connecting levels */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Dotted path */}
            <path
              d="M 20 75 Q 35 55 50 40 Q 65 55 80 75"
              fill="none"
              stroke="#8B4513"
              strokeWidth="1.5"
              strokeDasharray="2,2"
              className="opacity-60"
            />
            {/* Solid path for completed sections */}
            {levels[0]?.isCompleted && (
              <path
                d="M 20 75 Q 35 55 50 40"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                className="animate-draw-path"
              />
            )}
            {levels[1]?.isCompleted && (
              <path
                d="M 50 40 Q 65 55 80 75"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                className="animate-draw-path"
              />
            )}
          </svg>

          {/* Level Nodes */}
          {levels.map((level, index) => {
            const pos = getNodePosition(index)
            return (
              <div
                key={level.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
              >
                {/* Level Node */}
                <button
                  onClick={() => level.isUnlocked && onSelectLevel(level.id)}
                  disabled={!level.isUnlocked}
                  className={`relative group transition-all duration-300 ${
                    level.isUnlocked ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"
                  }`}
                >
                  {/* Node Circle */}
                  <div
                    className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center shadow-xl border-4 transition-all ${
                      level.isCompleted
                        ? "bg-gradient-to-br from-green-400 to-green-600 border-green-300"
                        : level.isUnlocked
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300"
                        : "bg-gradient-to-br from-gray-400 to-gray-600 border-gray-300"
                    }`}
                  >
                    {level.isCompleted ? (
                      <CheckCircle className="h-10 w-10 text-white mb-1" />
                    ) : level.isUnlocked ? (
                      <span className="text-4xl">{level.icon}</span>
                    ) : (
                      <Lock className="h-10 w-10 text-white/70" />
                    )}
                    <span className="text-white font-bold text-sm">{level.title}</span>
                  </div>

                  {/* Unlock requirement for locked levels */}
                  {!level.isUnlocked && (
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap border border-red-300">
                      🔒 Complete Level {level.id - 1} first
                    </div>
                  )}

                  {/* Stars display */}
                  {level.isUnlocked && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {[...Array(level.maxStars)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < level.stars
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-300 text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Difficulty badge */}
                  <div
                    className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                      level.difficulty === "Easy"
                        ? "bg-green-500 text-white"
                        : level.difficulty === "Medium"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {level.difficulty}
                  </div>

                  {/* Hover tooltip */}
                  {level.isUnlocked && (
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg px-4 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <p className="font-bold text-primary">Click to Play!</p>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
                    </div>
                  )}
                </button>

                {/* Decorative elements around nodes */}
                {level.isCompleted && (
                  <>
                    <div className="absolute -top-2 -right-2 text-2xl">🏆</div>
                    <div className="absolute -bottom-2 -left-2 text-xl">✨</div>
                  </>
                )}
              </div>
            )
          })}

          {/* Treasure chest at the end */}
          <div
            className="absolute transform -translate-x-1/2"
            style={{ left: "90%", top: "60%" }}
          >
            <div className={`text-5xl ${levels.every(l => l.isCompleted) ? "" : "grayscale opacity-50"}`}>
              🎁
            </div>
            {levels.every(l => l.isCompleted) && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                Claim!
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-16 flex-wrap">
          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
            <span className="text-sm font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600"></div>
            <span className="text-sm font-medium">Locked</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to save progress
export function saveProgress(subject: string, level: number, stars: number, completed: boolean) {
  const key = `progress_${subject}`
  const existing = localStorage.getItem(key)
  const progress = existing ? JSON.parse(existing) : {}
  
  progress[level] = {
    stars: Math.max(progress[level]?.stars || 0, stars),
    completed: progress[level]?.completed || completed,
  }
  
  localStorage.setItem(key, JSON.stringify(progress))
}
