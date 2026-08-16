"use client"

import { useCallback, useEffect } from "react"

export type SoundType = "correct" | "wrong" | "click" | "levelComplete" | "star" | "countdown" | "timeUp"

// Global mute state shared across ALL hook instances and windows
let globalIsMuted = false
const muteListeners = new Set<(isMuted: boolean) => void>()

// Audio Context Singleton for high-performance, 0-latency synthesized audio
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

// Initialize mute state from localStorage
function initializeMuteState() {
  if (typeof window === "undefined") return
  try {
    const saved = localStorage.getItem("gameAudioMuted")
    if (saved !== null) {
      globalIsMuted = JSON.parse(saved)
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

export function isGameMuted(): boolean {
  return globalIsMuted
}

export function getIsMuted(): boolean {
  return globalIsMuted
}

export function subscribeMuteChange(listener: (isMuted: boolean) => void): () => void {
  muteListeners.add(listener)
  return () => muteListeners.delete(listener)
}

function notifyMuteChange() {
  muteListeners.forEach((listener) => listener(globalIsMuted))
}

/**
 * 100% Reliable Web Audio Synthesizer
 * Produces crisp, beautiful game sounds locally without any external network requests,
 * CORS issues, or firewall blockers.
 */
function playSynthesizedSound(type: SoundType, volume = 0.5) {
  if (globalIsMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime

  if (type === "click") {
    // Crisp energetic pop / bubble chirp
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(450, now)
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.04)
    gain.gain.setValueAtTime(volume * 0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.05)
  } else if (type === "correct") {
    // Celebratory 3-note harmonic chime (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const startTime = now + i * 0.08
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(volume * 0.5, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.45)
    })
  } else if (type === "wrong") {
    // Friendly, gentle soft buzz (two descending low tones)
    const notes = [220, 164.81]
    notes.forEach((freq, i) => {
      const startTime = now + i * 0.1
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(volume * 0.35, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.16)
    })
  } else if (type === "star") {
    // Sparkling coin / magic star arpeggio
    const freqs = [659.25, 830.61, 987.77, 1318.51]
    freqs.forEach((freq, idx) => {
      const t = now + idx * 0.06
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(volume * 0.45, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.26)
    })
  } else if (type === "levelComplete") {
    // Majestic victory fanfare chord progression
    const chord1 = [523.25, 659.25, 783.99] // C major
    const chord2 = [587.33, 739.99, 880.00] // D major
    const chord3 = [659.25, 830.61, 987.77] // E major
    const chord4 = [1046.50, 1318.51, 1567.98] // High C major

    const chords = [
      { notes: chord1, delay: 0, dur: 0.18 },
      { notes: chord2, delay: 0.18, dur: 0.18 },
      { notes: chord3, delay: 0.36, dur: 0.24 },
      { notes: chord4, delay: 0.60, dur: 0.70 },
    ]

    chords.forEach(({ notes, delay, dur }) => {
      notes.forEach((freq) => {
        const t = now + delay
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, t)
        gain.gain.setValueAtTime(volume * 0.35, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t)
        osc.stop(t + dur + 0.05)
      })
    })
  } else if (type === "countdown") {
    // Crisp tick
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(800, now)
    gain.gain.setValueAtTime(volume * 0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.04)
  } else if (type === "timeUp") {
    // Dual pulse alarm
    ;[0, 0.18, 0.36].forEach((delay) => {
      const t = now + delay
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "square"
      osc.frequency.setValueAtTime(440, t)
      gain.gain.setValueAtTime(volume * 0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.13)
    })
  }
}

export function useGameSounds() {
  useEffect(() => {
    initializeMuteState()
    // Resume audio context on first user interaction anywhere
    const resumeAudio = () => {
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {})
      }
    }
    window.addEventListener("click", resumeAudio, { once: true })
    window.addEventListener("touchstart", resumeAudio, { once: true })
    return () => {
      window.removeEventListener("click", resumeAudio)
      window.removeEventListener("touchstart", resumeAudio)
    }
  }, [])

  const playSound = useCallback((sound: SoundType, volume = 0.5) => {
    playSynthesizedSound(sound, volume)
  }, [])

  const toggleMute = useCallback(() => {
    globalIsMuted = !globalIsMuted
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("gameAudioMuted", JSON.stringify(globalIsMuted))
      } catch (e) {}
    }
    notifyMuteChange()
    return globalIsMuted
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    globalIsMuted = muted
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("gameAudioMuted", JSON.stringify(globalIsMuted))
      } catch (e) {}
    }
    notifyMuteChange()
  }, [])

  return {
    playCorrect: () => playSound("correct", 0.6),
    playWrong: () => playSound("wrong", 0.4),
    playClick: () => playSound("click", 0.3),
    playLevelComplete: () => playSound("levelComplete", 0.7),
    playStar: () => playSound("star", 0.5),
    playCountdown: () => playSound("countdown", 0.3),
    playTimeUp: () => playSound("timeUp", 0.6),
    playSound,
    toggleMute,
    setMuted,
  }
}

export function stopAllSounds() {
  // Web Audio scheduled events naturally terminate within milliseconds
}
