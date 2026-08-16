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

const PAIR_STYLES = [
  { border: "#3b82f6", bg: "#93c5fd", text: "#1e3a5f" },
  { border: "#f97316", bg: "#fdba74", text: "#7c2d12" },
  { border: "#10b981", bg: "#6ee7b7", text: "#064e3b" },
  { border: "#14b8a6", bg: "#5eead4", text: "#134e4a" },
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

  const getItemStyle = (pairIndex: number, isSelected: boolean, isCorrectPair: boolean) => {
    if (checked && pairIndex >= 0) {
      return isCorrectPair
        ? { borderColor: "#22c55e", backgroundColor: "#bbf7d0", color: "#166534" }
        : { borderColor: "#f87171", backgroundColor: "#fecaca", color: "#991b1b" }
    }
    if (pairIndex >= 0) {
      const style = PAIR_STYLES[pairIndex % PAIR_STYLES.length]
      return { borderColor: style.border, backgroundColor: style.bg, color: style.text }
    }
    if (isSelected) {
      return { borderColor: "#a855f7", backgroundColor: "#c084fc", color: "#581c87" }
    }
    return { borderColor: "#d1d5db", backgroundColor: "#ffffff", color: "#111827" }
  }

  return (
    <main className="min-h-screen px-4 py-6 font-sans" style={{ background: "linear-gradient(to bottom, #fce7f3, #ffffff, #fce4ec)" }}>
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-105"
          >
            {"🚪 Exit"}
          </button>
          <span className="rounded-full border-2 border-dashed border-gray-800 px-4 py-2 text-sm font-extrabold text-gray-900" style={{ backgroundColor: "#fda4af" }}>
            {"⭐ Question "}{questionNumber}{" of "}{totalQuestions}
          </span>
        </header>

        <section aria-labelledby="match-prompt" className="rounded-3xl border-2 border-dashed border-gray-800 p-6 shadow-[3px_3px_0_rgba(0,0,0,0.15)] sm:p-8" style={{ backgroundColor: "#fecdd3" }}>
          <div className="mb-2 flex items-start gap-3">
            <span className="text-3xl" aria-hidden="true">{"🔗"}</span>
            <h1 id="match-prompt" className="text-balance text-xl font-extrabold leading-relaxed text-gray-900 sm:text-2xl">
              {question.question_text}
            </h1>
          </div>
          <p className="mb-6 text-sm font-bold leading-relaxed text-gray-700">
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
                const style = getItemStyle(pairIndex, selectedLeft === item, isCorrectPair)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleLeftClick(item)}
                    aria-pressed={selectedLeft === item}
                    className="flex min-h-14 items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-base font-bold shadow-sm transition-all"
                    style={style}
                  >
                    {item}
                    {!checked && pairIndex >= 0 && <X className="h-4 w-4 shrink-0 opacity-70" aria-label="Remove match" />}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-col gap-3" role="group" aria-label="Right items">
              {right_items.map((item) => {
                const pairIndex = pairIndexForRight(item)
                const leftKey = Object.keys(matches).find((k) => matches[k] === item)
                const isCorrectPair = leftKey ? correctMap[leftKey] === item : false
                const style = getItemStyle(pairIndex, false, isCorrectPair)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleRightClick(item)}
                    disabled={checked || (!selectedLeft && !matchedRightValues.has(item))}
                    className="flex min-h-14 items-center rounded-2xl border-2 px-4 py-3 text-base font-bold shadow-sm transition-all disabled:cursor-default"
                    style={style}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          {checked && (
            <p
              className="mt-5 rounded-2xl border-2 border-dashed px-4 py-3 text-center text-base font-extrabold"
              style={{
                borderColor: allCorrect ? "#22c55e" : "#f97316",
                backgroundColor: allCorrect ? "#bbf7d0" : "#fed7aa",
                color: allCorrect ? "#166534" : "#9a3412",
              }}
            >
              {allCorrect ? "All matched! You're a superstar! 🎉⭐" : "Great effort! The green pairs are correct! 💪"}
            </p>
          )}

          <button
            type="button"
            disabled={!allMatched || submitting}
            onClick={handleCheck}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:shadow-none"
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
