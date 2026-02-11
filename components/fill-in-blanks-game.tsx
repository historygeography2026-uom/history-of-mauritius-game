"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  sentence: string
  answer: string
  hint: string
  image?: string
  imageAlt?: string
}

const builtInQuestions: Question[] = [
  {
    sentence: "Mauritius is an island in the _____ Ocean.",
    answer: "Indian",
    hint: 'It starts with "I"',
    image: "/placeholder.svg?height=200&width=350",
    imageAlt: "Mauritius location map",
  },
  {
    sentence: "The capital of Mauritius is Port _____.",
    answer: "Louis",
    hint: "A French king's name",
    image: "/placeholder.svg?height=200&width=350",
    imageAlt: "Port Louis",
  },
  {
    sentence: "The _____ bird lived in Mauritius but is now extinct.",
    answer: "Dodo",
    hint: "It could not fly",
    image: "/placeholder.svg?height=200&width=350",
    imageAlt: "Dodo bird",
  },
]

export default function FillInBlanksGame({
  onComplete,
  onBack,
  question: singleQuestion,
}: {
  onComplete: (stars: number) => void
  onBack: () => void
  question?: any
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "sad" | "thinking" | "celebrating" | "encouraging">("idle")
  const [mascotMessage, setMascotMessage] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { playCorrect, playWrong, playClick } = useGameSounds()

  const isSingleMode = !!singleQuestion

  // Reset state when single question changes
  useEffect(() => {
    if (isSingleMode) {
      setShowResult(false)
      setAnswer("")
      setIsSubmitting(false)
      setMascotMood("idle")
      setMascotMessage("")
    }
  }, [singleQuestion, isSingleMode])

  // Build the display sentence with blank
  const getSentence = () => {
    if (isSingleMode) {
      const q = singleQuestion.question || singleQuestion.title || ""
      // Normalize any sequence of 3+ underscores to exactly _____
      const normalized = q.replace(/_{3,}/g, "_____")
      // If it already has _____, use the normalized version
      if (normalized.includes("_____")) return normalized
      // Otherwise, try to replace the answer with blank
      const ans = singleQuestion.answer || ""
      if (ans && q.toLowerCase().includes(ans.toLowerCase())) {
        const idx = q.toLowerCase().indexOf(ans.toLowerCase())
        return q.slice(0, idx) + "_____" + q.slice(idx + ans.length)
      }
      return q + " _____"
    }
    return builtInQuestions[currentQuestionIndex].sentence
  }

  const getCorrectAnswer = () => {
    if (isSingleMode) {
      return singleQuestion.answer || ""
    }
    return builtInQuestions[currentQuestionIndex].answer
  }

  const getHint = () => {
    if (isSingleMode) {
      return singleQuestion.hint || `Think about it!`
    }
    return builtInQuestions[currentQuestionIndex].hint
  }

  const sentence = getSentence()
  const correctAnswer = getCorrectAnswer()
  const hint = getHint()
  const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase()

  const handleSubmit = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    playClick()
    setShowResult(true)
    if (isCorrect) {
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
  }

  const handleNext = () => {
    playClick()
    setMascotMood("idle")
    setMascotMessage("")
    setIsSubmitting(false)
    if (isSingleMode) {
      onComplete(isCorrect ? 1 : 0)
    } else {
      if (currentQuestionIndex < builtInQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setAnswer("")
        setShowResult(false)
      } else {
        onComplete(score + (isCorrect ? 1 : 0))
      }
    }
  }

  const sentenceParts = sentence.split("_____")

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
        Fill in the Blank! ✏️
      </h2>

      {/* Show image for DB questions (single mode) or built-in questions */}
      {isSingleMode && singleQuestion?.image && (
        <div className="mb-2 overflow-hidden rounded-xl border-2 border-primary/20 animate-pop-in">
          <Image
            src={singleQuestion.image}
            alt="Question image"
            width={350}
            height={200}
            className="w-full h-auto object-cover max-h-[160px]"
          />
        </div>
      )}
      {!isSingleMode && builtInQuestions[currentQuestionIndex].image && (
        <div className="mb-2 overflow-hidden rounded-xl border-2 border-primary/20 animate-pop-in">
          <Image
            src={builtInQuestions[currentQuestionIndex].image || "/placeholder.svg"}
            alt={builtInQuestions[currentQuestionIndex].imageAlt || "Question image"}
            width={350}
            height={200}
            className="w-full h-auto object-cover max-h-[160px]"
          />
        </div>
      )}

      <div className="mb-3 rounded-xl bg-muted p-4">
        <div className="flex items-start gap-2">
          <p className="text-lg leading-snug text-card-foreground md:text-xl flex-1">
            {sentenceParts[0]}
            <span className={`mx-2 inline-block min-w-[200px] border-b-4 px-2 font-bold ${
              showResult
                ? isCorrect
                  ? "border-green-500 text-green-600"
                  : "border-red-500 text-red-600"
                : "border-primary text-primary"
            }`}>
              {showResult ? correctAnswer : answer || "?"}
            </span>
            {sentenceParts[1] || ""}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => speakText(sentence.replace("_____", "blank"))}
            className="shrink-0 h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
            title="Listen to question"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {!showResult && (
        <>
          <div className="mb-2 rounded-xl bg-gradient-to-r from-secondary/20 to-primary/20 p-3 border-2 border-secondary/30">
            <p className="text-center text-base text-card-foreground font-semibold">💡 Hint: {hint}</p>
          </div>

          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="mb-3 h-12 border-4 text-lg rounded-xl text-center font-semibold focus:border-primary focus:ring-4 focus:ring-primary/20"
            onKeyDown={(e) => e.key === "Enter" && answer && handleSubmit()}
          />

          <Button
            onClick={handleSubmit}
            disabled={!answer}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 text-lg py-4 hover:scale-105 transition-all rounded-xl shadow-lg font-bold"
          >
            Check Answer ✓
          </Button>
        </>
      )}

      {showResult && (
        <div className="space-y-3">
          <div
            className={`rounded-2xl p-4 text-center ${isCorrect ? "bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400 animate-correct-glow" : "bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400"}`}
          >
            <p className="text-2xl md:text-3xl font-bold text-card-foreground animate-bounce-in mb-1">
              {isCorrect ? "🎉 Correct!" : "💪 Nice try!"}
            </p>
            <p className="text-base text-card-foreground">
              The answer is: <span className="font-bold text-primary text-lg">{correctAnswer}</span>
            </p>
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
