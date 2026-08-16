// MatchingQuestionScreen.tsx — Fable design, wired to server-side answer checking
"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface MatchingQuestion {
  id: number
  question_type: string
  question_text: string
  instruction?: string
  image_url?: string
  left_items: string[]   // from API
  right_items: string[]  // shuffled from API
}

interface MatchingQuestionScreenProps {
  question: MatchingQuestion
  questionNumber: number
  totalQuestions: number
  onExit: () => void
  onAnswer: (answer: Array<{ left: string; right: string }>) => Promise<{ is_correct: boolean; correct_answer: any }>
  onNext: () => void
}

const PAIR_COLORS = [
  "border-blue-500 bg-blue-200 text-blue-900",
  "border-orange-500 bg-orange-200 text-orange-900",
  "border-emerald-500 bg-emerald-200 text-emerald-900",
  "border-teal-500 bg-teal-200 text-teal-900",
]

export default function MatchingQuestionScreen({ question, questionNumber, totalQuestions, onExit, onAnswer, onNext }: MatchingQuestionScreenProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string>>({}) // { left: right }
  const [checked, setChecked] = useState(false)
  const [allCorrect, setAllCorrect] = useState(false)
  const [correctPairs, setCorrectPairs] = useState<Array<{ left: string; right: string }>>([])
  const [submitting, setSubmitting] = useState(false)

  const { left_items, right_items } = question
  const matchedRightValues = new Set(Object.values(matches))
  const allMatched = Object.keys(matches).length === left_items.length

  const pairIndexForLeft = (left: string) => Object.keys(matches).indexOf(left)
  const pairIndexForRight = (right: string) => Object.values(matches).indexOf(right)

  const handleLeftClick = (left: string) => {
    if (checked) return
    if (matches[left]) {
      const next = { ...matches }
      delete next[left]
      setMatches(next)
      setSelectedLeft(null)
    } else {
      setSelectedLeft(left === selectedLeft ? null : left)
    }
  }

  const handleRightClick = (right: string) => {
    if (checked || !selectedLeft || matchedRightValues.has(right)) return
    setMatches({ ...matches, [selectedLeft]: right })
    setSelectedLeft(null)
  }

  const handleCheck = async () => {
    if (checked) {
      onNext()
      return
    }
    if (!allMatched) return
    setSubmitting(true)
    try {
      const pairs = Object.entries(matches).map(([left, right]) => ({ left, right }))
      const result = await onAnswer(pairs)
      setAllCorrect(result.is_correct)
      if (Array.isArray(result.correct_answer)) {
        setCorrectPairs(result.correct_answer)
      }
      setChecked(true)
    } finally {
      setSubmitting(false)
    }
  }

  // Build correct match lookup for highlighting
  const correctMap: Record<string, string> = {}
  correctPairs.forEach((p) => { correctMap[p.left] = p.right })

  const itemClasses = (pairIndex: number, isSelected: boolean, isCorrectPair: boolean) => {
    if (checked && pairIndex >= 0) {
      return isCorrectPair ? "border-green-500 bg-green-100 text-green-900" : "border-red-400 bg-red-100 text-red-800"
    }
    if (pairIndex >= 0) return PAIR_COLORS[pairIndex % PAIR_COLORS.length]
    if (isSelected) return "border-purple-500 bg-purple-200 text-purple-900 ring-2 ring-purple-300"
    return "border-gray-300 bg-white text-gray-900 hover:border-purple-400 hover:bg-purple-50"
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 px-4 py-6 font-sans">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
          >
            {"🚪 Exit"}
          </button>
          <span className="rounded-full border-2 border-dashed border-gray-800 bg-rose-100 px-4 py-2 text-sm font-extrabold text-gray-900">
            {"⭐ Question "}{questionNumber}{" of "}{totalQuestions}
          </span>
        </header>

        <section aria-labelledby="match-prompt" className="rounded-3xl border-2 border-dashed border-gray-800 bg-rose-100 p-6 shadow-[3px_3px_0_rgba(0,0,0,0.15)] sm:p-8">
          <div className="mb-2 flex items-start gap-3">
            <span className="text-3xl" aria-hidden="true">{"🔗"}</span>
            <h1 id="match-prompt" className="text-balance text-xl font-extrabold leading-relaxed text-gray-900 sm:text-2xl">
              {question.question_text}
            </h1>
          </div>
          <p className="mb-6 text-sm font-bold leading-relaxed text-gray-600">
            {"Tap an item, then tap its match. Matching pairs get the same colour! 🎨"}
          </p>

          {question.image_url && (
            <div className="mb-4 flex justify-center">
              <img src={question.image_url} alt="" className="max-h-48 rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-8">
            <div className="flex flex-col gap-3" role="group" aria-label="Left items">
              {left_items.map((item) => {
                const pairIndex = pairIndexForLeft(item)
                const isCorrectPair = checked && correctMap[item] === matches[item]
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleLeftClick(item)}
                    aria-pressed={selectedLeft === item}
                    className={`flex min-h-14 items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-base font-bold shadow-sm transition-all ${itemClasses(pairIndex, selectedLeft === item, isCorrectPair)}`}
                  >
                    {item}
                    {!checked && pairIndex >= 0 && <X className="h-4 w-4 shrink-0 text-gray-500" aria-label="Remove match" />}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-col gap-3" role="group" aria-label="Right items">
              {right_items.map((item) => {
                const pairIndex = pairIndexForRight(item)
                const leftKey = Object.keys(matches).find((k) => matches[k] === item)
                const isCorrectPair = leftKey ? correctMap[leftKey] === item : false
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleRightClick(item)}
                    disabled={checked || (!selectedLeft && !matchedRightValues.has(item))}
                    className={`flex min-h-14 items-center rounded-2xl border-2 px-4 py-3 text-base font-bold shadow-sm transition-all disabled:cursor-default ${itemClasses(pairIndex, false, isCorrectPair)}`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          {checked && (
            <p className={`mt-5 rounded-2xl border-2 border-dashed px-4 py-3 text-center text-base font-extrabold ${allCorrect ? "border-green-500 bg-green-100 text-green-800" : "border-orange-400 bg-orange-100 text-orange-800"}`}>
              {allCorrect ? "All matched! You're a superstar! 🎉⭐" : "Great effort! The green pairs are correct! 💪"}
            </p>
          )}

          <button
            type="button"
            disabled={!allMatched || submitting}
            onClick={handleCheck}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
