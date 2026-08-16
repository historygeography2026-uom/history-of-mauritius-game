// PracticeLearnerStatsDashboard.tsx — Fable design, wired to real admin API
// Uses pure SVG charts instead of recharts to avoid dependency issues
"use client"

import { useState, useEffect, useCallback } from "react"
import { AlertTriangle, TrendingUp, Trophy, Users } from "lucide-react"

interface LearnerRow {
  id: number
  name: string
  email?: string
  total_attempts: number
  total_sessions: number
  units_attempted: number
  accuracy_pct: number
  last_activity: string
}

interface UnitStatRow {
  id: number
  unit_no: number
  unit_name: string
  unique_students: number
  total_attempts: number
  avg_accuracy: number
  total_sessions: number
  question_count: number
}

function accuracyBadge(pct: number) {
  if (pct >= 80) return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  if (pct >= 65) return "bg-amber-50 text-amber-700 ring-amber-200"
  return "bg-red-50 text-red-700 ring-red-200"
}

// ── Simple SVG Bar Chart ──────────────────────────────────
function SimpleBarChart({ data, dataKey, label }: { data: { name: string; [k: string]: any }[]; dataKey: string; label: string }) {
  if (data.length === 0) return <p className="text-center text-sm text-gray-400">No data</p>
  const maxVal = Math.max(...data.map((d) => Number(d[dataKey]) || 0), 1)

  return (
    <svg viewBox={`0 0 ${data.length * 80} 200`} className="h-full w-full" aria-label={label}>
      {data.map((d, i) => {
        const val = Number(d[dataKey]) || 0
        const barH = (val / maxVal) * 150
        const x = i * 80 + 10
        return (
          <g key={i}>
            <rect x={x} y={200 - barH - 30} width={55} height={barH} rx={4} fill="#3b82f6" opacity={0.85} />
            <text x={x + 27.5} y={200 - barH - 35} textAnchor="middle" fontSize={11} fill="#374151" fontWeight={600}>{val}</text>
            <text x={x + 27.5} y={195} textAnchor="middle" fontSize={10} fill="#6b7280">{d.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Simple SVG Line Chart ─────────────────────────────────
function SimpleLineChart({ data, dataKey, label }: { data: { name: string; [k: string]: any }[]; dataKey: string; label: string }) {
  if (data.length === 0) return <p className="text-center text-sm text-gray-400">No data</p>
  const maxVal = Math.max(...data.map((d) => Number(d[dataKey]) || 0), 100)
  const chartW = data.length * 80
  const chartH = 170

  const points = data.map((d, i) => {
    const val = Number(d[dataKey]) || 0
    const x = i * 80 + 40
    const y = chartH - (val / maxVal) * 140 - 10
    return { x, y, val, name: d.name }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="h-full w-full" aria-label={label}>
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth={2.5} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#10b981" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize={11} fill="#374151" fontWeight={600}>{p.val}%</text>
          <text x={p.x} y={chartH + 20} textAnchor="middle" fontSize={10} fill="#6b7280">{p.name}</text>
        </g>
      ))}
    </svg>
  )
}

interface Props {}

export default function PracticeLearnerStatsDashboard({}: Props) {
  const [learners, setLearners] = useState<LearnerRow[]>([])
  const [unitStats, setUnitStats] = useState<UnitStatRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const [learnersRes, unitsRes] = await Promise.all([
        fetch("/api/admin/practice/stats?view=learners"),
        fetch("/api/admin/practice/stats?view=units"),
      ])

      if (learnersRes.ok) {
        const data = await learnersRes.json()
        setLearners(Array.isArray(data) ? data : [])
      }
      if (unitsRes.ok) {
        const data = await unitsRes.json()
        setUnitStats(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-500 font-medium">Loading statistics... 📊</p>
      </div>
    )
  }

  // Computed summary cards
  const mostPracticed = unitStats.length > 0 ? unitStats.reduce((a, b) => (Number(b.total_attempts) > Number(a.total_attempts) ? b : a)) : null
  const needsAttention = unitStats.length > 0 ? unitStats.reduce((a, b) => (Number(b.avg_accuracy) < Number(a.avg_accuracy) ? b : a)) : null
  const activeLearners = learners.length

  const chartData = unitStats.map((u) => ({
    name: `Unit ${u.unit_no}`,
    attempts: Number(u.total_attempts) || 0,
    accuracy: Number(u.avg_accuracy) || 0,
  }))

  return (
    <div className="bg-gray-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Learner Statistics</h1>
          <p className="mt-1 text-sm text-gray-500">Practice Mode engagement and accuracy across all learners.</p>
        </header>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
              Most practiced unit
            </div>
            {mostPracticed ? (
              <>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  Unit {mostPracticed.unit_no}: {mostPracticed.unit_name}
                </p>
                <p className="text-sm text-gray-500">{mostPracticed.total_attempts} attempts</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-400">No data yet</p>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden="true" />
              Needs attention
            </div>
            {needsAttention ? (
              <>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  Unit {needsAttention.unit_no}: {needsAttention.unit_name}
                </p>
                <p className="text-sm text-gray-500">{needsAttention.avg_accuracy}% average accuracy</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-400">No data yet</p>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Users className="h-4 w-4 text-blue-500" aria-hidden="true" />
              Active learners
            </div>
            <p className="mt-2 text-lg font-semibold text-gray-900">{activeLearners}</p>
            <p className="text-sm text-gray-500">practiced this term</p>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section aria-labelledby="attempts-chart" className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 id="attempts-chart" className="mb-4 text-sm font-semibold text-gray-900">Attempts per unit</h2>
            <div className="h-64 overflow-x-auto">
              <SimpleBarChart data={chartData} dataKey="attempts" label="Attempts per unit bar chart" />
            </div>
          </section>

          <section aria-labelledby="accuracy-chart" className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 id="accuracy-chart" className="mb-4 text-sm font-semibold text-gray-900">Average accuracy per unit</h2>
            <div className="h-64 overflow-x-auto">
              <SimpleLineChart data={chartData} dataKey="accuracy" label="Accuracy per unit line chart" />
            </div>
          </section>
        </div>

        {/* Learner table */}
        <section aria-labelledby="learners-table" className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <h2 id="learners-table" className="border-b border-gray-200 px-5 py-4 text-sm font-semibold text-gray-900">
            Learner overview
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3">Learner</th>
                <th scope="col" className="px-5 py-3">Units attempted</th>
                <th scope="col" className="px-5 py-3">Accuracy</th>
                <th scope="col" className="px-5 py-3">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {learners.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{l.name}</td>
                  <td className="px-5 py-3 text-gray-600">{l.units_attempted} of 6</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${accuracyBadge(Number(l.accuracy_pct) || 0)}`}>
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      {l.accuracy_pct}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {l.last_activity ? new Date(l.last_activity).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                </tr>
              ))}
              {learners.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-500">
                    No learner data yet. Students will appear here after they start practicing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
