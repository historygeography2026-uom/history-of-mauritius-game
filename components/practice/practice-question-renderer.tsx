"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DodoMascot } from "./dodo-mascot"

/**
 * Practice Question Renderer
 *
 * Renders a single practice question with appropriate controls per question type.
 * No timer, no score, no confetti — just the question, answer options, and immediate feedback.
 */

interface PracticeQuestionData {
  id: number
  question_type: string
  question_text: string
  instruction?: string
  image_url?: string
  options?: string[]       // MCQ options (text only, shuffled)
  left_items?: string[]    // Matching left side
  right_items?: string[]   // Matching right side (shuffled)
  items?: string[]         // Reorder items (shuffled)
}

interface PracticeQuestionRendererProps {
  question: PracticeQuestionData
  onAnswer: (answer: any) => Promise<{ is_correct: boolean; correct_answer: any }>
  onNext: () => void
  questionNumber: number
  totalQuestions: number
}

export default function PracticeQuestionRenderer({
  question,
  onAnswer,
  onNext,
  questionNumber,
  totalQuestions,
}: PracticeQuestionRendererProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null)
  const [feedback, setFeedback] = useState<{ is_correct: boolean; correct_answer: any } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Matching state
  const [matchPairs, setMatchPairs] = useState<Array<{ left: string; right: string }>>([])
  const [matchLeftSelected, setMatchLeftSelected] = useState<string | null>(null)
  // Reorder state
  const [reorderItems, setReorderItems] = useState<string[]>(question.items || [])
  // Fill state
  const [fillText, setFillText] = useState("")

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)

    let answer: any = selectedAnswer
    if (question.question_type === "matching") {
      answer = matchPairs
    } else if (question.question_type === "reorder") {
      answer = reorderItems
    } else if (question.question_type === "fill") {
      answer = fillText
    }

    try {
      const result = await onAnswer(answer)
      setFeedback(result)
    } catch (error) {
      console.error("Error submitting answer:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setFeedback(null)
    setMatchPairs([])
    setMatchLeftSelected(null)
    setReorderItems(question.items || [])
    setFillText("")
    onNext()
  }

  const isAnswered = feedback !== null

  return (
    <div className="space-y-6">
      {/* Segmented progress bar — one segment per question */}
      <div className="flex items-center gap-4 mb-2">
        <div
          className="flex flex-1 items-center gap-1.5"
          role="progressbar"
          aria-valuenow={questionNumber - 1}
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
          aria-label={`Question ${questionNumber} of ${totalQuestions}`}
        >
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div key={i} className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={false}
                animate={{ width: i < (questionNumber - 1) ? '100%' : i === (questionNumber - 1) ? (isAnswered ? '100%' : '50%') : '0%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
          ))}
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold shrink-0">
          {question.question_type.toUpperCase()}
        </span>
      </div>

      {/* Question card wrapper with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionNumber}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
          <div className="hidden sm:block shrink-0">
            <DodoMascot mood={feedback === null ? 'thinking' : (feedback.is_correct ? 'happy' : 'sad')} size={80} />
          </div>
          <div className="flex-1">
            {/* Instruction */}
            {question.instruction && (
              <p className="text-sm text-slate-500 italic mb-2">{question.instruction}</p>
            )}

            {/* Question text */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
              {question.question_text}
            </h2>
          </div>
        </div>

        {/* Image */}
        {question.image_url && (
          <div className="mb-4 flex justify-center">
            <img
              src={question.image_url}
              alt="Question image"
              className="max-h-48 rounded-lg shadow-sm object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          </div>
        )}

        {/* ── MCQ ── */}
        {question.question_type === "mcq" && question.options && (
          <div className="grid gap-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === option
              const isCorrectOption = isAnswered && feedback?.correct_answer === option
              const isWrongSelection = isAnswered && isSelected && !feedback?.is_correct

              return (
                <Button
                  key={idx}
                  onClick={() => !isAnswered && setSelectedAnswer(option)}
                  disabled={isAnswered}
                  variant="outline"
                  className={`w-full justify-start text-left py-4 px-5 text-base font-medium transition-all ${
                    isCorrectOption
                      ? "bg-green-100 border-green-400 text-green-800 ring-2 ring-green-300"
                      : isWrongSelection
                        ? "bg-red-100 border-red-400 text-red-800"
                        : isSelected
                          ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300"
                          : "hover:bg-slate-50"
                  }`}
                >
                  <span className="mr-3 font-bold text-slate-400">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                  {isCorrectOption && <CheckCircle className="ml-auto h-5 w-5 text-green-600" />}
                  {isWrongSelection && <XCircle className="ml-auto h-5 w-5 text-red-600" />}
                </Button>
              )
            })}
          </div>
        )}

        {/* ── True/False ── */}
        {question.question_type === "truefalse" && (
          <div className="grid grid-cols-2 gap-4">
            {[true, false].map((val) => {
              const isSelected = selectedAnswer === val
              const isCorrect = isAnswered && feedback?.correct_answer === val
              const isWrong = isAnswered && isSelected && !feedback?.is_correct

              return (
                <Button
                  key={String(val)}
                  onClick={() => !isAnswered && setSelectedAnswer(val)}
                  disabled={isAnswered}
                  variant="outline"
                  className={`py-6 text-xl font-bold transition-all ${
                    isCorrect
                      ? "bg-green-100 border-green-400 text-green-800 ring-2 ring-green-300"
                      : isWrong
                        ? "bg-red-100 border-red-400 text-red-800"
                        : isSelected
                          ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300"
                          : "hover:bg-slate-50"
                  }`}
                >
                  {val ? "✅ True" : "❌ False"}
                </Button>
              )
            })}
          </div>
        )}

        {/* ── Fill in the Blanks ── */}
        {question.question_type === "fill" && (
          <div className="space-y-3">
            <Input
              value={fillText}
              onChange={(e) => !isAnswered && setFillText(e.target.value)}
              placeholder="Type your answer..."
              disabled={isAnswered}
              className="text-lg py-5 text-center font-medium"
              onKeyDown={(e) => e.key === "Enter" && !isAnswered && fillText.trim() && handleSubmit()}
            />
            {isAnswered && !feedback?.is_correct && (
              <p className="text-sm text-green-600 font-medium text-center">
                Correct answer: <strong>{feedback?.correct_answer}</strong>
              </p>
            )}
          </div>
        )}

        {/* ── Matching ── */}
        {question.question_type === "matching" && question.left_items && question.right_items && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Items</p>
                {question.left_items.map((left, i) => {
                  const isPaired = matchPairs.some((p) => p.left === left)
                  const isActive = matchLeftSelected === left

                  return (
                    <Button
                      key={i}
                      onClick={() => !isAnswered && !isPaired && setMatchLeftSelected(left)}
                      disabled={isAnswered || isPaired}
                      variant="outline"
                      className={`w-full text-sm ${
                        isActive ? "ring-2 ring-emerald-400 bg-emerald-50" :
                        isPaired ? "bg-slate-100 text-slate-400" : ""
                      }`}
                    >
                      {left} {isPaired && "✓"}
                    </Button>
                  )
                })}
              </div>

              {/* Right column */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Matches</p>
                {question.right_items.map((right, i) => {
                  const isPaired = matchPairs.some((p) => p.right === right)

                  return (
                    <Button
                      key={i}
                      onClick={() => {
                        if (isAnswered || isPaired || !matchLeftSelected) return
                        setMatchPairs([...matchPairs, { left: matchLeftSelected, right }])
                        setMatchLeftSelected(null)
                      }}
                      disabled={isAnswered || isPaired || !matchLeftSelected}
                      variant="outline"
                      className={`w-full text-sm ${
                        isPaired ? "bg-slate-100 text-slate-400" :
                        matchLeftSelected ? "hover:bg-emerald-50 hover:border-emerald-300" : ""
                      }`}
                    >
                      {right} {isPaired && "✓"}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Paired display */}
            {matchPairs.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-500 mb-2">Your Matches:</p>
                {matchPairs.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm mb-1">
                    <span className="font-medium">{p.left}</span>
                    <span className="text-slate-400">→</span>
                    <span>{p.right}</span>
                    {!isAnswered && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-400"
                        onClick={() => setMatchPairs(matchPairs.filter((_, idx) => idx !== i))}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isAnswered && !feedback?.is_correct && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs font-bold text-green-600 mb-1">Correct Matches:</p>
                {Array.isArray(feedback?.correct_answer) && feedback.correct_answer.map((p: any, i: number) => (
                  <div key={i} className="text-sm text-green-700">
                    {p.left} → {p.right}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Reorder ── */}
        {question.question_type === "reorder" && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 mb-2">Drag items to reorder (or click arrows):</p>
            {reorderItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 p-3 rounded-lg border ${
                  isAnswered ? "bg-slate-50" : "bg-white hover:bg-slate-50"
                }`}
              >
                <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                <span className="flex-1 text-sm font-medium">{item}</span>
                {!isAnswered && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={idx === 0}
                      onClick={() => {
                        const updated = [...reorderItems]
                        ;[updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]]
                        setReorderItems(updated)
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={idx === reorderItems.length - 1}
                      onClick={() => {
                        const updated = [...reorderItems]
                        ;[updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]]
                        setReorderItems(updated)
                      }}
                    >
                      ↓
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {isAnswered && !feedback?.is_correct && (
              <div className="p-3 bg-green-50 rounded-lg mt-2">
                <p className="text-xs font-bold text-green-600 mb-1">Correct Order:</p>
                {Array.isArray(feedback?.correct_answer) && feedback.correct_answer.map((item: string, i: number) => (
                  <div key={i} className="text-sm text-green-700">
                    {i + 1}. {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Feedback banner */}
      {isAnswered && (
        <Card
          className={`p-5 border-0 shadow-md text-center ${
            feedback?.is_correct
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              : "bg-gradient-to-r from-orange-50 to-amber-50 border-amber-200"
          }`}
        >
          <div className="text-4xl mb-2">
            {feedback?.is_correct ? "🎉" : "💪"}
          </div>
          <p className={`text-lg font-bold ${feedback?.is_correct ? "text-green-700" : "text-amber-700"}`}>
            {feedback?.is_correct ? "Correct! Great job!" : "Not quite — keep practicing!"}
          </p>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-4">
        {!isAnswered ? (
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              (question.question_type === "mcq" && selectedAnswer === null) ||
              (question.question_type === "truefalse" && selectedAnswer === null) ||
              (question.question_type === "fill" && fillText.trim().length === 0) ||
              (question.question_type === "matching" && matchPairs.length < 2) ||
              (question.question_type === "reorder" && reorderItems.length < 2)
            }
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg py-5"
          >
            {submitting ? "Checking..." : "Submit Answer ✓"}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg py-5"
          >
            {questionNumber < totalQuestions ? "Next Question →" : "Finish Practice 🏁"}
          </Button>
        )}
      </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
