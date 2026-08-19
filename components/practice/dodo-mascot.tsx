'use client'

import { motion } from 'framer-motion'

export type Mood = 'idle' | 'happy' | 'sad' | 'thinking'

export function DodoMascot({ mood = 'idle', size = 88 }: { mood?: Mood; size?: number }) {
  const bounce =
    mood === 'happy'
      ? { y: [0, -10, 0], rotate: [0, -4, 4, 0] }
      : mood === 'sad'
        ? { rotate: [0, -2, 0] }
        : { y: [0, -3, 0] }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={
        mood === 'happy'
          ? 'Dodo mascot celebrating'
          : mood === 'sad'
            ? 'Dodo mascot encouraging you'
            : 'Dodo mascot'
      }
      animate={bounce}
      transition={{ duration: mood === 'happy' ? 0.6 : 2.4, repeat: mood === 'happy' ? 2 : Infinity, ease: 'easeInOut' }}
    >
      {/* body */}
      <ellipse cx="48" cy="62" rx="30" ry="26" fill="oklch(0.75 0.06 240)" />
      {/* wing */}
      <ellipse cx="38" cy="66" rx="12" ry="9" fill="oklch(0.65 0.07 240)" />
      {/* head */}
      <circle cx="62" cy="34" r="18" fill="oklch(0.78 0.05 240)" />
      {/* beak */}
      <path d="M78 32 q14 2 12 9 q-2 6 -13 2 z" fill="oklch(0.85 0.15 90)" />
      <path d="M78 38 q10 4 11 3" stroke="oklch(0.7 0.17 35)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* eye */}
      {mood === 'sad' ? (
        <path d="M58 30 q4 4 8 0" stroke="oklch(0.3 0.05 240)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : mood === 'happy' ? (
        <path d="M58 32 q4 -5 8 0" stroke="oklch(0.3 0.05 240)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="62" cy="31" r="3.2" fill="oklch(0.3 0.05 240)" />
      )}
      {/* blush */}
      {mood === 'happy' && <circle cx="56" cy="40" r="3.5" fill="oklch(0.7 0.17 35 / 0.5)" />}
      {/* tail feathers */}
      <path d="M20 52 q-8 -8 -2 -14 q2 8 8 8 q-8 -12 0 -16 q1 10 8 11" fill="oklch(0.68 0.13 185)" />
      {/* feet */}
      <path d="M42 87 l0 6 m-4 -2 l4 2 l4 -2 M58 87 l0 6 m-4 -2 l4 2 l4 -2" stroke="oklch(0.85 0.15 90)" strokeWidth="3" strokeLinecap="round" fill="none" />
    </motion.svg>
  )
}
