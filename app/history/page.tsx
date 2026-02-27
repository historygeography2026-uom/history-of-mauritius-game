"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Trophy, Star, Clock, TrendingUp, Target, Calendar, AlertTriangle, BarChart3, LineChart as LineChartIcon } from "lucide-react"
import { useSession } from "next-auth/react"

export const dynamic = 'force-dynamic'

type Attempt = {
  id: number
  player_name: string
  user_id: string | null
  subject: string
  level: number
  total_points: number
  stars_earned: number
  questions_completed: number
  total_questions: number
  timed_out: boolean
  created_at: string
}

type Summary = {
  totalAttempts: number
  bestScore: number
  totalStarsEarned: number
  avgScore: number
  completedWithoutTimeout: number
  subjectStats: Record<string, { attempts: number; bestScore: number; bestStars: number }>
}

// Simple SVG Line Chart for score progression
function ScoreProgressChart({ attempts }: { attempts: Attempt[] }) {
  if (attempts.length < 2) return null

  const sorted = [...attempts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).slice(-15)
  const width = 600
  const height = 250
  const padding = 40
  const maxScore = Math.max(...sorted.map(a => a.total_points), 100)
  const minScore = 0

  const points = sorted.map((a, i) => {
    const x = padding + (i / (sorted.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((a.total_points - minScore) / (maxScore - minScore)) * (height - 2 * padding)
    return { x, y, ...a }
  })

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <Card className="p-4 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <h3 className="font-bold text-primary mb-3 text-lg flex items-center gap-2">
        <LineChartIcon className="h-5 w-5" /> Score Progression (Last 15 Attempts)
      </h3>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full border border-blue-200 rounded-lg bg-white" style={{ maxWidth: '100%', height: 'auto' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
          <line
            key={i}
            x1={padding}
            y1={height - padding - frac * (height - 2 * padding)}
            x2={width - padding}
            y2={height - padding - frac * (height - 2 * padding)}
            stroke="#e0e0e0"
            strokeDasharray="4"
          />
        ))}
        {/* Y-axis */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" strokeWidth="2" />
        {/* X-axis */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" strokeWidth="2" />
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
          <text
            key={i}
            x={padding - 10}
            y={height - padding - frac * (height - 2 * padding) + 4}
            fontSize="12"
            textAnchor="end"
            fill="#666"
          >
            {Math.round(minScore + frac * (maxScore - minScore))}
          </text>
        ))}

        {/* Path line */}
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />
        
        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={p.timed_out ? "#f97316" : "#22c55e"}
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => {
          if (sorted.length > 8 && i % Math.ceil(sorted.length / 8) !== 0) return null
          return (
            <text
              key={i}
              x={p.x}
              y={height - 15}
              fontSize="10"
              textAnchor="middle"
              fill="#666"
            >
              {new Date(p.created_at).getDate()}/{new Date(p.created_at).getMonth() + 1}
            </text>
          )
        })}
      </svg>
    </Card>
  )
}

// Simple Bar Chart for per-level best stars
function LevelStarsChart({ attempts }: { attempts: Attempt[] }) {
  // Get best stars per level
  const levelStars: Record<number, { stars: number; points: number }> = {}
  attempts.forEach(a => {
    const key = a.level
    if (!levelStars[key]) {
      levelStars[key] = { stars: a.stars_earned, points: a.total_points }
    } else if (a.stars_earned > levelStars[key].stars) {
      levelStars[key] = { stars: a.stars_earned, points: a.total_points }
    }
  })

  if (Object.keys(levelStars).length === 0) return null

  const levels = Object.keys(levelStars).sort((a, b) => parseInt(a) - parseInt(b))
  const width = 400
  const height = 250
  const padding = 40
  const barWidth = (width - 2 * padding) / (levels.length * 1.5)
  const maxStars = 5

  return (
    <Card className="p-4 mb-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
      <h3 className="font-bold text-primary mb-3 text-lg flex items-center gap-2">
        <BarChart3 className="h-5 w-5" /> Best Stars Per Level
      </h3>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full border border-yellow-200 rounded-lg bg-white" style={{ maxWidth: '100%', height: 'auto' }}>
        {/* Y-axis */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" strokeWidth="2" />
        {/* X-axis */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" strokeWidth="2" />

        {/* Y-axis labels (stars) */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <text
            key={i}
            x={padding - 10}
            y={height - padding - (i / maxStars) * (height - 2 * padding) + 4}
            fontSize="12"
            textAnchor="end"
            fill="#666"
          >
            {i}⭐
          </text>
        ))}

        {/* Bars */}
        {levels.map((level, i) => {
          const stars = levelStars[parseInt(level)].stars
          const barHeight = (stars / maxStars) * (height - 2 * padding)
          const x = padding + i * (barWidth * 1.5) + barWidth * 0.25
          const y = height - padding - barHeight

          return (
            <g key={level}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#f59e0b"
                rx="2"
              />
              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 20}
                fontSize="12"
                textAnchor="middle"
                fill="#666"
                fontWeight="bold"
              >
                L{level}
              </text>
              {/* Value on top */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                fontSize="12"
                textAnchor="middle"
                fill="#b45309"
                fontWeight="bold"
              >
                {stars}⭐
              </text>
            </g>
          )
        })}
      </svg>
    </Card>
  )
}

export default function AttemptHistoryPage() {
  const { data: session } = useSession()
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState("all")

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }
      try {
        const params = new URLSearchParams()
        if (session.user.id) params.set("user_id", session.user.id)
        else if (session.user.name) params.set("player_name", session.user.name)
        if (selectedSubject !== "all") params.set("subject", selectedSubject)
        params.set("limit", "100")

        const res = await fetch(`/api/attempts?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setAttempts(data.attempts || [])
          setSummary(data.summary || null)
        }
      } catch (e) {
        console.error("Failed to fetch attempt history:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchAttempts()
  }, [session, selectedSubject])

  const categories = [
    { id: "all", label: "All", icon: "🌍" },
    { id: "history", label: "History", icon: "📚" },
    { id: "geography", label: "Geography", icon: "🗺️" },
  ]

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  }

  // Calculate trend: compare last 5 vs previous 5 attempts
  const getTrend = () => {
    if (attempts.length < 2) return null
    const sorted = [...attempts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const recent = sorted.slice(0, Math.min(5, Math.floor(sorted.length / 2)))
    const older = sorted.slice(Math.min(5, Math.floor(sorted.length / 2)), Math.min(10, sorted.length))
    if (older.length === 0) return null
    const recentAvg = recent.reduce((s, a) => s + a.total_points, 0) / recent.length
    const olderAvg = older.reduce((s, a) => s + a.total_points, 0) / older.length
    return recentAvg >= olderAvg ? "improving" : "declining"
  }

  const trend = getTrend()

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/">
            <Button className="mb-6 bg-gradient-to-r from-secondary via-secondary/80 to-secondary hover:shadow-lg hover:shadow-secondary/50 text-white font-bold transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3">
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform hover:translate-x-1" />
              🏠 Back Home
            </Button>
          </Link>
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground">Please log in to see your attempt history.</p>
            <Link href="/auth/login">
              <Button className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 rounded-lg px-6 py-2">Log In</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4 md:p-8">
      <div className="mx-auto max-w-4xl relative z-10">
        <Link href="/">
          <Button className="mb-6 bg-gradient-to-r from-secondary via-secondary/80 to-secondary hover:shadow-lg hover:shadow-secondary/50 text-white font-bold transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3">
            <ArrowLeft className="mr-2 h-5 w-5 transition-transform hover:translate-x-1" />
            🏠 Back Home
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Clock className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-primary md:text-5xl">My Progress</h1>
          </div>
          <p className="text-lg text-muted-foreground">Track your learning journey through Mauritius! 🇲🇺</p>
        </div>

        {/* Summary Cards */}
        {summary && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-700">{summary.totalAttempts}</p>
              <p className="text-xs text-blue-600 font-medium">Total Attempts</p>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <Trophy className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-yellow-700">{summary.bestScore}</p>
              <p className="text-xs text-yellow-600 font-medium">Best Score</p>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <Star className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700">{summary.totalStarsEarned}</p>
              <p className="text-xs text-green-600 font-medium">Total Stars</p>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-700">{summary.avgScore}</p>
              <p className="text-xs text-purple-600 font-medium">Avg Score</p>
            </Card>
          </div>
        )}

        {/* Trend indicator */}
        {trend && (
          <Card className={`p-3 mb-6 text-center ${trend === "improving" ? "bg-green-50 border-green-300" : "bg-orange-50 border-orange-300"}`}>
            <p className={`font-bold ${trend === "improving" ? "text-green-700" : "text-orange-700"}`}>
              {trend === "improving"
                ? "📈 Your scores are improving! Keep it up!"
                : "📊 Keep practising — you can do better!"}
            </p>
          </Card>
        )}

        {/* Subject filter */}
        <div className="flex gap-2 mb-6 justify-center">
          {categories.map((c) => (
            <Button
              key={c.id}
              onClick={() => setSelectedSubject(c.id)}
              className={`font-semibold transition-all rounded-lg px-4 py-2 ${
                selectedSubject === c.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50 scale-105"
                  : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 hover:from-gray-400 hover:to-gray-500"
              }`}
            >
              {c.icon} {c.label}
            </Button>
          ))}
        </div>

        {/* Per-subject best scores */}
        {summary && Object.keys(summary.subjectStats).length > 0 && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
            <h3 className="font-bold text-primary mb-3 text-lg">🏆 Best Scores by Subject & Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(summary.subjectStats)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, stat]) => (
                <div key={key} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                  <span className="font-medium text-card-foreground capitalize">{key.replace("-", " · ")}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{stat.attempts} attempts</span>
                    <span className="font-bold text-primary">{stat.bestScore} pts</span>
                    <span className="text-yellow-600">⭐ {stat.bestStars}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Visualization Charts */}
        {!loading && attempts.length > 0 && (
          <>
            <ScoreProgressChart attempts={attempts} />
            <LevelStarsChart attempts={attempts} />
          </>
        )}

        {/* Attempt list */}
        <h3 className="font-bold text-primary mb-3 text-lg">📋 All Attempts</h3>
        <div className="space-y-2">
          {loading && <Card className="p-4 text-center">Loading your history...</Card>}
          {!loading && attempts.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-lg">No attempts yet. Start playing to track your progress!</p>
              <Link href="/">
              <Button className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 rounded-lg px-6 py-2">Start Playing 🎮</Button>
              </Link>
            </Card>
          )}
          {!loading && attempts.map((a, i) => (
            <Card
              key={a.id}
              className={`p-3 flex items-center justify-between transition-all hover:shadow-md ${
                a.timed_out ? "border-l-4 border-l-orange-400" : "border-l-4 border-l-green-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                  {i + 1}
                </div>
                <div>
                  <div className="font-semibold text-card-foreground flex items-center gap-2">
                    <span className="capitalize">{a.subject}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Level {a.level}</span>
                    {a.timed_out && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Timed out
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {a.questions_completed}/{a.total_questions} questions answered
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {formatDate(a.created_at)} at {formatTime(a.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{a.total_points} pts</div>
                  <div className="text-sm text-yellow-600">⭐ {a.stars_earned}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <div className="p-6 text-center">
            <p className="text-lg text-card-foreground">
              Keep playing to improve your scores and climb the leaderboard! 🚀
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
