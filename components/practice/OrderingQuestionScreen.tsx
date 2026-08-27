// OrderingQuestionScreen.tsx — Matches the exact screenshot aesthetic & colors
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DodoMascot } from "./dodo-mascot"
import { PracticeHeader } from "./PracticeHeader"
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

const NUMBER_BADGES = [
  "from-blue-500 to-indigo-500",
  "from-amber-500 to-orange-400",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500",
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
    (question.items || []).map((label, i) => ({ id: `i${i}`, label }))
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
    <main className="relative z-10 min-h-screen px-3 sm:px-4 py-3 sm:py-6 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <PracticeHeader currentQuestionIndex={questionNumber - 1} totalQuestions={totalQuestions} isCurrentAnswered={checked} onExit={onExit} />

        {/* Card */}
        <section
          aria-labelledby="ord-prompt"
          className="rounded-2xl sm:rounded-3xl border-2 border-pink-100 bg-white/95 p-4 sm:p-8 shadow-xl backdrop-blur-sm"
        >
          <div className="mb-4 sm:mb-6 flex items-start gap-2.5 sm:gap-3">
            <div className="shrink-0">
              <DodoMascot mood={!checked ? 'thinking' : (isCorrect ? 'happy' : 'sad')} size={52} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h1 id="ord-prompt" className="text-base sm:text-2xl font-black leading-snug text-slate-800">
                  {question.question_text}
                </h1>
                <button
                  type="button"
                  onClick={() => speakText(question.question_text)}
                  className="shrink-0 rounded-full bg-rose-50 p-2 text-rose-500 hover:bg-rose-100 transition-colors active:scale-95"
                  title="Listen to question"
                >
                  <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-bold text-slate-500">
                Use the arrow buttons to arrange these items into the correct order 🔼🔽
              </p>
            </div>
          </div>

          {/* Question Image */}
          {question.image_url && (
            <div className="mb-4 sm:mb-6 flex justify-center overflow-hidden rounded-xl sm:rounded-2xl border-2 border-rose-100 bg-slate-50 p-2">
              <img
                src={encodeURI(question.image_url)}
                alt="Question visual"
                className="max-h-40 sm:max-h-56 w-auto rounded-lg sm:rounded-xl object-contain shadow-sm"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          )}

          {/* Ordering items list */}
          <ol className="flex flex-col gap-2 sm:gap-3 mt-3 sm:mt-4">
            {items.map((item, index) => {
              const inRightSpot = checked && correctLabels.length > 0 && item.label === correctLabels[index]
              const badgeGradient = NUMBER_BADGES[index % NUMBER_BADGES.length]

              let itemStyle = "border border-slate-200 bg-white text-slate-800 shadow-sm"
              if (checked) {
                itemStyle = inRightSpot
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl ring-4 ring-emerald-300"
                  : "bg-gradient-to-r from-rose-500 to-red-500 text-white ring-4 ring-rose-300"
              }

              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-2.5 sm:gap-3.5 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all ${itemStyle}`}
                >
                  <span
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r ${badgeGradient} text-xs sm:text-sm font-black text-white shadow-xs`}
                  >
                    {index + 1}
                  </span>
                  <span className={`flex-1 text-xs sm:text-base font-bold leading-snug ${checked ? "text-white" : "text-slate-800"}`}>
                    {item.label}
                  </span>
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={checked || index === 0}
                      aria-label={`Move ${item.label} up`}
                      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={checked || index === items.length - 1}
                      aria-label={`Move ${item.label} down`}
                      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* Feedback */}
          {checked && (
            <div
              className={`mt-4 sm:mt-6 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center text-sm sm:text-base font-black shadow-sm ${
                isCorrect
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
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
            className={`mt-4 sm:mt-6 w-full rounded-full py-3 sm:py-4 text-base sm:text-lg font-black text-white shadow-lg transition-all active:scale-95 ${
              checked
                ? "bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
                : "bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 hover:from-pink-500 hover:to-indigo-500"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
