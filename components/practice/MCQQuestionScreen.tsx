// MCQQuestionScreen.tsx — Matches the exact game aesthetic & colors
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DodoMascot } from "./dodo-mascot"
import { PracticeHeader } from "./PracticeHeader"
import { Check, X, Volume2 } from "lucide-react"
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

interface MCQQuestion {
  id: number
  question_type: string
  question_text: string
  instruction?: string
  image_url?: string
  options: string[]
}

interface MCQQuestionScreenProps {
  question: MCQQuestion
  questionNumber: number
  totalQuestions: number
  onExit: () => void
  onAnswer: (answer: string) => Promise<{ is_correct: boolean; correct_answer: any }>
  onNext: () => void
}

const OPTION_THEMES = [
  "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-md hover:from-blue-600 hover:to-purple-600",
  "bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-md hover:from-amber-600 hover:to-orange-500",
  "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:from-emerald-600 hover:to-teal-600",
  "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:from-pink-600 hover:to-rose-600",
]

export default function MCQQuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  onExit,
  onAnswer,
  onNext,
}: MCQQuestionScreenProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctIndex, setCorrectIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { playCorrect, playWrong, playClick } = useGameSounds()

  const handleSelect = (idx: number) => {
    if (checked) return
    playClick()
    setSelected(idx)
  }

  const handleCheck = async () => {
    if (checked) {
      playClick()
      onNext()
      return
    }
    if (selected === null || submitting) return
    setSubmitting(true)

    try {
      const result = await onAnswer(question.options[selected])
      const correct = Boolean(result.is_correct)
      setIsCorrect(correct)

      const cIdx = question.options.findIndex(
        (o) => o.toLowerCase().trim() === String(result.correct_answer).toLowerCase().trim()
      )
      setCorrectIndex(cIdx >= 0 ? cIdx : null)
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

  return (
    <main className="relative z-10 min-h-screen px-4 py-6 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <PracticeHeader currentQuestionIndex={questionNumber - 1} totalQuestions={totalQuestions} isCurrentAnswered={checked} onExit={onExit} />

        {/* Question Card */}
        <section
          aria-labelledby="question-prompt"
          className="rounded-3xl border-2 border-pink-100 bg-white/95 p-6 shadow-xl backdrop-blur-sm sm:p-8"
        >
          {/* Question text & speech button */}
          <div className="mb-6 flex items-start gap-3">
            <DodoMascot mood={!checked ? 'thinking' : (isCorrect ? 'happy' : 'sad')} size={64} />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="question-prompt" className="text-xl font-black leading-snug text-slate-800 sm:text-2xl">
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
              {question.instruction && (
                <p className="mt-2 inline-block rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                  💡 {question.instruction}
                </p>
              )}
            </div>
          </div>

          {/* Question Image */}
          {question.image_url && (
            <div className="mb-6 flex justify-center overflow-hidden rounded-2xl border-2 border-rose-100 bg-slate-50 p-2">
              <img
                src={question.image_url}
                alt="Question visual"
                className="max-h-56 w-auto rounded-xl object-contain shadow-sm"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          )}

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, i) => {
              const isSelected = selected === i
              const isRightAnswer = checked && correctIndex !== null && i === correctIndex
              const isWrongSelection = checked && isSelected && !isCorrect
              const defaultTheme = OPTION_THEMES[i % OPTION_THEMES.length]

              let cardStyle = defaultTheme

              if (isRightAnswer) {
                cardStyle = "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl ring-4 ring-emerald-300 scale-[1.02]"
              } else if (isWrongSelection) {
                cardStyle = "bg-gradient-to-r from-rose-500 to-red-500 text-white ring-4 ring-rose-300"
              } else if (isSelected) {
                cardStyle = "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-2xl ring-4 ring-yellow-300 scale-[1.03]"
              } else if (checked) {
                cardStyle = "bg-slate-300 text-slate-500 opacity-40 grayscale"
              }

              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={checked}
                  onClick={() => handleSelect(i)}
                  className={`flex min-h-[4.25rem] items-center justify-between gap-3 rounded-2xl p-4 text-left text-sm sm:text-base font-bold transition-all ${cardStyle} disabled:cursor-default`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/30 text-sm font-black text-white shadow-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-snug">{option}</span>
                  {isRightAnswer && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  )}
                  {isWrongSelection && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
                      <X className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Feedback banner */}
          {checked && (
            <div
              className={`mt-6 rounded-2xl p-4 text-center text-base font-black shadow-sm ${
                isCorrect
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              {isCorrect ? "🎉 Awesome! You got it right! ⭐" : "💪 Good try! Look at the green box for the right answer!"}
            </div>
          )}

          {/* Action button: Pink-Purple pastel gradient */}
          <button
            type="button"
            disabled={selected === null || submitting}
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
