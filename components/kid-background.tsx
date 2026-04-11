"use client"

/**
 * Kid-friendly animated background with Mauritius history & geography themed icons.
 * Renders floating, slowly drifting emoji icons, a decorative wave, and subtle patterns
 * behind the page content at pleasant opacity for a fun kids' game feel.
 */
export function KidBackground() {
  const icons = [
    { emoji: "🦤", size: 3.5, top: 5, left: 8, delay: 0, drift: "drift1" },
    { emoji: "🧭", size: 2.8, top: 12, left: 85, delay: 2, drift: "drift2" },
    { emoji: "🌴", size: 3.2, top: 25, left: 3, delay: 4, drift: "drift3" },
    { emoji: "⛵", size: 3, top: 18, left: 50, delay: 1, drift: "drift1" },
    { emoji: "📚", size: 2.5, top: 40, left: 90, delay: 3, drift: "drift2" },
    { emoji: "🌍", size: 3.5, top: 55, left: 12, delay: 5, drift: "drift3" },
    { emoji: "🗺️", size: 2.8, top: 65, left: 78, delay: 0.5, drift: "drift1" },
    { emoji: "🏝️", size: 3, top: 75, left: 45, delay: 2.5, drift: "drift2" },
    { emoji: "🦜", size: 2.5, top: 85, left: 5, delay: 4.5, drift: "drift3" },
    { emoji: "🏛️", size: 2.8, top: 35, left: 65, delay: 1.5, drift: "drift1" },
    { emoji: "🌊", size: 3, top: 90, left: 88, delay: 3.5, drift: "drift2" },
    { emoji: "🔭", size: 2.5, top: 8, left: 35, delay: 5.5, drift: "drift3" },
    { emoji: "🐢", size: 2.8, top: 48, left: 25, delay: 0.8, drift: "drift1" },
    { emoji: "🌺", size: 2.5, top: 70, left: 60, delay: 2.8, drift: "drift2" },
    { emoji: "⚓", size: 2.8, top: 30, left: 40, delay: 4.2, drift: "drift3" },
    { emoji: "🏔️", size: 3, top: 60, left: 95, delay: 1.2, drift: "drift1" },
    { emoji: "🎓", size: 2.6, top: 15, left: 70, delay: 1.8, drift: "drift2" },
    { emoji: "🐠", size: 2.4, top: 82, left: 30, delay: 3.2, drift: "drift3" },
    { emoji: "🌈", size: 3.2, top: 3, left: 55, delay: 0.3, drift: "drift1" },
    { emoji: "🦋", size: 2.3, top: 50, left: 5, delay: 4.8, drift: "drift2" },
  ]

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Warm gradient overlay — slightly more vivid for kid-game feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/70 via-amber-50/50 to-emerald-100/70" />

      {/* Subtle dot grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Decorative wave at bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-[0.12]"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
          fill="#38bdf8"
        />
        <path
          d="M0,80 C300,20 600,100 900,60 C1200,20 1350,90 1440,70 L1440,120 L0,120 Z"
          fill="#34d399"
        />
      </svg>

      {/* Decorative clouds at top */}
      <svg
        className="absolute top-0 left-0 w-full opacity-[0.08]"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="200" cy="50" rx="180" ry="50" fill="white" />
        <ellipse cx="350" cy="30" rx="120" ry="40" fill="white" />
        <ellipse cx="900" cy="40" rx="200" ry="55" fill="white" />
        <ellipse cx="1100" cy="25" rx="140" ry="35" fill="white" />
        <ellipse cx="1350" cy="50" rx="160" ry="45" fill="white" />
      </svg>

      {/* Floating themed icons */}
      {icons.map((icon, i) => (
        <span
          key={i}
          className="absolute select-none opacity-[0.18]"
          style={{
            fontSize: `${icon.size}rem`,
            top: `${icon.top}%`,
            left: `${icon.left}%`,
            animation: `${icon.drift} ${18 + (i % 5) * 4}s ease-in-out ${icon.delay}s infinite`,
          }}
        >
          {icon.emoji}
        </span>
      ))}

      <style>{`
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(15px, -20px) rotate(5deg); }
          50% { transform: translate(-10px, -35px) rotate(-3deg); }
          75% { transform: translate(20px, -10px) rotate(4deg); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-20px, 15px) rotate(-4deg); }
          50% { transform: translate(10px, 25px) rotate(3deg); }
          75% { transform: translate(-15px, 5px) rotate(-5deg); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(25px, -15px) rotate(6deg); }
          66% { transform: translate(-20px, 20px) rotate(-4deg); }
        }
      `}</style>
    </div>
  )
}
