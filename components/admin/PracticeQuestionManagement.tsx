// PracticeQuestionManagement.tsx — Game Question Table Structure for Practice Questions
"use client"

import { useState, useEffect, useCallback } from "react"
import { Pencil, Plus, Search, Trash2, Upload, Eye, X, Check, Image as ImageIcon } from 'lucide-react'
import PracticeQuestionEditModal from './PracticeQuestionEditModal'

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
  image_url?: string
  answer_data?: any
  is_active?: boolean
    created_at?: string
  updated_at?: string
}

// Map API question types to display badges
const TYPE_LABELS: Record<string, { label: string; badge: string }> = {
  mcq: { label: "MCQ", badge: "bg-blue-100 text-blue-700 border border-blue-300" },
  fill: { label: "Fill", badge: "bg-emerald-100 text-emerald-700 border border-emerald-300" },
  reorder: { label: "Reorder", badge: "bg-amber-100 text-amber-700 border border-amber-300" },
  matching: { label: "Match", badge: "bg-purple-100 text-purple-700 border border-purple-300" },
  truefalse: { label: "T/F", badge: "bg-rose-100 text-rose-700 border border-rose-300" },
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

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<PracticeQuestion | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState("")

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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this practice question?")) return
    try {
      const res = await fetch(`/api/admin/practice/questions?id=${questionId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId))
      } else {
        alert("Failed to delete question")
      }
    } catch (e) {
      console.error("Delete failed:", e)
      alert("Delete failed due to a network error")
    }
  }

  const handleSaveEdit = async (updatedQuestion: Partial<PracticeQuestion>) => {
      if (!updatedQuestion) return
    setSavingEdit(true)
    setEditError("")

    try {
      const res = await fetch("/api/admin/practice/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedQuestion),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update question")
      }

      const updated = await res.json()
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? { ...q, ...updated } : q)))
      setEditingQuestion(null)
    } catch (err: any) {
      setEditError(err.message || "Failed to save question")
    } finally {
      setSavingEdit(false)
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
        <p className="text-lg text-slate-500 font-bold">Loading practice questions... ⏳</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 px-4 py-6 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header Bar */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Practice Question Bank</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage all Grade 5 & Grade 6 practice questions, visuals, and answer keys.
            </p>
          </div>
          <div className="flex gap-2.5">
            {onImport && (
              <button
                type="button"
                onClick={onImport}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:shadow"
              >
                <Upload className="h-4 w-4 text-emerald-600" />
                Import Excel
              </button>
            )}
            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            )}
          </div>
        </header>

        {/* Statistics Bar */}
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm shadow-sm flex items-center gap-2">
            <span className="font-bold text-blue-700">Displaying:</span>
            <span className="font-black text-blue-900">{filtered.length}</span>
            <span className="text-blue-600">/ {questions.length} total</span>
          </div>
          {units.map(u => {
            const count = questions.filter(q => q.unit_no === u.unit_no).length;
            if (count === 0) return null;
            return (
              <div key={u.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm flex items-center gap-2">
                <span className="font-bold text-slate-700">{u.unit_name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-black text-slate-600">{count}</span>
              </div>
            )
          })}
        </div>

        {/* Filters Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question text..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none shadow-sm"
            />
          </div>
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            aria-label="Filter by unit"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none shadow-sm"
          >
            <option value="all">All Units (10)</option>
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
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none shadow-sm"
          >
            <option value="all">All Types</option>
            <option value="mcq">MCQ</option>
            <option value="fill">Fill in the blank</option>
            <option value="reorder">Ordering</option>
            <option value="matching">Matching</option>
            <option value="truefalse">True/False</option>
          </select>
        </div>

        {/* Game-Question-Structured Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-100 text-xs font-black uppercase tracking-wider text-slate-600">
              <tr>
                <th scope="col" className="w-[60px] px-4 py-3.5">ID</th>
                <th scope="col" className="w-[85px] px-4 py-3.5">Type</th>
                <th scope="col" className="w-[140px] px-4 py-3.5">Subject</th>
                <th scope="col" className="w-[130px] px-4 py-3.5">Level / Unit</th>
                <th scope="col" className="min-w-[280px] px-4 py-3.5">Question</th>
                <th scope="col" className="w-[110px] px-4 py-3.5">Image</th>
                <th scope="col" className="w-[130px] px-4 py-3.5">Created At</th>
                <th scope="col" className="w-[120px] px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((q) => {
                const typeInfo = TYPE_LABELS[q.question_type] || {
                  label: q.question_type,
                  badge: "bg-slate-100 text-slate-700 border border-slate-300",
                }
                const isGrade5 = q.unit_no <= 5
                const createdDate = q.created_at ? new Date(q.created_at).toLocaleDateString() : "—"

                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-500">
                      #{q.id}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-black ${typeInfo.badge}`}>
                        {typeInfo.label}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3 font-bold text-slate-700 text-xs">
                      History & Geography
                    </td>

                    {/* Level / Unit */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                          isGrade5
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {q.unit_name || `Unit ${q.unit_no}`}
                      </span>
                    </td>

                    {/* Question Text */}
                    <td className="max-w-[320px] px-4 py-3 font-medium text-slate-900">
                      <p className="line-clamp-2 text-sm leading-snug">{q.question_text}</p>
                      {q.instruction && (
                        <span className="mt-1 block text-xs font-semibold text-amber-700 truncate">
                          💡 {q.instruction}
                        </span>
                      )}
                    </td>

                    {/* Image Thumbnail */}
                    <td className="px-4 py-3">
                      {q.image_url ? (
                        <div className="relative group">
                          <img
                            src={q.image_url}
                            alt="Visual"
                            className="h-12 w-16 rounded-lg object-contain border border-slate-200 bg-slate-50 shadow-xs"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <ImageIcon className="h-3.5 w-3.5" /> No image
                        </span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {createdDate}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            let parsed = q.answer_data;
                            if (typeof parsed === "string") {
                              try { parsed = JSON.parse(parsed) } catch(e) {}
                            }
                            setEditingQuestion({ ...q, answer_data: parsed || {} });
                          }}
                          aria-label={`Edit question ${q.id}`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Question"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          aria-label={`Delete question ${q.id}`}
                          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm font-bold text-slate-500">
                    No practice questions found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
          <p>
            Showing {filtered.length} of {questions.length} total practice questions
          </p>
          <p>Mauritius Learning Hub — Practice Administration</p>
        </div>
      </div>

      {/* Edit Question Modal */}
      {/* Edit Modal */}
      <PracticeQuestionEditModal
        open={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSave={handleSaveEdit}
        question={editingQuestion}
        units={units}
      />
    </div>
  )
}
