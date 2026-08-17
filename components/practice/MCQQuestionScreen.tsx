// MCQQuestionScreen.tsx — Vibrant, high-contrast practice screen with 100% opaque 3D buttons
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
  { bg: "bg-blue-600 hover:bg-blue-700", border: "border-blue-950", shadow: "shadow-[0_5px_0_0_#172554]", badge: "bg-blue-800" },
  { bg: "bg-emerald-600 hover:bg-emerald-700", border: "border-emerald-950", shadow: "shadow-[0_5px_0_0_#022c22]", badge: "bg-emerald-800" },
  { bg: "bg-amber-500 hover:bg-amber-600", border: "border-amber-950", shadow: "shadow-[0_5px_0_0_#451a03]", badge: "bg-amber-700" },
  { bg: "bg-purple-600 hover:bg-purple-700", border: "border-purple-950", shadow: "shadow-[0_5px_0_0_#3b0764]", badge: "bg-purple-800" },
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
          aria-labelledby="question-prompt"
          className="rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[0_10px_0_0_#0f172a] sm:p-8 relative"
        >
          {/* Question text & speech button */}
          <div className="mb-6 flex items-start gap-3">
            <span className="text-3xl sm:text-4xl" aria-hidden="true">
              🤔
            </span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="question-prompt" className="text-2xl font-black leading-snug text-slate-950 sm:text-3xl">
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
              {question.instruction && (
                <p className="mt-2 inline-block rounded-full bg-amber-100 px-4 py-1 text-xs sm:text-sm font-black text-amber-900 border-2 border-amber-300">
                  💡 {question.instruction}
                </p>
              )}
            </div>
          </div>

          {/* Question Image */}
          {question.image_url && (
            <div className="mb-6 flex justify-center overflow-hidden rounded-2xl border-3 border-slate-300 bg-slate-100 p-2">
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

          {/* Answer Options Grid with Solid 100% Opaque High-Contrast Colors */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, i) => {
              const isSelected = selected === i
              const isRightAnswer = checked && correctIndex !== null && i === correctIndex
              const isWrongSelection = checked && isSelected && !isCorrect
              const theme = OPTION_THEMES[i % OPTION_THEMES.length]

              let cardStyle = `${theme.bg} ${theme.border} text-white ${theme.shadow} border-3 active:translate-y-1 active:shadow-none`

              if (isRightAnswer) {
                cardStyle = "bg-emerald-600 text-white border-4 border-emerald-950 shadow-[0_6px_0_0_#022c22] scale-[1.03]"
              } else if (isWrongSelection) {
                cardStyle = "bg-red-600 text-white border-4 border-red-950 shadow-[0_6px_0_0_#450a0a]"
              } else if (isSelected) {
                cardStyle = "bg-yellow-400 text-slate-950 border-4 border-slate-950 shadow-[0_6px_0_0_#000] ring-4 ring-yellow-300 scale-[1.03]"
              } else if (checked) {
                cardStyle = "bg-slate-300 text-slate-500 border-2 border-slate-400 opacity-40 grayscale"
              }

              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={checked}
                  onClick={() => handleSelect(i)}
                  className={`flex min-h-[4.75rem] items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-left text-base font-black transition-all ${cardStyle} disabled:cursor-default`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/30 text-base font-black text-white shadow-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-snug">{option}</span>
                  {isRightAnswer && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </span>
                  )}
                  {isWrongSelection && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-red-700 shadow-sm">
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
              className={`mt-6 rounded-2xl border-4 p-4 text-center text-lg font-black shadow-md ${
                isCorrect
                  ? "border-emerald-700 bg-emerald-100 text-emerald-950"
                  : "border-amber-700 bg-amber-100 text-amber-950"
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
