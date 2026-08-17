// MatchingQuestionScreen.tsx — High-contrast, rich vibrant matching practice screen with 100% opaque 3D cards
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
  { border: "border-indigo-950", bg: "bg-indigo-600", text: "text-white", shadow: "shadow-[0_5px_0_0_#1e1b4b]" },
  { border: "border-orange-950", bg: "bg-orange-600", text: "text-white", shadow: "shadow-[0_5px_0_0_#431407]" },
  { border: "border-emerald-950", bg: "bg-emerald-600", text: "text-white", shadow: "shadow-[0_5px_0_0_#022c22]" },
  { border: "border-purple-950", bg: "bg-purple-600", text: "text-white", shadow: "shadow-[0_5px_0_0_#3b0764]" },
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
    <main className="min-h-screen bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-600 px-4 py-6 font-sans relative z-10 isolate">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 px-5 py-2.5 text-sm font-black text-white border-2 border-red-900 shadow-[0_4px_0_0_#7f1d1d] active:translate-y-1 active:shadow-none transition-all"
          >
            🚪 Exit
          </button>
          <span className="rounded-full border-2 border-amber-700 bg-amber-400 px-5 py-2 text-sm font-black text-slate-950 shadow-[0_4px_0_0_#78350f]">
            ⭐ Question {questionNumber} of {totalQuestions}
          </span>
        </header>

        {/* 100% Solid Pure White Question Card */}
        <section
          aria-labelledby="match-prompt"
          className="rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[0_10px_0_0_#0f172a] sm:p-8 relative"
        >
          <div className="mb-4 flex items-start gap-3">
            <span className="text-3xl sm:text-4xl" aria-hidden="true">
              🔗
            </span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="match-prompt" className="text-2xl font-black leading-snug text-slate-950 sm:text-3xl">
                  {question.question_text}
                </h1>
                <button
                  type="button"
                  onClick={() => speakText(question.question_text)}
                  className="shrink-0 rounded-full bg-blue-100 p-2.5 text-blue-800 hover:bg-blue-200 border-2 border-blue-300 transition-colors"
                  title="Listen to question"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 inline-block rounded-full bg-amber-100 px-4 py-1 text-xs sm:text-sm font-black text-amber-900 border-2 border-amber-300">
                Tap an item in Column A, then tap its match in Column B! 🎨
              </p>
            </div>
          </div>

          {/* Question Image */}
          {question.image_url && (
            <div className="mb-6 flex justify-center overflow-hidden rounded-2xl border-3 border-slate-300 bg-slate-100 p-2">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {/* Column A (Left Items) */}
            <div className="flex flex-col gap-3" role="group" aria-label="Column A items">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-lg w-fit border border-slate-300">
                Column A
              </span>
              {left_items.map((item) => {
                const pairIndex = pairIndexForLeft(item)
                const isSelected = selectedLeft === item
                const isCorrectPair = checked && correctMap[item] === matches[item]

                // Default bold Royal Blue button
                let style = "bg-blue-600 hover:bg-blue-700 text-white border-3 border-blue-950 shadow-[0_5px_0_0_#172554] active:translate-y-1 active:shadow-none"

                if (checked && pairIndex >= 0) {
                  style = isCorrectPair
                    ? "bg-emerald-600 text-white border-4 border-emerald-950 shadow-[0_6px_0_0_#022c22]"
                    : "bg-red-600 text-white border-4 border-red-950 shadow-[0_6px_0_0_#450a0a]"
                } else if (pairIndex >= 0) {
                  const p = PAIR_PALETTES[pairIndex % PAIR_PALETTES.length]
                  style = `${p.bg} ${p.border} ${p.text} ${p.shadow} scale-[1.02]`
                } else if (isSelected) {
                  style = "bg-yellow-400 text-slate-950 border-4 border-slate-950 shadow-[0_6px_0_0_#000] ring-4 ring-yellow-300 scale-[1.03]"
                }

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleLeftClick(item)}
                    className={`flex min-h-[4rem] items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-left text-sm sm:text-base font-black transition-all ${style}`}
                  >
                    <span className="leading-snug flex-1">{item}</span>
                    {!checked && pairIndex >= 0 && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/30 text-white hover:bg-white/50">
                        <X className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {checked && isCorrectPair && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Column B (Right Items) */}
            <div className="flex flex-col gap-3" role="group" aria-label="Column B items">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-lg w-fit border border-slate-300">
                Column B
              </span>
              {right_items.map((item) => {
                const pairIndex = pairIndexForRight(item)
                const isSelected = selectedRight === item
                const leftKey = Object.keys(matches).find((k) => matches[k] === item)
                const isCorrectPair = leftKey ? correctMap[leftKey] === item : false

                // Default bold Sunset Amber button
                let style = "bg-amber-500 hover:bg-amber-600 text-white border-3 border-amber-950 shadow-[0_5px_0_0_#451a03] active:translate-y-1 active:shadow-none"

                if (checked && pairIndex >= 0) {
                  style = isCorrectPair
                    ? "bg-emerald-600 text-white border-4 border-emerald-950 shadow-[0_6px_0_0_#022c22]"
                    : "bg-red-600 text-white border-4 border-red-950 shadow-[0_6px_0_0_#450a0a]"
                } else if (pairIndex >= 0) {
                  const p = PAIR_PALETTES[pairIndex % PAIR_PALETTES.length]
                  style = `${p.bg} ${p.border} ${p.text} ${p.shadow} scale-[1.02]`
                } else if (isSelected) {
                  style = "bg-yellow-400 text-slate-950 border-4 border-slate-950 shadow-[0_6px_0_0_#000] ring-4 ring-yellow-300 scale-[1.03]"
                }

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleRightClick(item)}
                    className={`flex min-h-[4rem] items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-left text-sm sm:text-base font-black transition-all ${style}`}
                  >
                    <span className="leading-snug flex-1">{item}</span>
                    {checked && isCorrectPair && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                        <Check className="h-4 w-4 stroke-[3]" />
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
              className={`mt-6 rounded-2xl border-4 p-4 text-center text-lg font-black shadow-md ${
                allCorrect
                  ? "border-emerald-700 bg-emerald-100 text-emerald-950"
                  : "border-amber-700 bg-amber-100 text-amber-950"
              }`}
            >
              {allCorrect
                ? "🎉 All pairs matched correctly! You're a superstar! ⭐"
                : "💪 Great effort! Check the green boxes for correct matches!"}
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            disabled={!allMatched || submitting}
            onClick={handleCheck}
            className={`mt-6 w-full rounded-full py-4 text-xl font-black text-white transition-all ${
              checked
                ? "bg-emerald-500 hover:bg-emerald-600 border-3 border-emerald-900 shadow-[0_6px_0_0_#064e3b] active:translate-y-1 active:shadow-none"
                : "bg-emerald-500 hover:bg-emerald-600 border-3 border-emerald-900 shadow-[0_6px_0_0_#064e3b] active:translate-y-1 active:shadow-none"
            } disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0`}
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
