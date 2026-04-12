"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Volume2 } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { DodoMascot, getRandomMessage } from "@/components/dodo-mascot"
const GameConfetti = dynamic(() => import("@/components/game-confetti").then(m => ({ default: m.GameConfetti })), { ssr: false })
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
  question: string
  options: string[]
  correctAnswer: number
  funFact: string
  image?: string
  imageAlt?: string
}

const builtInQuestions: Question[] = [
  {
    question: "What is the capital city of Mauritius?",
    options: ["Port Louis", "Curepipe", "Vacoas", "Rose Hill"],
    correctAnswer: 0,
    funFact: "Port Louis is named after King Louis XV of France!",
    image: "/aerial-view-of-port-louis-mauritius-capital-city-w.jpg",
    imageAlt: "Port Louis city view",
  },
  {
    question: "Which famous extinct bird lived in Mauritius?",
    options: ["Parrot", "Dodo", "Eagle", "Penguin"],
    correctAnswer: 1,
    funFact: "The Dodo bird could not fly and was very friendly!",
    image: "/illustration-of-dodo-bird-extinct-mauritius-friend.jpg",
    imageAlt: "Dodo bird illustration",
  },
  {
    question: "What ocean surrounds Mauritius?",
    options: ["Atlantic Ocean", "Pacific Ocean", "Indian Ocean", "Arctic Ocean"],
    correctAnswer: 2,
    funFact: "Mauritius is a beautiful island in the Indian Ocean!",
    image: "/map-showing-mauritius-island-location-in-indian-oc.jpg",
    imageAlt: "Map of Mauritius location",
  },
]

export default function MultipleChoiceGame({
  onComplete,
  onBack,
  question: singleQuestion,
}: {
  onComplete: (stars: number) => void
  onBack: () => void
  question?: any
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [shakeWrong, setShakeWrong] = useState(false)
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "sad" | "thinking" | "celebrating" | "encouraging">("idle")
  const [mascotMessage, setMascotMessage] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const { playCorrect, playWrong, playClick } = useGameSounds()

  const pendingTimeoutsRef = useRef<number[]>([])

  const isSingleMode = !!singleQuestion

  // Reset state when single question changes
  useEffect(() => {
    if (isSingleMode) {
      setShowResult(false)
      setSelectedAnswer(null)
      setShakeWrong(false)
      setMascotMood("idle")
      setMascotMessage("")
    }
  }, [singleQuestion, isSingleMode])
  const question = useMemo(() => {
    if (!isSingleMode) return builtInQuestions[currentQuestionIndex]
    
    const originalOptions: string[] = singleQuestion.options || []
    const originalCorrectIndex = (singleQuestion.correct || 1) - 1 // DB uses 1-indexed
    const correctOptionText = originalOptions[originalCorrectIndex]
    
    // Fisher-Yates shuffle on a copy
    const shuffled = [...originalOptions]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return {
      question: singleQuestion.question || singleQuestion.title || "Question",
      options: shuffled,
      correctAnswer: shuffled.indexOf(correctOptionText),
      funFact: "Great job!",
      image: singleQuestion.image,
      imageAlt: singleQuestion.imageAlt,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSingleMode, singleQuestion, currentQuestionIndex])

  const handleAnswer = (index: number) => {
    if (showResult) return // Prevent double-click
    playClick()
    setSelectedAnswer(index)
    setShowResult(true)

    if (index === question.correctAnswer) {
      setScore(score + 1)
      setMascotMood("happy")
      setMascotMessage(getRandomMessage("correct"))
      setShowConfetti(true)
      playCorrect()
      const confettiTimer = window.setTimeout(() => setShowConfetti(false), 3000)
      pendingTimeoutsRef.current.push(confettiTimer)
    } else {
      setShakeWrong(true)
      setMascotMood("encouraging")
      setMascotMessage(getRandomMessage("wrong"))
      playWrong()
      const shakeTimer = window.setTimeout(() => setShakeWrong(false), 500)
      pendingTimeoutsRef.current.push(shakeTimer)
    }
  }

  const handleNext = () => {
    playClick()
    setMascotMood("idle")
    setMascotMessage("")
    if (isSingleMode) {
      onComplete(selectedAnswer === question.correctAnswer ? 1 : 0)
    } else {
      if (currentQuestionIndex < builtInQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        onComplete(score + (selectedAnswer === question.correctAnswer ? 1 : 0))
      }
    }
  }

  // Clear any pending timeouts and cancel speech on unmount
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

  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <>
      <GameConfetti trigger={showConfetti} type="correct" />
      <Card className="border-4 border-primary/30 bg-card p-2 md:p-3 relative overflow-visible">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-bold text-muted-foreground">
            {isSingleMode ? "Question" : `Question ${currentQuestionIndex + 1} of ${builtInQuestions.length}`}
          </span>
          <div className="flex items-center gap-3">
            {/* Mascot */}
            <DodoMascot 
              mood={mascotMood} 
              size="sm" 
              showSpeechBubble={!!mascotMessage}
              speechText={mascotMessage}
            />
            <div className="flex items-center gap-1.5 bg-secondary/20 px-3 py-1 rounded-full">
              <Star className="h-5 w-5 fill-secondary text-secondary" />
              <span className="text-lg font-bold text-secondary">{score}</span>
            </div>
          </div>
        </div>

      {question.image && (
        <div className="mb-1 overflow-hidden rounded-lg border-2 border-primary/20 bg-white flex items-center justify-center">
          <Image
            src={question.image || "/placeholder.svg"}
            alt={question.imageAlt || "Question image"}
            width={1200}
            height={800}
            className="w-full h-auto object-contain max-h-[15vh] sm:max-h-[18vh] md:max-h-[20vh]"
            quality={100}
            unoptimized
            priority
          />
        </div>
      )}

      <div className="mb-1.5 flex items-start gap-2">
        <h2 className="text-base font-bold leading-snug text-card-foreground md:text-lg flex-1">
          {question.question}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => speakText(question.question)}
          className="shrink-0 h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
          title="Listen to question"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {(question.options || []).map((option, index) => (
          <Button
            key={index}
            onClick={() => !showResult && handleAnswer(index)}
            disabled={showResult}
            className={`h-auto w-full justify-start p-2 text-left text-sm transition-all rounded-xl ${
              showResult
                ? index === question.correctAnswer
                  ? "bg-gradient-to-r from-green-400 to-green-500 text-white border-4 border-green-300 shadow-lg"
                  : selectedAnswer === index
                    ? "bg-gradient-to-r from-red-400 to-red-500 text-white border-4 border-red-300"
                    : "bg-muted text-muted-foreground opacity-50"
                : "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-md"
            }`}
          >
            <span className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-base font-bold">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="break-words whitespace-normal text-left flex-1 leading-tight">{option}</span>
          </Button>
        ))}
      </div>

      {showResult && (
        <div className="mt-1.5 space-y-1.5">
          <div
            className={`rounded-xl p-2 text-center ${isCorrect ? "bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400" : "bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400"}`}
          >
            <p className="mb-0.5 text-lg font-bold">{isCorrect ? "🎉 Awesome!" : "💪 Good try!"}</p>
            <p className="text-xs text-card-foreground">{question.funFact}</p>
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90 text-base py-2 rounded-xl shadow-lg font-bold"
          >
            {isSingleMode ? "Continue →" : currentQuestionIndex < builtInQuestions.length - 1 ? "Next Question →" : "Finish! 🎊"}
          </Button>
        </div>
      )}
    </Card>
    </>
  )
}
