// OrderingQuestionScreen.tsx — Vibrant, high-contrast ordering practice screen with 100% opaque 3D cards
"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, Volume2 } from "lucide-react"
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

interface OrderingQuestion {
  id: number
  question_type: string
  question_text: string
  instruction?: string
  image_url?: string
  items: string[]
}

interface OrderingQuestionScreenProps {
  question: OrderingQuestion
  questionNumber: number
  totalQuestions: number
  onExit: () => void
  onAnswer: (answer: string[]) => Promise<{ is_correct: boolean; correct_answer: any }>
  onNext: () => void
}

const BADGE_COLORS = [
  "bg-orange-500 border-orange-800",
  "bg-blue-600 border-blue-900",
  "bg-purple-600 border-purple-900",
  "bg-emerald-600 border-emerald-900",
]

export default function OrderingQuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  onExit,
  onAnswer,
  onNext,
}: OrderingQuestionScreenProps) {
  const [items, setItems] = useState(
    question.items.map((label, i) => ({ id: `i${i}`, label }))
  )
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctOrder, setCorrectOrder] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const { playCorrect, playWrong, playClick } = useGameSounds()

  const move = (index: number, direction: number) => {
    if (checked) return
    const target = index + direction
    if (target < 0 || target >= items.length) return
    playClick()
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
  }

  const handleCheck = async () => {
    if (checked) {
      playClick()
      onNext()
      return
    }
    if (submitting) return
    setSubmitting(true)

    try {
      const result = await onAnswer(items.map((i) => i.label))
      const correct = Boolean(result.is_correct)
      setIsCorrect(correct)

      if (Array.isArray(result.correct_answer)) {
        setCorrectOrder(result.correct_answer)
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

  const correctLabels = correctOrder.length > 0 ? correctOrder : []

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
          aria-labelledby="ord-prompt"
          className="rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[0_10px_0_0_#0f172a] sm:p-8 relative"
        >
          <div className="mb-4 flex items-start gap-3">
            <span className="text-3xl sm:text-4xl" aria-hidden="true">
              🔢
            </span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="ord-prompt" className="text-2xl font-black leading-snug text-slate-950 sm:text-3xl">
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
                Use the arrow buttons to arrange these items into the correct order 🔼🔽
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

          {/* Ordering items list with solid 100% opaque 3D cards */}
          <ol className="flex flex-col gap-3 mt-4">
            {items.map((item, index) => {
              const inRightSpot = checked && correctLabels.length > 0 && item.label === correctLabels[index]
              const badgeColor = BADGE_COLORS[index % BADGE_COLORS.length]

              let itemStyle = "border-3 border-slate-900 bg-slate-50 text-slate-950 shadow-[0_4px_0_0_#0f172a]"
              if (checked) {
                itemStyle = inRightSpot
                  ? "bg-emerald-600 text-white border-4 border-emerald-950 shadow-[0_5px_0_0_#022c22]"
                  : "bg-red-600 text-white border-4 border-red-950 shadow-[0_5px_0_0_#450a0a]"
              }

              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all ${itemStyle}`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${badgeColor} text-base font-black text-white border-2 shadow-xs`}
                  >
                    {index + 1}
                  </span>
                  <span className={`flex-1 text-base font-black leading-snug ${checked ? "text-white" : "text-slate-950"}`}>
                    {item.label}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={checked || index === 0}
                      aria-label={`Move ${item.label} up`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-950 shadow-[0_3px_0_0_#172554] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-30"
                    >
                      <ArrowUp className="h-5 w-5 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={checked || index === items.length - 1}
                      aria-label={`Move ${item.label} down`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-950 shadow-[0_3px_0_0_#3b0764] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-30"
                    >
                      <ArrowDown className="h-5 w-5 stroke-[3]" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* Feedback */}
          {checked && (
            <div
              className={`mt-6 rounded-2xl border-4 p-4 text-center text-lg font-black shadow-md ${
                isCorrect
                  ? "border-emerald-700 bg-emerald-100 text-emerald-950"
                  : "border-amber-700 bg-amber-100 text-amber-950"
              }`}
            >
              {isCorrect
                ? "🎉 Perfect order! You nailed it! ⭐"
                : "💪 Almost! The green boxes are in the right position!"}
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            disabled={submitting}
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
