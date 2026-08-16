"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, BookOpen, Target, TrendingUp, AlertTriangle } from "lucide-react"
import { BarChart, LineChart, DifficultyHeatmap } from "./practice-stats-charts"

interface OverviewData {
  total_sessions: number
  total_attempts: number
  unique_students: number
  avg_accuracy: number
  inactive_students_7d: number
  most_practiced_unit: { unit_no: number; unit_name: string; session_count: number } | null
  least_practiced_unit: { unit_no: number; unit_name: string; session_count: number } | null
}

interface LearnerRow {
  id: number
  name: string
  email: string
  total_attempts: number
  total_sessions: number
  units_attempted: number
  accuracy_pct: number
  last_activity: string
}

interface UnitRow {
  id: number
  unit_no: number
  unit_name: string
  unique_students: number
  total_attempts: number
  avg_accuracy: number
  total_sessions: number
  question_count: number
}

interface HardQuestion {
  id: number
  question_text: string
  question_type: string
  total_attempts: number
  accuracy_pct: number
  unique_students: number
}

interface LearnerDetail {
  student: { id: number; name: string; email: string }
  unit_accuracy: Array<{ unit_no: number; unit_name: string; total_attempts: number; accuracy_pct: number }>
  recent_sessions: Array<{
    id: number
    started_at: string
    ended_at: string
    exit_reason: string
    unit_no: number
    unit_name: string
    questions_count: number
    answers_given: number
    session_accuracy: number
  }>
  daily_activity: Array<{ day: string; attempts: number; accuracy_pct: number }>
}

export default function PracticeLearnerStats() {
  const [view, setView] = useState<"overview" | "learners" | "units" | "hard-questions" | "learner-detail">("overview")
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [learners, setLearners] = useState<LearnerRow[]>([])
  const [units, setUnits] = useState<UnitRow[]>([])
  const [hardQuestions, setHardQuestions] = useState<HardQuestion[]>([])
  const [learnerDetail, setLearnerDetail] = useState<LearnerDetail | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverview()
    fetchLearners()
    fetchUnits()
  }, [])

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/admin/practice/stats?view=overview")
      if (res.ok) setOverview(await res.json())
    } catch (e) {
      console.error("Error fetching overview:", e)
    }
  }

  const fetchLearners = async () => {
    try {
      const res = await fetch("/api/admin/practice/stats?view=learners")
      if (res.ok) setLearners(await res.json())
    } catch (e) {
      console.error("Error fetching learners:", e)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnits = async () => {
    try {
      const res = await fetch("/api/admin/practice/stats?view=units")
      if (res.ok) setUnits(await res.json())
    } catch (e) {
      console.error("Error fetching units:", e)
    }
  }

  const fetchHardQuestions = async (unitId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/practice/stats?view=hard-questions&unit=${unitId}`)
      if (res.ok) setHardQuestions(await res.json())
    } catch (e) {
      console.error("Error fetching hard questions:", e)
    } finally {
      setLoading(false)
    }
  }

  const fetchLearnerDetail = async (studentId: number) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/practice/stats?view=learner-detail&student_id=${studentId}`)
      if (res.ok) setLearnerDetail(await res.json())
    } catch (e) {
      console.error("Error fetching learner detail:", e)
    } finally {
      setLoading(false)
    }
  }

  const daysAgo = (dateStr: string) => {
    if (!dateStr) return "Never"
    const d = new Date(dateStr)
    const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    return `${days} days ago`
  }

  // ── Learner Detail View ──
  if (view === "learner-detail" && learnerDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setView("learners")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Learners
          </Button>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{learnerDetail.student.name}</h3>
            <p className="text-sm text-slate-500">{learnerDetail.student.email}</p>
          </div>
        </div>

        {/* Per-unit accuracy */}
        <Card className="p-5">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Per-Unit Accuracy</h4>
          <BarChart
            data={learnerDetail.unit_accuracy.map((u) => ({
              label: `U${u.unit_no}`,
              value: parseInt(String(u.accuracy_pct)) || 0,
              color: `hsl(${160 + u.unit_no * 30}, 60%, 50%)`,
            }))}
            maxValue={100}
            showPercentage
          />
        </Card>

        {/* Daily activity */}
        {learnerDetail.daily_activity.length > 0 && (
          <Card className="p-5">
            <h4 className="text-sm font-bold text-slate-700 mb-3">Daily Activity (Last 30 Days)</h4>
            <LineChart
              data={learnerDetail.daily_activity.map((d) => ({
                label: new Date(d.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                value: parseInt(String(d.accuracy_pct)) || 0,
              }))}
              showPercentage
            />
          </Card>
        )}

        {/* Recent sessions */}
        <Card className="p-5">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Recent Sessions</h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Unit</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Answered</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learnerDetail.recent_sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">U{s.unit_no}: {s.unit_name}</TableCell>
                    <TableCell className="text-xs">{new Date(s.started_at).toLocaleDateString()}</TableCell>
                    <TableCell>{s.questions_count}</TableCell>
                    <TableCell>{s.answers_given}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        parseInt(String(s.session_accuracy)) >= 70 ? "text-green-600" :
                        parseInt(String(s.session_accuracy)) >= 40 ? "text-amber-600" : "text-red-600"
                      }`}>
                        {s.session_accuracy != null ? `${s.session_accuracy}%` : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        s.exit_reason === "completed" ? "bg-green-100 text-green-700" :
                        s.exit_reason === "exited" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {s.exit_reason || "in progress"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    )
  }

  // ── Hard Questions Drill-down ──
  if (view === "hard-questions") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setView("units")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Units
          </Button>
          <h3 className="text-xl font-bold text-slate-900">Most-Missed Questions</h3>
          <Select value={selectedUnitId} onValueChange={(v) => { setSelectedUnitId(v); fetchHardQuestions(v) }}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select unit" /></SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id.toString()}>Unit {u.unit_no}: {u.unit_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="p-5">
          <DifficultyHeatmap
            data={hardQuestions.map((q) => ({
              label: q.question_text,
              value: parseInt(String(q.accuracy_pct)) || 0,
              attempts: parseInt(String(q.total_attempts)),
            }))}
          />
        </Card>
      </div>
    )
  }

  // ── Main View ──
  return (
    <div className="space-y-6">
      {/* View Tabs */}
      <div className="flex gap-2">
        <Button variant={view === "overview" ? "default" : "outline"} size="sm" onClick={() => setView("overview")}>Overview</Button>
        <Button variant={view === "learners" ? "default" : "outline"} size="sm" onClick={() => setView("learners")}>Per-Student</Button>
        <Button variant={view === "units" ? "default" : "outline"} size="sm" onClick={() => setView("units")}>Per-Unit</Button>
      </div>

      {/* Overview */}
      {view === "overview" && overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-600">Sessions</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{overview.total_sessions}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-600">Students</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{overview.unique_students}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-600">Attempts</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{overview.total_attempts}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-600">Avg Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{overview.avg_accuracy}%</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {overview.most_practiced_unit && (
              <Card className="p-4 border-green-200">
                <p className="text-xs text-slate-500 mb-1">Most Practiced</p>
                <p className="font-bold text-slate-900">Unit {overview.most_practiced_unit.unit_no}: {overview.most_practiced_unit.unit_name}</p>
                <p className="text-xs text-green-600">{overview.most_practiced_unit.session_count} sessions</p>
              </Card>
            )}
            {overview.least_practiced_unit && (
              <Card className="p-4 border-amber-200">
                <p className="text-xs text-slate-500 mb-1">Least Practiced</p>
                <p className="font-bold text-slate-900">Unit {overview.least_practiced_unit.unit_no}: {overview.least_practiced_unit.unit_name}</p>
                <p className="text-xs text-amber-600">{overview.least_practiced_unit.session_count} sessions</p>
              </Card>
            )}
            {overview.inactive_students_7d > 0 && (
              <Card className="p-4 border-red-200 bg-red-50/50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <p className="text-xs text-red-600 font-semibold">Inactive Students</p>
                </div>
                <p className="text-2xl font-bold text-red-700">{overview.inactive_students_7d}</p>
                <p className="text-xs text-red-500">No activity in 7+ days</p>
              </Card>
            )}
          </div>

          {/* Unit Accuracy Chart */}
          {units.length > 0 && (
            <Card className="p-5">
              <h4 className="text-sm font-bold text-slate-700 mb-3">Per-Unit Average Accuracy</h4>
              <BarChart
                data={units.map((u) => ({
                  label: `U${u.unit_no}`,
                  value: parseInt(String(u.avg_accuracy)) || 0,
                  color: `hsl(${160 + u.unit_no * 30}, 60%, 50%)`,
                }))}
                maxValue={100}
                showPercentage
              />
            </Card>
          )}
        </>
      )}

      {/* Per-Student Table */}
      {view === "learners" && (
        <Card className="p-5">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Student Practice Activity</h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      No practice activity recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  learners.map((l) => (
                    <TableRow key={l.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{l.name || "—"}</TableCell>
                      <TableCell className="text-xs text-slate-500">{l.email}</TableCell>
                      <TableCell>{l.units_attempted}</TableCell>
                      <TableCell>{l.total_sessions}</TableCell>
                      <TableCell>{l.total_attempts}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          parseInt(String(l.accuracy_pct)) >= 70 ? "text-green-600" :
                          parseInt(String(l.accuracy_pct)) >= 40 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {l.accuracy_pct}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{daysAgo(l.last_activity)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            fetchLearnerDetail(l.id)
                            setView("learner-detail")
                          }}
                        >
                          Details →
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Per-Unit Table */}
      {view === "units" && (
        <Card className="p-5">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Per-Unit Statistics</h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Unit</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Avg Accuracy</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((u) => (
                  <TableRow key={u.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold mr-2">
                        U{u.unit_no}
                      </span>
                      {u.unit_name}
                    </TableCell>
                    <TableCell>{u.question_count}</TableCell>
                    <TableCell>{u.unique_students}</TableCell>
                    <TableCell>{u.total_sessions}</TableCell>
                    <TableCell>{u.total_attempts}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        parseInt(String(u.avg_accuracy)) >= 70 ? "text-green-600" :
                        parseInt(String(u.avg_accuracy)) >= 40 ? "text-amber-600" : "text-red-600"
                      }`}>
                        {u.avg_accuracy != null ? `${u.avg_accuracy}%` : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUnitId(u.id.toString())
                          fetchHardQuestions(u.id.toString())
                          setView("hard-questions")
                        }}
                      >
                        Hard Questions →
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
