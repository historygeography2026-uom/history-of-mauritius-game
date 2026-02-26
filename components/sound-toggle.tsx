"use client"

import { memo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { useGameSounds, getIsMuted, subscribeMuteChange } from "@/hooks/use-game-sounds"

interface SoundToggleProps {
  onToggle?: (isMuted: boolean) => void
  className?: string
}

// PERF FIX: Memoize to prevent re-render from parent timer ticks
export const SoundToggle = memo(function SoundToggle({ onToggle, className = "" }: SoundToggleProps) {
  const { toggleMute } = useGameSounds()
  const [isMuted, setIsMuted] = useState(false)

  // Initialize from global state
  useEffect(() => {
    setIsMuted(getIsMuted())
  }, [])

  // Subscribe to global mute state changes
  useEffect(() => {
    const unsubscribe = subscribeMuteChange((newMuted) => {
      setIsMuted(newMuted)
    })
    return unsubscribe
  }, [])

  const handleToggle = () => {
    const newMuted = toggleMute()
    setIsMuted(newMuted)
    onToggle?.(newMuted)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-md ${className}`}
      title={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? (
        <VolumeX className="h-6 w-6 text-gray-500" />
      ) : (
        <Volume2 className="h-6 w-6 text-primary" />
      )}
    </Button>
  )
})
