// app/practice/play/page.tsx — Play orchestrator: dispatches to Fable question screens
"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import MCQQuestionScreen from "@/components/practice/MCQQuestionScreen"
import FillBlankQuestionScreen from "@/components/practice/FillBlankQuestionScreen"
import OrderingQuestionScreen from "@/components/practice/OrderingQuestionScreen"
import MatchingQuestionScreen from "@/components/practice/MatchingQuestionScreen"
import PracticeCompleteScreen from "@/components/practice/PracticeCompleteScreen"

interface SessionQuestion {
  id: number
  question_type: string // "mcq" | "fill" | "reorder" | "matching" | "truefalse"
  question_text: string
  instruction?: string
  image_url?: string
  options?: string[]
  left_items?: string[]
  right_items?: string[]
  items?: string[]
}

interface SessionData {
  session_id: number
  unit: { id: number; unit_no: number; unit_name: string }
  total_questions: number
  questions: SessionQuestion[]
}

function PracticePlayContent() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const hasEndedRef = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()

  const sessionId = searchParams.get("session")

  // Load session on mount
  useEffect(() => {
    if (!sessionId) {
      router.push("/practice")
      return
    }
    const storedSession = sessionStorage.getItem(`practice_session_${sessionId}`)
    if (storedSession) {
      setSessionData(JSON.parse(storedSession))
      setLoading(false)
    } else {
      router.push("/practice")
    }
  }, [sessionId, status])

  // End session on unmount if not already ended
  useEffect(() => {
    return () => {
      if (sessionId && !hasEndedRef.current) {
        endSession("abandoned")
      }
    }
  }, [sessionId])

  const endSession = async (reason: "completed" | "exited" | "abandoned") => {
    if (hasEndedRef.current || !sessionId) return
    hasEndedRef.current = true
    try {
      await fetch("/api/practice/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: Number(sessionId), exit_reason: reason }),
      })
    } catch (e) {
      console.error("Failed to end session:", e)
    }
    sessionStorage.removeItem(`practice_session_${sessionId}`)
  }

  /**
   * Adapter: submit a student answer to the server.
   * Called by every Fable question screen's onAnswer/onCheck handler.
   */
  const handleAnswer = async (answer: any): Promise<{ is_correct: boolean; correct_answer: any }> => {
    if (!sessionData) throw new Error("No session data")
    const question = sessionData.questions[currentIndex]

    const res = await fetch("/api/practice/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: Number(sessionId),
        question_id: question.id,
        student_answer: answer,
      }),
    })

    if (!res.ok) throw new Error("Failed to submit answer")
    return res.json()
  }

  const handleNext = () => {
    if (currentIndex + 1 >= (sessionData?.total_questions || 0)) {
      endSession("completed")
      setCompleted(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleExit = () => {
    setShowExitConfirm(true)
  }

  const confirmExit = async () => {
    await endSession("exited")
    router.push("/practice")
  }

  const handlePracticeAgain = async () => {
    if (!sessionData) return
    // Start a new session for the same unit
    try {
      const res = await fetch("/api/practice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit_id: sessionData.unit.id }),
      })
      if (!res.ok) throw new Error("Failed to start new session")
      const data = await res.json()
      sessionStorage.setItem(`practice_session_${data.session_id}`, JSON.stringify(data))
      // Navigate to the new session
      window.location.href = `/practice/play?session=${data.session_id}`
    } catch {
      router.push("/practice")
    }
  }

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-spin mb-4">⏳</div>
          <p className="text-lg text-slate-600 font-bold">Loading practice session...</p>
        </div>
      </main>
    )
  }

  // ── Completed ────────────────────────────────────────────
  if (completed && sessionData) {
    return (
      <PracticeCompleteScreen
        unit={sessionData.unit}
        onPracticeAgain={handlePracticeAgain}
        onBackToUnits={() => router.push("/practice")}
      />
    )
  }

  // ── Active session ───────────────────────────────────────
  if (!sessionData) return null
  const currentQuestion = sessionData.questions[currentIndex]

  // Exit confirmation overlay
  const exitOverlay = showExitConfirm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-3xl border-2 border-dashed border-slate-800 bg-amber-50 p-6 text-center shadow-xl">
        <p className="text-3xl mb-3" aria-hidden="true">🚪</p>
        <p className="text-base font-extrabold text-amber-800 mb-4">
          Are you sure you want to exit? Your progress in this session will be saved.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={confirmExit}
            className="rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 text-sm font-extrabold text-white shadow-md"
          >
            Yes, Exit
          </button>
          <button
            onClick={() => setShowExitConfirm(false)}
            className="rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-extrabold text-slate-700"
          >
            Continue Practicing
          </button>
        </div>
      </div>
    </div>
  )

  // ── Question type dispatch ───────────────────────────────
  const qProps = {
    questionNumber: currentIndex + 1,
    totalQuestions: sessionData.total_questions,
    onExit: handleExit,
    onNext: handleNext,
  }

  let questionScreen: React.ReactNode = null

  switch (currentQuestion.question_type) {
    case "mcq":
      questionScreen = (
        <MCQQuestionScreen
          key={currentQuestion.id}
          question={currentQuestion as any}
          onAnswer={handleAnswer}
          {...qProps}
        />
      )
      break

    case "truefalse":
      // Render truefalse as MCQ with True/False options
      questionScreen = (
        <MCQQuestionScreen
          key={currentQuestion.id}
          question={{
            ...currentQuestion,
            options: ["True", "False"],
          } as any}
          onAnswer={(selectedOption: string) => handleAnswer(selectedOption === "True")}
          {...qProps}
        />
      )
      break

    case "fill":
      questionScreen = (
        <FillBlankQuestionScreen
          key={currentQuestion.id}
          question={currentQuestion as any}
          onAnswer={handleAnswer}
          {...qProps}
        />
      )
      break

    case "reorder":
      questionScreen = (
        <OrderingQuestionScreen
          key={currentQuestion.id}
          question={currentQuestion as any}
          onAnswer={handleAnswer}
          {...qProps}
        />
      )
      break

    case "matching":
      questionScreen = (
        <MatchingQuestionScreen
          key={currentQuestion.id}
          question={currentQuestion as any}
          onAnswer={handleAnswer}
          {...qProps}
        />
      )
      break

    default:
      questionScreen = (
        <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold text-red-600">
              Unknown question type: {currentQuestion.question_type}
            </p>
            <button onClick={handleNext} className="mt-4 rounded-full bg-blue-500 px-6 py-3 text-white font-bold">
              Skip →
            </button>
          </div>
        </main>
      )
  }

  return (
    <>
      {exitOverlay}
      {questionScreen}
    </>
  )
}

export default function PracticePlayPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-indigo-700 font-medium">Loading practice session...</p>
        </div>
      </main>
    }>
      <PracticePlayContent />
    </Suspense>
  )
}
