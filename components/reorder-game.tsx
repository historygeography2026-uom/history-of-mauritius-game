"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, GripVertical, Volume2 } from "lucide-react"
import Image from "next/image"
import { DodoMascot, getRandomMessage } from "@/components/dodo-mascot"
import { GameConfetti } from "@/components/game-confetti"
import { useGameSounds } from "@/hooks/use-game-sounds"

// Text-to-speech function
const speakText = (text: string) => {
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

  const isSingleMode = !!question

  useEffect(() => {
    if (isSingleMode && question.items && Array.isArray(question.items)) {
      // Build items from DB question
      const dbItems = question.items.map((txt: string, i: number) => ({
        year: String(i + 1),
        event: txt || "",
      }))
      // Build correct order from DB
      const dbCorrect = (question.correct || question.items).map((txt: string, i: number) => ({
        year: String(i + 1),
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
      setTimeout(() => onComplete(1), 1500)
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

  const isCorrect = items.every((item, index) => item.event === correctOrder[index]?.event)

  return (
    <>
      <GameConfetti trigger={showConfetti} type="levelComplete" />
      <Card className="border-4 border-primary/30 bg-card p-4 md:p-5 animate-pop-in relative overflow-visible">
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
          👆 Drag and drop to put these events in the correct order!
        </p>

      {/* Show question image if provided from DB */}
      {question?.image && (
        <div className="mb-2 overflow-hidden rounded-xl border-2 border-primary/20 animate-pop-in">
          <Image
            src={question.image}
            alt="Question image"
            width={400}
            height={200}
            className="w-full h-auto object-cover max-h-[120px]"
          />
        </div>
      )}

      <div className="mb-3 space-y-2">
        {items.map((item, index) => (
          <div
            key={`${item.event}-${index}`}
            draggable={!showResult}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            className={`flex cursor-move items-center gap-3 rounded-xl border-2 p-3 md:p-4 transition-all ${
              showResult && item.event === correctOrder[index]?.event
                ? "border-green-400 bg-gradient-to-r from-green-100 to-green-200 animate-correct-glow"
                : showResult
                  ? "border-red-400 bg-gradient-to-r from-red-100 to-red-200 animate-screen-shake"
                  : "border-primary/30 bg-gradient-to-r from-blue-50 to-purple-50 hover:border-primary hover:scale-[1.02] hover:shadow-lg"
            }`}
          >
            <GripVertical className="h-6 w-6 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-lg font-bold text-primary">{item.year || ""}</p>
              <p className="text-base text-card-foreground">{item.event || "Event"}</p>
            </div>
            {showResult && (
              <span className="text-2xl">{item.event === correctOrder[index]?.event ? "✓" : "✗"}</span>
            )}
          </div>
        ))}
      </div>

      {!showResult ? (
        <Button
          onClick={handleCheckOrder}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 text-lg py-4 hover:scale-105 transition-all rounded-xl shadow-lg font-bold"
        >
          Check My Order! ✓
        </Button>
      ) : (
        <div className="space-y-3">
          <div className={`rounded-2xl p-4 text-center ${isCorrect ? "bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400" : "bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400"}`}>
            <p className="text-2xl md:text-3xl font-bold text-card-foreground animate-bounce-in">
              {isCorrect ? "🎉 Perfect Timeline!" : "💪 Try again!"}
            </p>
            {!isCorrect && (
              <p className="mt-1 text-base text-card-foreground">Look at the order carefully and try reordering!</p>
            )}
          </div>

          {!isCorrect && (
            <Button
              onClick={handleTryAgain}
              className="w-full bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90 text-lg py-4 hover:scale-105 transition-all rounded-xl shadow-lg font-bold"
            >
              Try Again! 🔄
            </Button>
          )}
        </div>
      )}
    </Card>
    </>
  )
}
