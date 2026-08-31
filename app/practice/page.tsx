// app/practice/page.tsx — Practice unit selector, open to all players
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PracticeUnitSelector from "@/components/practice/PracticeUnitSelector"

import { useSession } from "next-auth/react"

interface PracticeUnit {
  id: number
  unit_no: number
  unit_name: string
  question_count: number
}

// Fallback units in case of initial server cold start
const DEFAULT_FALLBACK_UNITS: PracticeUnit[] = [
  { id: 7, unit_no: 1, unit_name: "Our Natural Environment", question_count: 191 },
  { id: 8, unit_no: 2, unit_name: "Discovery of Mauritius & Rodrigues", question_count: 186 },
  { id: 9, unit_no: 3, unit_name: "Settlement in Mauritius", question_count: 173 },
  { id: 10, unit_no: 4, unit_name: "Weather and Climate", question_count: 190 },
  { id: 11, unit_no: 5, unit_name: "Port Louis: the capital of Mauritius", question_count: 150 },
  { id: 1, unit_no: 6, unit_name: "Land Use", question_count: 151 },
  { id: 2, unit_no: 7, unit_name: "People in the island in the past", question_count: 152 },
  { id: 3, unit_no: 8, unit_name: "Natural Hazards", question_count: 165 },
  { id: 4, unit_no: 9, unit_name: "Celebrating Independence", question_count: 160 },
  { id: 5, unit_no: 10, unit_name: "Our Heritage", question_count: 174 },
]

export default function PracticePage() {
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
        const res = await fetch("/api/practice/units")
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
        console.warn("[Practice] Units fetch fallback to default:", err)
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
      // Navigate to play page
      router.push(`/practice/play?session=${data.session_id}`)
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
      <PracticeUnitSelector units={units} onStart={handleStart} />
    </>
  )
}
