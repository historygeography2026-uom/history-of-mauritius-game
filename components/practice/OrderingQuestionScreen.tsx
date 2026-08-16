// OrderingQuestionScreen.tsx — Fable design, wired to server-side answer checking
"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"

interface OrderingQuestion {
  id: number
  question_type: string
  question_text: string
  instruction?: string
  image_url?: string
  items: string[]  // shuffled item texts from API
}

interface OrderingQuestionScreenProps {
  question: OrderingQuestion
  questionNumber: number
  totalQuestions: number
  onExit: () => void
  onAnswer: (answer: string[]) => Promise<{ is_correct: boolean; correct_answer: any }>
  onNext: () => void
}

export default function OrderingQuestionScreen({ question, questionNumber, totalQuestions, onExit, onAnswer, onNext }: OrderingQuestionScreenProps) {
  // Build items with synthetic IDs for the Fable design
  const [items, setItems] = useState(
    question.items.map((label, i) => ({ id: `i${i}`, label }))
  )
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctOrder, setCorrectOrder] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const move = (index: number, direction: number) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
  }

  const handleCheck = async () => {
    if (checked) {
      onNext()
      return
    }
    setSubmitting(true)
    try {
      const result = await onAnswer(items.map((i) => i.label))
      setIsCorrect(result.is_correct)
      if (Array.isArray(result.correct_answer)) {
        setCorrectOrder(result.correct_answer)
      }
      setChecked(true)
    } finally {
      setSubmitting(false)
    }
  }

  // Build a lookup for correct positions to highlight
  const correctLabels = correctOrder.length > 0 ? correctOrder : []

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 px-4 py-6 font-sans">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
          >
            {"🚪 Exit"}
          </button>
          <span className="rounded-full border-2 border-dashed border-gray-800 bg-amber-100 px-4 py-2 text-sm font-extrabold text-gray-900">
            {"⭐ Question "}{questionNumber}{" of "}{totalQuestions}
          </span>
        </header>

        <section aria-labelledby="ord-prompt" className="rounded-3xl border-2 border-dashed border-gray-800 bg-amber-100 p-6 shadow-[3px_3px_0_rgba(0,0,0,0.15)] sm:p-8">
          <div className="mb-6 flex items-start gap-3">
            <span className="text-3xl" aria-hidden="true">{"🔢"}</span>
            <h1 id="ord-prompt" className="text-balance text-xl font-extrabold leading-relaxed text-gray-900 sm:text-2xl">
              {question.question_text}
            </h1>
          </div>

          {question.image_url && (
            <div className="mb-4 flex justify-center">
              <img src={question.image_url} alt="" className="max-h-48 rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            </div>
          )}

          <ol className="flex flex-col gap-3">
            {items.map((item, index) => {
              const inRightSpot = checked && correctLabels.length > 0 && item.label === correctLabels[index]
              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 shadow-sm transition-colors ${
                    checked ? (inRightSpot ? "border-green-500 bg-green-100" : "border-red-400 bg-red-100") : "border-gray-300 bg-white"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-base font-extrabold text-white shadow-sm">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-base font-bold text-gray-900">{item.label}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={checked || index === 0}
                      aria-label={`Move ${item.label} up`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-gray-800 bg-blue-100 text-gray-800 transition-colors hover:bg-blue-200 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
                    >
                      <ArrowUp className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={checked || index === items.length - 1}
                      aria-label={`Move ${item.label} down`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-gray-800 bg-blue-100 text-gray-800 transition-colors hover:bg-blue-200 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
                    >
                      <ArrowDown className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>

          {checked && (
            <p className={`mt-5 rounded-2xl border-2 border-dashed px-4 py-3 text-center text-base font-extrabold ${isCorrect ? "border-green-500 bg-green-100 text-green-800" : "border-orange-400 bg-orange-100 text-orange-800"}`}>
              {isCorrect ? "Perfect order! Well done! 🎉⭐" : "Almost! The green ones are in the right spot! 💪"}
            </p>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleCheck}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
          >
            {submitting ? "Checking... ⏳" : checked ? "Next Question! 🚀" : "Check My Answer! ✅"}
          </button>
        </section>
      </div>
    </main>
  )
}
