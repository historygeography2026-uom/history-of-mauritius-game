// PracticeUnitSelector.tsx — Kids Gaming Interface with 3D Tilt Quest Cards (Pure React & CSS, 0 extra libraries)
"use client"

import { useState, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Home,
  Sparkles,
  Rocket,
  Lock,
  Star,
  TreePalm,
  Castle,
  Map,
  Flame,
  Wheat,
  ScrollText,
  BookOpen,
  Microscope,
  Globe2,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"

interface PracticeUnit {
  id: number
  unit_no: number
  unit_name: string
  question_count: number
}

interface UnitTheming {
  icon: LucideIcon
  gradient: string
  tint: string
  glow: string
  shadow: string
}

const UNIT_THEMES: Record<number, UnitTheming> = {
  1: {
    icon: TreePalm,
    gradient: "from-amber-400 to-orange-500",
    tint: "bg-amber-100/80",
    glow: "shadow-amber-400/30",
    shadow: "shadow-orange-600",
  },
  2: {
    icon: Castle,
    gradient: "from-emerald-400 to-teal-500",
    tint: "bg-emerald-100/80",
    glow: "shadow-emerald-400/30",
    shadow: "shadow-teal-600",
  },
  3: {
    icon: Map,
    gradient: "from-sky-400 to-blue-500",
    tint: "bg-sky-100/80",
    glow: "shadow-sky-400/30",
    shadow: "shadow-blue-600",
  },
  4: {
    icon: Flame,
    gradient: "from-rose-400 to-red-500",
    tint: "bg-rose-100/80",
    glow: "shadow-rose-400/30",
    shadow: "shadow-red-600",
  },
  5: {
    icon: Wheat,
    gradient: "from-violet-400 to-purple-500",
    tint: "bg-violet-100/80",
    glow: "shadow-violet-400/30",
    shadow: "shadow-purple-600",
  },
  6: {
    icon: ScrollText,
    gradient: "from-blue-500 to-indigo-600",
    tint: "bg-blue-100/80",
    glow: "shadow-blue-500/40",
    shadow: "shadow-indigo-700",
  },
  7: {
    icon: BookOpen,
    gradient: "from-orange-500 to-red-500",
    tint: "bg-orange-100/80",
    glow: "shadow-orange-500/40",
    shadow: "shadow-red-600",
  },
  8: {
    icon: Microscope,
    gradient: "from-emerald-500 to-teal-600",
    tint: "bg-emerald-100/80",
    glow: "shadow-emerald-500/40",
    shadow: "shadow-teal-700",
  },
  9: {
    icon: Globe2,
    gradient: "from-cyan-400 to-sky-500",
    tint: "bg-cyan-100/80",
    glow: "shadow-cyan-400/30",
    shadow: "shadow-sky-600",
  },
  10: {
    icon: GraduationCap,
    gradient: "from-pink-400 to-rose-500",
    tint: "bg-pink-100/80",
    glow: "shadow-pink-400/30",
    shadow: "shadow-rose-600",
  },
}

const DEFAULT_THEME: UnitTheming = {
  icon: BookOpen,
  gradient: "from-blue-500 to-indigo-600",
  tint: "bg-blue-100/80",
  glow: "shadow-blue-500/40",
  shadow: "shadow-indigo-600",
}

const TITLE_WORDS = ["Pick", "Your", "Adventure!"]

// 3D Tilt Quest Card Component with pure React state
function QuestUnitCard({
  unit,
  onStart,
}: {
  unit: PracticeUnit
  onStart: (unitId: number) => void
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const count = Number(unit.question_count) || 0
  const isReady = count > 0
  const isGrade5 = unit.unit_no <= 5
  const gradeNumber = isGrade5 ? 5 : 6
  const relativeUnitNo = isGrade5 ? unit.unit_no : unit.unit_no - 5
  const theme = UNIT_THEMES[unit.unit_no] || DEFAULT_THEME
  const Icon = theme.icon

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - y) * 12
    const ry = (x - 0.5) * 12
    setTilt({ rx, ry })
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0 })
    setIsHovered(false)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-6px) scale(1.025)`
          : "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)",
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
      }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 bg-white ${
        isReady
          ? `border-slate-800/10 shadow-xl ${theme.glow}`
          : "border-dashed border-slate-800/15 shadow-md shadow-slate-900/5"
      }`}
    >
      {/* Tinted Top Banner with Floating Icon */}
      <div className={`relative flex flex-col items-center gap-2 px-5 pt-6 pb-4 ${theme.tint}`}>
        {/* Badges */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <span className="rounded-full bg-white/90 px-3 py-1 font-sans text-xs font-black text-slate-800 shadow-xs">
            Grade {gradeNumber}
          </span>
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 font-sans text-xs font-black shadow-xs ${
              isReady
                ? `bg-gradient-to-r ${theme.gradient} text-white`
                : "bg-white/80 text-slate-600"
            }`}
          >
            {!isReady && <Lock className="h-3 w-3" aria-hidden="true" />}
            Unit {relativeUnitNo}
          </span>
        </div>

        {/* Icon Bubble */}
        <div
          className={`mt-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br ${theme.gradient} shadow-lg ${theme.glow} transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${
            isReady ? "animate-pulse" : ""
          }`}
        >
          <Icon className="h-10 w-10 text-white" strokeWidth={2.2} aria-hidden="true" />
        </div>

        {/* Scalloped Wave Edge Transition */}
        <svg
          viewBox="0 0 320 16"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-4 w-full text-white"
          aria-hidden="true"
        >
          <path
            d="M0 16 Q20 0 40 16 T80 16 T120 16 T160 16 T200 16 T240 16 T280 16 T320 16 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col items-center gap-3 px-5 pt-3 pb-5 text-center">
        <h2 className="text-xl font-black text-slate-900 leading-snug">{unit.unit_name}</h2>

        {isReady ? (
          <p className="flex items-center gap-1.5 rounded-full bg-amber-100/70 px-3.5 py-1 text-xs sm:text-sm font-black text-amber-900 border border-amber-200">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden="true" />
            {count} questions ready
          </p>
        ) : (
          <p className="rounded-full bg-slate-100 px-3.5 py-1 text-xs sm:text-sm font-bold text-slate-500">
            New quest hatching soon 🐣
          </p>
        )}

        {/* Action Button */}
        <div className="mt-auto w-full pt-3">
          {isReady ? (
            <button
              type="button"
              onClick={() => onStart(unit.id)}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${theme.gradient} px-4 py-3.5 text-base font-black text-white shadow-[0_5px_0_0] ${theme.shadow} transition-all hover:brightness-110 active:translate-y-1 active:shadow-[0_1px_0_0]`}
            >
              Start Quest
              <Rocket
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-12"
                aria-hidden="true"
              />
            </button>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3.5 text-base font-bold text-slate-400">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Locked
            </div>
          )}
        </div>
      </div>

      {/* Hover glow sweep */}
      {isReady && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      )}
    </div>
  )
}

export default function PracticeUnitSelector({
  units,
  onStart,
}: {
  units: PracticeUnit[]
  onStart: (unitId: number) => void
}) {
  const [filter, setFilter] = useState<"all" | "g5" | "g6">("all")

  const readyCount = useMemo(
    () => units.filter((u) => Number(u.question_count) > 0).length,
    [units]
  )

  const counts = useMemo(
    () => ({
      all: units.length,
      g5: units.filter((u) => u.unit_no <= 5).length,
      g6: units.filter((u) => u.unit_no >= 6 && u.unit_no <= 10).length,
    }),
    [units]
  )

  const visibleUnits = useMemo(() => {
    if (filter === "g5") return units.filter((u) => u.unit_no <= 5)
    if (filter === "g6") return units.filter((u) => u.unit_no >= 6 && u.unit_no <= 10)
    return units
  }, [units, filter])

  return (
    <div className="relative z-10 min-h-screen font-sans">
      {/* Hero Header */}
      <header className="relative">
        {/* Top bar */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-5">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-5 py-2 font-black text-slate-700 shadow-sm transition-all hover:border-teal-400 hover:scale-105"
          >
            <Home className="h-4 w-4 text-teal-600" aria-hidden="true" />
            Home
          </Link>

          <div className="flex items-center gap-2 rounded-full bg-amber-100/80 px-4 py-2 text-sm font-black text-amber-900 border border-amber-200 shadow-xs">
            <Sparkles className="h-4 w-4 text-orange-500" aria-hidden="true" />
            {readyCount} of {units.length} quests ready
          </div>
        </div>

        {/* Hero Banner with Floating Dodo Mascot */}
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pt-8 pb-4 text-center sm:flex-row sm:text-left">
          {/* Floating Dodo Mascot */}
          <div className="relative shrink-0">
            <div className="animate-bounce" style={{ animationDuration: "3s" }}>
              <Image
                src="/images/dodo-mascot.png"
                alt="Dodo the practice buddy, waving hello"
                width={160}
                height={160}
                priority
                className="h-auto w-36 sm:w-44 object-contain drop-shadow-xl"
              />
            </div>
            {/* Speech bubble */}
            <div className="absolute -top-2 -right-8 hidden rounded-2xl rounded-bl-sm bg-white px-3.5 py-1.5 text-xs sm:text-sm font-black text-slate-800 shadow-lg border border-slate-100 sm:block">
              {"Let\u2019s play! 🚀"}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-start">
            <span className="rounded-full bg-teal-100/90 px-4 py-1 text-xs font-black tracking-wider text-teal-800 uppercase border border-teal-200">
              🏝️ Practice Island
            </span>

            <h1 className="text-4xl font-black text-slate-900 sm:text-6xl tracking-tight">
              {TITLE_WORDS.map((word, i) => (
                <span
                  key={word}
                  className={`inline-block ${i > 0 ? "ml-3" : ""} ${
                    word === "Adventure!"
                      ? "bg-gradient-to-r from-teal-500 via-orange-500 to-amber-500 bg-clip-text text-transparent"
                      : ""
                  }`}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p className="max-w-md font-bold text-slate-600 text-sm sm:text-base leading-relaxed">
              No marks, no pressure — just fun quests at your own pace. Pick a unit and start exploring! 🌴
            </p>
          </div>
        </div>
      </header>

      {/* Grade Filter Bar */}
      <section aria-label="Practice units" className="mx-auto max-w-6xl px-4 pt-4 pb-20">
        <div
          role="tablist"
          aria-label="Filter units by grade"
          className="mx-auto flex w-fit items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white p-1.5 shadow-[0_5px_0_0] shadow-slate-200"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
            className={`relative rounded-full px-5 py-2 text-xs sm:text-sm font-black transition-all ${
              filter === "all"
                ? "bg-gradient-to-r from-teal-500 to-orange-500 text-white shadow-md scale-105"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-1.5">
              All Quests
              <span
                className={`rounded-full px-2 py-0.5 text-[0.65rem] leading-none font-extrabold ${
                  filter === "all" ? "bg-white/30 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {counts.all}
              </span>
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === "g5"}
            onClick={() => setFilter("g5")}
            className={`relative rounded-full px-5 py-2 text-xs sm:text-sm font-black transition-all ${
              filter === "g5"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-1.5">
              Grade 5
              <span
                className={`rounded-full px-2 py-0.5 text-[0.65rem] leading-none font-extrabold ${
                  filter === "g5" ? "bg-white/30 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {counts.g5}
              </span>
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === "g6"}
            onClick={() => setFilter("g6")}
            className={`relative rounded-full px-5 py-2 text-xs sm:text-sm font-black transition-all ${
              filter === "g6"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md scale-105"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-1.5">
              Grade 6
              <span
                className={`rounded-full px-2 py-0.5 text-[0.65rem] leading-none font-extrabold ${
                  filter === "g6" ? "bg-white/30 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {counts.g6}
              </span>
            </span>
          </button>
        </div>

        {/* 3D Quest Cards Grid */}
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleUnits.map((unit) => (
            <li key={unit.id}>
              <QuestUnitCard unit={unit} onStart={onStart} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
