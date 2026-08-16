// PracticeQuestionManagement.tsx — Fable design, wired to real admin APIs
"use client"

import { useState, useEffect, useCallback } from "react"
import { Pencil, Plus, Search, Trash2, Upload } from "lucide-react"

interface PracticeUnit {
  id: number
  unit_no: number
  unit_name: string
}

interface PracticeQuestion {
  id: number
  unit_id?: number
  unit_no: number
  unit_name: string
  question_type: string
  question_text: string
  instruction?: string
}

// Map API question types to display labels
const TYPE_LABELS: Record<string, { label: string; classes: string }> = {
  mcq: { label: "MCQ", classes: "bg-blue-50 text-blue-700 ring-blue-200" },
  fill: { label: "Fill Blank", classes: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  reorder: { label: "Ordering", classes: "bg-amber-50 text-amber-700 ring-amber-200" },
  matching: { label: "Matching", classes: "bg-violet-50 text-violet-700 ring-violet-200" },
  truefalse: { label: "True/False", classes: "bg-pink-50 text-pink-700 ring-pink-200" },
}

interface Props {
  onImport?: () => void
  onAdd?: () => void
}

export default function PracticeQuestionManagement({ onImport, onAdd }: Props) {
  const [units, setUnits] = useState<PracticeUnit[]>([])
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [unitFilter, setUnitFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [search, setSearch] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const [unitsRes, questionsRes] = await Promise.all([
        fetch("/api/admin/practice/units"),
        fetch("/api/admin/practice/questions"),
      ])
      if (unitsRes.ok) {
        const data = await unitsRes.json()
        setUnits(Array.isArray(data) ? data : data.units || [])
      }
      if (questionsRes.ok) {
        const data = await questionsRes.json()
        setQuestions(Array.isArray(data) ? data : data.questions || [])
      }
    } catch (e) {
      console.error("Failed to fetch practice data:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (questionId: number) => {
    if (!confirm("Delete this practice question?")) return
    try {
      await fetch("/api/admin/practice/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questionId }),
      })
      setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    } catch (e) {
      console.error("Delete failed:", e)
    }
  }

  const filtered = questions.filter((q) => {
    if (unitFilter !== "all" && q.unit_no !== Number(unitFilter)) return false
    if (typeFilter !== "all" && q.question_type !== typeFilter) return false
    if (search && !q.question_text.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-500 font-medium">Loading questions... ⏳</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 px-4 py-8 font-sans">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Practice Questions</h1>
            <p className="mt-1 text-sm text-gray-500">Manage the question bank for Practice Mode.</p>
          </div>
          <div className="flex gap-2">
            {onImport && (
              <button
                type="button"
                onClick={onImport}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Import Questions
              </button>
            )}
            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Question
              </button>
            )}
          </div>
        </header>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question text..."
              aria-label="Search questions"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
            />
          </div>
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            aria-label="Filter by unit"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none"
          >
            <option value="all">All units</option>
            {units.map((u) => (
              <option key={u.id} value={u.unit_no}>
                {u.unit_name}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by question type"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none"
          >
            <option value="all">All types</option>
            <option value="mcq">MCQ</option>
            <option value="fill">Fill in the blank</option>
            <option value="reorder">Ordering</option>
            <option value="matching">Matching</option>
            <option value="truefalse">True/False</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">Question</th>
                <th scope="col" className="px-4 py-3">Unit</th>
                <th scope="col" className="px-4 py-3">Type</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((q) => {
                const type = TYPE_LABELS[q.question_type] || { label: q.question_type, classes: "bg-gray-50 text-gray-700 ring-gray-200" }
                return (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="max-w-xs px-4 py-3 font-medium text-gray-900">
                      <span className="line-clamp-1">{q.question_text}</span>
                      <span className="mt-0.5 block font-mono text-xs text-gray-400">#{q.id}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {`Unit ${q.unit_no} — ${q.unit_name}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${type.classes}`}>
                        {type.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {/* TODO: open edit modal */}}
                          aria-label={`Edit question ${q.id}`}
                          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          aria-label={`Delete question ${q.id}`}
                          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                    No questions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Showing {filtered.length} of {questions.length} questions
        </p>
      </div>
    </div>
  )
}
