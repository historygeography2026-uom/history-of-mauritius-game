import React from "react"

interface DodoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

/**
 * Universal vector Dodo icon for the Mauritius Learning Hub.
 * Renders reliably across all browsers and operating systems,
 * solving missing Unicode 13 emoji (U+1FAC4) issues on Windows.
 */
export function DodoIcon({ size = "1em", className = "", ...props }: DodoIconProps) {
  const pixelSize = typeof size === "number" ? `${size}px` : size

  return (
    <svg
      viewBox="0 0 120 120"
      width={pixelSize}
      height={pixelSize}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block align-middle select-none shrink-0 ${className}`}
      aria-label="Dodo"
      role="img"
      {...props}
    >
      {/* Body */}
      <ellipse cx="60" cy="70" rx="35" ry="40" fill="#8B7355" />
      {/* Belly */}
      <ellipse cx="60" cy="75" rx="25" ry="28" fill="#D4C4A8" />
      {/* Left Wing */}
      <ellipse cx="30" cy="66" rx="11" ry="19" fill="#6B5344" />
      {/* Right Wing */}
      <ellipse cx="90" cy="66" rx="11" ry="19" fill="#6B5344" />
      {/* Tail feathers */}
      <ellipse cx="60" cy="100" rx="14" ry="7" fill="#4A4035" />
      <ellipse cx="55" cy="102" rx="5" ry="9" fill="#5A5045" transform="rotate(-15 55 102)" />
      <ellipse cx="65" cy="102" rx="5" ry="9" fill="#5A5045" transform="rotate(15 65 102)" />
      {/* Head */}
      <circle cx="60" cy="30" r="22" fill="#9B8B7B" />
      {/* Face (cream colored) */}
      <circle cx="60" cy="32" r="16" fill="#E8DDD0" />
      {/* Eyes */}
      <circle cx="52" cy="28" r="5" fill="#2D241E" />
      <circle cx="68" cy="28" r="5" fill="#2D241E" />
      <circle cx="53.5" cy="26.5" r="2" fill="white" />
      <circle cx="69.5" cy="26.5" r="2" fill="white" />
      {/* Beak base */}
      <path d="M60 38 L46 48 Q60 55 74 48 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
      <path d="M60 38 L60 48" stroke="#D97706" strokeWidth="1.5" />
      {/* Beak hook */}
      <path d="M60 48 Q65 52 60 56 Q55 52 60 48" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      {/* Feet */}
      <ellipse cx="50" cy="108" rx="8" ry="4" fill="#F59E0B" />
      <ellipse cx="70" cy="108" rx="8" ry="4" fill="#F59E0B" />
      <path d="M44 108 L47 108 M50 108 L53 108 M56 108 L50 108" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M64 108 L67 108 M70 108 L73 108 M76 108 L70 108" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
