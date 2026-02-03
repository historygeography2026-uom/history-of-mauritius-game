"use client"

import { Achievement, RARITY_COLORS, RARITY_BORDER } from "@/hooks/use-achievements"
import { Lock } from "lucide-react"

interface AchievementBadgeProps {
  achievement: Achievement
  size?: "sm" | "md" | "lg"
  showProgress?: boolean
  onClick?: () => void
}

export function AchievementBadge({
  achievement,
  size = "md",
  showProgress = true,
  onClick,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const iconSizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl",
  }

  const progressPercent = Math.min(
    (achievement.currentProgress / achievement.requirement) * 100,
    100
  )

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 hover:scale-110 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {/* Badge circle */}
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-4 ${
          achievement.isUnlocked
            ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} ${RARITY_BORDER[achievement.rarity]} shadow-lg`
            : "bg-gray-300 border-gray-400 grayscale"
        }`}
      >
        {achievement.isUnlocked ? (
          <span className={`${iconSizes[size]} drop-shadow-md`}>{achievement.icon}</span>
        ) : (
          <Lock className={`${size === "sm" ? "h-6 w-6" : size === "md" ? "h-8 w-8" : "h-10 w-10"} text-gray-500`} />
        )}
      </div>

      {/* Progress ring for locked achievements */}
      {!achievement.isUnlocked && showProgress && (
        <svg
          className={`absolute inset-0 ${sizeClasses[size]} -rotate-90`}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeDasharray={`${progressPercent * 2.89} 289`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
      )}

      {/* Rarity indicator */}
      {achievement.isUnlocked && (
        <div
          className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold text-white capitalize ${
            achievement.rarity === "legendary"
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse"
              : achievement.rarity === "epic"
              ? "bg-purple-500"
              : achievement.rarity === "rare"
              ? "bg-blue-500"
              : "bg-gray-500"
          }`}
        >
          {achievement.rarity}
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-lg px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 w-48 text-center pointer-events-none">
        <p className="font-bold text-sm">{achievement.title}</p>
        <p className="text-xs text-gray-300">{achievement.description}</p>
        {!achievement.isUnlocked && (
          <p className="text-xs text-blue-400 mt-1">
            {achievement.currentProgress}/{achievement.requirement}
          </p>
        )}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900 rotate-45"></div>
      </div>

      {/* Unlock animation sparkles */}
      {achievement.isUnlocked && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 text-yellow-400 animate-ping">✨</div>
          <div className="absolute bottom-0 right-0 text-yellow-400 animate-ping" style={{ animationDelay: "0.5s" }}>✨</div>
        </div>
      )}
    </div>
  )
}

// Achievement unlock notification
interface AchievementUnlockNotificationProps {
  achievement: Achievement
  onClose: () => void
}

export function AchievementUnlockNotification({
  achievement,
  onClose,
}: AchievementUnlockNotificationProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-4 animate-bounce-in">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Achievement Unlocked!
          </p>
          <div className="text-6xl my-4 animate-bounce">{achievement.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900">{achievement.title}</h2>
          <p className="text-gray-600 mt-2">{achievement.description}</p>
        </div>

        {/* Rarity badge */}
        <div className="flex justify-center mb-6">
          <span
            className={`px-4 py-2 rounded-full text-white font-bold capitalize bg-gradient-to-r ${
              RARITY_COLORS[achievement.rarity]
            }`}
          >
            {achievement.rarity} Achievement
          </span>
        </div>

        {/* Confetti decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][i % 5],
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity"
        >
          Awesome! 🎉
        </button>
      </div>
    </div>
  )
}

// Achievements gallery component
interface AchievementsGalleryProps {
  achievements: Achievement[]
  onClose: () => void
}

export function AchievementsGallery({ achievements, onClose }: AchievementsGalleryProps) {
  const categories = ["progress", "performance", "streak", "special"] as const
  const categoryLabels = {
    progress: "Progress 📈",
    performance: "Performance 🏆",
    streak: "Streaks 🔥",
    special: "Special ⭐",
  }

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-pop-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Achievements</h2>
              <p className="text-white/80">
                {unlockedCount} of {achievements.length} unlocked
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-3xl hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {categories.map((category) => {
            const categoryAchievements = achievements.filter(
              (a) => a.category === category
            )
            return (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {categoryLabels[category]}
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {categoryAchievements.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="md"
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
