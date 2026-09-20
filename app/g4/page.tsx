// app/g4/page.tsx — Grade 4 Practice unit selector, open to all players
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import G4UnitSelector from "@/components/g4/G4UnitSelector"
import { useSession } from "next-auth/react"

interface PracticeUnit {
  id: number
  unit_no: number
  unit_name: string
  question_count: number
}

// Fallback units in case of initial server cold start
const DEFAULT_FALLBACK_UNITS: PracticeUnit[] = [
  { id: 12, unit_no: 11, unit_name: "Working with Maps", question_count: 0 },
  { id: 13, unit_no: 12, unit_name: "Our Natural Environment", question_count: 0 },
  { id: 14, unit_no: 13, unit_name: "Weather", question_count: 0 },
  { id: 15, unit_no: 14, unit_name: "Locality - Past and Present", question_count: 0 },
  { id: 16, unit_no: 15, unit_name: "People Living in our Locality", question_count: 0 },
  { id: 17, unit_no: 16, unit_name: "Voyages of Discovery", question_count: 0 },
]

export default function G4PracticePage() {
  const [units, setUnits] = useState<PracticeUnit[]>(DEFAULT_FALLBACK_UNITS)
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { status } = useSession()

  // Fetch units from API immediately for all visitors with automatic retry
  useEffect(() => {
    let isMounted = true
    const fetchUnits = async () => {
      try {
        const res = await fetch("/api/g4/units")
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            if (Array.isArray(data) && data.length > 0) {
              setUnits(data)
            } else if (data.units && data.units.length > 0) {
              setUnits(data.units)
            }
          }
        }
      } catch (err) {
        console.warn("[G4 Practice] Units fetch fallback to default:", err)
      }
    }
    fetchUnits()
    return () => { isMounted = false }
  }, [])

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
        let errMsg = "Failed to start session"
        try {
          const err = await res.json()
          errMsg = err.error || errMsg
        } catch {}
        throw new Error(errMsg)
      }

      const data = await res.json()
      // Store session data for the play page to retrieve
      try {
        sessionStorage.setItem(`practice_session_${data.session_id}`, JSON.stringify(data))
      } catch (e) {
        console.warn("Could not save to sessionStorage:", e)
      }
      // Navigate to Grade 4 play page
      router.push(`/g4/play?session=${data.session_id}`)
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.")
      setStarting(false)
    }
  }

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex items-center justify-center">
        <p className="text-lg text-slate-600 font-bold">Loading practice units... ⏳</p>
      </main>
    )
  }

  // ── Error with no units ────────────────────────────────
  if (error && units.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 font-bold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-blue-500 px-6 py-3 text-white font-bold"
          >
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
      <G4UnitSelector units={units} onStart={handleStart} />
    </>
  )
}
