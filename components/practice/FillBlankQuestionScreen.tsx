// FillBlankQuestionScreen.tsx — Matches the exact screenshot aesthetic & colors
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
  const parts = question.question_text.split(blankRegex)
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
    <main className="relative z-10 min-h-screen px-4 py-6 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onExit}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:scale-105"
          >
            🚪 Exit
          </button>
          
          <div className="flex-1 max-w-sm mx-auto ml-2 sm:ml-6" role="progressbar" aria-valuenow={questionNumber - 1} aria-valuemin={0} aria-valuemax={totalQuestions}>
             <div className="flex items-center gap-1 sm:gap-1.5 h-2.5 sm:h-3">
               {Array.from({ length: totalQuestions }).map((_, i) => (
                  <div key={i} className="h-full flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-500 ease-out ${i < questionNumber ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-transparent'}`} />
                  </div>
               ))}
             </div>
             <p className="text-right text-[10px] sm:text-xs font-bold text-slate-500 mt-1 sm:mt-1.5 drop-shadow-sm">
               Question {questionNumber} of {totalQuestions}
             </p>
          </div>
        </header>

        {/* Question Card */}
        <section
          aria-labelledby="fb-prompt"
          className="rounded-3xl border-2 border-pink-100 bg-white/95 p-6 shadow-xl backdrop-blur-sm sm:p-8"
        >
          <div className="mb-6 flex items-start gap-3">
            <img 
              src="/images/dodo-mascot.jpeg" 
              alt="Dodo mascot" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-full shadow-md border-2 border-white ring-2 ring-emerald-200" 
            />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 id="fb-prompt" className="text-xl font-black leading-snug text-slate-800 sm:text-2xl">
                  Fill in the missing word!
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

          {/* Fill Blank sentence block */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-base sm:text-lg font-bold leading-relaxed text-slate-800 shadow-inner">
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
              className={`min-w-[140px] max-w-[220px] rounded-xl border-2 px-4 py-2 text-center text-base sm:text-lg font-black outline-none transition-all ${
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
              className={`mt-6 rounded-2xl p-4 text-center text-base font-black shadow-sm ${
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
