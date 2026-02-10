"use client"

interface DodoTimerProps {
  timeLeft: number
  initialTime: number
  onTimeUp?: () => void
}

export function DodoTimer({ timeLeft, initialTime, onTimeUp }: DodoTimerProps) {
  // PERF FIX: Derive isRunning directly from props instead of syncing via
  // useEffect + useState, which caused an unnecessary extra re-render every second.
  const isRunning = timeLeft > 0
  const percentage = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0
  const isWarning = percentage < 30
  const isCritical = percentage < 10

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`
    }
    return `${secs}s`
  }

  const getDodoMood = () => {
    if (isCritical) return "panic"
    if (isWarning) return "worried"
    return "happy"
  }

  const mood = getDodoMood()

  return (
    <div className="flex items-center gap-3">
      {/* Animated Dodo running */}
      <div className={`relative ${isRunning ? "animate-bounce-gentle" : ""}`}>
        <svg
          viewBox="0 0 80 80"
          className={`w-16 h-16 ${isCritical ? "animate-wiggle" : ""}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Body */}
          <ellipse
            cx="40"
            cy="45"
            rx="20"
            ry="22"
            fill={isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#8B7355"}
            className="transition-colors duration-300"
          />
          
          {/* Belly */}
          <ellipse cx="40" cy="48" rx="14" ry="16" fill="#D4C4A8" />

          {/* Running legs */}
          <g className={isRunning ? "animate-leg-run" : ""}>
            {/* Left leg */}
            <ellipse
              cx="33"
              cy="67"
              rx="5"
              ry="3"
              fill="#F4A460"
              className="origin-top"
              style={{
                transform: isRunning ? "rotate(-10deg)" : "rotate(0deg)",
                transformOrigin: "center top",
              }}
            />
            {/* Right leg */}
            <ellipse
              cx="47"
              cy="67"
              rx="5"
              ry="3"
              fill="#F4A460"
              className="origin-top"
              style={{
                transform: isRunning ? "rotate(10deg)" : "rotate(0deg)",
                transformOrigin: "center top",
              }}
            />
          </g>

          {/* Wings - flapping when running */}
          <ellipse
            cx="22"
            cy="42"
            rx="6"
            ry="12"
            fill="#6B5344"
            className={isRunning ? "animate-wing-flap origin-right" : ""}
          />
          <ellipse
            cx="58"
            cy="42"
            rx="6"
            ry="12"
            fill="#6B5344"
            className={isRunning ? "animate-wing-flap origin-left" : ""}
            style={{ animationDelay: "0.1s" }}
          />

          {/* Head */}
          <circle cx="40" cy="22" r="14" fill={isCritical ? "#fca5a5" : isWarning ? "#fcd34d" : "#9B8B7B"} />

          {/* Face */}
          <circle cx="40" cy="24" r="10" fill="#E8DDD0" />

          {/* Eyes - change based on mood */}
          {mood === "panic" ? (
            <>
              {/* Panic eyes - wide open */}
              <circle cx="35" cy="21" r="4" fill="white" />
              <circle cx="45" cy="21" r="4" fill="white" />
              <circle cx="35" cy="21" r="2.5" fill="#333" className="animate-ping" />
              <circle cx="45" cy="21" r="2.5" fill="#333" className="animate-ping" />
              {/* Sweat drop */}
              <ellipse cx="52" cy="18" rx="2" ry="3" fill="#87CEEB" className="animate-pulse" />
            </>
          ) : mood === "worried" ? (
            <>
              {/* Worried eyes */}
              <circle cx="35" cy="21" r="3" fill="#333" />
              <circle cx="45" cy="21" r="3" fill="#333" />
              <circle cx="36" cy="20" r="1" fill="white" />
              <circle cx="46" cy="20" r="1" fill="white" />
              {/* Worried eyebrows */}
              <path d="M32 17 L38 19" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M48 17 L42 19" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Happy eyes */}
              <path d="M32 21 Q35 18 38 21" stroke="#333" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M42 21 Q45 18 48 21" stroke="#333" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Beak */}
          <path
            d="M40 28 L33 34 Q40 38 47 34 Z"
            fill="#F4A460"
            stroke="#D2691E"
            strokeWidth="0.5"
          />

          {/* Motion lines when running */}
          {isRunning && (
            <>
              <path
                d="M10 35 L5 35"
                stroke={isCritical ? "#ef4444" : "#888"}
                strokeWidth="1.5"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <path
                d="M10 42 L3 42"
                stroke={isCritical ? "#ef4444" : "#888"}
                strokeWidth="1.5"
                strokeLinecap="round"
                className="animate-pulse"
                style={{ animationDelay: "0.1s" }}
              />
              <path
                d="M10 49 L5 49"
                stroke={isCritical ? "#ef4444" : "#888"}
                strokeWidth="1.5"
                strokeLinecap="round"
                className="animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
            </>
          )}

          {/* Exclamation when critical */}
          {isCritical && (
            <text x="55" y="15" className="text-xs font-bold fill-red-500 animate-pulse">
              !
            </text>
          )}
        </svg>

        {/* Running dust particles */}
        {isRunning && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-dust-particle opacity-60"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center">
        {/* Time remaining bar */}
        <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isCritical
                ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                : isWarning
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : "bg-gradient-to-r from-green-400 to-blue-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Time text */}
        <div
          className={`mt-1 font-bold text-lg ${
            isCritical ? "text-red-500 animate-pulse" : isWarning ? "text-orange-500" : "text-blue-600"
          }`}
        >
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  )
}
