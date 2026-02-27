"use client"

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation" // Added useRouter
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Star, ArrowLeft, CheckCircle, Clock, Zap } from "lucide-react"
import MultipleChoiceGame from "@/components/multiple-choice-game"
import MatchingGame from "@/components/matching-game"
import FillInBlanksGame from "@/components/fill-in-blanks-game"
import ReorderGame from "@/components/reorder-game"
import TrueFalseGame from "@/components/true-false-game"
import { useQuestions } from "@/hooks/use-questions"
import { GAME_CONFIG } from "@/lib/game-config"
import { GameConfetti } from "@/components/game-confetti"
import { DodoMascot, getRandomMessage } from "@/components/dodo-mascot"
import { SoundToggle } from "@/components/sound-toggle"
import { useGameSounds, stopAllSounds } from "@/hooks/use-game-sounds"
import { clearAllToastsTimeouts } from "@/hooks/use-toast"
import { DodoTimer } from "@/components/dodo-timer"
import { useAchievements } from "@/hooks/use-achievements"
import { saveProgress } from "@/components/progress-map"
import { useSession } from "next-auth/react"

// Declare subjectNames variable
const subjectNames = {
  history: "History",
  geography: "Geography",
  combined: "Combined",
}

// Questions now come from the database via /api/questions

const GamePage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  // PERF FIX: Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)
  const isUnmountingRef = useRef(false) // Flag to prevent any operations during unmount
  
  const [mixedQuestions, setMixedQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalStars, setTotalStars] = useState(0)
  const [allCompleted, setAllCompleted] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<any>({})
  const [levelTimeLeft, setLevelTimeLeft] = useState(0) // Level-wide timer
  const [levelInitialTime, setLevelInitialTime] = useState(0) // Total time for level
  const [timerPaused, setTimerPaused] = useState(false) // Pause timer when showing results
  // PERF FIX: Refs for timer values so handleQuestionComplete doesn't recreate every second
  const levelTimeLeftRef = useRef(0)
  const levelInitialTimeRef = useRef(0)
  const timerPausedRef = useRef(false) // Ref for timer pause state to avoid closure issues
  const isAdvancingRef = useRef(false) // Guard against rapid-click Continue skipping questions
  const [showTimeoutScreen, setShowTimeoutScreen] = useState(false) // Added state for timeout screen
  const [levelTimedOut, setLevelTimedOut] = useState(false) // Track if level timed out
  const [error, setError] = useState<string | null>(null)
  const [showLevelCompleteConfetti, setShowLevelCompleteConfetti] = useState(false)
  const { playLevelComplete, playStar, setMuted } = useGameSounds()
  const { recordQuestionAnswered, recordLevelCompleted, recordGameStarted } = useAchievements()

  const subject = (searchParams.get("subject") || "history") as string
  const level = searchParams.get("level") || "1"
  const { questions, isLoading: qLoading, error: qError } = useQuestions(subject, level)

  // PERF FIX: Track all pending timeouts/intervals to clear on unmount
  const pendingTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const pendingIntervalsRef = useRef<NodeJS.Timer[]>([])
  const timerIntervalRef = useRef<NodeJS.Timer | null>(null) // Store main timer for direct access
  const abortControllerRef = useRef<AbortController | null>(null) // For canceling fetch requests

  // PERF FIX: Listen for browser back button and immediate cleanup
  useEffect(() => {
    // CRITICAL: Handle browser back button / page unload
    const handleBeforeUnload = () => {
      isUnmountingRef.current = true
      isMountedRef.current = false
      
      // IMMEDIATELY stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      
      // IMMEDIATELY abort requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // IMMEDIATELY cancel speech
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      // IMMEDIATELY stop any playing audio
      try {
        stopAllSounds()
      } catch (e) {
        // ignore
      }
      // IMMEDIATELY clear toast timers
      try {
        clearAllToastsTimeouts()
      } catch (e) {
        // ignore
      }
    }
    
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  // PERF FIX: Cleanup effect to prevent memory leaks from rapid navigation
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true // Set unmounting flag FIRST to block all async ops
      isMountedRef.current = false // Mark component as unmounted
      
      // CRITICAL: Cancel all network requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // CRITICAL: Stop all speech
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      // CRITICAL: Stop all audio immediately
      try {
        stopAllSounds()
      } catch (e) {
        // ignore
      }
      // CRITICAL: Clear toast timers
      try {
        clearAllToastsTimeouts()
      } catch (e) {
        // ignore
      }
      
      // CRITICAL: Clear ALL pending timeouts and intervals immediately
      pendingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      pendingIntervalsRef.current.forEach((interval) => clearInterval(interval))
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      pendingTimeoutsRef.current = []
      pendingIntervalsRef.current = []
      timerIntervalRef.current = null
    }
  }, [])

  // Sync timerPausedRef with timerPaused state to avoid closure issues
  useEffect(() => {
    timerPausedRef.current = timerPaused
  }, [timerPaused])

  useEffect(() => {
    try {
      if (isUnmountingRef.current || !isMountedRef.current) return
      setLoading(true)
      setError(null)
      if (qError) {
        console.error("[v0] useQuestions error:", qError)
        if (isUnmountingRef.current || !isMountedRef.current) return
        setError("Failed to load questions.")
        setLoading(false)
        return
      }
      if (qLoading) {
        console.log("[v0] Still loading questions...")
        return
      }
      console.log("[v0] Questions received:", questions?.length, questions)
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        console.warn("[v0] No questions found for", { subject, level })
        if (isUnmountingRef.current || !isMountedRef.current) return
        setError("No questions found for this subject and level.")
        setLoading(false)
        return
      }
      // Fisher-Yates shuffle for truly random question order
      const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }
      // Randomly select questions from the whole bank for this level
      const shuffled = shuffleArray(questions).slice(0, GAME_CONFIG.QUESTIONS_PER_LEVEL)
      console.log("[v0] Setting mixed questions:", shuffled.length)
      if (isUnmountingRef.current || !isMountedRef.current) return
      setMixedQuestions(shuffled)
      setLoading(false)
    } catch (error: any) {
      if (!isUnmountingRef.current) {
        console.error("[v0] Error loading questions:", error)
        setError(error.message || "Failed to load questions")
        setLoading(false)
      }
    }
  }, [subject, level, questions, qLoading, qError])

  // Initialize level timer and start countdown when questions are loaded
  // PERF FIX: Disable timer during rapid navigation to prevent state updates
  useEffect(() => {
    if (!isMountedRef.current || isUnmountingRef.current || !mixedQuestions.length || allCompleted || levelTimedOut) return
    
    // Calculate total time for level: sum of all question timers, or default timer per question
    const totalTime = mixedQuestions.reduce((sum, q) => sum + (q.timer || GAME_CONFIG.DEFAULT_QUESTION_TIMER), 0)
    if (isMountedRef.current && !isUnmountingRef.current) {
      setLevelInitialTime(totalTime)
      setLevelTimeLeft(totalTime)
    }
    levelInitialTimeRef.current = totalTime
    levelTimeLeftRef.current = totalTime

    // Use local variable to drive countdown — avoids putting levelTimeLeft in deps
    let remaining = totalTime
    const timer = setInterval(() => {
      // CRITICAL: Check unmounting flag FIRST - prevents any state updates during unmount
      if (isUnmountingRef.current || !isMountedRef.current) {
        clearInterval(timer)
        return
      }
      
      // Skip decrementing if timer is paused (waiting to show result)
      if (timerPausedRef.current) {
        return
      }
      
      remaining -= 1
      if (remaining <= 0) {
        clearInterval(timer)
        if (!isUnmountingRef.current && isMountedRef.current) {
          setLevelTimeLeft(0)
          setShowTimeoutScreen(true)
          setLevelTimedOut(true)
        }
      } else {
        if (!isUnmountingRef.current && isMountedRef.current) {
          setLevelTimeLeft(remaining)
        }
        levelTimeLeftRef.current = remaining
      }
    }, 1000)

    timerIntervalRef.current = timer
    pendingIntervalsRef.current.push(timer)
    return () => {
      clearInterval(timer)
      timerIntervalRef.current = null
      pendingIntervalsRef.current = pendingIntervalsRef.current.filter((t) => t !== timer)
    }
  }, [mixedQuestions, allCompleted, levelTimedOut])

  // Handle level timeout - show timeout screen then end exercise
  useEffect(() => {
    if (isUnmountingRef.current || !isMountedRef.current || !showTimeoutScreen || !levelTimedOut) return

    const timeout = setTimeout(() => {
      if (isUnmountingRef.current || !isMountedRef.current) return
      setShowTimeoutScreen(false)
      setAllCompleted(true) // End the exercise, points will be recorded
    }, 3500)

    pendingTimeoutsRef.current.push(timeout)
    return () => {
      clearTimeout(timeout)
      pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter((t) => t !== timeout)
    }
  }, [showTimeoutScreen, levelTimedOut])

  const handleQuestionComplete = useCallback((stars: number) => {
    // CRITICAL: Exit immediately if unmounting to prevent all side effects
    if (isUnmountingRef.current) return
    
    // Guard: Prevent duplicate completion calls for the same question
    if (!mixedQuestions[currentQuestionIndex]) return
    if (answeredQuestions[currentQuestionIndex] !== undefined) return
    if (allCompleted) return
    if (isAdvancingRef.current) return // Block rapid clicks during advancement

    // PAUSE TIMER immediately when question is answered to show result
    timerPausedRef.current = true
    setTimerPaused(true)

    isAdvancingRef.current = true // Lock advancement

    const currentQuestion = mixedQuestions[currentQuestionIndex]
    const isCorrect = stars > 0
    
    // Record question for achievements (ONLY if not unmounting)
    if (!isUnmountingRef.current) {
      recordQuestionAnswered(isCorrect, currentQuestion.type)
    }
    
    setAnsweredQuestions((prev: Record<number, { stars: number; title: string; type: string }>) => ({
      ...prev,
      [currentQuestionIndex]: {
        stars,
        title: currentQuestion.title || "Question",
        type: currentQuestion.type || "unknown",
      },
    }))
    setTotalStars((prev) => prev + stars)
    
    // Play star sound for correct answers (ONLY if not unmounting)
    if (stars > 0 && !isUnmountingRef.current) {
      playStar()
    }

    if (currentQuestionIndex < mixedQuestions.length - 1) {
      // Auto-advance to next question after showing result (2 seconds)
      const timeout = setTimeout(
        () => {
          if (isUnmountingRef.current || !isMountedRef.current) return
          
          // RESUME TIMER before moving to next question
          timerPausedRef.current = false
          setTimerPaused(false)
          
          setCurrentQuestionIndex((prev) => prev + 1)
          isAdvancingRef.current = false // Unlock for next question
        },
        2000, // Show result for 2 seconds then auto-advance
      )
      pendingTimeoutsRef.current.push(timeout)
    } else {
      // Level complete - trigger celebration (ONLY if not unmounting)
      if (!isUnmountingRef.current) {
        setShowLevelCompleteConfetti(true)
        playLevelComplete()
        const finalStars = totalStars + stars
        const maxPossibleStars = mixedQuestions.length * 3 // Assuming max 3 stars per question
        const timeRemainingPercent = (levelTimeLeftRef.current / levelInitialTimeRef.current) * 100
        recordLevelCompleted(subject, finalStars, maxPossibleStars, timeRemainingPercent)
        // Persist progress to localStorage for level unlock & star retention
        saveProgress(subject, parseInt(level), finalStars, true)
        setAllCompleted(true)
      }
      isAdvancingRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, mixedQuestions, allCompleted, answeredQuestions, totalStars, subject])

  // Persist results to leaderboard when all questions are completed or level times out
  // PERF FIX: Only trigger on allCompleted to avoid running on every answered question
  useEffect(() => {
    if (isUnmountingRef.current || !isMountedRef.current || !allCompleted) return
    // Also save progress to localStorage on timeout (partial completion)
    if (levelTimedOut) {
      saveProgress(subject, parseInt(level), totalStars, false)
    }
    const persistResults = async () => {
      if (isUnmountingRef.current || !isMountedRef.current) return
      try {
        // CRITICAL: Create fresh AbortController for this fetch
        const controller = new AbortController()
        abortControllerRef.current = controller
        
        // Points model: configurable points per star
        const total_points = totalStars * GAME_CONFIG.POINTS_PER_STAR
        const questionsCompleted = Object.keys(answeredQuestions).length
        const totalQuestions = mixedQuestions.length
        const playerName = session?.user?.name || "Guest"
        const userId = session?.user?.id || null
        
        await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            player_name: playerName,
            user_id: userId,
            subject,
            level,
            stars_earned: totalStars,
            total_points,
            questions_completed: questionsCompleted,
            total_questions: totalQuestions,
            timed_out: levelTimedOut,
          }),
        })
      } catch (e) {
        // Ignore AbortError - it's expected during navigation
        if (e instanceof Error && e.name === "AbortError") return
        if (!isUnmountingRef.current && isMountedRef.current) {
          console.error("[v0] Failed to save leaderboard entry", e)
        }
      }
    }
    void persistResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCompleted])

  const TimeoutScreen = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <Card className="border-4 border-red-500 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-12 text-center max-w-md">
        {/* Lightning icon */}
        <div className="relative mb-8 h-24 flex items-center justify-center">
          <Zap className="h-20 w-20 text-red-600" />
        </div>

        {/* Time's Up message */}
        <h2 className="mb-2 text-5xl font-black text-red-600">⏰ Time's Up!</h2>

        {/* Encouraging message for level timeout */}
        <div className="space-y-3 mb-6">
          <p className="text-2xl font-bold text-orange-600">Level Complete! 🎮</p>
          <p className="text-lg text-gray-700">
            You completed {Object.keys(answeredQuestions).length} of {mixedQuestions.length} questions!
          </p>
          <p className="text-xl font-bold text-secondary">
            ⭐ {totalStars} stars earned!
          </p>
          <p className="text-sm text-gray-600">Recording your score...</p>
        </div>

        {/* Progress indicator - static dots */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-full bg-red-400"
            />
          ))}
        </div>
      </Card>
    </div>
  )

  // PERF FIX: Stable callback refs to prevent child re-renders
  const noopCallback = useCallback(() => {}, [])

  // PERF FIX: Memoize progress percentage to avoid recalculation
  const progressPercent = useMemo(
    () => mixedQuestions.length > 0 ? ((currentQuestionIndex + 1) / mixedQuestions.length) * 100 : 0,
    [currentQuestionIndex, mixedQuestions.length]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-lg">Loading questions...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center border-red-500">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </Card>
      </div>
    )
  }

  if (allCompleted) {
    // Calculate accumulated stars across all levels for this subject
    const savedProgress = typeof window !== "undefined" ? localStorage.getItem(`progress_${subject}`) : null
    const progress = savedProgress ? JSON.parse(savedProgress) : {}
    const previousAccumulatedStars = Object.entries(progress)
      .filter(([lvl]) => lvl !== level) // Exclude current level (will add current below)
      .reduce((sum, [, data]: [string, any]) => sum + (data?.stars || 0), 0)
    const currentLevelBestStars = Math.max(progress[level]?.stars || 0, totalStars)
    const totalAccumulatedStars = previousAccumulatedStars + currentLevelBestStars

    return (
      <>
        <GameConfetti trigger={showLevelCompleteConfetti} type="levelComplete" duration={5000} />
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4 md:p-8">
          {/* PERF FIX: Removed GPU-heavy blobs from completion screen too */}

          <div className="mx-auto max-w-2xl relative z-10">
            <Button onClick={() => {
              // CRITICAL: Force cleanup BEFORE navigation
              isUnmountingRef.current = true
              isMountedRef.current = false
              
              // IMMEDIATELY clear timer
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
                timerIntervalRef.current = null
              }
              
              // IMMEDIATELY abort requests
              if (abortControllerRef.current) {
                abortControllerRef.current.abort()
              }
              
              // IMMEDIATELY cancel speech
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel()
              }
              
              // NOW safe to navigate
              router.push("/")
            }} className="mb-6 bg-gradient-to-r from-secondary via-secondary/80 to-secondary hover:shadow-lg hover:shadow-secondary/50 text-white font-bold transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3">
              {/* Changed window.history.back to router.push("/") */}
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform hover:translate-x-1" />
              🏠 Back to Home
            </Button>

            <Card className="border-4 border-secondary/50 bg-gradient-to-br from-secondary/20 to-accent/20 p-8 text-center animate-pop-in relative overflow-visible">
              {/* Celebrating Mascot */}
              <div className="absolute -top-16 right-4">
                <DodoMascot mood="celebrating" size="lg" showSpeechBubble speechText={getRandomMessage("levelComplete")} />
              </div>
              
              <Trophy className="mx-auto mb-6 h-24 w-24 text-secondary animate-bounce-gentle" />
              <h1 className="mb-4 text-4xl font-bold text-primary">
                {levelTimedOut ? "⏰ Time's Up!" : "🎉 Level Complete!"}
              </h1>
            <p className="mb-6 text-xl text-card-foreground">
              {levelTimedOut 
                ? `You completed ${Object.keys(answeredQuestions).length} of ${mixedQuestions.length} questions for ${subjectNames[subject as keyof typeof subjectNames] || subject} - Level ${level}!`
                : `Congratulations! You've completed all questions for ${subjectNames[subject as keyof typeof subjectNames] || subject} - Level ${level}!`
              }
            </p>

            <div className="mb-8 space-y-3">
              {mixedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between rounded-lg bg-white/50 p-4 animate-pop-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-bold text-card-foreground">
                      Question {index + 1} - {answeredQuestions[index]?.title || "Unknown"}{" "}
                      {/* Added fallback for title */}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-secondary text-secondary" />
                    <span className="font-bold text-secondary">{answeredQuestions[index]?.stars || 0}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* This Level Stars */}
            <div className="mb-4 rounded-xl bg-gradient-to-r from-secondary to-primary p-6">
              <p className="mb-2 text-sm text-secondary-foreground">Stars Earned This Level</p>
              <div className="flex items-center justify-center gap-3">
                <Star className="h-10 w-10 fill-secondary text-secondary animate-wiggle" />
                <span className="text-5xl font-bold text-white">{totalStars}</span>
              </div>
            </div>

            {/* Accumulated Stars Across All Levels */}
            <div className="mb-8 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 p-5">
              <p className="mb-2 text-sm text-white/90">Total Accumulated Stars ({subjectNames[subject as keyof typeof subjectNames] || subject})</p>
              <div className="flex items-center justify-center gap-3">
                <Trophy className="h-8 w-8 text-white animate-bounce-gentle" />
                <span className="text-4xl font-bold text-white">{totalAccumulatedStars}</span>
                <Star className="h-8 w-8 fill-white text-white" />
              </div>
            </div>

            <Button
              onClick={() => router.push("/")} // Changed window.history.back to router.push("/")
              className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 py-8 text-2xl font-bold rounded-2xl shadow-lg"
            >
              🏠 Back to Home
            </Button>
            <Button
              onClick={() => router.push("/history")}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 py-4 text-lg font-bold rounded-2xl shadow-lg mt-3"
            >
              📊 View My Progress
            </Button>
          </Card>
        </div>
      </div>
      </>
    )
  }

  if (mixedQuestions.length === 0) {
    return null
  }

  // Safety check: if currentQuestionIndex is out of bounds, show completion screen
  if (currentQuestionIndex >= mixedQuestions.length) {
    return null
  }

  const currentQuestion = mixedQuestions[currentQuestionIndex]

  // Additional safety: if no current question, don't render
  if (!currentQuestion) {
    return null
  }

  const renderQuestion = () => {
    switch (currentQuestion?.type) {
      case "mcq":
        return <MultipleChoiceGame onComplete={handleQuestionComplete} onBack={noopCallback} question={currentQuestion} />
      case "matching":
        return <MatchingGame onComplete={handleQuestionComplete} onBack={noopCallback} question={currentQuestion} />
      case "fill":
        return <FillInBlanksGame onComplete={handleQuestionComplete} onBack={noopCallback} question={currentQuestion} />
      case "reorder":
        return <ReorderGame onComplete={handleQuestionComplete} onBack={noopCallback} question={currentQuestion} />
      case "truefalse":
        return <TrueFalseGame onComplete={handleQuestionComplete} onBack={noopCallback} question={currentQuestion} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      {/* PERF FIX: Removed GPU-heavy background blobs (blur-3xl + mix-blend-multiply × 3)
          that caused browser freeze when combined with timer re-renders every second */}

      <div className="relative z-10">
        <div className="bg-white/80 backdrop-blur-sm sticky top-0 p-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-lg font-bold text-primary">
                  Question {currentQuestionIndex + 1} of {mixedQuestions.length}
                </p>
                {/* Sound Toggle */}
                <SoundToggle onToggle={setMuted} />
              </div>
              <div className="flex items-center gap-6">
                <DodoTimer
                  timeLeft={levelTimeLeft}
                  initialTime={levelInitialTime}
                  onTimeUp={noopCallback}
                />
                <div className="flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-3">
                  <Star className="h-6 w-6 fill-secondary text-secondary" />
                  <span className="text-xl font-bold text-secondary">{totalStars}</span>
                </div>
              </div>
            </div>

            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Game container - compact, no-scroll on desktop */}
        <div className="p-2 md:p-4 flex items-start justify-center">
          <div className="w-full max-w-4xl">
            {showTimeoutScreen && <TimeoutScreen />} {/* Conditionally render TimeoutScreen */}
            {renderQuestion()}
          </div>
        </div>
      </div>
    </div>
  )
}

const CountdownTimer = ({
  timeLeft,
  initialTime,
  onTimeUp,
}: { timeLeft: number; initialTime: number; onTimeUp: () => void }) => {
  const percentage = (timeLeft / initialTime) * 100
  const isWarning = percentage < 30
  const isCritical = percentage < 10

  // Format time as MM:SS for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${secs}`
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-24 h-24">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          {/* Animated progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#3b82f6"}
            strokeWidth="3"
            strokeDasharray={`${(percentage / 100) * 282.7} 282.7`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        {/* Timer text in center */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center`}
        >
          <Clock
            className={`h-5 w-5 mb-1 ${isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-500"}`}
          />
          <span
            className={`text-xl font-bold ${
              isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-600"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-gray-600 mt-0.5">
            {timeLeft >= 60 ? "min" : "sec"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default GamePage
