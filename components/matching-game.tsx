"use client"

import { useState, useEffect } from "react"
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

interface MatchPair {
  left: string
  right: string
  leftImage?: string
  rightImage?: string
}

const builtInPairs: MatchPair[] = [
  {
    left: "Dodo Bird",
    right: "Extinct animal",
    leftImage: "/dodo-bird-illustration-mauritius-extinct.jpg",
  },
  {
    left: "Port Louis",
    right: "Capital city",
    leftImage: "/port-louis-waterfront-mauritius-capital.jpg",
  },
  {
    left: "Sugar Cane",
    right: "Important crop",
    leftImage: "/sugar-cane-field-mauritius-plantation-green.jpg",
  },
  {
    left: "Le Morne",
    right: "UNESCO mountain",
    leftImage: "/le-morne-brabant-mountain-mauritius-unesco.jpg",
  },
]

export default function MatchingGame({
  onComplete,
  onBack,
  question,
}: {
  onComplete: (stars: number) => void
  onBack: () => void
  question?: any
}) {
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([])
  const [rightItems, setRightItems] = useState<string[]>([])
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [selectedRight, setSelectedRight] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [matchedRight, setMatchedRight] = useState<Set<number>>(new Set())
  const [score, setScore] = useState(0)
  const [wrongMatch, setWrongMatch] = useState(false)
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false })
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "sad" | "thinking" | "celebrating" | "encouraging">("idle")
  const [mascotMessage, setMascotMessage] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const { playCorrect, playWrong, playClick } = useGameSounds()

  useEffect(() => {
    const pairsToUse = question?.pairs && Array.isArray(question.pairs) ? question.pairs : builtInPairs
    setMatchPairs(pairsToUse)
    setRightItems([...pairsToUse.map((p: MatchPair) => p.right || "")].sort(() => Math.random() - 0.5))
    setMatched(new Set())
    setMatchedRight(new Set())
    setFeedback({ show: false, correct: false })
    setSelectedLeft(null)
    setSelectedRight(null)
  }, [question])

  const handleLeftClick = (index: number) => {
    if (matched.has(index)) return
    playClick()
    setSelectedLeft(index)
    setFeedback({ show: false, correct: false })
  }

  const handleRightClick = (index: number) => {
    if (selectedLeft === null) return
    if (matchedRight.has(index)) return
    playClick()
    setSelectedRight(index)

    const leftValue = matchPairs[selectedLeft]?.left
    const rightValue = rightItems[index]
    const correctPair = matchPairs.find((p: MatchPair) => p.left === leftValue && p.right === rightValue)

    if (correctPair) {
      const newMatched = new Set(matched)
      newMatched.add(selectedLeft)
      setMatched(newMatched)
      const newMatchedRight = new Set(matchedRight)
      newMatchedRight.add(index)
      setMatchedRight(newMatchedRight)
      setScore(score + 1)
      setFeedback({ show: true, correct: true })
      setMascotMood("happy")
      setMascotMessage(getRandomMessage("correct"))
      setShowConfetti(true)
      playCorrect()
      setTimeout(() => setShowConfetti(false), 2000)

      if (newMatched.size === matchPairs.length) {
        setMascotMood("celebrating")
        setMascotMessage(getRandomMessage("levelComplete"))
        setShowComplete(true) // Show Continue button instead of auto-advancing
      }
    } else {
      setFeedback({ show: true, correct: false })
      setWrongMatch(true)
      setMascotMood("encouraging")
      setMascotMessage(getRandomMessage("wrong"))
      playWrong()
      setTimeout(() => setWrongMatch(false), 600)
    }

    setTimeout(() => {
      setSelectedLeft(null)
      setSelectedRight(null)
      setFeedback({ show: false, correct: false })
      if (!correctPair) {
        setMascotMood("idle")
        setMascotMessage("")
      }
    }, 1200)
  }

  return (
    <>
      <GameConfetti trigger={showConfetti} type={matched.size === matchPairs.length ? "levelComplete" : "correct"} />
      <Card className="border-4 border-primary/30 bg-card p-3 md:p-4 relative overflow-visible">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-card-foreground md:text-2xl">
              Match the Pairs! 🔗
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakText("Match the Pairs! Click a picture or word on the left, then click what it matches on the right!")}
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
              <span className="text-xl font-bold text-secondary">{score}</span>
            </div>
          </div>
        </div>

      <div className="mb-2 rounded-lg bg-blue-50 p-2 border border-blue-200">
        <p className="text-sm text-blue-900 font-semibold">📌 {question?.instruction || "Click a picture or word on the left, then click what it matches on the right!"}</p>
      </div>

      {/* Show question image if provided from DB */}
      {question?.image && (
        <div className="mb-2 overflow-hidden rounded-xl border-2 border-primary/20 bg-white flex items-center justify-center">
          <Image
            src={question.image}
            alt="Question image"
            width={1200}
            height={800}
            className="w-full h-auto object-contain max-h-[400px]"
            quality={100}
            unoptimized
            priority
          />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-primary mb-1">🎯 Choose one:</h3>
          {matchPairs.map((item, index) => (
            <div key={index} className="relative">
              <Button
                onClick={() => handleLeftClick(index)}
                disabled={matched.has(index)}
                className={`h-auto w-full p-3 text-base transition-all flex flex-col items-center gap-2 rounded-xl ${
                  matched.has(index)
                    ? "bg-green-500 text-white border-4 border-green-600 opacity-70 cursor-default"
                    : selectedLeft === index
                      ? "bg-yellow-400 text-gray-900 border-4 border-yellow-500 scale-105 shadow-lg"
                      : "bg-gradient-to-br from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 hover:scale-105 hover:shadow-lg"
                } ${wrongMatch && selectedLeft === index ? "animate-shake" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.leftImage && (
                  <div className="overflow-hidden rounded-lg border-2 border-white">
                    <Image
                      src={item.leftImage || "/placeholder.svg"}
                      alt={item.left || "Item"}
                      width={200}
                      height={120}
                      className="object-cover"
                      quality={100}
                      unoptimized
                    />
                  </div>
                )}
                <span className="font-bold text-sm break-words whitespace-normal text-center w-full">{item.left || "Item"}</span>
              </Button>
              {matched.has(index) && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-2xl">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-primary mb-1">🎯 Pick a match:</h3>
          {rightItems.map((item, index) => (
            <div key={index} className="relative">
              <Button
                onClick={() => handleRightClick(index)}
                disabled={selectedLeft === null || matchedRight.has(index)}
                className={`h-auto w-full p-3 text-sm transition-all rounded-xl font-semibold ${
                  matchedRight.has(index)
                    ? "bg-green-500 text-white border-4 border-green-600 opacity-70 cursor-default"
                    : selectedRight === index
                      ? "bg-yellow-400 text-gray-900 border-4 border-yellow-500 scale-105 shadow-lg"
                      : selectedLeft !== null
                        ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 hover:scale-105 hover:shadow-lg cursor-pointer"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
                style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
              >
                <span className="break-words whitespace-normal text-center w-full">{item || "Match"}</span>
              </Button>
              {matchedRight.has(index) && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-2xl">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Message */}
      {feedback.show && (
        <div
          className={`mt-2 rounded-xl p-2 text-center text-sm font-bold ${
            feedback.correct
              ? "bg-green-100 text-green-700 border-2 border-green-500"
              : "bg-red-100 text-red-700 border-2 border-red-500"
          }`}
        >
          {feedback.correct ? (
            <span>✨ Perfect Match! Well done! 🎉</span>
          ) : (
            <span>❌ Try again! That&apos;s not the right match.</span>
          )}
        </div>
      )}

      {matched.size === matchPairs.length && matchPairs.length > 0 && (
        <div className="mt-3 space-y-3">
          <div className="rounded-2xl bg-gradient-to-r from-yellow-100 to-green-100 p-4 text-center border-2 border-green-500 shadow-lg">
            <p className="text-2xl font-black text-green-600 mb-1">🏆 Amazing!</p>
            <p className="text-lg font-bold text-green-700">All pairs matched perfectly!</p>
          </div>
          <Button
            onClick={() => onComplete(1)}
            className="w-full bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90 text-lg py-3 hover:scale-105 transition-all rounded-xl shadow-lg font-bold"
          >
            Continue →
          </Button>
        </div>
      )}
    </Card>
    </>
  )
}
