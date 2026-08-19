"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save, Image as ImageIcon, CheckCircle, FileText } from "lucide-react"

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
}

interface Props {
  open: boolean
  onClose: () => void
  onSave: (question: Partial<PracticeQuestion>) => Promise<void>
  question: PracticeQuestion | null
  units?: { id: number; unit_no: number; unit_name: string }[]
}

export default function PracticeQuestionEditModal({ open, onClose, onSave, question, units = [] }: Props) {
  const [formData, setFormData] = useState<Partial<PracticeQuestion>>({})
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Initialize form
  useEffect(() => {
    if (question && open) {
      setFormData({
        ...question,
        answer_data: question.answer_data ? JSON.parse(JSON.stringify(question.answer_data)) : {}
      })
      setImagePreview(question.image_url || null)
    } else if (open) {
      setFormData({
        unit_no: units.length > 0 ? units[0].unit_no : 1,
        question_type: "mcq",
        question_text: "",
        instruction: "",
        answer_data: { options: [{text:'', is_correct:true}, {text:'', is_correct:false}, {text:'', is_correct:false}, {text:'', is_correct:false}] }
      })
      setImagePreview(null)
    }
  }, [question, open, units])

  const updateField = (field: keyof PracticeQuestion, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateAnswerData = (newAnswerData: any) => {
    setFormData((prev) => ({ ...prev, answer_data: newAnswerData }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const uploadFormData = new FormData()
    uploadFormData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })
      const data = await res.json()
      if (data.url) {
        setImagePreview(data.url)
        updateField("image_url", data.url)
      }
    } catch (error) {
      console.error("Image upload failed:", error)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = { ...formData }
      if (imagePreview) {
        payload.image_url = imagePreview
      } else {
        payload.image_url = undefined
      }
      await onSave(payload)
      onClose()
    } catch (error) {
      console.error("Save failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderTypeSpecificFields = () => {
    const type = formData.question_type || "mcq"
    const ans = formData.answer_data || {}

    switch (type) {
      case "mcq":
        const options = ans.options || [{text:'', is_correct:true}, {text:'', is_correct:false}, {text:'', is_correct:false}, {text:'', is_correct:false}]
        return (
          <div className="space-y-4">
            <Label>Options (Check correct answer)</Label>
            {options.map((opt: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div 
                  className={`p-2 rounded-full cursor-pointer flex-shrink-0 border-2 transition-colors
                    ${opt.is_correct ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-emerald-300'}`}
                  onClick={() => {
                    const newOpts = options.map((o: any, i: number) => ({ ...o, is_correct: i === idx }))
                    updateAnswerData({ ...ans, options: newOpts })
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                </div>
                <Input 
                  value={opt.text}
                  onChange={(e) => {
                    const newOpts = [...options]
                    newOpts[idx].text = e.target.value
                    updateAnswerData({ ...ans, options: newOpts })
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  className={opt.is_correct ? "border-emerald-200 bg-emerald-50/30 font-medium" : ""}
                />
              </div>
            ))}
          </div>
        )
      case "matching":
        const pairs = ans.pairs || [{left:'', right:''}, {left:'', right:''}, {left:'', right:''}, {left:'', right:''}]
        return (
          <div className="space-y-4">
            <Label>Matching Pairs</Label>
            {pairs.map((pair: any, idx: number) => (
              <div key={idx} className="grid grid-cols-2 gap-3 items-center">
                <Input 
                  value={pair.left}
                  onChange={(e) => {
                    const newPairs = [...pairs]; newPairs[idx].left = e.target.value; updateAnswerData({ ...ans, pairs: newPairs })
                  }}
                  placeholder={`Left Item ${idx + 1}`}
                />
                <Input 
                  value={pair.right}
                  onChange={(e) => {
                    const newPairs = [...pairs]; newPairs[idx].right = e.target.value; updateAnswerData({ ...ans, pairs: newPairs })
                  }}
                  placeholder={`Right Item ${idx + 1} (Match)`}
                />
              </div>
            ))}
          </div>
        )
      case "fill":
        return (
          <div className="space-y-3">
            <Label>Blank Answer</Label>
            <Input 
              value={(ans.answers && ans.answers[0]) || ""}
              onChange={(e) => updateAnswerData({ ...ans, answers: [e.target.value] })}
              placeholder="Correct word or phrase"
            />
            <p className="text-xs text-slate-500">The student must type this exactly (case-insensitive).</p>
          </div>
        )
      case "reorder":
        const items = ans.items || [{text:'', correct_position:1}, {text:'', correct_position:2}, {text:'', correct_position:3}, {text:'', correct_position:4}]
        return (
          <div className="space-y-4">
            <Label>Correct Order (1 to 4)</Label>
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                <Input 
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...items]; newItems[idx].text = e.target.value; updateAnswerData({ ...ans, items: newItems })
                  }}
                  placeholder={`Step ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        )
      case "truefalse":
        return (
          <div className="space-y-4">
            <Label>Correct Answer</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={ans.correct_answer === true ? "default" : "outline"}
                className={ans.correct_answer === true ? "bg-emerald-600 hover:bg-emerald-700 w-full" : "w-full"}
                onClick={() => updateAnswerData({ ...ans, correct_answer: true })}
              >
                True
              </Button>
              <Button
                type="button"
                variant={ans.correct_answer === false ? "default" : "outline"}
                className={ans.correct_answer === false ? "bg-rose-600 hover:bg-rose-700 w-full" : "w-full"}
                onClick={() => updateAnswerData({ ...ans, correct_answer: false })}
              >
                False
              </Button>
            </div>
            <div className="pt-2">
              <Label className="text-xs text-slate-500">Explanation (Optional)</Label>
              <Input 
                value={ans.explanation || ""}
                onChange={(e) => updateAnswerData({ ...ans, explanation: e.target.value })}
                placeholder="Why is it true/false?"
                className="mt-1"
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? "Edit Practice Question" : "Add Practice Question"}</DialogTitle>
          <DialogDescription>
            Manage practice question details and unit placement.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Top Row: Unit and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={String(formData.unit_no || "1")}
                onValueChange={(val) => updateField("unit_no", parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.unit_no} value={String(u.unit_no)}>
                      Unit {u.unit_no} - {u.unit_name}
                    </SelectItem>
                  ))}
                  {units.length === 0 && (
                    <>
                      <SelectItem value="1">Unit 1</SelectItem>
                      <SelectItem value="2">Unit 2</SelectItem>
                      <SelectItem value="3">Unit 3</SelectItem>
                      <SelectItem value="4">Unit 4</SelectItem>
                      <SelectItem value="5">Unit 5</SelectItem>
                      <SelectItem value="6">Unit 6</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={formData.question_type || "mcq"}
                onValueChange={(val) => {
                  updateField("question_type", val)
                  let defaultAnswer: any = {}
                  if (val === "mcq") defaultAnswer = { options: [{text:"", is_correct:true}, {text:"", is_correct:false}, {text:"", is_correct:false}, {text:"", is_correct:false}] }
                  else if (val === "matching") defaultAnswer = { pairs: [{left:"", right:""}, {left:"", right:""}, {left:"", right:""}, {left:"", right:""}] }
                  else if (val === "fill") defaultAnswer = { answers: [""] }
                  else if (val === "reorder") defaultAnswer = { items: [{text:"", correct_position:1}, {text:"", correct_position:2}, {text:"", correct_position:3}, {text:"", correct_position:4}] }
                  else if (val === "truefalse") defaultAnswer = { correct_answer: true, explanation: "" }
                  updateField("answer_data", defaultAnswer)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                  <SelectItem value="fill">Fill in the Blank</SelectItem>
                  <SelectItem value="reorder">Reorder Steps</SelectItem>
                  <SelectItem value="truefalse">True / False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label>Question Text</Label>
            <Textarea
              value={formData.question_text || ""}
              onChange={(e) => updateField("question_text", e.target.value)}
              placeholder="Type your question here..."
              className="min-h-[100px]"
            />
          </div>

          {/* Instruction */}
          <div className="space-y-2">
            <Label>Instruction (Optional)</Label>
            <Input
              value={formData.instruction || ""}
              onChange={(e) => updateField("instruction", e.target.value)}
              placeholder="e.g. Choose the most appropriate answer"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image (Optional)</Label>
            <div className="flex gap-4 items-start">
              <div 
                className={`relative w-32 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden
                  ${imagePreview ? 'border-slate-200' : 'border-slate-300 bg-slate-50'}`}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <span className="text-xs font-medium">Uploading...</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {imagePreview && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-rose-500 h-8 px-2"
                    onClick={() => {
                      setImagePreview(null)
                      updateField("image_url", "")
                    }}
                  >
                    <X className="w-4 h-4 mr-1" /> Remove Image
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Type-Specific Answer Section */}
          <div className="pt-4 border-t border-slate-200">
            {renderTypeSpecificFields()}
          </div>
        </div>

        <DialogFooter className="border-t pt-4 -mx-6 px-6 sm:justify-between">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={loading || !formData.question_text?.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {loading ? "Saving..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Question
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
