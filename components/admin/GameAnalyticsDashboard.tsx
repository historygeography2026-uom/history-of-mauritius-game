// GameAnalyticsDashboard.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, TrendingUp, Trophy, Gamepad2, Download, Search } from "lucide-react"
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
  history_level_1: number
  history_level_2: number
  history_level_3: number
  geography_level_1: number
  geography_level_2: number
  geography_level_3: number
  combined_level_1: number
  combined_level_2: number
  combined_level_3: number
}

interface Props {}

export default function GameAnalyticsDashboard({}: Props) {
  const [stats, setStats] = useState<DailyGameStat[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [searchQuery, setSearchQuery] = useState("")

  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({})

  const handleLegendClick = (e: any) => {
    if (!e || !e.dataKey) return
    setHiddenSeries(prev => ({
      ...prev,
      [e.dataKey]: !prev[e.dataKey]
    }))
  }

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/stats/game?view=timeline&range=${timeRange}`)
      if (res.ok) {
        const data = await res.json()
        setStats(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error("Failed to fetch game stats:", e)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => { 
    setCurrentPage(1)
    fetchStats() 
  }, [fetchStats, timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-500 font-medium">Loading game analytics... 🎮</p>
      </div>
    )
  }

  // Summary logic
  const totalGamesEver = stats.reduce((acc, curr) => acc + curr.total_attempts, 0)
  const totalHistory = stats.reduce((acc, curr) => acc + curr.subject_history, 0)
  const totalGeography = stats.reduce((acc, curr) => acc + curr.subject_geography, 0)
  const totalCombined = stats.reduce((acc, curr) => acc + curr.subject_combined, 0)
  const totalLevel1 = stats.reduce((acc, curr) => acc + curr.level_1, 0)
  const totalLevel2 = stats.reduce((acc, curr) => acc + curr.level_2, 0)
  const totalLevel3 = stats.reduce((acc, curr) => acc + curr.level_3, 0)
  const chartData = [...stats].reverse().map(d => ({
    ...d,
    // Add readable date for chart
    displayDate: new Date(d.day).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })
  }))

  const filteredStats = stats.filter(row => {
    if (!searchQuery) return true
    const searchDate = new Date(row.day).toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    return searchDate.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleExportCSV = () => {
    if (filteredStats.length === 0) return
    const headers = ["Period Start", "Total Attempts", "History", "Geography", "Combined", "Hist L1", "Hist L2", "Hist L3", "Geo L1", "Geo L2", "Geo L3", "Comb L1", "Comb L2", "Comb L3"]
    const csvRows = [headers.join(",")]
    filteredStats.forEach(row => {
      const date = new Date(row.day).toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      csvRows.push([
        `"${date}"`,
        row.total_attempts,
        row.subject_history,
        row.subject_geography,
        row.subject_combined,
        row.history_level_1,
        row.history_level_2,
        row.history_level_3,
        row.geography_level_1,
        row.geography_level_2,
        row.geography_level_3,
        row.combined_level_1,
        row.combined_level_2,
        row.combined_level_3
      ].join(","))
    })
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `game-analytics-${timeRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <button onClick={fetchStats} className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Refresh Data
            </button>
          </div>
        </header>

        {/* Statistics Bar */}
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm shadow-sm flex items-center gap-2">
            <span className="font-bold text-blue-700">Total Attempts:</span>
            <span className="font-black text-blue-900">{totalGamesEver}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm flex items-center gap-2">
            <span className="font-bold text-slate-700">History</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-black text-slate-600">{totalHistory}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm flex items-center gap-2">
            <span className="font-bold text-slate-700">Geography</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-black text-slate-600">{totalGeography}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm flex items-center gap-2">
            <span className="font-bold text-slate-700">Combined</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-black text-slate-600">{totalCombined}</span>
          </div>
          
          {/* Specific Combinations */}
          {[
            { key: 'history_level_1', label: 'Hist Lvl 1' },
            { key: 'history_level_2', label: 'Hist Lvl 2' },
            { key: 'history_level_3', label: 'Hist Lvl 3' },
            { key: 'geography_level_1', label: 'Geo Lvl 1' },
            { key: 'geography_level_2', label: 'Geo Lvl 2' },
            { key: 'geography_level_3', label: 'Geo Lvl 3' },
            { key: 'combined_level_1', label: 'Comb Lvl 1' },
            { key: 'combined_level_2', label: 'Comb Lvl 2' },
            { key: 'combined_level_3', label: 'Comb Lvl 3' },
          ].map(({ key, label }) => {
            const total = stats.reduce((acc, curr) => acc + (curr[key as keyof DailyGameStat] as number || 0), 0)
            if (total === 0) return null;
            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm flex items-center gap-2">
                <span className="font-bold text-slate-700">{label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-black text-slate-600">{total}</span>
              </div>
            )
          })}
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
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', cursor: 'pointer' }} onClick={handleLegendClick} />
                    <Bar dataKey="subject_history" name="History" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} hide={!!hiddenSeries['subject_history']} />
                    <Bar dataKey="subject_geography" name="Geography" stackId="a" fill="#10b981" hide={!!hiddenSeries['subject_geography']} />
                    <Bar dataKey="subject_combined" name="Combined" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} hide={!!hiddenSeries['subject_combined']} />
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
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', cursor: 'pointer' }} onClick={handleLegendClick} />
                    <Line type="monotone" dataKey="level_1" name="Level 1" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} hide={!!hiddenSeries['level_1']} />
                    <Line type="monotone" dataKey="level_2" name="Level 2" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} hide={!!hiddenSeries['level_2']} />
                    <Line type="monotone" dataKey="level_3" name="Level 3" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} hide={!!hiddenSeries['level_3']} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">No chart data available</div>
              )}
            </div>
          </section>
        </div>

        {/* Daily Data Table */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm mt-6">
          <div className="border-b border-gray-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Game Attempts Timeline</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="search" 
                  placeholder="Search date..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
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
                  <th scope="col" className="px-5 py-3 text-right border-l border-gray-200 bg-gray-50/50">Hist L1</th>
                  <th scope="col" className="px-5 py-3 text-right bg-gray-50/50">Hist L2</th>
                  <th scope="col" className="px-5 py-3 text-right bg-gray-50/50">Hist L3</th>
                  <th scope="col" className="px-5 py-3 text-right border-l border-gray-200">Geo L1</th>
                  <th scope="col" className="px-5 py-3 text-right">Geo L2</th>
                  <th scope="col" className="px-5 py-3 text-right">Geo L3</th>
                  <th scope="col" className="px-5 py-3 text-right border-l border-gray-200 bg-gray-50/50">Comb L1</th>
                  <th scope="col" className="px-5 py-3 text-right bg-gray-50/50">Comb L2</th>
                  <th scope="col" className="px-5 py-3 text-right bg-gray-50/50">Comb L3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStats.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((row) => (
                  <tr key={row.day} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {new Date(row.day).toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-blue-600 bg-blue-50/30">{row.total_attempts}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{row.subject_history}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{row.subject_geography}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{row.subject_combined}</td>
                    <td className="px-5 py-3 text-right text-gray-600 border-l border-gray-200 bg-gray-50/50">{row.history_level_1}</td>
                    <td className="px-5 py-3 text-right text-gray-600 bg-gray-50/50">{row.history_level_2}</td>
                    <td className="px-5 py-3 text-right text-gray-600 bg-gray-50/50">{row.history_level_3}</td>
                    <td className="px-5 py-3 text-right text-gray-600 border-l border-gray-200">{row.geography_level_1}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{row.geography_level_2}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{row.geography_level_3}</td>
                    <td className="px-5 py-3 text-right text-gray-600 border-l border-gray-200 bg-gray-50/50">{row.combined_level_1}</td>
                    <td className="px-5 py-3 text-right text-gray-600 bg-gray-50/50">{row.combined_level_2}</td>
                    <td className="px-5 py-3 text-right text-gray-600 bg-gray-50/50">{row.combined_level_3}</td>
                  </tr>
                ))}
                {filteredStats.length === 0 && (
                  <tr>
                    <td colSpan={14} className="px-5 py-12 text-center text-sm text-gray-500">
                      No game data matches your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {Math.ceil(filteredStats.length / pageSize) > 1 && (
            <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, filteredStats.length)}</span> of <span className="font-medium">{filteredStats.length}</span> results
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors font-medium text-gray-700 bg-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredStats.length / pageSize), p + 1))}
                  disabled={currentPage === Math.ceil(filteredStats.length / pageSize)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors font-medium text-gray-700 bg-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
