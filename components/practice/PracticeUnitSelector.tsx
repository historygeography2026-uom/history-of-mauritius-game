// PracticeUnitSelector.tsx — Polished Kids Gaming Interface with Baloo 2 typography, Framer Motion, and 3D Arcade Cards
"use client"

import { useState, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import {
  Home,
  Sparkles,
  Rocket,
  Lock,
  Star,
} from "lucide-react"

import {
  IllusNature,
  IllusDiscovery,
  IllusSettlement,
  IllusWeather,
  IllusCapital,
  IllusLandUse,
  IllusPeople,
  IllusHazards,
  IllusIndependence,
  IllusHeritage
} from "./UnitIllustrations"

interface PracticeUnit {
  id: number
  unit_no: number
  unit_name: string
  question_count: number
}

interface UnitTheming {
  title: string
  icon: React.ElementType
  gradient: string
  tint: string
  glow: string
  shadow: string
}

// 10 Named Quest Adventures with curated tropical palettes
const UNIT_CONFIGS: Record<number, UnitTheming> = {
  // Grade 5
  1: {
    title: "Our Natural Environment",
    icon: IllusNature,
    gradient: "from-amber-400 to-orange-500",
    tint: "bg-amber-100",
    glow: "shadow-amber-400/40",
    shadow: "shadow-orange-600",
  },
  2: {
    title: "Discovery of Mauritius & Rodrigues",
    icon: IllusDiscovery,
    gradient: "from-emerald-400 to-teal-500",
    tint: "bg-emerald-100",
    glow: "shadow-emerald-400/40",
    shadow: "shadow-teal-600",
  },
  3: {
    title: "Settlement in Mauritius",
    icon: IllusSettlement,
    gradient: "from-sky-400 to-blue-500",
    tint: "bg-sky-100",
    glow: "shadow-sky-400/40",
    shadow: "shadow-blue-600",
  },
  4: {
    title: "Weather and Climate",
    icon: IllusWeather,
    gradient: "from-rose-400 to-red-500",
    tint: "bg-rose-100",
    glow: "shadow-rose-400/40",
    shadow: "shadow-red-600",
  },
  5: {
    title: "Port Louis: the capital of Mauritius",
    icon: IllusCapital,
    gradient: "from-violet-400 to-purple-500",
    tint: "bg-violet-100",
    glow: "shadow-violet-400/40",
    shadow: "shadow-purple-600",
  },
  // Grade 6
  6: {
    title: "Land Use",
    icon: IllusLandUse,
    gradient: "from-blue-500 to-indigo-600",
    tint: "bg-blue-100",
    glow: "shadow-blue-500/50",
    shadow: "shadow-indigo-700",
  },
  7: {
    title: "People in the island in the past",
    icon: IllusPeople,
    gradient: "from-orange-500 to-red-500",
    tint: "bg-orange-100",
    glow: "shadow-orange-500/50",
    shadow: "shadow-red-600",
  },
  8: {
    title: "Natural Hazards",
    icon: IllusHazards,
    gradient: "from-emerald-500 to-teal-600",
    tint: "bg-emerald-100",
    glow: "shadow-emerald-500/50",
    shadow: "shadow-teal-700",
  },
  9: {
    title: "Celebrating Independence",
    icon: IllusIndependence,
    gradient: "from-cyan-400 to-sky-500",
    tint: "bg-cyan-100",
    glow: "shadow-cyan-400/40",
    shadow: "shadow-sky-600",
  },
  10: {
    title: "Our Heritage",
    icon: IllusHeritage,
    gradient: "from-pink-400 to-rose-500",
    tint: "bg-pink-100",
    glow: "shadow-pink-400/40",
    shadow: "shadow-rose-600",
  },
}

const DEFAULT_CONFIG: UnitTheming = {
  title: "Adventure Quest",
  icon: IllusHeritage,
  gradient: "from-blue-500 to-indigo-600",
  tint: "bg-blue-100",
  glow: "shadow-blue-500/40",
  shadow: "shadow-indigo-600",
}

const TITLE_WORDS = ["Pick", "Your", "Adventure!"]

// 3D Interactive Quest Card Component
function UnitQuestCard({
  unit,
  onStart,
}: {
  unit: PracticeUnit
  onStart: (unitId: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const count = Number(unit.question_count) || 0
  const isReady = count > 0
  const isGrade5 = unit.unit_no <= 5
  const gradeNumber = isGrade5 ? 5 : 6
  const relativeUnitNo = isGrade5 ? unit.unit_no : unit.unit_no - 5
  const config = UNIT_CONFIGS[unit.unit_no] || DEFAULT_CONFIG
  const Icon = config.icon

  // Framer motion 3D tilt tracking
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 250, damping: 20 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 250, damping: 20 })

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  function resetTilt() {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      layout
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ scale: 1.03, y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 bg-white ${
        isReady
          ? `border-white shadow-xl ${config.glow}`
          : "border-dashed border-slate-800/15 shadow-md shadow-slate-900/5 opacity-90"
      }`}
    >
      {/* Pastel-Tinted Top Banner with Floating Icon Bubble */}
      <div className={`relative flex flex-col items-center gap-2 px-5 pt-6 pb-4 ${config.tint}`}>
        {/* Badges */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <span className="rounded-full bg-white/90 px-3 py-1 font-display text-xs font-bold text-slate-800 shadow-sm">
            Grade {gradeNumber}
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-bold shadow-sm ${
              isReady
                ? `bg-gradient-to-r ${config.gradient} text-white`
                : "bg-white/80 text-slate-600"
            }`}
          >
            {!isReady && <Lock className="h-3 w-3" aria-hidden="true" />}
            Unit {relativeUnitNo}
          </span>
        </div>

        {/* Icon Bubble with soft drop shadow and CSS gentle oscillation */}
        <div
          className={`mt-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br ${config.gradient} shadow-lg ${config.glow} transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${
            isReady ? "animate-icon-float" : ""
          }`}
        >
          <Icon className="h-14 w-14 drop-shadow-sm" aria-hidden="true" />
        </div>

        {/* Scalloped Wave SVG Edge Transition */}
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
        <h2 className="font-display text-xl font-bold text-slate-900 leading-snug">
          {config.title}
        </h2>

        {isReady ? (
          <p className="flex items-center gap-1.5 rounded-full bg-amber-100/70 px-3.5 py-1 font-display text-sm font-bold text-amber-900 border border-amber-200">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden="true" />
            {count} questions
          </p>
        ) : (
          <p className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 font-display text-sm font-bold text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            New quest hatching soon
          </p>
        )}

        {/* 3D Chunky Arcade Action Button */}
        <div className="mt-auto w-full pt-3">
          {isReady ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95, y: 5 }}
              onClick={() => onStart(unit.id)}
              className={`flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r ${config.gradient} px-4 py-3.5 font-display text-base font-bold text-white shadow-[0_5px_0_0] ${config.shadow} transition-all hover:brightness-110 active:translate-y-[5px] active:shadow-none`}
            >
              Start Quest
              <Rocket
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-12"
                aria-hidden="true"
              />
            </motion.button>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-slate-800/15 bg-slate-100/80 px-4 py-3 font-display text-base font-bold text-slate-400 cursor-not-allowed">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Locked
            </div>
          )}
        </div>
      </div>

      {/* Soft Glow Sweep on Hover */}
      {isReady && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      )}
    </motion.div>
  )
}

export default function PracticeUnitSelector({
  units,
  onStart,
}: {
  units: PracticeUnit[]
  onStart: (unitId: number) => void
}) {
  const [filter, setFilter] = useState<"g5" | "g6">("g5")

  const readyCount = useMemo(
    () => (units || []).filter((u) => Number(u.question_count) > 0).length,
    [units]
  )



  const visibleUnits = useMemo(() => {
    if (filter === "g5") return (units || []).filter((u) => u.unit_no <= 5)
    if (filter === "g6") return (units || []).filter((u) => u.unit_no >= 6 && u.unit_no <= 10)
    return units
  }, [units, filter])

  return (
    <div className="relative z-10 min-h-screen">
      {/* Hero Header */}
      <header className="relative">
        {/* Top bar */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-5">
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full border-2 border-[#333a56]/10 bg-white px-4 py-2 font-display text-sm font-bold text-[#333a56] shadow-[0_4px_0_0_rgba(51,58,86,0.1)] transition-colors hover:border-[#4aa3bd]"
            >
              <Home className="h-4 w-4 text-[#4aa3bd]" aria-hidden="true" />
              Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-full bg-amber-100/80 px-4 py-2 font-display text-sm font-bold text-[#333a56] border border-amber-200 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-[#e8845a]" aria-hidden="true" />
            {readyCount} of {(units || []).length} quests ready
          </motion.div>
        </div>

        {/* Hero Banner with Floating Dodo Mascot */}
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pt-8 pb-4 text-center sm:flex-row sm:text-left">
          {/* Mascot wrapper with pure CSS float */}
          <div className="relative shrink-0">
            <div className="animate-dodo-float">
              <Image
                src="/images/dodo-mascot.png"
                alt="Dodo the practice buddy, waving hello"
                width={170}
                height={170}
                priority
                className="h-auto w-36 sm:w-44 object-contain"
              />
            </div>

            {/* Comic Speech Bubble with Spring Scale-in */}
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.8 }}
              className="absolute -top-2 -right-8 hidden rounded-2xl rounded-bl-sm bg-white px-3.5 py-1.5 font-display text-sm font-bold text-[#333a56] shadow-lg border border-slate-100 sm:block"
            >
              {"Let\u2019s play!"}
            </motion.div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-start">
            <span className="flex items-center gap-1.5 rounded-full bg-[#4aa3bd]/15 px-4 py-1 font-display text-xs font-bold tracking-wider text-[#4aa3bd] uppercase border border-[#4aa3bd]/20">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Practice Island
            </span>

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#333a56] tracking-tight text-balance">
              {TITLE_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 35, rotate: i % 2 === 0 ? -5 : 5 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.2 + i * 0.12 }}
                  className={`inline-block ${i > 0 ? "ml-3 sm:ml-4" : ""} ${
                    word === "Adventure!"
                      ? "bg-gradient-to-r from-[#4aa3bd] via-[#e8845a] to-amber-500 bg-clip-text text-transparent"
                      : ""
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <p className="max-w-md font-sans text-sm sm:text-base font-semibold leading-relaxed text-[#333a56]/70 text-pretty">
              No marks, no pressure — just fun quests at your own pace. Pick a unit and start exploring!
            </p>
          </div>
        </div>
      </header>

      {/* Grade Filter Bar */}
      <section aria-label="Practice units" className="mx-auto max-w-6xl px-4 pt-4 pb-20">
        <div
          role="tablist"
          aria-label="Filter units by grade"
          className="mx-auto flex w-fit items-center gap-1 rounded-full border-2 border-[#333a56]/10 bg-white p-1.5 shadow-[0_5px_0_0_rgba(51,58,86,0.1)]"
        >
          {[
            { value: "g5" as const, label: "Grade 5" },
            { value: "g6" as const, label: "Grade 6" },
          ].map((opt) => {
            const active = filter === opt.value
            return (
              <motion.button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(opt.value)}
                whileHover={{ scale: active ? 1 : 1.05 }}
                whileTap={{ scale: 0.93 }}
                className={`relative rounded-full px-4 py-2 font-display text-sm font-bold transition-colors sm:px-5 ${
                  active ? "text-white" : "text-[#333a56]/70 hover:text-[#333a56]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="activeFilterPill"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4aa3bd] to-[#e8845a]"
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {opt.label}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* 3D Quest Cards Grid with Framer Motion Staggered Pop-in & Spring Reflow */}
        {visibleUnits.length > 0 ? (
          <motion.ul layout className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visibleUnits.map((unit, i) => (
                <motion.li
                  key={unit.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20, delay: i * 0.06 }}
                >
                  <UnitQuestCard unit={unit} onStart={onStart} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <div className="mt-12 text-center py-12 bg-white/60 rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto">
            <p className="text-3xl mb-2">🌴</p>
            <p className="font-display font-bold text-lg text-slate-700">Connecting to Practice Island...</p>
            <p className="text-sm text-slate-500 mt-1">Please wait a moment while the quests load.</p>
          </div>
        )}
      </section>
    </div>
  )
}
