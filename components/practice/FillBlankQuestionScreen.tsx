// FillBlankQuestionScreen.tsx — Fable design, wired to server-side answer checking
"use client"

import { useState } from "react"

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

/**
 * Splits question_text at the blank marker (_______ or ___) into before/after parts.
 */
function splitAtBlank(text: string): { before: string; after: string } {
  const marker = text.match(/_{3,}/)
  if (marker && marker.index !== undefined) {
    return {
      before: text.substring(0, marker.index).trim(),
      after: text.substring(marker.index + marker[0].length).trim(),
    }
  }
  // No blank marker found — treat full text as "before"
  return { before: text, after: "" }
}

export default function FillBlankQuestionScreen({ question, questionNumber, totalQuestions, onExit, onAnswer, onNext }: FillBlankQuestionScreenProps) {
  const [value, setValue] = useState("")
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const { before, after } = splitAtBlank(question.question_text)

  const handleCheck = async () => {
    if (checked) {
      onNext()
      return
    }
    if (!value.trim()) return
    setSubmitting(true)
    try {
      const result = await onAnswer(value.trim())
      setIsCorrect(result.is_correct)
      setCorrectAnswer(String(result.correct_answer || ""))
      setChecked(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 font-sans" style={{ background: "linear-gradient(to bottom, #d1fae5, #ffffff, #ccfbf1)" }}>
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-105"
          >
            {"🚪 Exit"}
          </button>
          <span className="rounded-full border-2 border-dashed border-gray-800 px-4 py-2 text-sm font-extrabold text-gray-900" style={{ backgroundColor: "#6ee7b7" }}>
            {"⭐ Question "}{questionNumber}{" of "}{totalQuestions}
          </span>
        </header>

        <section aria-labelledby="fb-prompt" className="rounded-3xl border-2 border-dashed border-gray-800 p-6 shadow-[3px_3px_0_rgba(0,0,0,0.15)] sm:p-8" style={{ backgroundColor: "#a7f3d0" }}>
          <div className="mb-6 flex items-start gap-3">
            <span className="text-3xl" aria-hidden="true">{"✏️"}</span>
            <h1 id="fb-prompt" className="text-xl font-extrabold text-gray-900 sm:text-2xl">
              {"Fill in the missing word!"}
            </h1>
          </div>

          {question.image_url && (
            <div className="mb-4 flex justify-center">
              <img src={question.image_url} alt="" className="max-h-48 rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            </div>
          )}

          <p className="flex flex-wrap items-center gap-x-2 gap-y-3 rounded-2xl border-2 px-5 py-4 text-xl font-bold leading-relaxed text-gray-900" style={{ borderColor: "#9ca3af", backgroundColor: "#ffffff" }}>
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
              placeholder="type here"
              className="w-36 rounded-2xl border-2 border-dashed px-4 py-2 text-center text-xl font-bold text-gray-900 outline-none transition-colors placeholder:text-gray-400"
              style={{
                borderColor: checked ? (isCorrect ? "#22c55e" : "#f87171") : "#1f2937",
                backgroundColor: checked ? (isCorrect ? "#bbf7d0" : "#fecaca") : "#d1fae5",
              }}
            />
            {after && <span>{after}</span>}
          </p>

          {question.instruction && (
            <p className="mt-4 inline-flex rounded-full border-2 border-dashed border-gray-800 px-4 py-1.5 text-sm font-extrabold text-gray-900" style={{ backgroundColor: "#fde68a" }}>
              {"💡 Hint: "}{question.instruction}
            </p>
          )}

          {checked && (
            <p
              className="mt-5 rounded-2xl border-2 border-dashed px-4 py-3 text-center text-base font-extrabold"
              style={{
                borderColor: isCorrect ? "#22c55e" : "#f97316",
                backgroundColor: isCorrect ? "#bbf7d0" : "#fed7aa",
                color: isCorrect ? "#166534" : "#9a3412",
              }}
            >
              {isCorrect
                ? "Fantastic! That's the word! 🎉⭐"
                : `Nice try! The word was "${correctAnswer}". 💪`}
            </p>
          )}

          <button
            type="button"
            disabled={!value.trim() || submitting}
            onClick={handleCheck}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:shadow-none"
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
