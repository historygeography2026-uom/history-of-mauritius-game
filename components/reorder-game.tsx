"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, GripVertical, Volume2 } from "lucide-react"
import Image from "next/image"
import { DodoMascot, getRandomMessage } from "@/components/dodo-mascot"
import { GameConfetti } from "@/components/game-confetti"
import { useGameSounds, isGameMuted } from "@/hooks/use-game-sounds"

// Text-to-speech function
const speakText = (text: string) => {
  if (isGameMuted()) return
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.lang = "en-US"
    window.speechSynthesis.speak(utterance)
  }
}

interface TimelineEvent {
  year: string
  event: string
}

const builtInCorrectOrder: TimelineEvent[] = [
  { year: "1598", event: "Dutch arrive in Mauritius" },
  { year: "1715", event: "French take control" },
  { year: "1810", event: "British rule begins" },
  { year: "1968", event: "Mauritius becomes independent" },
]

export default function ReorderGame({
  onComplete,
  onBack,
  question,
}: {
  onComplete: (stars: number) => void
  onBack: () => void
  question?: any
}) {
  const [items, setItems] = useState<TimelineEvent[]>([])
  const [correctOrder, setCorrectOrder] = useState<TimelineEvent[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "sad" | "thinking" | "celebrating" | "encouraging">("idle")
  const [mascotMessage, setMascotMessage] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const { playCorrect, playWrong, playClick } = useGameSounds()
  const pendingTimeoutsRef = useRef<number[]>([])

  const isSingleMode = !!question

  useEffect(() => {
    if (isSingleMode && question.items && Array.isArray(question.items)) {
      // Build correct order from DB (correct is now an array of text strings in proper order)
      const correctTexts: string[] = Array.isArray(question.correct) ? question.correct : question.items
      const dbCorrect = correctTexts.map((txt: string) => ({
        year: "",
        event: txt || "",
      }))
      // Build shuffled items for display (without revealing order numbers)
      const dbItems = question.items.map((txt: string) => ({
        year: "",
        event: txt || "",
      }))
      setCorrectOrder(dbCorrect)
      setItems([...dbItems].sort(() => Math.random() - 0.5))
      setShowResult(false)
      setMascotMood("idle")
      setMascotMessage("")
    } else {
      setCorrectOrder(builtInCorrectOrder)
      setItems([...builtInCorrectOrder].sort(() => Math.random() - 0.5))
    }
  }, [question, isSingleMode])

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)

    setItems(newItems)
    setDraggedIndex(index)
  }

  const handleCheckOrder = () => {
    playClick()
    setShowResult(true)
    const isOrderCorrect = items.every((item, index) => item.event === correctOrder[index]?.event)
    if (isOrderCorrect) {
      setMascotMood("celebrating")
      setMascotMessage(getRandomMessage("levelComplete"))
      setShowConfetti(true)
      playCorrect()
      const confettiTimer = window.setTimeout(() => setShowConfetti(false), 3000)
      pendingTimeoutsRef.current.push(confettiTimer)
      // Don't auto-advance — let the user click Continue
    } else {
      setMascotMood("encouraging")
      setMascotMessage(getRandomMessage("wrong"))
      playWrong()
    }
  }

  const handleTryAgain = () => {
    playClick()
    setShowResult(false)
    setMascotMood("idle")
    setMascotMessage("")
  }

  useEffect(() => {
    return () => {
      try {
        pendingTimeoutsRef.current.forEach((t) => clearTimeout(t))
      } catch (e) {
        // ignore
      }
      pendingTimeoutsRef.current = []
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const isCorrect = items.every((item, index) => item.event === correctOrder[index]?.event)

  return (
    <>
      <GameConfetti trigger={showConfetti} type="levelComplete" />
      <Card className="border-4 border-primary/30 bg-card p-3 md:p-4 relative overflow-visible">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-card-foreground md:text-2xl">
              Timeline Challenge! 📅
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakText("Timeline Challenge! Drag and drop to put these events in the correct order from oldest to newest!")}
              className="shrink-0 h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
              title="Listen to instructions"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            {/* Mascot */}
            <DodoMascot 
              mood={mascotMood} 
              size="sm" 
              showSpeechBubble={!!mascotMessage}
              speechText={mascotMessage}
            />
            <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full">
              <Star className="h-6 w-6 fill-secondary text-secondary" />
            </div>
          </div>
        </div>

        <p className="mb-3 text-base text-muted-foreground font-semibold">
          👆 {question?.instruction || "Drag and drop to put these events in the correct order!"}
        </p>

        {/* Show question title if provided from DB */}
        {question?.question && (
          <div className="mb-3 flex items-start gap-2">
            <h3 className="text-lg font-bold leading-snug text-card-foreground md:text-xl flex-1">
              {question.question}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakText(question.question)}
              className="shrink-0 h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
              title="Listen to question"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        )}

      {/* Show question image if provided from DB */}
      {question?.image && (
        <div className="mb-2 overflow-hidden rounded-xl border-2 border-primary/20 bg-white flex items-center justify-center">
          <Image
            src={question.image}
            alt="Question image"
            width={1200}
            height={800}
            className="w-full h-auto object-contain max-h-[250px] sm:max-h-[300px] md:max-h-[400px]"
            quality={100}
            unoptimized
            priority
          />
        </div>
      )}

      <div className="mb-2 space-y-1.5">
        {items.map((item, index) => (
          <div
            key={`${item.event}-${index}`}
            draggable={!showResult}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            className={`flex cursor-move items-center gap-3 rounded-xl border-2 p-2.5 md:p-3 transition-all ${
              showResult && isCorrect
                ? "border-green-400 bg-gradient-to-r from-green-100 to-green-200"
                : showResult && !isCorrect
                  ? "border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50"
                  : "border-primary/30 bg-gradient-to-r from-blue-50 to-purple-50 hover:border-primary"
            }`}
          >
            {!showResult && <GripVertical className="h-6 w-6 text-muted-foreground" />}
            {showResult && isCorrect && <span className="text-xl">✓</span>}
            <div className="flex-1">
              {item.year && <p className="text-lg font-bold text-primary">{item.year}</p>}
              <p className="text-base text-card-foreground break-words">{item.event || "Event"}</p>
            </div>
          </div>
        ))}
      </div>

      {!showResult ? (
        <Button
          onClick={handleCheckOrder}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 text-lg py-3 rounded-xl shadow-lg font-bold"
        >
          Check My Order! ✓
        </Button>
      ) : (
        <div className="space-y-3">
          <div className={`rounded-2xl p-3 text-center ${isCorrect ? "bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400" : "bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400"}`}>
            <p className="text-2xl md:text-3xl font-bold text-card-foreground">
              {isCorrect ? "🎉 Perfect Timeline!" : "💪 Not quite right!"}
            </p>
            {!isCorrect && (
              <p className="mt-1 text-base text-card-foreground">Rearrange and check again!</p>
            )}
          </div>

          {isCorrect ? (
            <Button
              onClick={() => onComplete(1)}
              className="w-full bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90 text-lg py-3 rounded-xl shadow-lg font-bold"
            >
              Continue →
            </Button>
          ) : (
            <Button
              onClick={() => setShowResult(false)}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 text-lg py-3 rounded-xl shadow-lg font-bold"
            >
              Check My Order! ✓
            </Button>
          )}
        </div>
      )}
    </Card>
    </>
  )
}
