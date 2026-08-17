// FillBlankQuestionScreen.tsx — Vibrant, high-contrast fill-in-the-blank practice screen with 100% opaque 3D cards
"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, Sparkles, Check, X } from "lucide-react"
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

export default function FillBlankQuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  onExit,
  onAnswer,
  onNext,
}: FillBlankQuestionScreenProps) {
  const [inputVal, setInputVal] = useState("")
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { playCorrect, playWrong, playClick } = useGameSounds()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCheck = async () => {
    if (checked) {
      playClick()
      onNext()
      return
    }
    const trimmed = inputVal.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)

    try {
      const result = await onAnswer(trimmed)
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !submitting && (inputVal.trim() || checked)) {
      handleCheck()
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
          aria-labelledby="fill-prompt"
          className="rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[0_10px_0_0_#0f172a] sm:p-8 relative"
        >
          {/* Question Text & speech button */}
          <div className="mb-6 flex items-start gap-3">
            <span className="text-3xl sm:text-4xl" aria-hidden="true">
              ✏️
            </span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="fill-prompt" className="text-2xl font-black leading-snug text-slate-950 sm:text-3xl">
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
              <p className="mt-2 inline-block rounded-full bg-amber-100 px-4 py-1 text-xs sm:text-sm font-black text-amber-900 border-2 border-amber-300">
                💡 {question.instruction || "Type your answer in the box below!"}
              </p>
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

          {/* Input Box */}
          <div className="my-6">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={checked}
                placeholder="Type your answer here..."
                className={`w-full rounded-2xl border-4 px-6 py-4 text-center text-xl sm:text-2xl font-black text-slate-950 shadow-inner placeholder:text-slate-400 focus:outline-none transition-all ${
                  checked
                    ? isCorrect
                      ? "border-emerald-600 bg-emerald-100 text-emerald-950"
                      : "border-red-600 bg-red-100 text-red-950"
                    : "border-slate-900 bg-slate-50 focus:border-blue-600 focus:bg-white"
                }`}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl">
                {checked ? (isCorrect ? "✅" : "❌") : <Sparkles className="h-6 w-6 text-amber-500" />}
              </span>
            </div>
          </div>

          {/* Feedback */}
          {checked && (
            <div
              className={`mt-4 rounded-2xl border-4 p-4 text-center text-lg font-black shadow-md ${
                isCorrect
                  ? "border-emerald-700 bg-emerald-100 text-emerald-950"
                  : "border-amber-700 bg-amber-100 text-amber-950"
              }`}
            >
              {isCorrect ? (
                <p>🎉 Excellent! That is exactly right! ⭐</p>
              ) : (
                <div>
                  <p>💪 Good try!</p>
                  {correctAnswer && (
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      The correct answer is:{" "}
                      <span className="rounded-lg bg-white px-3 py-1 text-base font-black text-emerald-700 border-2 border-emerald-500 inline-block mt-1">
                        {correctAnswer}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            disabled={!inputVal.trim() && !checked}
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
