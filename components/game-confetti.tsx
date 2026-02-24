"use client"

import { useCallback, useEffect, useState } from "react"
import ReactConfetti from "react-confetti"

interface GameConfettiProps {
  trigger: boolean
  type?: "correct" | "levelComplete" | "achievement"
  duration?: number
}

export function GameConfetti({ trigger, type = "correct", duration = 3000 }: GameConfettiProps) {
  const [isActive, setIsActive] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [recycle, setRecycle] = useState(true)

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      setRecycle(true)

      // Stop recycling confetti after a short time
      const recycleTimer = setTimeout(() => {
        setRecycle(false)
      }, duration / 2)

      // Hide confetti component after full duration
      const hideTimer = setTimeout(() => {
        setIsActive(false)
      }, duration)

      return () => {
        clearTimeout(recycleTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [trigger, duration])

  if (!isActive) return null

  const confettiConfig = {
    correct: {
      numberOfPieces: 100,
      colors: ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#45B7D1"],
      gravity: 0.3,
      initialVelocityY: 20,
    },
    levelComplete: {
      numberOfPieces: 300,
      colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"],
      gravity: 0.2,
      initialVelocityY: 30,
    },
    achievement: {
      numberOfPieces: 200,
      colors: ["#FFD700", "#FFC107", "#FF9800", "#FF5722"],
      gravity: 0.25,
      initialVelocityY: 25,
    },
  }

  const config = confettiConfig[type]

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={config.numberOfPieces}
      colors={config.colors}
      gravity={config.gravity}
      initialVelocityY={config.initialVelocityY}
      recycle={recycle}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none" }}
    />
  )
}

// Star burst effect component
export function StarBurst({ trigger, x = 50, y = 50 }: { trigger: boolean; x?: number; y?: number }) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      const timer = setTimeout(() => setIsActive(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  if (!isActive) return null

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute text-3xl"
          style={{
            transform: `rotate(${i * 45}deg) translateY(-30px)`,
            animationDelay: `${i * 0.05}s`,
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  )
}
