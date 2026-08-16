// FillBlankQuestionScreen.tsx — Vibrant, high-contrast practice screen with sound
"use client"

import { useState } from "react"
import { Volume2 } from "lucide-react"
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

interface FillBlankQuestion {
  id: number
  question_type: string
  question_text: string
  instruction?: string
  image_url?: string
}

interface FillBlankQuestionScreenProps {
  question: FillBlankQuestion
  questionNumber: number
  totalQuestions: number
  onExit: () => void
  onAnswer: (answer: string) => Promise<{ is_correct: boolean; correct_answer: any }>
  onNext: () => void
}

function splitAtBlank(text: string): { before: string; after: string } {
  const marker = text.match(/_{3,}/)
  if (marker && marker.index !== undefined) {
    return {
      before: text.substring(0, marker.index).trim(),
      after: text.substring(marker.index + marker[0].length).trim(),
    }
  }
  return { before: text, after: "" }
}

export default function FillBlankQuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  onExit,
  onAnswer,
  onNext,
}: FillBlankQuestionScreenProps) {
  const [value, setValue] = useState("")
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { playCorrect, playWrong, playClick } = useGameSounds()

  const { before, after } = splitAtBlank(question.question_text)

  const handleCheck = async () => {
    if (checked) {
      playClick()
      onNext()
      return
    }
    if (!value.trim() || submitting) return
    setSubmitting(true)

    try {
      const result = await onAnswer(value.trim())
      const correct = Boolean(result.is_correct)
      setIsCorrect(correct)
      setCorrectAnswer(String(result.correct_answer || ""))
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
    <main className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-50 to-cyan-100 px-4 py-6 font-sans">
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
          <span className="rounded-full border-2 border-emerald-300 bg-white px-5 py-2 text-sm font-black text-emerald-900 shadow-sm">
            ⭐ Question {questionNumber} of {totalQuestions}
          </span>
        </header>

        {/* Question Card */}
        <section
          aria-labelledby="fb-prompt"
          className="rounded-3xl border-4 border-emerald-200 bg-white p-6 shadow-2xl sm:p-8"
        >
          <div className="mb-6 flex items-start gap-3">
            <span className="text-3xl sm:text-4xl" aria-hidden="true">
              ✏️
            </span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="fb-prompt" className="text-xl font-black leading-snug text-slate-900 sm:text-2xl">
                  Fill in the missing word!
                </h1>
                <button
                  type="button"
                  onClick={() => speakText(question.question_text)}
                  className="shrink-0 rounded-full bg-emerald-100 p-2 text-emerald-700 hover:bg-emerald-200 transition-colors"
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
            <div className="mb-6 flex justify-center overflow-hidden rounded-2xl border-2 border-emerald-100 bg-slate-50 p-2">
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

          {/* Fill Blank sentence block */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3 rounded-2xl border-2 border-slate-300 bg-slate-50 p-5 text-lg font-bold leading-relaxed text-slate-900 shadow-inner sm:text-xl">
            <span>{before}</span>
            <input
              type="text"
              value={value}
              disabled={checked}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && value.trim()) handleCheck()
              }}
              aria-label="Your answer for the blank"
              placeholder="type word here..."
              className={`min-w-[140px] max-w-[220px] rounded-xl border-3 px-4 py-2 text-center text-lg font-black outline-none transition-all ${
                checked
                  ? isCorrect
                    ? "border-emerald-500 bg-emerald-100 text-emerald-950 ring-4 ring-emerald-300"
                    : "border-rose-500 bg-rose-100 text-rose-950 ring-4 ring-rose-300"
                  : "border-emerald-500 bg-white text-slate-900 shadow-sm focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200"
              }`}
            />
            {after && <span>{after}</span>}
          </div>

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
                ? "🎉 Fantastic! That's the correct word! ⭐"
                : `💪 Nice try! The answer was: "${correctAnswer}"`}
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            disabled={!value.trim() || submitting}
            onClick={handleCheck}
            className={`mt-6 w-full rounded-full py-4 text-lg font-black text-white shadow-xl transition-all ${
              checked
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.02]"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 hover:scale-[1.02]"
            } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100`}
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
