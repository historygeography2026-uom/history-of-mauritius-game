// GameAnalyticsDashboard.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, TrendingUp, Trophy, Gamepad2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface DailyGameStat {
  day: string
  total_attempts: number
  subject_history: number
  subject_geography: number
  subject_combined: number
  level_1: number
  level_2: number
  level_3: number
}

interface Props {}

export default function GameAnalyticsDashboard({}: Props) {
  const [stats, setStats] = useState<DailyGameStat[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/stats/game?view=timeline&period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setStats(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error("Failed to fetch game stats:", e)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchStats() }, [fetchStats, period])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-500 font-medium">Loading game analytics... 🎮</p>
      </div>
    )
  }

  // Summary logic
  const totalGamesEver = stats.reduce((acc, curr) => acc + curr.total_attempts, 0)
  const mostActiveDay = stats.length > 0 ? stats.reduce((a, b) => (b.total_attempts > a.total_attempts ? b : a)) : null

  // Recharts data expects chronological order usually, so we reverse it if the API returned DESC
  const chartData = [...stats].reverse().map(d => ({
    ...d,
    // Add readable date for chart
    displayDate: new Date(d.day).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })
  }))

  return (
    <div className="bg-gray-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Game Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">Number of game attempts broken down by subject and level.</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as any)}
              className="rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button onClick={fetchStats} className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Refresh Data
            </button>
          </div>
        </header>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Gamepad2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Games Played</p>
              <p className="text-2xl font-bold text-gray-900">{totalGamesEver}</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Most Active Period</p>
              <p className="text-2xl font-bold text-gray-900">
                {mostActiveDay ? new Date(mostActiveDay.day).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
              </p>
              <p className="text-xs text-gray-500">with {mostActiveDay?.total_attempts || 0} games</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Subject Breakdown Chart */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" /> Subject Popularity (Over Time)
            </h2>
            <div className="h-72 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f3f4f6' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    <Bar dataKey="subject_history" name="History" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="subject_geography" name="Geography" stackId="a" fill="#10b981" />
                    <Bar dataKey="subject_combined" name="Combined" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">No chart data available</div>
              )}
            </div>
          </section>

          {/* Level Breakdown Chart */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-500" /> Level Distribution (Over Time)
            </h2>
            <div className="h-72 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="level_1" name="Level 1" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="level_2" name="Level 2" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="level_3" name="Level 3" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">No chart data available</div>
              )}
            </div>
          </section>
        </div>

        {/* Daily Data Table */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Game Attempts Timeline</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-5 py-3 whitespace-nowrap">Period Start</th>
                  <th scope="col" className="px-5 py-3 text-right">Total Attempts</th>
                  <th scope="col" className="px-5 py-3 text-right">History</th>
                  <th scope="col" className="px-5 py-3 text-right">Geography</th>
                  <th scope="col" className="px-5 py-3 text-right">Combined</th>
                  <th scope="col" className="px-5 py-3 text-right">Level 1</th>
                  <th scope="col" className="px-5 py-3 text-right">Level 2</th>
                  <th scope="col" className="px-5 py-3 text-right">Level 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.map((row) => (
                  <tr key={row.day} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {new Date(row.day).toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-blue-600 bg-blue-50/30">{row.total_attempts}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{row.subject_history}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{row.subject_geography}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{row.subject_combined}</td>
                    <td className="px-5 py-3 text-right text-gray-600 bg-gray-50/50">{row.level_1}</td>
                    <td className="px-5 py-3 text-right text-gray-600 bg-gray-50/50">{row.level_2}</td>
                    <td className="px-5 py-3 text-right text-gray-600 bg-gray-50/50">{row.level_3}</td>
                  </tr>
                ))}
                {stats.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-500">
                      No game data recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
