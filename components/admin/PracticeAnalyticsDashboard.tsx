// PracticeAnalyticsDashboard.tsx
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Users, BookOpen, Target, TrendingUp, Download, Search, Filter, Layers } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface LearnerUnitStat {
  learner_name: string
  unit_no?: number
  unit_name: string
  attempts: string | number
}

interface PracticeUnitDef {
  id: number | string
  unit_no: number
  unit_name: string
  question_count?: number
}

const DEFAULT_ALL_UNITS: PracticeUnitDef[] = [
  { id: 12, unit_no: 11, unit_name: "Grade 4 Unit 1" },
  { id: 13, unit_no: 12, unit_name: "Grade 4 Unit 2" },
  { id: 14, unit_no: 13, unit_name: "Grade 4 Unit 3" },
  { id: 15, unit_no: 14, unit_name: "Grade 4 Unit 4" },
  { id: 16, unit_no: 15, unit_name: "Grade 4 Unit 5" },
  { id: 17, unit_no: 16, unit_name: "Grade 4 Unit 6" },
  { id: 7, unit_no: 1, unit_name: "Grade 5 Unit 1" },
  { id: 8, unit_no: 2, unit_name: "Grade 5 Unit 2" },
  { id: 9, unit_no: 3, unit_name: "Grade 5 Unit 3" },
  { id: 10, unit_no: 4, unit_name: "Grade 5 Unit 4" },
  { id: 11, unit_no: 5, unit_name: "Grade 5 Unit 5" },
  { id: 1, unit_no: 6, unit_name: "Grade 6 Unit 1" },
  { id: 2, unit_no: 7, unit_name: "Grade 6 Unit 2" },
  { id: 3, unit_no: 8, unit_name: "Grade 6 Unit 3" },
  { id: 4, unit_no: 9, unit_name: "Grade 6 Unit 4" },
  { id: 5, unit_no: 10, unit_name: "Grade 6 Unit 5" },
]

function parseGradeAndUnit(unitName: string, unitNo?: number): { grade: number; unit: number; sortKey: number } {
  const match = unitName.match(/Grade\s*(\d+)\s*Unit\s*(\d+)/i)
  if (match) {
    const grade = parseInt(match[1], 10)
    const unit = parseInt(match[2], 10)
    return { grade, unit, sortKey: grade * 100 + unit }
  }
  if (unitNo !== undefined) {
    if (unitNo >= 11 && unitNo <= 16) return { grade: 4, unit: unitNo - 10, sortKey: 400 + (unitNo - 10) }
    if (unitNo >= 1 && unitNo <= 5) return { grade: 5, unit: unitNo, sortKey: 500 + unitNo }
    if (unitNo >= 6 && unitNo <= 10) return { grade: 6, unit: unitNo - 5, sortKey: 600 + (unitNo - 5) }
  }
  return { grade: 99, unit: 99, sortKey: 9999 }
}

function getGradeTheme(grade: number) {
  if (grade === 4) {
    return {
      border: 'border-indigo-200',
      bg: 'bg-indigo-50/50',
      badgeBg: 'bg-indigo-100 text-indigo-700 font-bold',
      text: 'text-indigo-900',
      barColor: '#6366f1'
    }
  }
  if (grade === 5) {
    return {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/50',
      badgeBg: 'bg-emerald-100 text-emerald-700 font-bold',
      text: 'text-emerald-900',
      barColor: '#10b981'
    }
  }
  return {
    border: 'border-sky-200',
    bg: 'bg-sky-50/50',
    badgeBg: 'bg-sky-100 text-sky-700 font-bold',
    text: 'text-sky-900',
    barColor: '#0284c7'
  }
}

interface Props {}

export default function PracticeAnalyticsDashboard({}: Props) {
  const [stats, setStats] = useState<LearnerUnitStat[]>([])
  const [timelineStats, setTimelineStats] = useState<any[]>([])
  const [availableUnits, setAvailableUnits] = useState<PracticeUnitDef[]>(DEFAULT_ALL_UNITS)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d')
  const [gradeFilter, setGradeFilter] = useState<'all' | '4' | '5' | '6'>('all')

  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({})

  const handleLegendClick = (e: any) => {
    if (!e || !e.dataKey) return
    setHiddenSeries(prev => ({
      ...prev,
      [e.dataKey]: !prev[e.dataKey]
    }))
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const pageSize = 10

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const [unitsRes, timelineRes, allUnitsRes] = await Promise.all([
        fetch(`/api/admin/practice/stats?view=learner-units&range=${timeRange}`),
        fetch(`/api/admin/practice/stats?view=timeline&range=${timeRange}`),
        fetch(`/api/admin/practice/units`)
      ])
      
      if (unitsRes.ok) {
        const data = await unitsRes.json()
        setStats(Array.isArray(data) ? data : [])
      }
      
      if (timelineRes.ok) {
        const tData = await timelineRes.json()
        setTimelineStats(Array.isArray(tData) ? tData : [])
      }

      if (allUnitsRes.ok) {
        const uData = await allUnitsRes.json()
        if (Array.isArray(uData) && uData.length > 0) {
          setAvailableUnits(uData)
        }
      }
    } catch (e) {
      console.error("Failed to fetch practice stats:", e)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => { 
    setCurrentPage(1)
    fetchStats() 
  }, [fetchStats, timeRange])

  // --- Process & Filter Units in Natural Progression ---
  // Sort order: Grade 4 (Units 1–6) -> Grade 5 (Units 1–5) -> Grade 6 (Units 1–5)
  const allSortedUnits = useMemo(() => {
    const unitMap = new Map<string, PracticeUnitDef>()
    availableUnits.forEach(u => unitMap.set(u.unit_name, u))
    stats.forEach(s => {
      if (!unitMap.has(s.unit_name)) {
        unitMap.set(s.unit_name, { id: 0, unit_no: s.unit_no || 0, unit_name: s.unit_name })
      }
    })

    return Array.from(unitMap.values()).sort((a, b) => {
      const keyA = parseGradeAndUnit(a.unit_name, a.unit_no).sortKey
      const keyB = parseGradeAndUnit(b.unit_name, b.unit_no).sortKey
      return keyA - keyB
    })
  }, [availableUnits, stats])

  // Filter units according to grade filter
  const activeUnits = useMemo(() => {
    if (gradeFilter === 'all') return allSortedUnits
    const targetGrade = parseInt(gradeFilter, 10)
    return allSortedUnits.filter(u => parseGradeAndUnit(u.unit_name, u.unit_no).grade === targetGrade)
  }, [allSortedUnits, gradeFilter])

  const activeUnitNames = useMemo(() => activeUnits.map(u => u.unit_name), [activeUnits])

  // --- Aggregate Data for Active Grade Filter ---
  // Stats filtered by active units
  const activeStats = useMemo(() => {
    return stats.filter(s => activeUnitNames.includes(s.unit_name))
  }, [stats, activeUnitNames])

  // Learners who have attempts in the selected units (or all learners if all grades)
  const relevantLearners = useMemo(() => {
    return Array.from(new Set(activeStats.map(s => s.learner_name))).sort()
  }, [activeStats])

  // Pivot Table: Rows = Learners, Columns = Units in activeUnits
  const pivotTable = useMemo(() => {
    return relevantLearners.map(learner => {
      const row: any = { learner }
      let total = 0
      activeUnitNames.forEach(unit => {
        const match = activeStats.find(s => s.learner_name === learner && s.unit_name === unit)
        const attempts = match ? parseInt(String(match.attempts), 10) || 0 : 0
        row[unit] = attempts
        total += attempts
      })
      row.total = total
      return row
    })
  }, [relevantLearners, activeUnitNames, activeStats])

  // Unit Summary Data (for top stats bar and popularity chart)
  const unitSummaryData = useMemo(() => {
    return activeUnits.map(u => {
      const total = pivotTable.reduce((acc, row) => acc + (row[u.unit_name] || 0), 0)
      const parsed = parseGradeAndUnit(u.unit_name, u.unit_no)
      return {
        name: u.unit_name,
        shortName: `G${parsed.grade} U${parsed.unit}`,
        grade: parsed.grade,
        unit: parsed.unit,
        Attempts: total
      }
    })
  }, [activeUnits, pivotTable])

  // Chart Data: Top 10 Active Learners for this Grade selection
  const learnerChartData = useMemo(() => {
    return [...pivotTable]
      .filter(l => l.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(l => ({
        name: l.learner,
        Attempts: l.total
      }))
  }, [pivotTable])

  // Chart Data: Most Popular Units
  const unitChartData = useMemo(() => {
    return [...unitSummaryData].sort((a, b) => b.Attempts - a.Attempts)
  }, [unitSummaryData])

  const totalPracticeAttempts = useMemo(() => {
    return pivotTable.reduce((acc, row) => acc + row.total, 0)
  }, [pivotTable])

  const timelineChartData = useMemo(() => {
    return [...timelineStats].reverse().map(d => ({
      ...d,
      displayDate: new Date(d.day).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }),
      Attempts: Number(d.attempts) || 0
    }))
  }, [timelineStats])

  const filteredPivotTable = useMemo(() => {
    return pivotTable.filter(row => {
      if (!searchQuery) return true
      return (row.learner || "").toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [pivotTable, searchQuery])

  const handleExportCSV = () => {
    if (filteredPivotTable.length === 0) return
    const headers = ["Learner Name", "Total Attempts", ...activeUnitNames]
    const csvRows = [headers.join(",")]
    filteredPivotTable.forEach(row => {
      const rowData = [
        `"${row.learner}"`,
        row.total,
        ...activeUnitNames.map(unit => row[unit] || 0)
      ]
      csvRows.push(rowData.join(","))
    })
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `practice-analytics-${gradeFilter === 'all' ? 'all-grades' : `grade-${gradeFilter}`}-${timeRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-500 font-medium">Loading practice analytics... 📚</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Header with Title and Filters */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Practice Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Detailed breakdown of practice attempts across Grade 4, Grade 5, and Grade 6.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Grade Filter Pill Tabs */}
            <div className="flex items-center rounded-lg bg-white p-1 border border-gray-200 shadow-sm">
              {(['all', '4', '5', '6'] as const).map(g => {
                const label = g === 'all' ? 'All Grades' : `Grade ${g}`
                const isActive = gradeFilter === g
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setGradeFilter(g); setCurrentPage(1); }}
                    className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-md transition-all ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Time Range Selector */}
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>

            <button 
              onClick={fetchStats} 
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Statistics Bar with Grade-Aware Units Badges */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm shadow-sm flex items-center gap-2">
              <span className="font-bold text-emerald-800">Total Attempts:</span>
              <span className="font-black text-emerald-950 text-base">{totalPracticeAttempts}</span>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm shadow-sm flex items-center gap-2">
              <span className="font-bold text-blue-800">Active Learners:</span>
              <span className="font-black text-blue-950 text-base">{relevantLearners.length}</span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm flex items-center gap-1.5 text-gray-500">
              <Layers className="h-3.5 w-3.5 text-gray-400" />
              <span>Showing: <strong className="text-gray-800">{activeUnits.length} Units</strong></span>
            </div>
          </div>

          {/* Unit badges sorted strictly by natural progression: Grade 4 (1–6) -> Grade 5 (1–5) -> Grade 6 (1–5) */}
          <div className="flex flex-wrap gap-2">
            {unitSummaryData.map(u => {
              const theme = getGradeTheme(u.grade)
              return (
                <div 
                  key={u.name} 
                  className={`rounded-xl border ${theme.border} ${theme.bg} px-3 py-1.5 text-xs shadow-sm flex items-center gap-2 transition-all hover:shadow`}
                >
                  <span className={`font-bold ${theme.text}`}>{u.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-black ${u.Attempts > 0 ? theme.badgeBg : 'bg-gray-100 text-gray-400'}`}>
                    {u.Attempts}
                  </span>
                </div>
              )
            })}
          </div>
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
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', cursor: 'pointer' }} onClick={handleLegendClick} />
                  <Line type="monotone" dataKey="Attempts" name="Practice Attempts" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} hide={!!hiddenSeries['Attempts']} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">No chart data available</div>
            )}
          </div>
        </section>

        {/* Charts: Top Learners & Unit Popularity */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Learners Chart */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Top Active Learners {gradeFilter !== 'all' ? `(Grade ${gradeFilter})` : ''}
            </h2>
            <div className="h-72 w-full">
              {learnerChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={learnerChartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} width={80} />
                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', cursor: 'pointer' }} onClick={handleLegendClick} />
                    <Bar dataKey="Attempts" name="Attempts" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} hide={!!hiddenSeries['Attempts']} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">No practice attempts recorded for this selection</div>
              )}
            </div>
          </section>

          {/* Unit Popularity Chart */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-500" /> Unit Popularity {gradeFilter !== 'all' ? `(Grade ${gradeFilter})` : ''}
            </h2>
            <div className="h-72 w-full">
              {unitChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dy={10} interval={0} angle={-30} textAnchor="end" height={60} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', cursor: 'pointer' }} onClick={handleLegendClick} />
                    <Bar dataKey="Attempts" name="Attempts" fill="#10b981" radius={[4, 4, 0, 0]} barSize={activeUnits.length > 10 ? 24 : 40} hide={!!hiddenSeries['Attempts']} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">No chart data available</div>
              )}
            </div>
          </section>
        </div>

        {/* Pivot Table: Learner vs Unit Attempts */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm mt-6">
          <div className="border-b border-gray-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 gap-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 whitespace-nowrap flex items-center gap-2">
                Learner vs Unit Attempts
                {gradeFilter !== 'all' && (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 font-semibold">
                    Grade {gradeFilter}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Practice attempts broken down per learner and unit in natural sequence.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="search" 
                  placeholder="Search learner..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors shadow-sm whitespace-nowrap"
              >
                <Download className="h-4 w-4 text-gray-500" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-max">
              <thead className="border-b border-gray-200 bg-white text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-5 py-4 border-r border-gray-100 bg-gray-50 sticky left-0 z-10 shadow-[1px_0_0_0_#f3f4f6]">
                    Learner Name
                  </th>
                  <th scope="col" className="px-5 py-4 text-center text-emerald-700 bg-emerald-50/50 border-r border-gray-100 font-bold">
                    Total
                  </th>
                  {activeUnits.map(unit => {
                    const parsed = parseGradeAndUnit(unit.unit_name, unit.unit_no)
                    const theme = getGradeTheme(parsed.grade)
                    return (
                      <th key={unit.unit_name} scope="col" className="px-4 py-3 text-center border-r border-gray-100 whitespace-nowrap">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.text}`}>
                            Grade {parsed.grade}
                          </span>
                          <span className="font-bold text-gray-800 text-xs">
                            Unit {parsed.unit}
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPivotTable.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((row) => (
                  <tr key={row.learner} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3 font-semibold text-gray-900 border-r border-gray-100 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#f3f4f6]">
                      {row.learner}
                    </td>
                    <td className="px-5 py-3 text-center font-black text-emerald-700 bg-emerald-50/30 border-r border-gray-100">
                      {row.total}
                    </td>
                    {activeUnitNames.map(unit => {
                      const count = row[unit] || 0
                      return (
                        <td key={unit} className={`px-4 py-3 text-center border-r border-gray-100 ${count > 0 ? 'text-gray-900 font-bold' : 'text-gray-300'}`}>
                          {count > 0 ? (
                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-800">
                              {count}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {filteredPivotTable.length === 0 && (
                  <tr>
                    <td colSpan={activeUnits.length + 2} className="px-5 py-12 text-center text-sm text-gray-500">
                      No practice records found for {gradeFilter !== 'all' ? `Grade ${gradeFilter}` : 'this selection'}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {Math.ceil(filteredPivotTable.length / pageSize) > 1 && (
            <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, filteredPivotTable.length)}</span> of <span className="font-medium">{filteredPivotTable.length}</span> results
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
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredPivotTable.length / pageSize), p + 1))}
                  disabled={currentPage === Math.ceil(filteredPivotTable.length / pageSize)}
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
