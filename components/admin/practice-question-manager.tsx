"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, Search, X, Save } from "lucide-react"
import dynamic from "next/dynamic"

const PracticeExcelImportSection = dynamic(
  () => import("@/components/admin/practice-excel-import-section"),
  { ssr: false }
)

type QuestionType = "mcq" | "matching" | "fill" | "reorder" | "truefalse"

interface PracticeUnit {
  id: string
  unit_no: number
  unit_name: string
  is_active: boolean
  question_count: number
}

interface PracticeQuestion {
  id: string
  unit_id: string
  unit_no: number
  unit_name: string
  question_type: QuestionType
  question_text: string
  instruction?: string
  image_url?: string
  answer_data: any
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export default function PracticeQuestionManager() {
  const [units, setUnits] = useState<PracticeUnit[]>([])
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnitId, setSelectedUnitId] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<PracticeQuestion | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Unit management state
  const [showUnitEditor, setShowUnitEditor] = useState(false)
  const [editingUnit, setEditingUnit] = useState<PracticeUnit | null>(null)
  const [unitName, setUnitName] = useState("")

  // Form state
  const [formType, setFormType] = useState<QuestionType>("mcq")
  const [formUnitId, setFormUnitId] = useState<string>("")
  const [formQuestionText, setFormQuestionText] = useState("")
  const [formInstruction, setFormInstruction] = useState("")
  const [formImageUrl, setFormImageUrl] = useState("")
  // MCQ
  const [formOptionA, setFormOptionA] = useState("")
  const [formOptionB, setFormOptionB] = useState("")
  const [formOptionC, setFormOptionC] = useState("")
  const [formOptionD, setFormOptionD] = useState("")
  const [formCorrectAnswer, setFormCorrectAnswer] = useState("")
  // Matching
  const [formPairs, setFormPairs] = useState<Array<{ left: string; right: string }>>([
    { left: "", right: "" },
    { left: "", right: "" },
  ])
  // Fill
  const [formFillAnswer, setFormFillAnswer] = useState("")
  // Reorder
  const [formSteps, setFormSteps] = useState<string[]>(["", ""])
  // True/False
  const [formIsTrue, setFormIsTrue] = useState<boolean>(true)

  const questionTypes: QuestionType[] = ["mcq", "matching", "fill", "reorder", "truefalse"]

  useEffect(() => {
    fetchUnits()
  }, [])

  useEffect(() => {
    fetchQuestions()
  }, [selectedUnitId, filterType])

  const fetchUnits = async () => {
    try {
      const res = await fetch("/api/admin/practice/units")
      if (res.ok) {
        const data = await res.json()
        setUnits(data)
        if (data.length > 0 && !formUnitId) {
          setFormUnitId(data[0].id.toString())
        }
      }
    } catch (error) {
      console.error("Error fetching units:", error)
    }
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedUnitId !== "all") params.set("unit", selectedUnitId)
      if (filterType !== "all") params.set("type", filterType)

      const res = await fetch(`/api/admin/practice/questions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  // ── Unit management ──

  const handleSaveUnit = async () => {
    try {
      if (editingUnit) {
        const res = await fetch("/api/admin/practice/units", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingUnit.id, unit_name: unitName }),
        })
        if (!res.ok) throw new Error("Failed to update unit")
      }
      setEditingUnit(null)
      setUnitName("")
      fetchUnits()
    } catch (error) {
      console.error("Error saving unit:", error)
      alert("Failed to save unit")
    }
  }

  const handleToggleUnit = async (unit: PracticeUnit) => {
    try {
      const res = await fetch("/api/admin/practice/units", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: unit.id, is_active: !unit.is_active }),
      })
      if (!res.ok) throw new Error("Failed to toggle unit")
      fetchUnits()
    } catch (error) {
      console.error("Error toggling unit:", error)
    }
  }

  // ── Question management ──

  const resetForm = () => {
    setFormQuestionText("")
    setFormInstruction("")
    setFormImageUrl("")
    setFormOptionA("")
    setFormOptionB("")
    setFormOptionC("")
    setFormOptionD("")
    setFormCorrectAnswer("")
    setFormPairs([{ left: "", right: "" }, { left: "", right: "" }])
    setFormFillAnswer("")
    setFormSteps(["", ""])
    setFormIsTrue(true)
    setEditingQuestion(null)
  }

  const populateFormFromQuestion = (q: PracticeQuestion) => {
    setFormType(q.question_type)
    setFormUnitId(q.unit_id || units.find(u => u.unit_no === q.unit_no)?.id.toString() || "")
    setFormQuestionText(q.question_text)
    setFormInstruction(q.instruction || "")
    setFormImageUrl(q.image_url || "")

    const ad = typeof q.answer_data === "string" ? JSON.parse(q.answer_data) : q.answer_data

    if (q.question_type === "mcq" && ad?.options) {
      const opts = ad.options
      setFormOptionA(opts[0]?.text || "")
      setFormOptionB(opts[1]?.text || "")
      setFormOptionC(opts[2]?.text || "")
      setFormOptionD(opts[3]?.text || "")
      const correct = opts.find((o: any) => o.is_correct)
      setFormCorrectAnswer(correct?.text || "")
    } else if (q.question_type === "matching" && ad?.pairs) {
      setFormPairs(ad.pairs.length >= 2 ? ad.pairs : [...ad.pairs, { left: "", right: "" }])
    } else if (q.question_type === "fill" && ad?.answers) {
      setFormFillAnswer(ad.answers[0] || "")
    } else if (q.question_type === "reorder" && ad?.items) {
      const sorted = [...ad.items].sort((a: any, b: any) => a.correct_position - b.correct_position)
      setFormSteps(sorted.map((i: any) => i.text))
    } else if (q.question_type === "truefalse") {
      setFormIsTrue(ad?.correct_answer ?? true)
    }
  }

  const buildAnswerData = (): any => {
    if (formType === "mcq") {
      const options = [formOptionA, formOptionB, formOptionC, formOptionD]
        .filter((o) => o.trim())
        .map((text) => ({
          text: text.trim(),
          is_correct: text.trim().toLowerCase() === formCorrectAnswer.trim().toLowerCase(),
        }))
      return { options }
    } else if (formType === "matching") {
      const pairs = formPairs.filter((p) => p.left.trim() && p.right.trim())
      return { pairs }
    } else if (formType === "fill") {
      return { answers: [formFillAnswer.trim()] }
    } else if (formType === "reorder") {
      const items = formSteps
        .filter((s) => s.trim())
        .map((text, idx) => ({ text: text.trim(), correct_position: idx + 1 }))
      return { items }
    } else if (formType === "truefalse") {
      return { correct_answer: formIsTrue, explanation: "" }
    }
    return {}
  }

  const handleSaveQuestion = async () => {
    if (!formQuestionText.trim()) {
      alert("Question text is required")
      return
    }
    if (!formUnitId) {
      alert("Please select a unit")
      return
    }

    try {
      const answerData = buildAnswerData()
      const body: any = {
        unit_id: Number(formUnitId),
        question_type: formType,
        question_text: formQuestionText.trim(),
        instruction: formInstruction.trim() || null,
        image_url: formImageUrl.trim() || null,
        answer_data: answerData,
        created_by: "MES",
      }

      let res
      if (editingQuestion) {
        body.id = editingQuestion.id
        res = await fetch("/api/admin/practice/questions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch("/api/admin/practice/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save question")
      }

      resetForm()
      setShowForm(false)
      fetchQuestions()
      fetchUnits() // refresh counts
    } catch (error: any) {
      console.error("Error saving question:", error)
      alert(error.message || "Failed to save question")
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      const res = await fetch(`/api/admin/practice/questions?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      fetchQuestions()
      fetchUnits()
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("Failed to delete question")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} selected question(s)?`)) return

    try {
      for (const id of selectedIds) {
        await fetch(`/api/admin/practice/questions?id=${id}`, { method: "DELETE" })
      }
      setSelectedIds([])
      fetchQuestions()
      fetchUnits()
    } catch (error) {
      console.error("Error bulk deleting:", error)
    }
  }

  const handleExcelImport = async (validQuestions: any[]) => {
    const formData = new FormData()
    formData.append("questions", JSON.stringify(validQuestions))
    formData.append("createdBy", "MES")

    const res = await fetch("/api/admin/practice/import", {
      method: "POST",
      body: formData,
    })

    const result = await res.json()

    if (result.errorCount > 0) {
      console.warn("[practice-import] Errors:", result.errors)
    }

    fetchQuestions()
    fetchUnits()
  }

  // ── Filtering ──

  const filteredQuestions = questions.filter((q) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!q.question_text.toLowerCase().includes(query)) return false
    }
    return true
  })

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const typeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mcq: "MCQ",
      matching: "Match",
      fill: "Fill",
      reorder: "Reorder",
      truefalse: "T/F",
    }
    return labels[type] || type
  }

  // ── Render ──

  return (
    <div className="space-y-6">
      
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Practice Question" : "Add Practice Question"}</DialogTi          <div className="space-y-4 py-4">
            {/* Unit and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit</Label>
                <Select value={formUnitId} onValueChange={setFormUnitId}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {units.filter(u => u.is_active).map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        Unit {u.unit_no}: {u.unit_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as QuestionType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((t) => (
                      <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Question text */}
            <div>
              <Label>Question Text</Label>
              <Textarea
                value={formQuestionText}
                onChange={(e) => setFormQuestionText(e.target.value)}
                placeholder="Enter the question..."
                className="min-h-[80px]"
              />
            </div>

            {/* Instruction */}
            <div>
              <Label>Instruction (optional)</Label>
              <Input
                value={formInstruction}
                onChange={(e) => setFormInstruction(e.target.value)}
                placeholder="e.g. Match each item on the left with its pair on the right"
              />
            </div>

            {/* Image URL */}
            <div>
              <Label>Image URL (optional)</Label>
              <Input
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="/practice-assets/g5-u1/image.jpg"
              />
            </div>

            {/* Type-specific fields */}
            {formType === "mcq" && (
              <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                <Label className="text-blue-700 font-semibold">MCQ Options</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Option A" value={formOptionA} onChange={(e) => setFormOptionA(e.target.value)} className="bg-white" />
                  <Input placeholder="Option B" value={formOptionB} onChange={(e) => setFormOptionB(e.target.value)} className="bg-white" />
                  <Input placeholder="Option C" value={formOptionC} onChange={(e) => setFormOptionC(e.target.value)} className="bg-white" />
                  <Input placeholder="Option D" value={formOptionD} onChange={(e) => setFormOptionD(e.target.value)} className="bg-white" />
                </div>
                <div>
                  <Label className="text-blue-700">Correct Answer (must match one option exactly)</Label>
                  <Input value={formCorrectAnswer} onChange={(e) => setFormCorrectAnswer(e.target.value)} placeholder="Port Louis" className="bg-white border-blue-200" />
                </div>
              </div>
            )}

            {formType === "matching" && (
              <div className="space-y-3 p-4 bg-purple-50/50 border border-purple-100 rounded-lg">
                <Label className="text-purple-700 font-semibold">Matching Pairs</Label>
                {formPairs.map((pair, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={`Left item ${i + 1}`}
                      value={pair.left}
                      onChange={(e) => {
                        const updated = [...formPairs]
                        updated[i] = { ...updated[i], left: e.target.value }
                        setFormPairs(updated)
                      }}
                      className="bg-white"
                    />
                    <Input
                      placeholder={`Right item ${i + 1}`}
                      value={pair.right}
                      onChange={(e) => {
                        const updated = [...formPairs]
                        updated[i] = { ...updated[i], right: e.target.value }
                        setFormPairs(updated)
                      }}
                      className="bg-white"
                    />
                  </div>
                ))}
                {formPairs.length < 4 && (
                  <Button variant="outline" size="sm" onClick={() => setFormPairs([...formPairs, { left: "", right: "" }])}>
                    <Plus className="h-3 w-3 mr-1" /> Add Pair
                  </Button>
                )}
              </div>
            )}

            {formType === "fill" && (
              <div className="p-4 bg-green-50/50 border border-green-100 rounded-lg">
                <Label className="text-green-700 font-semibold">Fill Answer</Label>
                <Input value={formFillAnswer} onChange={(e) => setFormFillAnswer(e.target.value)} placeholder="extinct" className="bg-white" />
                <p className="text-xs text-green-600 mt-1">Use _______ in the question text to mark the blank</p>
              </div>
            )}

            {formType === "reorder" && (
              <div className="space-y-3 p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
                <Label className="text-amber-700 font-semibold">Steps (in correct order)</Label>
                {formSteps.map((step, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs font-bold text-amber-600 w-6">{i + 1}.</span>
                    <Input
                      placeholder={`Step ${i + 1}`}
                      value={step}
                      onChange={(e) => {
                        const updated = [...formSteps]
                        updated[i] = e.target.value
                        setFormSteps(updated)
                      }}
                      className="bg-white"
                    />
                  </div>
                ))}
                {formSteps.length < 4 && (
                  <Button variant="outline" size="sm" onClick={() => setFormSteps([...formSteps, ""])}>
                    <Plus className="h-3 w-3 mr-1" /> Add Step
                  </Button>
                )}
              </div>
            )}

            {formType === "truefalse" && (
              <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-lg">
                <Label className="text-orange-700 font-semibold">Correct Answer</Label>
                <Select value={formIsTrue ? "true" : "false"} onValueChange={(v) => setFormIsTrue(v === "true")}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button onClick={() => { resetForm(); setShowForm(false) }} variant="ghost">
                Cancel
              </Button>
              <Button onClick={handleSaveQuestion} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
                <Save className="h-4 w-4 mr-2" />
                {editingQuestion ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Unit Management */}
      <Card className="p-4 border-emerald-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900">📋 Practice Units</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUnitEditor(!showUnitEditor)}
          >
            {showUnitEditor ? "Hide" : "Manage Units"}
          </Button>
        </div>

        {/* Quick unit stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
          {units.map((u) => (
            <div
              key={u.id}
              className={`text-center p-2 rounded-lg text-xs font-medium ${
                u.is_active
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              <div className="font-bold">Unit {u.unit_no}</div>
              <div>{u.question_count} Q</div>
            </div>
          ))}
        </div>

        {showUnitEditor && (
          <div className="space-y-2 pt-3 border-t">
            {units.map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 w-12">Unit {u.unit_no}</span>
                {editingUnit?.id === u.id ? (
                  <>
                    <Input
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      className="flex-1 h-8 text-sm"
                    />
                    <Button size="sm" className="h-8" onClick={handleSaveUnit}>Save</Button>
                    <Button size="sm" variant="outline" className="h-8" onClick={() => { setEditingUnit(null); setUnitName("") }}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{u.unit_name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => { setEditingUnit(u); setUnitName(u.unit_name) }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 ${u.is_active ? "text-green-600" : "text-slate-400"}`}
                      onClick={() => handleToggleUnit(u)}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Excel Import */}
      <PracticeExcelImportSection onImport={handleExcelImport} isLoading={loading} />

      {/* Question Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">Practice Questions</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Question
            </Button>
            {selectedIds.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="outline"
                className="text-red-600 border-red-200"
              >
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg mb-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
              <SelectTrigger><SelectValue placeholder="All Units" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>Unit {u.unit_no}: {u.unit_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {questionTypes.map((t) => (
                  <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Questions Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[40px]">
                    <Input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={filteredQuestions.length > 0 && selectedIds.length === filteredQuestions.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredQuestions.map((q) => q.id))
                        else setSelectedIds([])
                      }}
                    />
                  </TableHead>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead className="w-[80px]">Unit</TableHead>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead className="min-w-[300px]">Question</TableHead>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead className="w-[140px]">Created At</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      Loading questions...
                    </TableCell>
                  </TableRow>
                ) : filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      No practice questions found. Try adjusting your filters or add new questions.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuestions.map((q) => (
                    <TableRow key={q.id} className="hover:bg-slate-50">
                      <TableCell>
                        <Input type="checkbox" className="h-4 w-4" checked={selectedIds.includes(q.id)} onChange={() => toggleSelectId(q.id)} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{q.id}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">
                          U{q.unit_no}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {typeLabel(q.question_type)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate text-sm">{q.question_text}</p>
                      </TableCell>
                      <TableCell>
                        {q.image_url ? (
                          <img src={q.image_url} alt="Q" className="w-12 h-12 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }} />
                        ) : (
                          <span className="text-slate-400 text-xs">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {new Date(q.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            onClick={() => {
                              populateFormFromQuestion(q)
                              setEditingQuestion(q)
                              setShowForm(true)
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteQuestion(q.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="text-sm text-slate-600 text-center mt-3">
          Showing {filteredQuestions.length} of {questions.length} practice questions
        </div>
      </Card>
    </div>
  )
}
