// MCQQuestionScreen.tsx — Fable design, wired to server-side answer checking
"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"

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

export default function MCQQuestionScreen({ question, questionNumber, totalQuestions, onExit, onAnswer, onNext }: MCQQuestionScreenProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctIndex, setCorrectIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleCheck = async () => {
    if (checked) {
      onNext()
      return
    }
    if (selected === null) return
    setSubmitting(true)
    try {
      const result = await onAnswer(question.options[selected])
      setIsCorrect(result.is_correct)
      // Find the correct option index from the server response
      const cIdx = question.options.findIndex(
        (o) => o.toLowerCase().trim() === String(result.correct_answer).toLowerCase().trim()
      )
      setCorrectIndex(cIdx >= 0 ? cIdx : null)
      setChecked(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 font-sans" style={{ background: "linear-gradient(to bottom, #dbeafe, #ffffff, #ede9fe)" }}>
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-105"
          >
            {"🚪 Exit"}
          </button>
          <span className="rounded-full border-2 border-dashed border-gray-800 px-4 py-2 text-sm font-extrabold text-gray-900" style={{ backgroundColor: "#93c5fd" }}>
            {"⭐ Question "}{questionNumber}{" of "}{totalQuestions}
          </span>
        </header>

        <section aria-labelledby="question-prompt" className="rounded-3xl border-2 border-dashed border-gray-800 p-6 shadow-[3px_3px_0_rgba(0,0,0,0.15)] sm:p-8" style={{ backgroundColor: "#bfdbfe" }}>
          <div className="mb-6 flex items-start gap-3">
            <span className="text-3xl" aria-hidden="true">{"🤔"}</span>
            <h1 id="question-prompt" className="text-balance text-xl font-extrabold leading-relaxed text-gray-900 sm:text-2xl">
              {question.question_text}
            </h1>
          </div>

          {question.image_url && (
            <div className="mb-4 flex justify-center">
              <img src={question.image_url} alt="" className="max-h-48 rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, i) => {
              const isSelected = selected === i
              let borderColor = "#d1d5db"
              let bgColor = "#ffffff"
              let extraClasses = "hover:shadow-md"

              if (checked && correctIndex !== null && i === correctIndex) {
                borderColor = "#22c55e"
                bgColor = "#bbf7d0"
                extraClasses = "shadow-md"
              } else if (checked && isSelected && !isCorrect) {
                borderColor = "#f87171"
                bgColor = "#fecaca"
                extraClasses = ""
              } else if (isSelected) {
                borderColor = "#3b82f6"
                bgColor = "#93c5fd"
                extraClasses = "shadow-md ring-2 ring-blue-400"
              }

              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={checked}
                  onClick={() => setSelected(i)}
                  className={`flex min-h-16 items-center justify-between gap-2 rounded-2xl border-2 px-5 py-4 text-left text-base font-bold text-gray-900 shadow-sm transition-all disabled:cursor-default ${extraClasses}`}
                  style={{ borderColor, backgroundColor: bgColor }}
                >
                  {option}
                  {checked && correctIndex !== null && i === correctIndex && <Check className="h-5 w-5 shrink-0 text-green-700" aria-label="Correct answer" />}
                  {checked && isSelected && correctIndex !== null && i !== correctIndex && <X className="h-5 w-5 shrink-0 text-red-600" aria-label="Your answer" />}
                </button>
              )
            })}
          </div>

          {checked && (
            <p
              className="mt-5 rounded-2xl border-2 border-dashed px-4 py-3 text-center text-base font-extrabold"
              style={{
                borderColor: isCorrect ? "#22c55e" : "#f97316",
                backgroundColor: isCorrect ? "#bbf7d0" : "#fed7aa",
                color: isCorrect ? "#166534" : "#9a3412",
              }}
            >
              {isCorrect ? "Awesome! You got it! 🎉⭐" : "Good try! Now you know the answer! 💪"}
            </p>
          )}

          <button
            type="button"
            disabled={selected === null || submitting}
            onClick={handleCheck}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:shadow-none"
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
