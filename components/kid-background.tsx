"use client"

/**
 * Kid-friendly animated background with Mauritius history & geography themed icons.
 * Renders floating, slowly drifting SVG icons (dodo, compass, palm tree, ship, book, globe, etc.)
 * behind the page content at low opacity so they don't distract from gameplay.
 */
export function KidBackground() {
  // Each icon: emoji, size (rem), top%, left%, animation delay, drift direction
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
  ]

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/60 via-amber-50/40 to-emerald-100/60" />

      {/* Subtle topographic/map-like pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="topo" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo)" />
      </svg>

      {/* Floating themed icons */}
      {icons.map((icon, i) => (
        <span
          key={i}
          className="absolute select-none opacity-[0.13]"
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
