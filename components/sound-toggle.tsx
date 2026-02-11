"use client"

import { memo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

interface SoundToggleProps {
  onToggle?: (isMuted: boolean) => void
  className?: string
}

// PERF FIX: Memoize to prevent re-render from parent timer ticks
export const SoundToggle = memo(function SoundToggle({ onToggle, className = "" }: SoundToggleProps) {
  const [isMuted, setIsMuted] = useState(false)

  const handleToggle = () => {
    const newMuted = !isMuted
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
