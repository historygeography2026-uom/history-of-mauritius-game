// app/practice/page.tsx — Practice unit selector, wired to real API
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import PracticeUnitSelector from "@/components/practice/PracticeUnitSelector"

interface PracticeUnit {
  id: number
  unit_no: number
  unit_name: string
  question_count: number
}

export default function PracticePage() {
  const [units, setUnits] = useState<PracticeUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { data: session, status } = useSession()

  // Fetch units from API
  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false)
      return
    }

    fetch("/api/practice/units")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUnits(data)
        } else if (data.units) {
          setUnits(data.units)
        }
      })
      .catch(() => setError("Failed to load units"))
      .finally(() => setLoading(false))
  }, [status])

  const handleStart = async (unitId: number) => {
    if (starting) return
    setStarting(true)
    setError("")

    try {
      const res = await fetch("/api/practice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit_id: unitId }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to start session")
      }

      const data = await res.json()
      // Store session data for the play page to retrieve
      sessionStorage.setItem(`practice_session_${data.session_id}`, JSON.stringify(data))
      // Navigate to play page
      router.push(`/practice/play?session=${data.session_id}`)
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.")
      setStarting(false)
    }
  }

  // ── Loading state ──────────────────────────────────────
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex items-center justify-center">
        <p className="text-lg text-slate-600 font-bold">Loading practice units... ⏳</p>
      </main>
    )
  }

  // ── Unauthenticated: show kid-friendly Login Required prompt ─────────
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex items-center justify-center p-4 font-sans">
        <section className="rounded-3xl border-4 border-indigo-200 bg-white p-8 text-center max-w-md w-full shadow-2xl">
          <div className="text-6xl mb-3 animate-bounce">🔒</div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Login Required!</h2>
          <p className="text-slate-600 mb-6 text-sm sm:text-base leading-relaxed">
            You need to <span className="font-extrabold text-blue-600">register or log in</span> to attempt questions. Create a free account to start playing and track your progress!
          </p>

          <div className="flex flex-col gap-3 justify-center">
            <button
              type="button"
              onClick={() => router.push("/auth/sign-up")}
              className="w-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black px-6 py-3.5 shadow-lg transition-all hover:scale-105"
            >
              🚀 Register for Free
            </button>
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black px-6 py-3.5 shadow-lg transition-all hover:scale-105"
            >
              🔑 Log In
            </button>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/practice" })}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-black text-slate-700 ring-2 ring-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 text-xs sm:text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
          >
            ← Back to Home
          </button>
        </section>
      </main>
    )
  }

  // ── Error with no units ────────────────────────────────
  if (error && units.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 font-bold mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="rounded-full bg-blue-500 px-6 py-3 text-white font-bold">
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm font-bold text-red-700 shadow-lg">
          {error}
        </div>
      )}
      {starting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="text-2xl mb-2">🚀</p>
            <p className="font-bold text-slate-700">Starting your practice session...</p>
          </div>
        </div>
      )}
      <PracticeUnitSelector units={units} onStart={handleStart} />
    </>
  )
}
