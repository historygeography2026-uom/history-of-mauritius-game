"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Volume2 } from "lucide-react"
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

interface Question {
  statement: string
  isTrue: boolean
  explanation: string
  image?: string
  imageAlt?: string
}

const builtInQuestions: Question[] = [
  {
    statement: "Mauritius is in Africa.",
    isTrue: false,
    explanation: "Mauritius is an island nation in the Indian Ocean, east of Africa!",
    image: "/map-showing-mauritius-island-in-indian-ocean-separ.jpg",
    imageAlt: "Map of Mauritius location",
  },
  {
    statement: "The Dodo bird lived in Mauritius.",
    isTrue: true,
    explanation: "Yes! The Dodo was a unique bird that only lived in Mauritius!",
    image: "/dodo-bird-illustration-mauritius-extinct-flightles.jpg",
    imageAlt: "Dodo bird",
  },
  {
    statement: "Mauritius became independent in 1968.",
    isTrue: true,
    explanation: "Correct! Mauritius gained independence on March 12, 1968!",
    image: "/mauritius-flag-colorful-red-blue-yellow-green-inde.jpg",
    imageAlt: "Mauritius flag",
  },
]

export default function TrueFalseGame({
  onComplete,
  onBack,
  question: singleQuestion,
}: {
  onComplete: (stars: number) => void
  onBack: () => void
  question?: any
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "sad" | "thinking" | "celebrating" | "encouraging">("idle")
  const [mascotMessage, setMascotMessage] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [buttonPressed, setButtonPressed] = useState<"true" | "false" | null>(null)
  const { playCorrect, playWrong, playClick } = useGameSounds()
  const pendingTimeoutsRef = useRef<number[]>([])

  const isSingleMode = !!singleQuestion

  // Reset state when single question changes
  useEffect(() => {
    if (isSingleMode) {
      setShowResult(false)
      setSelectedAnswer(null)
      setMascotMood("idle")
      setMascotMessage("")
    }
  }, [singleQuestion, isSingleMode])

  const question = isSingleMode
    ? {
        statement: singleQuestion.question || singleQuestion.title || "True or False?",
        isTrue: singleQuestion.correct === true || singleQuestion.correct === "true",
        explanation: "That's the answer!",
        image: singleQuestion.image,
        imageAlt: singleQuestion.imageAlt,
      }
    : builtInQuestions[currentQuestionIndex]

  const handleAnswer = (answer: boolean) => {
    playClick()
    setButtonPressed(answer ? "true" : "false")
    setSelectedAnswer(answer)
    setShowResult(true)

    if (answer === question.isTrue) {
      setScore(score + 1)
      setMascotMood("happy")
      setMascotMessage(getRandomMessage("correct"))
      setShowConfetti(true)
      playCorrect()
      const confettiTimer = window.setTimeout(() => setShowConfetti(false), 3000)
      pendingTimeoutsRef.current.push(confettiTimer)
    } else {
      setMascotMood("encouraging")
      setMascotMessage(getRandomMessage("wrong"))
      playWrong()
    }
    
    const btnTimer = window.setTimeout(() => setButtonPressed(null), 300)
    pendingTimeoutsRef.current.push(btnTimer)
  }

  const handleNext = () => {
    playClick()
    setMascotMood("idle")
    setMascotMessage("")
    if (isSingleMode) {
      onComplete(selectedAnswer === question.isTrue ? 1 : 0)
    } else {
      if (currentQuestionIndex < builtInQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        onComplete(score + (selectedAnswer === question.isTrue ? 1 : 0))
      }
    }
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

  const isCorrect = selectedAnswer === question.isTrue

  return (
    <>
      <GameConfetti trigger={showConfetti} type="correct" />
      <Card className="border-4 border-primary/30 bg-card p-3 md:p-4 relative overflow-visible">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-lg font-bold text-muted-foreground">
          {isSingleMode ? "Question" : `Question ${currentQuestionIndex + 1} of ${builtInQuestions.length}`}
        </span>
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
            <span className="text-xl font-bold text-secondary">{score}</span>
          </div>
        </div>
      </div>

      <h2 className="mb-2 text-xl font-bold text-card-foreground md:text-2xl">
        True or False? 👍👎
      </h2>

      {question.image && (
        <div className="mb-2 overflow-hidden rounded-xl border-2 border-primary/20 bg-white flex items-center justify-center">
          <Image
            src={question.image || "/placeholder.svg"}
            alt={question.imageAlt || "Question image"}
            width={1200}
            height={800}
            className="w-full h-auto object-contain max-h-[400px]"
            quality={100}
            unoptimized
            priority
          />
        </div>
      )}

      <div className="mb-2 rounded-xl bg-muted p-3">
        <div className="flex items-center gap-2 justify-center">
          <p className="text-center text-lg leading-snug text-card-foreground md:text-xl break-words">{question.statement}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => speakText(question.statement)}
            className="shrink-0 h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
            title="Listen to question"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {!showResult ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Button
            onClick={() => handleAnswer(true)}
            className={`h-16 md:h-20 bg-gradient-to-br from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 text-xl md:text-2xl font-bold hover:scale-105 transition-all shadow-lg hover:shadow-xl border-4 border-green-300 rounded-2xl flex flex-col items-center justify-center gap-1 ${buttonPressed === "true" ? "animate-button-press scale-95" : ""}`}
          >
            <span className="text-3xl md:text-4xl" role="img" aria-label="thumbs up">👍</span>
            <span>TRUE</span>
          </Button>
          <Button
            onClick={() => handleAnswer(false)}
            className={`h-16 md:h-20 bg-gradient-to-br from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 text-xl md:text-2xl font-bold hover:scale-105 transition-all shadow-lg hover:shadow-xl border-4 border-red-300 rounded-2xl flex flex-col items-center justify-center gap-1 ${buttonPressed === "false" ? "animate-button-press scale-95" : ""}`}
          >
            <span className="text-3xl md:text-4xl" role="img" aria-label="thumbs down">👎</span>
            <span>FALSE</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`rounded-2xl p-4 text-center ${isCorrect ? "bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400" : "bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400"}`}
          >
            <p className="mb-1 text-2xl md:text-3xl font-bold text-card-foreground">
              {isCorrect ? "🎉 Correct!" : "💪 Not quite!"}
            </p>
            <p className="text-base text-card-foreground">{question.explanation}</p>
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90 text-lg py-3 hover:scale-105 transition-all rounded-xl shadow-lg font-bold"
          >
            {isSingleMode ? "Continue →" : currentQuestionIndex < builtInQuestions.length - 1 ? "Next Question →" : "Finish! 🎊"}
          </Button>
        </div>
      )}
    </Card>
    </>
  )
}
