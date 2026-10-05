// WrongAnswersDashboard.tsx — Admin view for tracking and analyzing wrong answers (Practice + Game modes)
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AlertTriangle, ChevronDown, ChevronUp, Download, Eye, Search, X, Users, BarChart3, BookOpen, Gamepad2 } from "lucide-react"

type Source = "practice" | "game"

interface WrongAnswerRow {
  question_id: number
  question_text: string
  question_type: string
  unit_no: number
  unit_name: string
  wrong_count: string | number
  unique_wrong_students: string | number
  total_attempts: string | number
  error_rate_pct: string | number
  most_common_wrong_answer: unknown
  most_common_wrong_count: string | number | null
}

interface WrongAnswerDetail {
  question: {
    id: number
    question_text: string
    question_type: string
    answer_data: any
    unit_no: number
    unit_name: string
  }
  stats: {
    total_attempts: string
    correct_count: string
    wrong_count: string
    unique_students: string
    students_wrong: string
    students_correct: string
  }
  wrong_answer_distribution: Array<{
    student_answer: unknown
    frequency: string
    pct: string
    first_seen: string
    last_seen: string
  }>
}

function getQuestionTypeBadge(type: string) {
  const badges: Record<string, { label: string; color: string }> = {
    mcq: { label: "MCQ", color: "bg-blue-100 text-blue-700" },
    matching: { label: "Matching", color: "bg-purple-100 text-purple-700" },
    fill: { label: "Fill", color: "bg-amber-100 text-amber-700" },
    reorder: { label: "Reorder", color: "bg-cyan-100 text-cyan-700" },
    truefalse: { label: "True/False", color: "bg-pink-100 text-pink-700" },
  }
  const badge = badges[type] || { label: type, color: "bg-gray-100 text-gray-700" }
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${badge.color}`}>
      {badge.label}
    </span>
  )
}

function getErrorRateColor(rate: number) {
  if (rate >= 80) return "bg-red-100 text-red-800 border-red-200"
  if (rate >= 60) return "bg-orange-100 text-orange-800 border-orange-200"
  if (rate >= 40) return "bg-amber-100 text-amber-800 border-amber-200"
  return "bg-yellow-50 text-yellow-800 border-yellow-200"
}

function formatParsedAnswer(parsed: any): string {
  if (parsed === null || parsed === undefined) return "\u2014"
  if (typeof parsed === "string") return parsed
  if (typeof parsed === "boolean") return parsed ? "True" : "False"
  if (typeof parsed === "number") return String(parsed)
  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0]?.left !== undefined) {
      return parsed.map((p: any) => `${p.left} \u2192 ${p.right}`).join(", ")
    }
    return parsed.join(" \u2192 ")
  }
  if (typeof parsed === "object") {
    // Single matching pair (game mode, exploded)
    if ("left" in parsed && "right" in parsed) return `${parsed.left} \u2192 ${parsed.right}`
    // Whole matching attempt { wrong_pairs, gave_up }
    if (Array.isArray(parsed.wrong_pairs)) {
      const pairs = formatParsedAnswer(parsed.wrong_pairs)
      return parsed.gave_up ? `${pairs || ""}${pairs ? " " : ""}(Gave up)` : pairs
    }
  }
  return JSON.stringify(parsed)
}

function formatStudentAnswer(answer: unknown): string {
  if (answer === null || answer === undefined) return "\u2014"
  // JSONB columns usually arrive already parsed; strings may still be JSON-encoded
  if (typeof answer !== "string") return formatParsedAnswer(answer)
  try {
    return formatParsedAnswer(JSON.parse(answer))
  } catch {
    return answer
  }
}

function getCorrectAnswer(answerData: any, questionType: string): string {
  if (!answerData) return "\u2014"
  try {
    const data = typeof answerData === "string" ? JSON.parse(answerData) : answerData
    switch (questionType) {
      case "mcq": {
        if (data.correct_answer) return String(data.correct_answer)
        const correct = data.options?.find?.((o: any) => o.is_correct)
        return correct?.text || "\u2014"
      }
      case "truefalse":
        return data.correct_answer ? "True" : "False"
      case "fill":
        return data.answers?.join(", ") || "\u2014"
      case "matching":
        return data.pairs?.map((p: any) => `${p.left} \u2192 ${p.right}`).join("; ") || "\u2014"
      case "reorder":
        return data.items
          ?.sort((a: any, b: any) => (a.correct_position || 0) - (b.correct_position || 0))
          .map((i: any) => i.text)
          .join(" \u2192 ") || "\u2014"
      default:
        return "\u2014"
    }
  } catch {
    return "\u2014"
  }
}

export default function WrongAnswersDashboard() {
  const [data, setData] = useState<WrongAnswerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [detailModal, setDetailModal] = useState<WrongAnswerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Data source: practice mode vs game mode
  const [source, setSource] = useState<Source>("practice")

  // Filters
  const [gradeFilter, setGradeFilter] = useState<"all" | "4" | "5" | "6">("all")
  const [subjectFilter, setSubjectFilter] = useState<"all" | "history" | "geography">("all")
  const [levelFilter, setLevelFilter] = useState<"all" | "1" | "2" | "3">("all")
  const [unitFilter, setUnitFilter] = useState<string>("")
  const [rangeFilter, setRangeFilter] = useState<"7d" | "30d" | "all">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [minAttempts, setMinAttempts] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"wrong_count" | "error_rate_pct" | "unique_wrong_students">("wrong_count")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  const apiBase = source === "game" ? "/api/admin/game-wrong-answers" : "/api/admin/practice/stats"

  const fetchWrongAnswers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ view: "wrong-answers" })
      if (source === "practice") {
        if (gradeFilter !== "all") params.set("grade", gradeFilter)
        if (unitFilter) params.set("unit", unitFilter)
      } else {
        if (subjectFilter !== "all") params.set("subject", subjectFilter)
        if (levelFilter !== "all") params.set("level", levelFilter)
      }
      if (rangeFilter !== "all") params.set("range", rangeFilter)
      if (typeFilter !== "all") params.set("question_type", typeFilter)
      params.set("min_attempts", String(minAttempts))

      const res = await fetch(`${apiBase}?${params.toString()}`)
      if (res.ok) {
        const rows = await res.json()
        setData(Array.isArray(rows) ? rows : [])
      } else {
        setData([])
      }
    } catch (e) {
      console.error("Failed to fetch wrong answers:", e)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [source, apiBase, gradeFilter, subjectFilter, levelFilter, unitFilter, rangeFilter, typeFilter, minAttempts])

  useEffect(() => {
    fetchWrongAnswers()
  }, [fetchWrongAnswers])

  // Automatically reset to page 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [source, gradeFilter, subjectFilter, levelFilter, unitFilter, rangeFilter, typeFilter, minAttempts, searchQuery])

  const handleSourceChange = (next: Source) => {
    if (next === source) return
    setSource(next)
    setCurrentPage(1)
    setSearchQuery("")
  }

  const fetchDetail = async (questionId: number) => {
    try {
      setDetailLoading(true)
      const res = await fetch(`${apiBase}?view=wrong-answer-detail&question_id=${questionId}`)
      if (res.ok) {
        const detail = await res.json()
        setDetailModal(detail)
      }
    } catch (e) {
      console.error("Failed to fetch wrong answer detail:", e)
    } finally {
      setDetailLoading(false)
    }
  }

  // Client-side search filter
  const filteredData = useMemo(() => {
    let result = [...data]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.question_text.toLowerCase().includes(q) ||
          r.unit_name.toLowerCase().includes(q) ||
          r.question_type.toLowerCase().includes(q)
      )
    }
    result.sort((a, b) => {
      const av = Number(a[sortField]) || 0
      const bv = Number(b[sortField]) || 0
      return sortDir === "desc" ? bv - av : av - bv
    })
    return result
  }, [data, searchQuery, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 opacity-30" />
    return sortDir === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
  }

  const handleExportCSV = () => {
    if (filteredData.length === 0) return
    const headers = ["Question", "Type", source === "game" ? "Subject / Level" : "Unit", "Wrong Count", "Error Rate %", "Unique Students", "Total Attempts", "Most Common Wrong Answer"]
    const csvRows = [headers.join(",")]
    filteredData.forEach((row) => {
      csvRows.push(
        [
          `"${row.question_text.replace(/"/g, '""')}"`,
          row.question_type,
          `"${row.unit_name}"`,
          row.wrong_count,
          row.error_rate_pct,
          row.unique_wrong_students,
          row.total_attempts,
          `"${formatStudentAnswer(row.most_common_wrong_answer).replace(/"/g, '""')}"`,
        ].join(",")
      )
    })
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const scope =
      source === "game"
        ? `game-${subjectFilter}-${levelFilter === "all" ? "all-levels" : `level-${levelFilter}`}`
        : `practice-${gradeFilter === "all" ? "all-grades" : `grade-${gradeFilter}`}`
    a.download = `wrong-answers-${scope}-${rangeFilter}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Summary stats
  const summary = useMemo(() => {
    const totalWrong = data.reduce((sum, r) => sum + (Number(r.wrong_count) || 0), 0)
    const avgErrorRate = data.length > 0 ? Math.round(data.reduce((sum, r) => sum + (Number(r.error_rate_pct) || 0), 0) / data.length) : 0
    return { totalWrong, questionsAffected: data.length, avgErrorRate }
  }, [data])

  return (
    <div className="bg-gray-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Wrong Answers Tracker
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Identify misconceptions and most-missed questions in {source === "game" ? "Game Mode" : "Practice Mode"}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Source switch */}
            <div className="flex items-center rounded-lg bg-gray-200/70 p-0.5" role="tablist" aria-label="Data source">
              {([
                { key: "practice" as const, label: "Practice", Icon: BookOpen },
                { key: "game" as const, label: "Game", Icon: Gamepad2 },
              ]).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  id={`wrong-answers-source-${key}`}
                  role="tab"
                  aria-selected={source === key}
                  onClick={() => handleSourceChange(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    source === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Total Wrong Answers</span>
            </div>
            <p className="text-3xl font-black text-red-700">{summary.totalWrong.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Questions With Errors</span>
            </div>
            <p className="text-3xl font-black text-orange-700">{summary.questionsAffected}</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Error Rate</span>
            </div>
            <p className="text-3xl font-black text-amber-700">{summary.avgErrorRate}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          {source === "practice" ? (
            /* Grade filter (practice) */
            <div className="flex items-center rounded-lg bg-gray-100 p-0.5">
              {(["all", "4", "5", "6"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => { setGradeFilter(g); setUnitFilter(""); setCurrentPage(1) }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    gradeFilter === g ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {g === "all" ? "All" : `G${g}`}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Subject filter (game) */}
              <div className="flex items-center rounded-lg bg-gray-100 p-0.5">
                {(["all", "history", "geography"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSubjectFilter(s); setCurrentPage(1) }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      subjectFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {s === "all" ? "All" : s === "history" ? "History" : "Geography"}
                  </button>
                ))}
              </div>
              {/* Level filter (game) */}
              <div className="flex items-center rounded-lg bg-gray-100 p-0.5">
                {(["all", "3", "2", "1"] as const).map((lv) => (
                  <button
                    key={lv}
                    onClick={() => { setLevelFilter(lv); setCurrentPage(1) }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      levelFilter === lv ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {lv === "all" ? "All Levels" : `L${lv}`}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Date range */}
          <select
            value={rangeFilter}
            onChange={(e) => { setRangeFilter(e.target.value as any); setCurrentPage(1) }}
            className="rounded-lg border border-gray-300 bg-white py-1.5 pl-2 pr-6 text-xs font-semibold text-gray-700 shadow-sm"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="7d">Last 7 Days</option>
          </select>

          {/* Question type */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }}
            className="rounded-lg border border-gray-300 bg-white py-1.5 pl-2 pr-6 text-xs font-semibold text-gray-700 shadow-sm"
          >
            <option value="all">All Types</option>
            <option value="mcq">MCQ</option>
            <option value="matching">Matching</option>
            <option value="fill">Fill in Blank</option>
            <option value="reorder">Reorder</option>
            <option value="truefalse">True/False</option>
          </select>

          {/* Min wrong attempts threshold */}
          <select
            value={minAttempts}
            onChange={(e) => { setMinAttempts(parseInt(e.target.value) || 1); setCurrentPage(1) }}
            className="rounded-lg border border-gray-300 bg-white py-1.5 pl-2 pr-6 text-xs font-semibold text-gray-700 shadow-sm"
          >
            <option value={1}>Min 1 wrong</option>
            <option value={3}>Min 3 wrong</option>
            <option value={5}>Min 5 wrong</option>
            <option value={10}>Min 10 wrong</option>
            <option value={20}>Min 20 wrong</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
          </div>
        </div>

        {/* Table */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16">
              <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No wrong answers found for the selected filters.</p>
              <p className="text-xs text-gray-400 mt-1">Try broadening your filters or changing the date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-8">#</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{source === "game" ? "Subject / Level" : "Unit"}</th>
                    <th
                      className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                      onClick={() => handleSort("wrong_count")}
                    >
                      <span className="inline-flex items-center gap-1">
                        Wrong <SortIcon field="wrong_count" />
                      </span>
                    </th>
                    <th
                      className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                      onClick={() => handleSort("error_rate_pct")}
                    >
                      <span className="inline-flex items-center gap-1">
                        Error % <SortIcon field="error_rate_pct" />
                      </span>
                    </th>
                    <th
                      className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                      onClick={() => handleSort("unique_wrong_students")}
                    >
                      <span className="inline-flex items-center gap-1">
                        Students <SortIcon field="unique_wrong_students" />
                      </span>
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Most Common Wrong</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize).map((row, idx) => {
                    const errorRate = Number(row.error_rate_pct) || 0
                    const globalIdx = (safeCurrentPage - 1) * pageSize + idx
                    return (
                      <tr key={`${source}-${row.question_id}`} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{globalIdx + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium max-w-[300px] truncate" title={row.question_text}>
                          {row.question_text}
                        </td>
                        <td className="px-4 py-3">{getQuestionTypeBadge(row.question_type)}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-medium whitespace-nowrap">{row.unit_name}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-red-700">{Number(row.wrong_count).toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 ml-0.5">/ {Number(row.total_attempts).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getErrorRateColor(errorRate)}`}>
                            {errorRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {row.unique_wrong_students}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate" title={formatStudentAnswer(row.most_common_wrong_answer)}>
                          {row.most_common_wrong_answer !== null && row.most_common_wrong_answer !== undefined ? (
                            <span>
                              &ldquo;{formatStudentAnswer(row.most_common_wrong_answer)}&rdquo;
                              {row.most_common_wrong_count ? (
                                <span className="text-[10px] text-gray-400 ml-1">(&times;{row.most_common_wrong_count})</span>
                              ) : null}
                            </span>
                          ) : (
                            "\u2014"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => fetchDetail(row.question_id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="View wrong answer details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredData.length > pageSize && (
            <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between bg-gray-50/70">
              <span className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-800">{(safeCurrentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-semibold text-gray-800">{Math.min(safeCurrentPage * pageSize, filteredData.length)}</span> of{" "}
                <span className="font-semibold text-gray-800">{filteredData.length}</span> questions
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors font-medium text-gray-700 bg-white shadow-xs"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors font-medium text-gray-700 bg-white shadow-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Detail Modal (Tier 2) */}
      {(detailModal || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !detailLoading && setDetailModal(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent" />
              </div>
            ) : detailModal ? (
              <>
                {/* Modal Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-start justify-between bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      {getQuestionTypeBadge(detailModal.question.question_type)}
                      <span className="text-xs text-gray-500 font-medium">{detailModal.question.unit_name}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">{detailModal.question.question_text}</h3>
                    <p className="mt-1.5 text-xs text-emerald-700 font-medium">
                      &#10003; Correct: {getCorrectAnswer(detailModal.question.answer_data, detailModal.question.question_type)}
                    </p>
                  </div>
                  <button
                    onClick={() => setDetailModal(null)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-0 border-b border-gray-200">
                  {[
                    { label: "Total Attempts", value: detailModal.stats.total_attempts, color: "text-gray-700" },
                    { label: "Correct", value: detailModal.stats.correct_count, color: "text-emerald-700" },
                    { label: "Wrong", value: detailModal.stats.wrong_count, color: "text-red-700" },
                    { label: "Students", value: detailModal.stats.unique_students, color: "text-blue-700",
                      subtitle: `${Number(detailModal.stats.students_wrong || 0)} got wrong \u00B7 ${Number(detailModal.stats.students_correct || 0)} got right` },
                  ].map((stat) => (
                    <div key={stat.label} className="px-4 py-3 text-center border-r border-gray-100 last:border-r-0">
                      <p className={`text-xl font-black ${stat.color}`}>{Number(stat.value).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                      {'subtitle' in stat && stat.subtitle && (
                        <p className="text-[9px] text-gray-400 mt-0.5">{stat.subtitle}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Wrong Answer Distribution */}
                <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "calc(85vh - 240px)" }}>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Wrong Answer Distribution
                  </h4>

                  {detailModal.wrong_answer_distribution.length === 0 ? (
                    <p className="text-sm text-gray-400 py-8 text-center">No wrong answer data available.</p>
                  ) : (
                    <div className="space-y-2">
                      {detailModal.wrong_answer_distribution.map((item, idx) => {
                        const pct = Number(item.pct) || 0
                        const freq = Number(item.frequency) || 0
                        return (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-semibold text-gray-900 flex-1 min-w-0 truncate pr-2">
                                &ldquo;{formatStudentAnswer(item.student_answer)}&rdquo;
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs font-bold text-red-600">{freq}&times;</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getErrorRateColor(pct)}`}>
                                  {pct}%
                                </span>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-red-400 to-red-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] text-gray-400">
                                First: {new Date(item.first_seen).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                Last: {new Date(item.last_seen).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}


                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
