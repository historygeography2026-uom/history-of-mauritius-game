"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Volume2 } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { DodoMascot, getRandomMessage } from "@/components/dodo-mascot"
const GameConfetti = dynamic(() => import("@/components/game-confetti").then((m) => ({ default: m.GameConfetti })), { ssr: false })
import { useGameSounds, isGameMuted } from "@/hooks/use-game-sounds"

// Text-to-speech function
const speakText = (text: string) => {
  if (isGameMuted()) return
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
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
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [gaveUp, setGaveUp] = useState(false)
  const [wrongMatch, setWrongMatch] = useState(false)
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false })
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "sad" | "thinking" | "celebrating" | "encouraging">("idle")
  const [mascotMessage, setMascotMessage] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const { playCorrect, playWrong, playClick } = useGameSounds()
  const pendingTimeoutsRef = useRef<number[]>([])

  useEffect(() => {
    const pairsToUse = question?.pairs && Array.isArray(question.pairs) ? question.pairs : builtInPairs
    setMatchPairs(pairsToUse)
    setRightItems([...pairsToUse.map((p: MatchPair) => p.right || "")].sort(() => Math.random() - 0.5))
    setMatched(new Set())
    setMatchedRight(new Set())
    setFeedback({ show: false, correct: false })
    setSelectedLeft(null)
    setSelectedRight(null)
    setWrongAttempts(0)
    setGaveUp(false)
  }, [question])

  const handleGiveUp = () => {
    setGaveUp(true)
    setFeedback({ show: false, correct: false })
    setMascotMood("encouraging")
    setMascotMessage("No worries! Study the correct pairs and try again next time! 💪")
  }

  // Instant evaluation function when both sides are picked
  const evaluateMatch = (leftIdx: number, rightIdx: number) => {
    const leftValue = matchPairs[leftIdx]?.left
    const rightValue = rightItems[rightIdx]
    const correctPair = matchPairs.find((p: MatchPair) => p.left === leftValue && p.right === rightValue)

    if (correctPair) {
      // Correct match: instant registration, 0ms delay!
      const newMatched = new Set(matched)
      newMatched.add(leftIdx)
      setMatched(newMatched)

      const newMatchedRight = new Set(matchedRight)
      newMatchedRight.add(rightIdx)
      setMatchedRight(newMatchedRight)

      setSelectedLeft(null)
      setSelectedRight(null)
      setScore((prev) => prev + 1)
      setFeedback({ show: true, correct: true })
      setMascotMood("happy")
      setMascotMessage(getRandomMessage("correct"))
      setShowConfetti(true)
      playCorrect()

      const confettiTimer = window.setTimeout(() => setShowConfetti(false), 1500)
      pendingTimeoutsRef.current.push(confettiTimer)

      if (newMatched.size === matchPairs.length) {
        setMascotMood("celebrating")
        setMascotMessage(getRandomMessage("levelComplete"))
      }
    } else {
      // Incorrect match: show quick 300ms feedback and unlock immediately
      setFeedback({ show: true, correct: false })
      setWrongMatch(true)
      setWrongAttempts((prev) => prev + 1)
      setMascotMood("encouraging")
      setMascotMessage(getRandomMessage("wrong"))
      playWrong()

      const wrongTimer = window.setTimeout(() => {
        setWrongMatch(false)
        setSelectedLeft(null)
        setSelectedRight(null)
        setFeedback({ show: false, correct: false })
      }, 350)
      pendingTimeoutsRef.current.push(wrongTimer)
    }
  }

  const handleLeftClick = (index: number) => {
    if (matched.has(index)) return
    playClick()

    if (selectedRight !== null) {
      // Right was already selected -> complete the match immediately!
      setSelectedLeft(index)
      evaluateMatch(index, selectedRight)
    } else {
      // Toggle or select left item
      setSelectedLeft(selectedLeft === index ? null : index)
      setFeedback({ show: false, correct: false })
    }
  }

  const handleRightClick = (index: number) => {
    if (matchedRight.has(index)) return
    playClick()

    if (selectedLeft !== null) {
      // Left was already selected -> complete the match immediately!
      setSelectedRight(index)
      evaluateMatch(selectedLeft, index)
    } else {
      // Toggle or select right item
      setSelectedRight(selectedRight === index ? null : index)
      setFeedback({ show: false, correct: false })
    }
  }

  useEffect(() => {
    return () => {
      pendingTimeoutsRef.current.forEach((t) => clearTimeout(t))
      pendingTimeoutsRef.current = []
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleNext = () => {
    playClick()
    const finalScore = gaveUp ? Math.max(0, score - 1) : score
    onComplete(finalScore)
  }

  return (
    <>
      <GameConfetti trigger={showConfetti} type="correct" />
      <Card className="border-4 border-primary/30 bg-card p-3 md:p-4 relative overflow-visible">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-muted-foreground">
            Matching Challenge ({matched.size}/{matchPairs.length} paired)
          </span>
          <div className="flex items-center gap-3">
            <DodoMascot
              mood={mascotMood}
              size="sm"
              showSpeechBubble={!!mascotMessage}
              speechText={mascotMessage}
            />
            <div className="flex items-center gap-2 bg-secondary/20 px-4 py-1.5 rounded-full">
              <Star className="h-5 w-5 fill-secondary text-secondary" />
              <span className="text-lg font-bold text-secondary">{score}</span>
            </div>
          </div>
        </div>

        <div className="mb-2 rounded-xl bg-blue-50 p-2.5 border border-blue-200">
          <p className="text-xs sm:text-sm text-blue-900 font-bold">
            📌 {question?.instruction || "Tap any card on the left or right, then tap its match! Pairs connect instantly ⚡"}
          </p>
        </div>

        {question?.question && (
          <div className="mb-3 flex items-start gap-2">
            <h3 className="text-base font-bold leading-snug text-card-foreground md:text-lg flex-1">
              {question.question}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakText(question.question)}
              className="shrink-0 h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
              title="Listen to question"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {question?.image && (
          <div className="mb-2 overflow-hidden rounded-xl border-2 border-primary/20 bg-white flex items-center justify-center">
            <Image
              src={question.image}
              alt="Question image"
              width={1200}
              height={800}
              className="w-full h-auto object-contain max-h-[20vh] sm:max-h-[24vh]"
              quality={100}
              unoptimized
              priority
            />
          </div>
        )}

        <div className={`grid gap-3 md:grid-cols-2${gaveUp ? " hidden" : ""}`}>
          {/* Left Column */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-primary mb-1">🎯 Left Items:</h3>
            {matchPairs.map((item, index) => {
              const isMatched = matched.has(index)
              const isSelected = selectedLeft === index
              return (
                <div key={index} className="relative">
                  <Button
                    onClick={() => handleLeftClick(index)}
                    disabled={isMatched}
                    className={`h-auto w-full p-3 text-sm font-bold transition-all flex flex-col items-center gap-1.5 rounded-2xl ${
                      isMatched
                        ? "bg-emerald-500 text-white border-4 border-emerald-600 opacity-80 cursor-default"
                        : isSelected
                          ? "bg-amber-400 text-gray-900 border-4 border-amber-500 scale-102 shadow-lg ring-4 ring-amber-300"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:scale-[1.01]"
                    } ${wrongMatch && isSelected ? "animate-shake" : ""}`}
                  >
                    {item.leftImage && (
                      <div className="overflow-hidden rounded-lg border-2 border-white/80 max-h-24">
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
                    <span className="break-words whitespace-normal text-center w-full">{item.left || "Item"}</span>
                  </Button>
                  {isMatched && (
                    <div className="absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-black shadow-md">
                      ✓
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-primary mb-1">🎯 Right Matches:</h3>
            {rightItems.map((item, index) => {
              const isMatched = matchedRight.has(index)
              const isSelected = selectedRight === index
              return (
                <div key={index} className="relative">
                  <Button
                    onClick={() => handleRightClick(index)}
                    disabled={isMatched}
                    className={`h-auto w-full p-3.5 text-sm font-bold transition-all rounded-2xl ${
                      isMatched
                        ? "bg-emerald-500 text-white border-4 border-emerald-600 opacity-80 cursor-default"
                        : isSelected
                          ? "bg-amber-400 text-gray-900 border-4 border-amber-500 scale-102 shadow-lg ring-4 ring-amber-300"
                          : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md hover:scale-[1.01]"
                    } ${wrongMatch && isSelected ? "animate-shake" : ""}`}
                  >
                    <span className="break-words whitespace-normal text-center w-full">{item || "Match"}</span>
                  </Button>
                  {isMatched && (
                    <div className="absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-black shadow-md">
                      ✓
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Give up review mode */}
        {gaveUp && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300">
            <h4 className="font-extrabold text-amber-900 mb-3 text-center text-base">📖 Study the Correct Pairs:</h4>
            <div className="space-y-2">
              {matchPairs.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 text-sm font-bold">
                  <span className="text-blue-700">{p.left}</span>
                  <span className="text-amber-600 font-black">➔</span>
                  <span className="text-emerald-700">{p.right}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200">
          {!gaveUp && matched.size < matchPairs.length && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGiveUp}
              className="text-xs text-slate-500 hover:text-red-600 border-slate-300 rounded-full font-bold"
            >
              Show Answers
            </Button>
          )}

          {(matched.size === matchPairs.length || gaveUp) && (
            <Button
              onClick={handleNext}
              className="ml-auto rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold px-8 py-3 shadow-lg hover:scale-105"
            >
              Continue 🚀
            </Button>
          )}
        </div>
      </Card>
    </>
  )
}
