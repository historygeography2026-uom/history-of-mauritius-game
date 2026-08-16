// MCQQuestionScreen.tsx — Vibrant, high-contrast, playful practice screen with sound & true colors
"use client"

import { useState } from "react"
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
  "bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-400 text-white shadow-md hover:from-blue-700 hover:to-indigo-700",
  "bg-gradient-to-r from-emerald-600 to-teal-600 border-2 border-emerald-400 text-white shadow-md hover:from-emerald-700 hover:to-teal-700",
  "bg-gradient-to-r from-amber-500 to-orange-500 border-2 border-amber-400 text-white shadow-md hover:from-amber-600 hover:to-orange-600",
  "bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 text-white shadow-md hover:from-purple-700 hover:to-pink-700",
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
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-indigo-100 px-4 py-6 font-sans">
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
          <span className="rounded-full border-2 border-indigo-300 bg-white px-5 py-2 text-sm font-black text-indigo-900 shadow-sm">
            ⭐ Question {questionNumber} of {totalQuestions}
          </span>
        </header>

        {/* Question Card */}
        <section
          aria-labelledby="question-prompt"
          className="rounded-3xl border-4 border-indigo-200 bg-white p-6 shadow-2xl sm:p-8"
        >
          {/* Question text & speech button */}
          <div className="mb-6 flex items-start gap-3">
            <span className="text-3xl sm:text-4xl" aria-hidden="true">
              🤔
            </span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="question-prompt" className="text-xl font-black leading-snug text-slate-900 sm:text-2xl">
                  {question.question_text}
                </h1>
                <button
                  type="button"
                  onClick={() => speakText(question.question_text)}
                  className="shrink-0 rounded-full bg-blue-100 p-2 text-blue-700 hover:bg-blue-200 transition-colors"
                  title="Listen to question"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              {question.instruction && (
                <p className="mt-2 inline-block rounded-full bg-amber-100 px-3.5 py-1 text-xs font-extrabold text-amber-900 border border-amber-300">
                  💡 {question.instruction}
                </p>
              )}
            </div>
          </div>

          {/* Question Image */}
          {question.image_url && (
            <div className="mb-6 flex justify-center overflow-hidden rounded-2xl border-2 border-indigo-100 bg-slate-50 p-2">
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

          {/* Answer Options Grid with True Rich Saturated Colors by Default */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, i) => {
              const isSelected = selected === i
              const isRightAnswer = checked && correctIndex !== null && i === correctIndex
              const isWrongSelection = checked && isSelected && !isCorrect
              const defaultTheme = OPTION_THEMES[i % OPTION_THEMES.length]

              let cardStyle = defaultTheme

              if (isRightAnswer) {
                cardStyle = "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-4 border-green-300 shadow-xl ring-4 ring-green-300 scale-[1.03]"
              } else if (isWrongSelection) {
                cardStyle = "bg-gradient-to-r from-red-500 to-rose-600 text-white border-4 border-red-300 ring-4 ring-red-300"
              } else if (isSelected) {
                cardStyle = `${defaultTheme} ring-4 ring-yellow-300 scale-[1.03] shadow-2xl brightness-110`
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
                  className={`flex min-h-[4.5rem] items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-left text-base font-black transition-all ${cardStyle} disabled:cursor-default`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/30 text-base font-black text-white shadow-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-snug">{option}</span>
                  {isRightAnswer && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </span>
                  )}
                  {isWrongSelection && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
                      <X className="h-4 w-4 stroke-[3]" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Feedback banner */}
          {checked && (
            <div
              className={`mt-6 rounded-2xl border-3 p-4 text-center text-base font-black shadow-md ${
                isCorrect
                  ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                  : "border-amber-500 bg-amber-100 text-amber-900"
              }`}
            >
              {isCorrect ? "🎉 Awesome! You got it right! ⭐" : "💪 Good try! Look at the green box for the right answer!"}
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            disabled={selected === null || submitting}
            onClick={handleCheck}
            className={`mt-6 w-full rounded-full py-4 text-lg font-black text-white shadow-xl transition-all ${
              checked
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.02]"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02]"
            } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100`}
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
