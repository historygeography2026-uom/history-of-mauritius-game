// app/practice/page.tsx — Practice unit selector (Open access for testing)
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

  // Fetch units from API immediately on mount (open access)
  useEffect(() => {
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
