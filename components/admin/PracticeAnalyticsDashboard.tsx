// PracticeAnalyticsDashboard.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, BookOpen, Target, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface LearnerUnitStat {
  learner_name: string
  unit_name: string
  attempts: string
}

interface Props {}

export default function PracticeAnalyticsDashboard({}: Props) {
  const [stats, setStats] = useState<LearnerUnitStat[]>([])
  const [timelineStats, setTimelineStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const [unitsRes, timelineRes] = await Promise.all([
        fetch("/api/admin/practice/stats?view=learner-units"),
        fetch(`/api/admin/practice/stats?view=timeline&period=${period}`)
      ])
      
      if (unitsRes.ok) {
        const data = await unitsRes.json()
        setStats(Array.isArray(data) ? data : [])
      }
      
      if (timelineRes.ok) {
        const tData = await timelineRes.json()
        setTimelineStats(Array.isArray(tData) ? tData : [])
      }
    } catch (e) {
      console.error("Failed to fetch practice stats:", e)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { 
    setCurrentPage(1)
    fetchStats() 
  }, [fetchStats, period])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-500 font-medium">Loading practice analytics... 📚</p>
      </div>
    )
  }

  // --- Aggregate Data ---
  // 1. Pivot Table Data (Rows: Learners, Columns: Units)
  const allUnits = Array.from(new Set(stats.map(s => s.unit_name))).sort()
  const allLearners = Array.from(new Set(stats.map(s => s.learner_name))).sort()
  
  const pivotTable = allLearners.map(learner => {
    const row: any = { learner }
    let total = 0
    allUnits.forEach(unit => {
      const match = stats.find(s => s.learner_name === learner && s.unit_name === unit)
      const attempts = match ? parseInt(match.attempts) : 0
      row[unit] = attempts
      total += attempts
    })
    row.total = total
    return row
  })

  // 2. Chart Data: Most Active Learners (Top 10)
  const learnerChartData = [...pivotTable].sort((a, b) => b.total - a.total).slice(0, 10).map(l => ({
    name: l.learner,
    Attempts: l.total
  }))

  // 3. Chart Data: Most Popular Units
  const unitChartData = allUnits.map(unit => {
    const total = pivotTable.reduce((acc, row) => acc + (row[unit] || 0), 0)
    return { name: unit, Attempts: total }
  }).sort((a, b) => b.Attempts - a.Attempts)

  const totalPracticeAttempts = pivotTable.reduce((acc, row) => acc + row.total, 0)
  
  const timelineChartData = [...timelineStats].reverse().map(d => ({
    ...d,
    displayDate: new Date(d.day).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }),
    Attempts: Number(d.attempts) || 0
  }))

  return (
    <div className="bg-gray-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Practice Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">Detailed breakdown of practice attempts per learner and unit.</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as any)}
              className="rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button onClick={fetchStats} className="text-sm font-medium text-emerald-600 hover:text-emerald-800">
              Refresh Data
            </button>
          </div>
        </header>

        {/* Statistics Bar */}
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm shadow-sm flex items-center gap-2">
            <span className="font-bold text-emerald-700">Total Attempts:</span>
            <span className="font-black text-emerald-900">{totalPracticeAttempts}</span>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm shadow-sm flex items-center gap-2">
            <span className="font-bold text-blue-700">Active Learners:</span>
            <span className="font-black text-blue-900">{allLearners.length}</span>
          </div>
          {unitChartData.map(u => (
            <div key={u.name} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm flex items-center gap-2">
              <span className="font-bold text-slate-700">{u.name}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-black text-slate-600">{u.Attempts}</span>
            </div>
          ))}
        </div>

        {/* Practice Timeline Chart */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> Practice Engagement (Over Time)
          </h2>
          <div className="h-72 w-full">
            {timelineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="Attempts" name="Practice Attempts" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">No chart data available</div>
            )}
          </div>
        </section>

        {/* Charts */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Learners Chart */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Top 10 Active Learners
            </h2>
            <div className="h-72 w-full">
              {learnerChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={learnerChartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} width={80} />
                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="Attempts" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">No chart data available</div>
              )}
            </div>
          </section>

          {/* Unit Popularity Chart */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-500" /> Unit Popularity
            </h2>
            <div className="h-72 w-full">
              {unitChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dy={10} interval={0} angle={-30} textAnchor="end" height={60} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="Attempts" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">No chart data available</div>
              )}
            </div>
          </section>
        </div>

        {/* Pivot Table */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Learner vs Unit Attempts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-max">
              <thead className="border-b border-gray-200 bg-white text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-5 py-4 border-r border-gray-100 bg-gray-50 sticky left-0 z-10 shadow-[1px_0_0_0_#f3f4f6]">Learner Name</th>
                  <th scope="col" className="px-5 py-4 text-center text-emerald-600 bg-emerald-50/30 border-r border-gray-100 font-bold">Total</th>
                  {allUnits.map(unit => (
                    <th key={unit} scope="col" className="px-5 py-4 text-center border-r border-gray-100">{unit}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pivotTable.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((row) => (
                  <tr key={row.learner} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 border-r border-gray-100 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#f3f4f6]">
                      {row.learner}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-emerald-600 bg-emerald-50/30 border-r border-gray-100">
                      {row.total}
                    </td>
                    {allUnits.map(unit => (
                      <td key={unit} className={`px-5 py-3 text-center border-r border-gray-100 ${row[unit] > 0 ? 'text-gray-900 font-medium' : 'text-gray-300'}`}>
                        {row[unit] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
                {pivotTable.length === 0 && (
                  <tr>
                    <td colSpan={allUnits.length + 2} className="px-5 py-12 text-center text-sm text-gray-500">
                      No practice data recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {Math.ceil(pivotTable.length / pageSize) > 1 && (
            <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, pivotTable.length)}</span> of <span className="font-medium">{pivotTable.length}</span> results
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
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(pivotTable.length / pageSize), p + 1))}
                  disabled={currentPage === Math.ceil(pivotTable.length / pageSize)}
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
