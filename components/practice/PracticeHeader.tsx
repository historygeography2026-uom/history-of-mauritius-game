"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"

interface PracticeHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  isCurrentAnswered: boolean;
  onExit: () => void;
}

export function PracticeHeader({
  currentQuestionIndex,
  totalQuestions,
  isCurrentAnswered,
  onExit,
}: PracticeHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
      <button
        type="button"
        onClick={onExit}
        aria-label="Exit practice"
        className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 shadow-sm active:scale-95"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Segmented progress bar — horizontal broken lines */}
      <div
        className="flex flex-1 items-center gap-1.5"
        role="progressbar"
        aria-valuenow={currentQuestionIndex}
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        aria-label={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
      >
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div key={i} className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={false}
              animate={{ width: i < currentQuestionIndex ? '100%' : i === currentQuestionIndex ? (isCurrentAnswered ? '100%' : '50%') : '0%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        ))}
      </div>
    </header>
  )
}
