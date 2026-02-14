"use client"

import { useCallback, useEffect } from "react"

// Sound URLs - using free sound effects
const SOUND_URLS = {
  correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3", // Success chime
  wrong: "https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3", // Soft error
  click: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3", // Pop click
  levelComplete: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3", // Celebration
  star: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3", // Coin/star collect
  countdown: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3", // Tick
  timeUp: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3", // Alarm
}

type SoundType = keyof typeof SOUND_URLS

// PERF FIX: Singleton Audio elements shared across all hook instances.
// Previously, every component calling useGameSounds() created 7 Audio elements
// and destroyed them on unmount (14+ elements alive, 7 recreated per question change).
let sharedAudioInitialized = false
const sharedAudioElements = new Map<SoundType, HTMLAudioElement>()

// FIX: Global mute state shared across ALL hook instances.
// Previously each useGameSounds() had its own useRef(false) for isMuted,
// so toggling mute on the game page didn't affect child component sounds.
let globalIsMuted = false

// Export getter so other modules (e.g. speakText) can check mute state
export function isGameMuted(): boolean {
  return globalIsMuted
}

function ensureAudioInitialized() {
  if (sharedAudioInitialized || typeof window === "undefined") return
  sharedAudioInitialized = true

  Object.entries(SOUND_URLS).forEach(([key, url]) => {
    const audio = new Audio(url)
    audio.preload = "auto"
    audio.volume = 0.5
    sharedAudioElements.set(key as SoundType, audio)
  })
}

export function useGameSounds() {
  // Initialize shared audio elements once globally
  useEffect(() => {
    ensureAudioInitialized()
  }, [])

  const playSound = useCallback((sound: SoundType, volume = 0.5) => {
    if (globalIsMuted) return
    
    const audio = sharedAudioElements.get(sound)
    if (audio) {
      audio.volume = volume
      audio.currentTime = 0
      audio.play().catch(() => {
        // Ignore autoplay errors
      })
    }
  }, [])

  const toggleMute = useCallback(() => {
    globalIsMuted = !globalIsMuted
    return globalIsMuted
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    globalIsMuted = muted
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
