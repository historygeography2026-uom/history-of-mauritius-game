// PracticeUnitSelector.tsx — Interactive Practice Unit Selector for Grade 5 & Grade 6
"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, Sparkles, BookOpen } from "lucide-react"

interface PracticeUnit {
  id: number
  unit_no: number
  unit_name: string
  question_count: number
}

const UNIT_DECOR: Record<number, { emoji: string; bgColor: string; borderColor: string; gradient: string }> = {
  1: { emoji: "🏝️", bgColor: "#fef3c7", borderColor: "#f59e0b", gradient: "from-amber-500 to-orange-500" },
  2: { emoji: "🏰", bgColor: "#d1fae5", borderColor: "#10b981", gradient: "from-emerald-500 to-teal-600" },
  3: { emoji: "🗺️", bgColor: "#dbeafe", borderColor: "#3b82f6", gradient: "from-blue-500 to-indigo-600" },
  4: { emoji: "🌋", bgColor: "#ffe4e6", borderColor: "#f43f5e", gradient: "from-rose-500 to-pink-600" },
  5: { emoji: "🌾", bgColor: "#ede9fe", borderColor: "#8b5cf6", gradient: "from-violet-500 to-purple-600" },
  6: { emoji: "📜", bgColor: "#bfdbfe", borderColor: "#2563eb", gradient: "from-blue-600 to-indigo-600" },
  7: { emoji: "📚", bgColor: "#fed7aa", borderColor: "#f97316", gradient: "from-orange-500 to-red-500" },
  8: { emoji: "🔬", bgColor: "#a7f3d0", borderColor: "#059669", gradient: "from-emerald-500 to-teal-600" },
  9: { emoji: "🌍", bgColor: "#cffafe", borderColor: "#0891b2", gradient: "from-cyan-500 to-blue-600" },
  10: { emoji: "🎓", bgColor: "#fbcfe8", borderColor: "#db2777", gradient: "from-fuchsia-500 to-purple-600" },
}

const fallbackDecor = { emoji: "📖", bgColor: "#f1f5f9", borderColor: "#64748b", gradient: "from-slate-500 to-gray-600" }

export default function PracticeUnitSelector({ units, onStart }: { units: PracticeUnit[]; onStart: (unitId: number) => void }) {
  const [selectedGrade, setSelectedGrade] = useState<"all" | "g5" | "g6">("all")

  // Filter units based on grade tab
  const filteredUnits = units.filter((u) => {
    if (selectedGrade === "g5") return u.unit_no >= 1 && u.unit_no <= 5
    if (selectedGrade === "g6") return u.unit_no >= 6 && u.unit_no <= 10
    return true
  })

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Bar */}
        <nav className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-gray-700 ring-2 ring-gray-300 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md hover:scale-105"
          >
            <Home className="h-4 w-4 text-blue-600" />
            Home
          </Link>

          {/* Grade filter tabs */}
          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 ring-2 ring-gray-200 shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedGrade("all")}
              className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold transition-all ${
                selectedGrade === "all"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Units (10)
            </button>
            <button
              type="button"
              onClick={() => setSelectedGrade("g5")}
              className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold transition-all ${
                selectedGrade === "g5"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Grade 5
            </button>
            <button
              type="button"
              onClick={() => setSelectedGrade("g6")}
              className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold transition-all ${
                selectedGrade === "g6"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Grade 6
            </button>
          </div>
        </nav>

        {/* Header */}
        <header className="mb-8 text-center">
          <p className="mb-2 text-4xl" aria-hidden="true">
            {"🏝️ 🦤 🌺"}
          </p>
          <h1 className="text-balance text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {"Practice Time! Pick a Unit! ✨"}
          </h1>
          <p className="mt-2 text-pretty text-base sm:text-lg leading-relaxed text-gray-600">
            {"No marks here — just fun practice at your own pace! 🎓🌴"}
          </p>
        </header>

        {/* Unit Cards Grid */}
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUnits.map((unit) => {
            const decor = UNIT_DECOR[unit.unit_no] || fallbackDecor
            const hasQuestions = Number(unit.question_count) > 0
            const isGrade5 = unit.unit_no <= 5
            const gradeLabel = isGrade5 ? "Grade 5" : "Grade 6"
            const unitIndex = isGrade5 ? unit.unit_no : unit.unit_no - 5

            return (
              <li key={unit.id}>
                <div
                  className={`flex h-full flex-col items-center gap-4 rounded-3xl border-2 border-dashed p-6 text-center shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition-all hover:-translate-y-1 ${
                    !hasQuestions ? "opacity-65" : ""
                  }`}
                  style={{
                    backgroundColor: decor.bgColor,
                    borderColor: decor.borderColor,
                  }}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className="rounded-full border px-3 py-1 text-xs font-extrabold shadow-sm"
                      style={{
                        backgroundColor: "#ffffff",
                        borderColor: decor.borderColor,
                        color: isGrade5 ? "#b45309" : "#047857",
                      }}
                    >
                      {gradeLabel}
                    </span>
                    <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold text-gray-600">
                      Unit {unitIndex}
                    </span>
                  </div>

                  {/* Emoji */}
                  <span className="text-5xl my-1" aria-hidden="true">
                    {decor.emoji}
                  </span>

                  {/* Content */}
                  <div className="w-full">
                    <h2 className="text-lg font-extrabold text-gray-900 leading-snug">
                      {unit.unit_name}
                    </h2>
                    <p className="mt-1.5 text-xs font-bold text-gray-600">
                      {hasQuestions ? (
                        <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          ⭐ {unit.question_count} questions available
                        </span>
                      ) : (
                        <span className="text-gray-500 bg-white/70 px-2.5 py-0.5 rounded-full">
                          Questions coming soon
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    disabled={!hasQuestions}
                    onClick={() => onStart(unit.id)}
                    className={`mt-auto w-full rounded-full bg-gradient-to-r ${decor.gradient} px-6 py-3.5 text-base font-extrabold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
                  >
                    {hasQuestions ? "Start Practice! 🚀" : "Coming Soon ⏳"}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
