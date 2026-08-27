// FillBlankQuestionScreen.tsx — Matches the exact screenshot aesthetic & colors
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DodoMascot } from "./dodo-mascot"
import { PracticeHeader } from "./PracticeHeader"
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
  const [correctAnswer, setCorrectAnswer] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const { playCorrect, playWrong, playClick } = useGameSounds()

  // Split question_text on blank marker: "___", "[blank]", or "(blank)"
  const blankRegex = /_{2,}|\[blank\]|\(blank\)/i
  const parts = (question.question_text || "").split(blankRegex)
  const before = parts[0] || ""
  const after = parts[1] || ""

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
    <main className="relative z-10 min-h-screen px-3 sm:px-4 py-3 sm:py-6 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <PracticeHeader currentQuestionIndex={questionNumber - 1} totalQuestions={totalQuestions} isCurrentAnswered={checked} onExit={onExit} />

        {/* Card */}
        <section
          aria-labelledby="fb-prompt"
          className="rounded-2xl sm:rounded-3xl border-2 border-pink-100 bg-white/95 p-4 sm:p-8 shadow-xl backdrop-blur-sm"
        >
          <div className="mb-4 sm:mb-6 flex items-start gap-2.5 sm:gap-3">
            <div className="shrink-0">
              <DodoMascot mood={!checked ? 'thinking' : (isCorrect ? 'happy' : 'sad')} size={52} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h1 id="fb-prompt" className="text-base sm:text-2xl font-black leading-snug text-slate-800">
                  Fill in the missing word!
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

          {/* Fill Blank sentence block */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 sm:p-5 text-sm sm:text-lg font-bold leading-relaxed text-slate-800 shadow-inner">
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
              placeholder="type word..."
              className={`min-w-[120px] sm:min-w-[140px] max-w-[200px] sm:max-w-[220px] rounded-lg sm:rounded-xl border-2 px-3 py-1.5 sm:px-4 sm:py-2 text-center text-sm sm:text-lg font-black outline-none transition-all ${
                checked
                  ? isCorrect
                    ? "border-emerald-400 bg-emerald-50 text-emerald-950 ring-4 ring-emerald-200"
                    : "border-rose-400 bg-rose-50 text-rose-950 ring-4 ring-rose-200"
                  : "border-blue-400 bg-white text-slate-900 shadow-xs focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              }`}
            />
            {after && <span>{after}</span>}
          </div>

          {/* Feedback */}
          {checked && (
            <div
              className={`mt-4 sm:mt-6 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center text-sm sm:text-base font-black shadow-sm ${
                isCorrect
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              {isCorrect ? (
                "🎉 That's right! Excellent job! ⭐"
              ) : (
                <p>
                  💪 Good try! The correct answer is:{" "}
                  <span className="underline decoration-2">{correctAnswer}</span>
                </p>
              )}
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            disabled={!value.trim() || submitting}
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
