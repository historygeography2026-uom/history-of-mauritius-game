// MatchingQuestionScreen.tsx — Instant 0ms bidirectional matching with sound & vibrant design
"use client"

import { useState } from "react"
import { X, Volume2 } from "lucide-react"
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
  { border: "border-blue-500", bg: "bg-blue-100", text: "text-blue-950", ring: "ring-blue-400" },
  { border: "border-orange-500", bg: "bg-orange-100", text: "text-orange-950", ring: "ring-orange-400" },
  { border: "border-emerald-500", bg: "bg-emerald-100", text: "text-emerald-950", ring: "ring-emerald-400" },
  { border: "border-purple-500", bg: "bg-purple-100", text: "text-purple-950", ring: "ring-purple-400" },
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

                let style = "border-slate-300 bg-slate-50 text-slate-900 hover:bg-rose-50 hover:border-rose-400"

                if (checked && pairIndex >= 0) {
                  style = isCorrectPair
                    ? "border-emerald-500 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-300"
                    : "border-rose-500 bg-rose-100 text-rose-950 ring-2 ring-rose-300"
                } else if (pairIndex >= 0) {
                  const p = PAIR_PALETTES[pairIndex % PAIR_PALETTES.length]
                  style = `${p.border} ${p.bg} ${p.text} shadow-md ring-2 ${p.ring}`
                } else if (isSelected) {
                  style = "border-amber-500 bg-amber-100 text-amber-950 shadow-md ring-4 ring-amber-300 scale-[1.02]"
                }

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleLeftClick(item)}
                    className={`flex min-h-[3.75rem] items-center justify-between gap-2 rounded-2xl border-3 px-4 py-3 text-left text-sm sm:text-base font-black transition-all ${style}`}
                  >
                    <span className="leading-snug">{item}</span>
                    {!checked && pairIndex >= 0 && (
                      <X className="h-4 w-4 shrink-0 opacity-60 hover:opacity-100" />
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

                let style = "border-slate-300 bg-slate-50 text-slate-900 hover:bg-rose-50 hover:border-rose-400"

                if (checked && pairIndex >= 0) {
                  style = isCorrectPair
                    ? "border-emerald-500 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-300"
                    : "border-rose-500 bg-rose-100 text-rose-950 ring-2 ring-rose-300"
                } else if (pairIndex >= 0) {
                  const p = PAIR_PALETTES[pairIndex % PAIR_PALETTES.length]
                  style = `${p.border} ${p.bg} ${p.text} shadow-md ring-2 ${p.ring}`
                } else if (isSelected) {
                  style = "border-amber-500 bg-amber-100 text-amber-950 shadow-md ring-4 ring-amber-300 scale-[1.02]"
                }

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleRightClick(item)}
                    className={`flex min-h-[3.75rem] items-center justify-between gap-2 rounded-2xl border-3 px-4 py-3 text-left text-sm sm:text-base font-black transition-all ${style}`}
                  >
                    <span className="leading-snug">{item}</span>
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
