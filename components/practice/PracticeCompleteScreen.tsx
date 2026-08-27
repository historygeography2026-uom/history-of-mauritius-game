// PracticeCompleteScreen.tsx — Fable design, no modifications needed
"use client"

import { Home, PartyPopper, RotateCcw, Star } from "lucide-react"

interface PracticeCompleteScreenProps {
  unit: { unit_no: number; unit_name: string }
  onPracticeAgain: () => void
  onBackToUnits: () => void
}

export default function PracticeCompleteScreen({ unit, onPracticeAgain, onBackToUnits }: PracticeCompleteScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-100 via-white to-amber-50 px-4 py-6 sm:py-10 font-sans">
      <section aria-labelledby="complete-heading" className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 text-center shadow-lg ring-2 ring-sky-200">
        <div className="mx-auto mb-3 sm:mb-6 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-amber-200 text-amber-600 shadow-sm">
          <PartyPopper className="h-8 w-8 sm:h-12 sm:w-12" aria-hidden="true" />
        </div>

        <div className="mb-2 sm:mb-4 flex items-center justify-center gap-1 text-amber-500" aria-hidden="true">
          <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
          <Star className="h-7 w-7 sm:h-8 sm:w-8 fill-current" />
          <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
        </div>

        <h1 id="complete-heading" className="text-balance text-2xl sm:text-3xl font-extrabold text-gray-900">
          You did it! 🎉
        </h1>
        <p className="mt-2 sm:mt-3 text-pretty text-sm sm:text-base leading-relaxed text-gray-600">
          You finished practicing <span className="font-bold text-gray-900">{unit?.unit_name || "this unit"}</span>.
          Every practice makes your brain stronger. Keep it up!
        </p>

        <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onPracticeAgain}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 sm:py-4 text-base sm:text-lg font-extrabold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Practice Again
          </button>
          <button
            type="button"
            onClick={onBackToUnits}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 sm:py-4 text-base sm:text-lg font-extrabold text-gray-800 ring-2 ring-gray-300 transition-all hover:bg-gray-100 hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            Back to Units
          </button>
        </div>
      </section>
    </main>
  )
}
