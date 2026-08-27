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
      const selectedOption = (question.options || [])[selected] ?? ""
      const result = await onAnswer(selectedOption)
      const correct = Boolean(result.is_correct)
      setIsCorrect(correct)

      const targetAnswer = String(result?.correct_answer ?? "").toLowerCase().trim()
      const cIdx = (question.options || []).findIndex(
        (o) => String(o ?? "").toLowerCase().trim() === targetAnswer
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
    <main className="relative z-10 min-h-screen px-3 sm:px-4 py-3 sm:py-6 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <PracticeHeader currentQuestionIndex={questionNumber - 1} totalQuestions={totalQuestions} isCurrentAnswered={checked} onExit={onExit} />

        {/* Question Card */}
        <section
          aria-labelledby="question-prompt"
          className="rounded-2xl sm:rounded-3xl border-2 border-pink-100 bg-white/95 p-4 sm:p-8 shadow-xl backdrop-blur-sm"
        >
          {/* Question text & speech button */}
          <div className="mb-4 sm:mb-6 flex items-start gap-2.5 sm:gap-3">
            <div className="shrink-0">
              <DodoMascot mood={!checked ? 'thinking' : (isCorrect ? 'happy' : 'sad')} size={52} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h1 id="question-prompt" className="text-base sm:text-2xl font-black leading-snug text-slate-800">
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
              {question.instruction && (
                <p className="mt-1.5 sm:mt-2 inline-block rounded-full bg-amber-50 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-bold text-amber-800 border border-amber-200">
                  💡 {question.instruction}
                </p>
              )}
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

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Answer options">
            {(question.options || []).map((option, i) => {
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
                  className={`flex min-h-[3.5rem] sm:min-h-[4.25rem] items-center justify-between gap-2.5 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left text-xs sm:text-base font-bold transition-all ${cardStyle} disabled:cursor-default active:scale-[0.99]`}
                >
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-white/30 text-xs sm:text-sm font-black text-white shadow-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-snug">{option}</span>
                  {isRightAnswer && (
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
                    </span>
                  )}
                  {isWrongSelection && (
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Feedback banner */}
          {checked && (
            <div
              className={`mt-4 sm:mt-6 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center text-sm sm:text-base font-black shadow-sm ${
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
