// OrderingQuestionScreen.tsx — Vibrant, high-contrast ordering practice screen with sound
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
    <main className="min-h-screen bg-gradient-to-b from-amber-100 via-orange-50 to-yellow-100 px-4 py-6 font-sans">
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
          <span className="rounded-full border-2 border-amber-300 bg-white px-5 py-2 text-sm font-black text-amber-900 shadow-sm">
            ⭐ Question {questionNumber} of {totalQuestions}
          </span>
        </header>

        {/* Card */}
        <section
          aria-labelledby="ord-prompt"
          className="rounded-3xl border-4 border-amber-200 bg-white p-6 shadow-2xl sm:p-8"
        >
          <div className="mb-4 flex items-start gap-3">
            <span className="text-3xl sm:text-4xl" aria-hidden="true">
              🔢
            </span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="ord-prompt" className="text-xl font-black leading-snug text-slate-900 sm:text-2xl">
                  {question.question_text}
                </h1>
                <button
                  type="button"
                  onClick={() => speakText(question.question_text)}
                  className="shrink-0 rounded-full bg-amber-100 p-2 text-amber-700 hover:bg-amber-200 transition-colors"
                  title="Listen to question"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-bold text-slate-600">
                Use the arrow buttons to arrange these items into the correct order 🔼🔽
              </p>
            </div>
          </div>

          {/* Question Image */}
          {question.image_url && (
            <div className="mb-6 flex justify-center overflow-hidden rounded-2xl border-2 border-amber-100 bg-slate-50 p-2">
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

          {/* Ordering items list */}
          <ol className="flex flex-col gap-3 mt-4">
            {items.map((item, index) => {
              const inRightSpot = checked && correctLabels.length > 0 && item.label === correctLabels[index]

              let itemStyle = "border-slate-300 bg-slate-50 text-slate-900"
              if (checked) {
                itemStyle = inRightSpot
                  ? "border-emerald-500 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-300"
                  : "border-rose-500 bg-rose-100 text-rose-950 ring-2 ring-rose-300"
              }

              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 rounded-2xl border-3 px-4 py-3.5 shadow-sm transition-all ${itemStyle}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-base font-black text-white shadow-sm">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-base font-black text-slate-900 leading-snug">{item.label}</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={checked || index === 0}
                      aria-label={`Move ${item.label} up`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <ArrowUp className="h-5 w-5 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={checked || index === items.length - 1}
                      aria-label={`Move ${item.label} down`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <ArrowDown className="h-5 w-5 stroke-[2.5]" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* Feedback */}
          {checked && (
            <div
              className={`mt-6 rounded-2xl border-3 p-4 text-center text-base font-black shadow-md ${
                isCorrect
                  ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                  : "border-amber-500 bg-amber-100 text-amber-900"
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
            className={`mt-6 w-full rounded-full py-4 text-lg font-black text-white shadow-xl transition-all ${
              checked
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.02]"
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 hover:scale-[1.02]"
            } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100`}
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
