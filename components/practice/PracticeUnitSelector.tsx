// PracticeUnitSelector.tsx — Fable design, wired to real API
"use client"

interface PracticeUnit {
  id: number
  unit_no: number
  unit_name: string
  question_count: number
}

const UNIT_DECOR: Record<number, { emoji: string; card: string; gradient: string }> = {
  1: { emoji: "🔢", card: "bg-blue-100", gradient: "from-blue-600 to-purple-600" },
  2: { emoji: "📚", card: "bg-rose-100", gradient: "from-orange-500 to-red-500" },
  3: { emoji: "🔬", card: "bg-emerald-100", gradient: "from-emerald-500 to-teal-600" },
  4: { emoji: "🌍", card: "bg-amber-100", gradient: "from-amber-500 to-orange-600" },
  5: { emoji: "🎨", card: "bg-violet-100", gradient: "from-violet-500 to-purple-600" },
  6: { emoji: "🎵", card: "bg-teal-100", gradient: "from-teal-500 to-cyan-600" },
}

const fallbackDecor = { emoji: "📖", card: "bg-slate-100", gradient: "from-slate-500 to-gray-600" }

export default function PracticeUnitSelector({ units, onStart }: { units: PracticeUnit[]; onStart: (unitId: number) => void }) {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 px-4 py-10 font-sans">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <p className="mb-2 text-4xl" aria-hidden="true">
            {"🏝️ 🦤 🌺"}
          </p>
          <h1 className="text-balance text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {"Practice Time! Pick a Unit! ✨"}
          </h1>
          <p className="mt-2 text-pretty text-lg leading-relaxed text-gray-600">
            {"No marks here — just fun practice at your own pace! 🎓🌴"}
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => {
            const decor = UNIT_DECOR[unit.unit_no] || fallbackDecor
            const hasQuestions = Number(unit.question_count) > 0
            return (
              <li key={unit.id}>
                <div
                  className={`flex h-full flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-gray-800 ${decor.card} p-6 text-center shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-1 ${!hasQuestions ? "opacity-60 grayscale-[30%]" : ""}`}
                >
                  <span className="text-5xl" aria-hidden="true">
                    {decor.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-600">Unit {unit.unit_no}</p>
                    <h2 className="mt-1 text-lg font-extrabold text-gray-900">{unit.unit_name}</h2>
                    <p className="mt-1 text-xs font-semibold text-gray-500">{unit.question_count} questions</p>
                  </div>
                  <button
                    type="button"
                    disabled={!hasQuestions}
                    onClick={() => onStart(unit.id)}
                    className={`mt-auto w-full rounded-full bg-gradient-to-r ${decor.gradient} px-6 py-3 text-base font-extrabold text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800`}
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
