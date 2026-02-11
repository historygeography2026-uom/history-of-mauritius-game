"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Volume2, ThumbsUp, ThumbsDown } from "lucide-react"
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
      setTimeout(() => setShowConfetti(false), 3000)
    } else {
      setMascotMood("encouraging")
      setMascotMessage(getRandomMessage("wrong"))
      playWrong()
    }
    
    setTimeout(() => setButtonPressed(null), 300)
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

  const isCorrect = selectedAnswer === question.isTrue

  return (
    <>
      <GameConfetti trigger={showConfetti} type="correct" />
      <Card className="border-4 border-primary/30 bg-card p-4 md:p-5 animate-pop-in relative overflow-visible">
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
        True or False? ✓✗
      </h2>

      {question.image && (
        <div className="mb-2 overflow-hidden rounded-xl border-2 border-primary/20 animate-pop-in">
          <Image
            src={question.image || "/placeholder.svg"}
            alt={question.imageAlt || "Question image"}
            width={400}
            height={200}
            className="w-full h-auto object-cover max-h-[160px]"
          />
        </div>
      )}

      <div className="mb-3 rounded-xl bg-muted p-4">
        <div className="flex items-center gap-2 justify-center">
          <p className="text-center text-lg leading-snug text-card-foreground md:text-xl">{question.statement}</p>
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
            className={`h-24 md:h-28 bg-gradient-to-br from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 text-2xl md:text-3xl font-bold hover:scale-105 transition-all shadow-lg hover:shadow-xl border-4 border-green-300 rounded-2xl flex flex-col items-center justify-center gap-2 ${buttonPressed === "true" ? "animate-button-press scale-95" : ""}`}
          >
            <ThumbsUp className="h-8 w-8 md:h-10 md:w-10" />
            <span>TRUE</span>
          </Button>
          <Button
            onClick={() => handleAnswer(false)}
            className={`h-24 md:h-28 bg-gradient-to-br from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 text-2xl md:text-3xl font-bold hover:scale-105 transition-all shadow-lg hover:shadow-xl border-4 border-red-300 rounded-2xl flex flex-col items-center justify-center gap-2 ${buttonPressed === "false" ? "animate-button-press scale-95" : ""}`}
          >
            <ThumbsDown className="h-8 w-8 md:h-10 md:w-10" />
            <span>FALSE</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`rounded-2xl p-4 text-center ${isCorrect ? "bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400 animate-correct-glow" : "bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400 animate-screen-shake"}`}
          >
            <p className="mb-1 text-2xl md:text-3xl font-bold text-card-foreground animate-bounce-in">
              {isCorrect ? "🎉 Correct!" : "💪 Not quite!"}
            </p>
            <p className="text-base text-card-foreground">{question.explanation}</p>
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90 text-lg py-4 hover:scale-105 transition-all rounded-xl shadow-lg font-bold"
          >
            {isSingleMode ? "Continue →" : currentQuestionIndex < builtInQuestions.length - 1 ? "Next Question →" : "Finish! 🎊"}
          </Button>
        </div>
      )}
    </Card>
    </>
  )
}
