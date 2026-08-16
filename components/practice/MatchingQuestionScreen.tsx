// MatchingQuestionScreen.tsx — Instant 0ms bidirectional matching with sound & vibrant true colors
"use client"

import { useState } from "react"
import { X, Volume2, Check } from "lucide-react"
import { useGameSounds, isGameMuted } from "@/hooks/use-game-sounds"

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

interface MatchingQuestion {
  id: number
  question_type: string
  question_text: string
  instruction?: string
  image_url?: string
  left_items: string[]
  right_items: string[]
}

interface MatchingQuestionScreenProps {
  question: MatchingQuestion
  questionNumber: number
  totalQuestions: number
  onExit: () => void
  onAnswer: (answer: Array<{ left: string; right: string }>) => Promise<{ is_correct: boolean; correct_answer: any }>
  onNext: () => void
}

const PAIR_PALETTES = [
  { border: "border-blue-400", bg: "bg-gradient-to-r from-blue-600 to-indigo-600", text: "text-white", ring: "ring-blue-300" },
  { border: "border-orange-400", bg: "bg-gradient-to-r from-orange-500 to-amber-600", text: "text-white", ring: "ring-orange-300" },
  { border: "border-emerald-400", bg: "bg-gradient-to-r from-emerald-600 to-teal-600", text: "text-white", ring: "ring-emerald-300" },
  { border: "border-purple-400", bg: "bg-gradient-to-r from-purple-600 to-pink-600", text: "text-white", ring: "ring-purple-300" },
]

export default function MatchingQuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  onExit,
  onAnswer,
  onNext,
}: MatchingQuestionScreenProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string>>({}) // { left: right }
  const [checked, setChecked] = useState(false)
  const [allCorrect, setAllCorrect] = useState(false)
  const [correctPairs, setCorrectPairs] = useState<Array<{ left: string; right: string }>>([])
  const [submitting, setSubmitting] = useState(false)
  const { playCorrect, playWrong, playClick } = useGameSounds()

  const { left_items, right_items } = question
  const matchedRightValues = new Set(Object.values(matches))
  const allMatched = Object.keys(matches).length === left_items.length

  const pairIndexForLeft = (left: string) => Object.keys(matches).indexOf(left)
  const pairIndexForRight = (right: string) => Object.values(matches).indexOf(right)

  // Instant bidirectional click handling
  const handleLeftClick = (left: string) => {
    if (checked) return
    playClick()

    // If already paired, clicking un-pairs it
    if (matches[left]) {
      const next = { ...matches }
      delete next[left]
      setMatches(next)
      setSelectedLeft(null)
      setSelectedRight(null)
      return
    }

    if (selectedRight) {
      // Right item was already picked -> complete pair instantly!
      setMatches({ ...matches, [left]: selectedRight })
      setSelectedLeft(null)
      setSelectedRight(null)
    } else {
      setSelectedLeft(selectedLeft === left ? null : left)
    }
  }

  const handleRightClick = (right: string) => {
    if (checked) return
    playClick()

    // If already paired, clicking un-pairs it
    const existingLeft = Object.keys(matches).find((k) => matches[k] === right)
    if (existingLeft) {
      const next = { ...matches }
      delete next[existingLeft]
      setMatches(next)
      setSelectedLeft(null)
      setSelectedRight(null)
      return
    }

    if (selectedLeft) {
      // Left item was already picked -> complete pair instantly!
      setMatches({ ...matches, [selectedLeft]: right })
      setSelectedLeft(null)
      setSelectedRight(null)
    } else {
      setSelectedRight(selectedRight === right ? null : right)
    }
  }

  const handleCheck = async () => {
    if (checked) {
      playClick()
      onNext()
      return
    }
    if (!allMatched || submitting) return
    setSubmitting(true)

    try {
      const pairs = Object.entries(matches).map(([left, right]) => ({ left, right }))
      const result = await onAnswer(pairs)
      const correct = Boolean(result.is_correct)
      setAllCorrect(correct)

      if (Array.isArray(result.correct_answer)) {
        setCorrectPairs(result.correct_answer)
      }
      setChecked(true)

      if (correct) {
        playCorrect()
      } else {
        playWrong()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const correctMap: Record<string, string> = {}
  correctPairs.forEach((p) => {
    correctMap[p.left] = p.right
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-50 to-purple-100 px-4 py-6 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            🚪 Exit
          </button>
          <span className="rounded-full border-2 border-rose-300 bg-white px-5 py-2 text-sm font-black text-rose-900 shadow-sm">
            ⭐ Question {questionNumber} of {totalQuestions}
          </span>
        </header>

        {/* Card */}
        <section
          aria-labelledby="match-prompt"
          className="rounded-3xl border-4 border-rose-200 bg-white p-6 shadow-2xl sm:p-8"
        >
          <div className="mb-3 flex items-start gap-3">
            <span className="text-3xl sm:text-4xl" aria-hidden="true">
              🔗
            </span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="match-prompt" className="text-xl font-black leading-snug text-slate-900 sm:text-2xl">
                  {question.question_text}
                </h1>
                <button
                  type="button"
                  onClick={() => speakText(question.question_text)}
                  className="shrink-0 rounded-full bg-rose-100 p-2 text-rose-700 hover:bg-rose-200 transition-colors"
                  title="Listen to question"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-bold text-slate-600">
                Tap an item, then tap its match! Pairs connect with matching colors 🎨
              </p>
            </div>
          </div>

          {/* Question Image */}
          {question.image_url && (
            <div className="mb-6 flex justify-center overflow-hidden rounded-2xl border-2 border-rose-100 bg-slate-50 p-2">
              <img
                src={question.image_url}
                alt="Question visual"
                className="max-h-52 w-auto rounded-xl object-contain shadow-sm"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          )}

          {/* Columns Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-4">
            {/* Left Items */}
            <div className="flex flex-col gap-2.5" role="group" aria-label="Left items">
              <span className="text-xs font-black uppercase text-slate-500">Column A</span>
              {left_items.map((item) => {
                const pairIndex = pairIndexForLeft(item)
                const isSelected = selectedLeft === item
                const isCorrectPair = checked && correctMap[item] === matches[item]

                // Default true rich vibrant color (Blue-Indigo)
                let style = "bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-400 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"

                if (checked && pairIndex >= 0) {
                  style = isCorrectPair
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-4 border-green-300 ring-4 ring-green-300 shadow-xl"
                    : "bg-gradient-to-r from-red-500 to-rose-600 text-white border-4 border-red-300 ring-4 ring-red-300"
                } else if (pairIndex >= 0) {
                  const p = PAIR_PALETTES[pairIndex % PAIR_PALETTES.length]
                  style = `${p.bg} ${p.border} ${p.text} shadow-lg ring-4 ${p.ring} scale-[1.02]`
                } else if (isSelected) {
                  style = "bg-amber-400 text-gray-950 border-4 border-amber-500 shadow-2xl ring-4 ring-amber-300 scale-[1.03]"
                }

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleLeftClick(item)}
                    className={`flex min-h-[3.75rem] items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left text-sm sm:text-base font-black transition-all ${style}`}
                  >
                    <span className="leading-snug">{item}</span>
                    {!checked && pairIndex >= 0 && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-white hover:bg-white/50">
                        <X className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {checked && isCorrectPair && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Right Items */}
            <div className="flex flex-col gap-2.5" role="group" aria-label="Right items">
              <span className="text-xs font-black uppercase text-slate-500">Column B</span>
              {right_items.map((item) => {
                const pairIndex = pairIndexForRight(item)
                const isSelected = selectedRight === item
                const leftKey = Object.keys(matches).find((k) => matches[k] === item)
                const isCorrectPair = leftKey ? correctMap[leftKey] === item : false

                // Default true rich vibrant color (Orange-Amber)
                let style = "bg-gradient-to-r from-orange-500 to-amber-500 border-2 border-orange-400 text-white shadow-md hover:from-orange-600 hover:to-amber-600"

                if (checked && pairIndex >= 0) {
                  style = isCorrectPair
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-4 border-green-300 ring-4 ring-green-300 shadow-xl"
                    : "bg-gradient-to-r from-red-500 to-rose-600 text-white border-4 border-red-300 ring-4 ring-red-300"
                } else if (pairIndex >= 0) {
                  const p = PAIR_PALETTES[pairIndex % PAIR_PALETTES.length]
                  style = `${p.bg} ${p.border} ${p.text} shadow-lg ring-4 ${p.ring} scale-[1.02]`
                } else if (isSelected) {
                  style = "bg-amber-400 text-gray-950 border-4 border-amber-500 shadow-2xl ring-4 ring-amber-300 scale-[1.03]"
                }

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleRightClick(item)}
                    className={`flex min-h-[3.75rem] items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left text-sm sm:text-base font-black transition-all ${style}`}
                  >
                    <span className="leading-snug">{item}</span>
                    {checked && isCorrectPair && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Feedback */}
          {checked && (
            <div
              className={`mt-6 rounded-2xl border-3 p-4 text-center text-base font-black shadow-md ${
                allCorrect
                  ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                  : "border-amber-500 bg-amber-100 text-amber-900"
              }`}
            >
              {allCorrect
                ? "🎉 All pairs matched correctly! You're a star! ⭐"
                : "💪 Great effort! Check the green pairs for the correct matches!"}
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            disabled={!allMatched || submitting}
            onClick={handleCheck}
            className={`mt-6 w-full rounded-full py-4 text-lg font-black text-white shadow-xl transition-all ${
              checked
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.02]"
                : "bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 hover:scale-[1.02]"
            } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100`}
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
