"use client"

import { useEffect, useState, useRef } from "react"

type MascotMood = "idle" | "happy" | "sad" | "thinking" | "celebrating" | "encouraging"

interface DodoMascotProps {
  mood?: MascotMood
  size?: "sm" | "md" | "lg"
  className?: string
  showSpeechBubble?: boolean
  speechText?: string
}

export function DodoMascot({
  mood = "idle",
  size = "md",
  className = "",
  showSpeechBubble = false,
  speechText = "",
}: DodoMascotProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const pendingTimeoutsRef = useRef<number[]>([])

  useEffect(() => {
    if (mood === "happy" || mood === "celebrating") {
      setIsAnimating(true)
      const timer = window.setTimeout(() => setIsAnimating(false), 2000)
      pendingTimeoutsRef.current.push(timer)
      return () => {
        try {
          pendingTimeoutsRef.current.forEach((t) => clearTimeout(t))
        } catch (e) {
          // ignore
        }
        pendingTimeoutsRef.current = []
      }
    }
  }, [mood])

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const moodAnimations = {
    idle: "animate-bounce-gentle",
    happy: "animate-wiggle",
    sad: "animate-pulse",
    thinking: "animate-float",
    celebrating: "animate-bounce",
    encouraging: "animate-pulse",
  }

  const getMoodEmoji = () => {
    switch (mood) {
      case "happy":
        return "😄"
      case "sad":
        return "😢"
      case "celebrating":
        return "🎉"
      case "thinking":
        return "🤔"
      case "encouraging":
        return "💪"
      default:
        return ""
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Speech Bubble */}
      {showSpeechBubble && speechText && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-primary/30 z-10 min-w-max">
          <p className="text-sm font-bold text-primary">{speechText}</p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-primary/30 rotate-45" />
        </div>
      )}

      {/* Dodo Bird SVG */}
      <div className={`${sizeClasses[size]} ${moodAnimations[mood]} relative`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Body */}
          <ellipse
            cx="60"
            cy="70"
            rx="35"
            ry="40"
            fill="#8B7355"
            className={mood === "celebrating" ? "animate-pulse" : ""}
          />
          
          {/* Belly */}
          <ellipse cx="60" cy="75" rx="25" ry="28" fill="#D4C4A8" />

          {/* Wings */}
          <ellipse
            cx="30"
            cy="65"
            rx="12"
            ry="20"
            fill="#6B5344"
            className={isAnimating ? "animate-wing-flap origin-right" : ""}
            style={{ transformOrigin: "right center" }}
          />
          <ellipse
            cx="90"
            cy="65"
            rx="12"
            ry="20"
            fill="#6B5344"
            className={isAnimating ? "animate-wing-flap origin-left" : ""}
            style={{ transformOrigin: "left center", animationDelay: "0.1s" }}
          />

          {/* Head */}
          <circle cx="60" cy="30" r="22" fill="#9B8B7B" />

          {/* Face (cream colored) */}
          <circle cx="60" cy="32" r="16" fill="#E8DDD0" />

          {/* Eyes */}
          <g className={mood === "happy" || mood === "celebrating" ? "" : ""}>
            {mood === "happy" || mood === "celebrating" ? (
              <>
                {/* Happy eyes (curved) */}
                <path
                  d="M48 28 Q52 24 56 28"
                  stroke="#333"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M64 28 Q68 24 72 28"
                  stroke="#333"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : mood === "sad" ? (
              <>
                {/* Sad eyes */}
                <circle cx="52" cy="28" r="4" fill="#333" />
                <circle cx="68" cy="28" r="4" fill="#333" />
                <circle cx="53" cy="27" r="1.5" fill="white" />
                <circle cx="69" cy="27" r="1.5" fill="white" />
                {/* Tears */}
                <ellipse cx="52" cy="36" rx="2" ry="3" fill="#87CEEB" className="animate-pulse" />
              </>
            ) : (
              <>
                {/* Normal eyes */}
                <circle cx="52" cy="28" r="5" fill="#333" />
                <circle cx="68" cy="28" r="5" fill="#333" />
                <circle cx="53" cy="26" r="2" fill="white" />
                <circle cx="69" cy="26" r="2" fill="white" />
              </>
            )}
          </g>

          {/* Beak */}
          <path
            d="M60 38 L45 48 Q60 55 75 48 Z"
            fill="#F4A460"
            stroke="#D2691E"
            strokeWidth="1"
          />
          <path d="M60 38 L60 48" stroke="#D2691E" strokeWidth="1" />

          {/* Beak hook */}
          <path
            d="M60 48 Q65 52 60 56 Q55 52 60 48"
            fill="#E8B87D"
            stroke="#D2691E"
            strokeWidth="1"
          />

          {/* Cheeks (blush) */}
          {(mood === "happy" || mood === "celebrating") && (
            <>
              <circle cx="42" cy="35" r="4" fill="#FFB6C1" opacity="0.6" />
              <circle cx="78" cy="35" r="4" fill="#FFB6C1" opacity="0.6" />
            </>
          )}

          {/* Feet */}
          <ellipse cx="50" cy="108" rx="8" ry="4" fill="#F4A460" />
          <ellipse cx="70" cy="108" rx="8" ry="4" fill="#F4A460" />
          <path d="M42 108 L46 108 M50 108 L54 108 M58 108 L50 108" stroke="#D2691E" strokeWidth="1" />
          <path d="M62 108 L66 108 M70 108 L74 108 M78 108 L70 108" stroke="#D2691E" strokeWidth="1" />

          {/* Tail feathers */}
          <ellipse cx="60" cy="100" rx="15" ry="8" fill="#4A4035" />
          <ellipse cx="55" cy="102" rx="5" ry="10" fill="#5A5045" transform="rotate(-15 55 102)" />
          <ellipse cx="65" cy="102" rx="5" ry="10" fill="#5A5045" transform="rotate(15 65 102)" />
        </svg>

        {/* Mood indicator */}
        {getMoodEmoji() && (
          <div className="absolute -top-2 -right-2 text-2xl">
            {getMoodEmoji()}
          </div>
        )}

        {/* Celebration particles */}
        {mood === "celebrating" && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][i],
                  left: `${20 + i * 15}%`,
                  top: "50%",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Mood messages for the mascot
export const DODO_MESSAGES = {
  welcome: ["Let's learn about Mauritius! 🌴", "Ready for an adventure? 🎮", "Hello, explorer! 👋"],
  correct: ["Amazing job! 🌟", "You're so smart! 🧠", "Fantastic! 🎉", "Brilliant! ✨", "Woohoo! 🙌"],
  wrong: ["Don't give up! 💪", "Try again, you can do it! 🌈", "Almost there! 🎯", "Keep going! 🚀"],
  thinking: ["Hmm, think carefully... 🤔", "Take your time! ⏳", "You've got this! 💫"],
  levelComplete: ["You're a Mauritius expert! 🏆", "Incredible work! 🌟", "Champion! 🥇"],
  timeWarning: ["Hurry up! ⏰", "Quick, quick! 🏃", "Time is running out! ⚡"],
}

export function getRandomMessage(type: keyof typeof DODO_MESSAGES): string {
  const messages = DODO_MESSAGES[type]
  return messages[Math.floor(Math.random() * messages.length)]
}
