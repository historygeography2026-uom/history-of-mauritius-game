"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Volume2 } from "lucide-react"
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
  const question = isSingleMode
    ? {
        question: singleQuestion.question || singleQuestion.title || "Question",
        options: singleQuestion.options || [],
        correctAnswer: (singleQuestion.correct || 1) - 1, // DB uses 1-indexed
        funFact: "Great job!",
        image: singleQuestion.image,
        imageAlt: singleQuestion.imageAlt,
      }
    : builtInQuestions[currentQuestionIndex]

  const handleAnswer = (index: number) => {
    playClick()
    setSelectedAnswer(index)
    setShowResult(true)

    if (index === question.correctAnswer) {
      setScore(score + 1)
      setMascotMood("happy")
      setMascotMessage(getRandomMessage("correct"))
      setShowConfetti(true)
      playCorrect()
      setTimeout(() => setShowConfetti(false), 3000)
    } else {
      setShakeWrong(true)
      setMascotMood("encouraging")
      setMascotMessage(getRandomMessage("wrong"))
      playWrong()
      setTimeout(() => setShakeWrong(false), 500)
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

  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <>
      <GameConfetti trigger={showConfetti} type="correct" />
      <Card className="border-4 border-primary/30 bg-card p-6 md:p-8 animate-pop-in relative overflow-visible">
        <div className="mb-6 flex items-center justify-between">
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
              <Star className="h-6 w-6 fill-secondary text-secondary animate-wiggle" />
              <span className="text-xl font-bold text-secondary">{score}</span>
            </div>
          </div>
        </div>

      {question.image && (
        <div className="mb-6 overflow-hidden rounded-2xl border-4 border-primary/20 animate-pop-in">
          <Image
            src={question.image || "/placeholder.svg"}
            alt={question.imageAlt || "Question image"}
            width={400}
            height={300}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      <div className="mb-8 flex items-start gap-3">
        <h2 className="text-2xl font-bold leading-relaxed text-card-foreground md:text-3xl animate-bounce-gentle flex-1">
          {question.question}
        </h2>
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

      <div className="space-y-4">
        {(question.options || []).map((option, index) => (
          <Button
            key={index}
            onClick={() => !showResult && handleAnswer(index)}
            disabled={showResult}
            className={`h-auto w-full justify-start p-6 md:p-8 text-left text-xl md:text-2xl transition-all rounded-2xl ${
              showResult
                ? index === question.correctAnswer
                  ? "bg-gradient-to-r from-green-400 to-green-500 text-white border-4 border-green-300 animate-correct-glow shadow-lg"
                  : selectedAnswer === index
                    ? "bg-gradient-to-r from-red-400 to-red-500 text-white border-4 border-red-300 animate-screen-shake"
                    : "bg-muted text-muted-foreground opacity-50"
                : "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 hover:scale-[1.02] shadow-md hover:shadow-lg"
            } ${shakeWrong && selectedAnswer === index ? "animate-shake" : ""}`}
          >
            <span className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </Button>
        ))}
      </div>

      {showResult && (
        <div className="mt-8 space-y-6 animate-pop-in">
          <div
            className={`rounded-3xl p-8 text-center ${isCorrect ? "bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-400" : "bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-orange-400"}`}
          >
            <p className="mb-4 text-4xl md:text-5xl font-bold animate-bounce-in">{isCorrect ? "🎉 Awesome!" : "💪 Good try!"}</p>
            <p className="text-xl text-card-foreground">{question.funFact}</p>
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90 text-2xl py-8 hover:scale-105 transition-all rounded-2xl shadow-lg font-bold"
          >
            {isSingleMode ? "Continue →" : currentQuestionIndex < builtInQuestions.length - 1 ? "Next Question →" : "Finish! 🎊"}
          </Button>
        </div>
      )}
    </Card>
    </>
  )
}
