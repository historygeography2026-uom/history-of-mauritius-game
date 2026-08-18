// PracticeQuestionManagement.tsx — Game Question Table Structure for Practice Questions
"use client"

import { useState, useEffect, useCallback } from "react"
import { Pencil, Plus, Search, Trash2, Upload, Eye, X, Check, Image as ImageIcon } from "lucide-react"

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

  const handleSaveEdit = async () => {
    if (!editingQuestion) return
    setSavingEdit(true)
    setEditError("")

    try {
      const res = await fetch("/api/admin/practice/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuestion),
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
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-black text-slate-900">
                Edit Practice Question #{editingQuestion.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
                {editError}
              </div>
            )}

            <div className="space-y-4 text-sm">
              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Question Text:
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.question_text}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question_text: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Instruction */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Instruction / Hint (optional):
                </label>
                <input
                  type="text"
                  value={editingQuestion.instruction || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, instruction: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Unit and Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Unit:
                  </label>
                  <select
                    value={editingQuestion.unit_id || ""}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, unit_id: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.unit_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Type:
                  </label>
                  <select
                    value={editingQuestion.question_type}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, question_type: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="fill">Fill in the blank</option>
                    <option value="reorder">Ordering</option>
                    <option value="matching">Matching</option>
                    <option value="truefalse">True/False</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Image URL (optional):
                </label>
                <input
                  type="text"
                  value={editingQuestion.image_url || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, image_url: e.target.value })
                  }
                  placeholder="/api/images/filename.jpg or /uploads/filename.jpg"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-medium focus:border-blue-500 focus:outline-none"
                />
                {editingQuestion.image_url && (
                  <div className="mt-2 flex justify-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <img
                      src={editingQuestion.image_url}
                      alt="Preview"
                      className="max-h-32 object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Answer Data Editor */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-3">
                  Answer Data:
                </label>
                
                {editingQuestion.question_type === "mcq" && (
                  <div className="space-y-3">
                    {(editingQuestion.answer_data?.options || []).map((opt: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="mcq_correct" 
                          className="h-4 w-4 text-blue-600"
                          checked={opt.is_correct} 
                          onChange={() => {
                            const newOptions = [...(editingQuestion.answer_data.options || [])];
                            newOptions.forEach(o => o.is_correct = false);
                            newOptions[idx].is_correct = true;
                            setEditingQuestion({...editingQuestion, answer_data: { ...editingQuestion.answer_data, options: newOptions }});
                          }}
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOptions = [...(editingQuestion.answer_data.options || [])];
                            newOptions[idx].text = e.target.value;
                            setEditingQuestion({...editingQuestion, answer_data: { ...editingQuestion.answer_data, options: newOptions }});
                          }}
                          className="flex-1 rounded-xl border border-slate-300 p-2.5 text-slate-900 font-medium focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    ))}
                    {(!editingQuestion.answer_data?.options || editingQuestion.answer_data.options.length === 0) && (
                      <p className="text-sm text-slate-500 italic">No options found. This question may be malformed.</p>
                    )}
                  </div>
                )}

                {editingQuestion.question_type === "truefalse" && (
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        className="h-4 w-4 text-blue-600"
                        checked={editingQuestion.answer_data?.correct_answer === true}
                        onChange={() => setEditingQuestion({...editingQuestion, answer_data: { ...editingQuestion.answer_data, correct_answer: true }})}
                      />
                      True
                    </label>
                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        className="h-4 w-4 text-blue-600"
                        checked={editingQuestion.answer_data?.correct_answer === false}
                        onChange={() => setEditingQuestion({...editingQuestion, answer_data: { ...editingQuestion.answer_data, correct_answer: false }})}
                      />
                      False
                    </label>
                  </div>
                )}

                {editingQuestion.question_type === "fill" && (
                  <div>
                    <input
                      type="text"
                      value={editingQuestion.answer_data?.answers?.[0] || ""}
                      onChange={(e) => setEditingQuestion({...editingQuestion, answer_data: { ...editingQuestion.answer_data, answers: [e.target.value] }})}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-medium focus:border-blue-500 focus:outline-none"
                      placeholder="Correct answer..."
                    />
                  </div>
                )}

                {editingQuestion.question_type === "matching" && (
                  <div className="space-y-3">
                    {(editingQuestion.answer_data?.pairs || []).map((pair: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={pair.left}
                          onChange={(e) => {
                            const newPairs = [...(editingQuestion.answer_data.pairs || [])];
                            newPairs[idx].left = e.target.value;
                            setEditingQuestion({...editingQuestion, answer_data: { ...editingQuestion.answer_data, pairs: newPairs }});
                          }}
                          placeholder="Left side"
                          className="flex-1 rounded-xl border border-slate-300 p-2.5 text-slate-900 font-medium focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-slate-400 font-bold">-</span>
                        <input
                          type="text"
                          value={pair.right}
                          onChange={(e) => {
                            const newPairs = [...(editingQuestion.answer_data.pairs || [])];
                            newPairs[idx].right = e.target.value;
                            setEditingQuestion({...editingQuestion, answer_data: { ...editingQuestion.answer_data, pairs: newPairs }});
                          }}
                          placeholder="Right side"
                          className="flex-1 rounded-xl border border-slate-300 p-2.5 text-slate-900 font-medium focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {editingQuestion.question_type === "reorder" && (
                  <div className="space-y-3">
                    {(editingQuestion.answer_data?.items || [])
                      .sort((a:any, b:any) => a.correct_position - b.correct_position)
                      .map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-8 text-center font-black text-slate-400">{item.correct_position}.</span>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => {
                            const newItems = [...(editingQuestion.answer_data.items || [])];
                            const itemIndex = newItems.findIndex(i => i.correct_position === item.correct_position);
                            if(itemIndex > -1) newItems[itemIndex].text = e.target.value;
                            setEditingQuestion({...editingQuestion, answer_data: { ...editingQuestion.answer_data, items: newItems }});
                          }}
                          className="flex-1 rounded-xl border border-slate-300 p-2.5 text-slate-900 font-medium focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="rounded-xl px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="rounded-xl bg-blue-600 px-6 py-2.5 font-extrabold text-white shadow-md hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
