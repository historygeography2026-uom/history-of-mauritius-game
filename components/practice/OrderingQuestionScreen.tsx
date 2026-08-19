// OrderingQuestionScreen.tsx — Matches the exact screenshot aesthetic & colors
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DodoMascot } from "./dodo-mascot"
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
    <main className="relative z-10 min-h-screen px-4 py-6 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onExit}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:scale-105"
          >
            🚪 Exit
          </button>
          
          <div className="flex-1 max-w-sm mx-auto ml-2 sm:ml-6" role="progressbar" aria-valuenow={questionNumber - 1} aria-valuemin={0} aria-valuemax={totalQuestions}>
             <div className="flex items-center gap-1 sm:gap-1.5 h-2.5 sm:h-3">
               {Array.from({ length: totalQuestions }).map((_, i) => (
                  <div key={i} className="h-full flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner">
                    <motion.div
                      className="h-full rounded-full bg-emerald-500"
                      initial={false}
                      animate={{ width: i < (questionNumber - 1) ? '100%' : i === (questionNumber - 1) ? (checked ? '100%' : '50%') : '0%' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  </div>
               ))}
             </div>
             <p className="text-right text-[10px] sm:text-xs font-bold text-slate-500 mt-1 sm:mt-1.5 drop-shadow-sm">
               Question {questionNumber} of {totalQuestions}
             </p>
          </div>
        </header>

        {/* Card */}
        <section
          aria-labelledby="ord-prompt"
          className="rounded-3xl border-2 border-pink-100 bg-white/95 p-6 shadow-xl backdrop-blur-sm sm:p-8"
        >
          <div className="mb-4 flex items-start gap-3">
            <DodoMascot mood={!checked ? 'thinking' : (isCorrect ? 'happy' : 'sad')} size={64} />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="ord-prompt" className="text-xl font-black leading-snug text-slate-800 sm:text-2xl">
                  {question.question_text}
                </h1>
                <button
                  type="button"
                  onClick={() => speakText(question.question_text)}
                  className="shrink-0 rounded-full bg-rose-50 p-2 text-rose-500 hover:bg-rose-100 transition-colors"
                  title="Listen to question"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-bold text-slate-500">
                Use the arrow buttons to arrange these items into the correct order 🔼🔽
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

          {/* Ordering items list */}
          <ol className="flex flex-col gap-3 mt-4">
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
                  className={`flex items-center gap-3.5 rounded-2xl p-4 transition-all ${itemStyle}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r ${badgeGradient} text-sm font-black text-white shadow-xs`}
                  >
                    {index + 1}
                  </span>
                  <span className={`flex-1 text-base font-bold leading-snug ${checked ? "text-white" : "text-slate-800"}`}>
                    {item.label}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={checked || index === 0}
                      aria-label={`Move ${item.label} up`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={checked || index === items.length - 1}
                      aria-label={`Move ${item.label} down`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <ArrowDown className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* Feedback */}
          {checked && (
            <div
              className={`mt-6 rounded-2xl p-4 text-center text-base font-black shadow-sm ${
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
            className={`mt-6 w-full rounded-full py-4 text-lg font-black text-white shadow-lg transition-all ${
              checked
                ? "bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 hover:scale-[1.02]"
                : "bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 hover:from-pink-500 hover:to-indigo-500 hover:scale-[1.02]"
            } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
