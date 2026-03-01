"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Edit2, X, LogOut, Search } from "lucide-react"
import Link from "next/link"
import AdminLoginModal from "@/components/admin-login-modal"
import ExcelImportSection from "@/components/excel-import-section"
import QuestionEditModal from "@/components/question-edit-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Import UI components from shadcn/ui for better control
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type QuestionType = "mcq" | "matching" | "fill" | "reorder" | "truefalse"

interface Question {
  id: string
  type: QuestionType
  subject: string
  level: number
  question: string
  instruction?: string
  options?: { A: string; B: string; C: string; D: string; correct: string } | string[] // For reorder, options become the items to reorder
  pairs?: { left: string; right: string }[]
  answer: string | string[] | { left: string; right: string }[] | boolean // For truefalse, answer is boolean
  image?: string
  timer?: number
  createdAt?: number
  updatedAt?: number
  createdBy?: string
}

export default function AdminPage() {
  const [showLoginModal, setShowLoginModal] = useState(true)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState("history")
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [questions, setQuestions] = useState<Question[]>([])
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [viewMode, setViewMode] = useState<"filtered" | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [filterLevel, setFilterLevel] = useState<number | "all">("all")
  const [filterType, setFilterType] = useState<string>("all")

  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([]) // For bulk actions
  const [showForm, setShowForm] = useState(false)
  const [selectedType, setSelectedType] = useState<QuestionType>("mcq")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Question>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null)

  const subjects = ["history", "geography"]
  const levels = [1, 2, 3]
  const questionTypes: QuestionType[] = ["mcq", "matching", "fill", "reorder", "truefalse"]

  useEffect(() => {
    const savedUser = sessionStorage.getItem("adminUser")
    if (savedUser) {
      setCurrentUser(savedUser)
    } else {
      setShowLoginModal(true)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      if (viewMode === "all") {
        fetchAllQuestions()
      } else {
        fetchQuestions()
      }
    }
  }, [selectedSubject, selectedLevel, currentUser, viewMode])

  const initializeBaseData = async () => {
    // Base data (subjects, levels, question_types) already exists in Render DB
    // No initialization needed - data was seeded during migration
    console.log("[v0] Base data already exists in Render DB")
  }

  // Helper to transform API question data to local Question format
  const transformApiQuestion = (q: any): Question => {
    const type = q.question_type || "mcq"
    let typeSpecificData: any = {}

    if (type === "mcq" && q.mcq_options) {
      const opts = q.mcq_options.sort((a: any, b: any) => a.option_order - b.option_order)
      const mcqOptions: { [key: string]: string } = {}
      opts.forEach((opt: any, index: number) => {
        const key = String.fromCharCode(65 + index)
        mcqOptions[key] = opt.option_text
      })
      const correctOpt = opts.find((o: any) => o.is_correct)
      const correctKey = correctOpt ? String.fromCharCode(65 + opts.indexOf(correctOpt)) : ""
      typeSpecificData = { options: { ...mcqOptions, correct: correctKey }, answer: correctKey }
    } else if (type === "matching" && q.matching_pairs) {
      const pairs = q.matching_pairs.sort((a: any, b: any) => a.pair_order - b.pair_order)
      const transformedPairs = pairs.map((p: any) => ({ left: p.left_item, right: p.right_item }))
      typeSpecificData = { pairs: transformedPairs, answer: transformedPairs }
    } else if (type === "fill" && q.fill_answers) {
      typeSpecificData = { answer: q.fill_answers[0]?.answer_text }
    } else if (type === "reorder" && q.reorder_items) {
      const items = q.reorder_items.sort((a: any, b: any) => a.item_order - b.item_order)
      typeSpecificData = {
        options: items.map((i: any) => i.item_text),
        answer: items.map((i: any) => i.item_text),
      }
    } else if (type === "truefalse" && q.truefalse_answers) {
      typeSpecificData = { answer: q.truefalse_answers[0]?.correct_answer }
    }

    return {
      id: q.id.toString(),
      type,
      subject: q.subject || "history",
      level: parseInt(q.level) || 1,
      question: q.question_text,
      timer: q.timer_seconds,
      createdBy: q.created_by || "MES",
      image: q.image_url || "",
      ...typeSpecificData,
      createdAt: q.created_at ? new Date(q.created_at).getTime() : Date.now(),
      updatedAt: q.updated_at ? new Date(q.updated_at).getTime() : Date.now(),
    }
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ subject: selectedSubject, level: String(selectedLevel) })
      const res = await fetch(`/api/admin/questions?${params}`)
      if (!res.ok) throw new Error("Failed to fetch questions")
      const data = await res.json()
      setQuestions(data.map(transformApiQuestion))
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllQuestions = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/questions")
      if (!res.ok) throw new Error("Failed to fetch questions")
      const data = await res.json()
      setAllQuestions(data.map(transformApiQuestion))
    } catch (error) {
      console.error("Error fetching all questions:", error)
      alert("Failed to fetch questions")
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = (type: QuestionType) => {
    setEditingId(null)
    setSelectedType(type)
    setImagePreview(null)
    setPendingImageBlob(null)
    const baseForm: Partial<Question> = {
      type,
      subject: selectedSubject,
      level: selectedLevel,
      question: "",
    }

    switch (type) {
      case "mcq":
        setFormData({ ...baseForm, options: { A: "", B: "", C: "", D: "" }, answer: "" })
        break
      case "matching":
        setFormData({ ...baseForm, pairs: [{ left: "", right: "" }], answer: [] })
        break
      case "fill":
        setFormData({ ...baseForm, answer: "" })
        break
      case "reorder":
        setFormData({ ...baseForm, options: ["", "", "", ""], answer: [] }) // Options will be items to reorder
        break
      case "truefalse":
        setFormData({ ...baseForm, answer: true }) // Default to true
        break
    }
    setShowForm(true)
  }

  const handleEditQuestion = (question: Question) => {
    setQuestionToEdit(question)
    setEditModalOpen(true)
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return

    try {
      setLoading(true)
      console.log("[SingleDelete] Deleting question with ID:", id)
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        const errorMsg = err.error || "Delete failed"
        console.error("[SingleDelete] Delete failed. Status:", res.status, "Error:", errorMsg, "Details:", err.details)
        throw new Error(errorMsg)
      }
      
      console.log("[SingleDelete] Delete succeeded, refreshing data...")
      // Wait for the data to refresh before showing success message
      if (viewMode === "filtered") {
        await fetchQuestions()
      } else {
        await fetchAllQuestions()
      }
      
      alert("Question deleted successfully!")
    } catch (error) {
      console.error("[SingleDelete] Error deleting question:", error)
      alert(`Failed to delete question: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const clearSelection = () => setSelectedIds([])

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} selected question(s)? This cannot be undone.`)) return

    try {
      setLoading(true)
      let successCount = 0
      let failCount = 0
      const failedIds: { id: string; error: string; status: number }[] = []
      
      for (const id of selectedIds) {
        try {
          const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" })
          if (res.ok) {
            successCount++
            console.log(`[BulkDelete] Successfully deleted question ${id}`)
          } else {
            const errData = await res.json()
            failCount++
            failedIds.push({ id, error: errData.error || "Unknown error", status: res.status })
            console.error(`[BulkDelete] Failed to delete question ${id}. Status: ${res.status}, Error: ${errData.error}, Details: ${errData.details}`)
          }
        } catch (err) {
          failCount++
          const errorMsg = err instanceof Error ? err.message : String(err)
          failedIds.push({ id, error: errorMsg, status: 0 })
          console.error("[BulkDelete] Error deleting question id", id, errorMsg)
        }
      }

      // Wait for the data to refresh before showing success message
      clearSelection()
      if (viewMode === "filtered") {
        await fetchQuestions()
      } else {
        await fetchAllQuestions()
      }
      
      if (failCount === 0) {
        alert(`${successCount} question(s) deleted successfully!`)
      } else if (successCount === 0) {
        // All failed - show error details
        const errorDetails = failedIds.map((f) => `ID ${f.id}: ${f.error}`).join("\n")
        console.error("[BulkDelete] All deletions failed:\n" + errorDetails)
        alert(`Failed to delete all ${failCount} question(s).\n\nErrors:\n${errorDetails}\n\nCheck browser console for more details.`)
      } else {
        const errorDetails = failedIds.map((f) => `ID ${f.id}: ${f.error}`).join(", ")
        alert(`Deleted ${successCount} question(s). Failed to delete ${failCount} question(s).\n\nFailed: ${errorDetails}`)
      }
    } catch (error) {
      console.error("[BulkDelete] Bulk delete failed:", error instanceof Error ? error.message : error)
      alert("Failed to delete selected questions.")
    } finally {
      setLoading(false)
    }
  }

  // Resize image on canvas and return as Blob for upload
  const resizeImageToBlob = (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.85): Promise<{ blob: Blob; previewUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          let { width, height } = img
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const previewUrl = canvas.toDataURL('image/jpeg', quality)
                resolve({ blob, previewUrl })
              } else {
                reject(new Error('Failed to create blob'))
              }
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Upload image to storage
  const uploadImageToStorage = async (blob: Blob, questionId?: string): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', blob, `image-${Date.now()}.jpg`)
    if (questionId) {
      formDataUpload.append('questionId', questionId)
    }

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formDataUpload,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const data = await response.json()
    return data.url
  }

  // Check if URL is an external image (needs to be downloaded and re-uploaded)
  const isExternalImageUrl = (url: string): boolean => {
    if (!url || url.startsWith('data:')) return false
    // Images already on our server are fine
    if (url.startsWith('/api/images/')) return false
    if (url.startsWith('/')) return false // local public folder images
    return url.startsWith('http://') || url.startsWith('https://')
  }

  // Download external image and return as Blob
  const downloadExternalImage = async (url: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img')
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        let { width, height } = img
        const maxWidth = 800
        const maxHeight = 600
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/jpeg',
          0.85
        )
      }
      img.onerror = () => reject(new Error('Failed to load external image'))
      img.src = url
    })
  }

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [pendingImageBlob, setPendingImageBlob] = useState<Blob | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploadingImage(true)
        const { blob, previewUrl } = await resizeImageToBlob(file)
        setImagePreview(previewUrl)
        setPendingImageBlob(blob)
        // Don't set formData.image yet - will upload when saving
      } catch (error) {
        console.error('Error processing image:', error)
        alert('Failed to process image. Please try again.')
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const handleSaveQuestion = async () => {
    if (!formData.question?.trim()) {
      alert("Please enter a question")
      return
    }

    if (
      selectedType === "mcq" &&
      (!formData.options || Object.values(formData.options).some((opt) => !opt?.trim()) || !formData.answer)
    ) {
      alert("Please fill in all options and select a correct answer for MCQ.")
      return
    }

    if (
      selectedType === "matching" &&
      (!formData.pairs || formData.pairs.some((pair) => !pair.left?.trim() || !pair.right?.trim()))
    ) {
      alert("Please fill in all matching pairs.")
      return
    }

    if (selectedType === "fill" && !formData.answer?.trim()) {
      alert("Please provide the answer for Fill in the Blanks.")
      return
    }

    if (selectedType === "reorder" && (!formData.options || formData.options.some((item) => !item?.trim()))) {
      alert("Please provide all items to reorder.")
      return
    }

    if (selectedType === "truefalse" && formData.answer === undefined) {
      alert("Please select a correct answer for True/False.")
      return
    }

    try {
      // Upload pending image to storage if exists
      let imageUrl = formData.image || ""
      if (pendingImageBlob) {
        try {
          imageUrl = await uploadImageToStorage(pendingImageBlob, editingId || undefined)
          setPendingImageBlob(null)
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError)
          alert("Failed to upload image. Please try again.")
          return
        }
      } else if (imageUrl && isExternalImageUrl(imageUrl)) {
        try {
          const blob = await downloadExternalImage(imageUrl)
          imageUrl = await uploadImageToStorage(blob, editingId || undefined)
        } catch (downloadError) {
          console.error("Error downloading external image:", downloadError)
          alert("Could not download external image. It will be kept as external URL.")
        }
      }

      // Build answer_data for API
      const buildAnswerData = () => {
        if (selectedType === "mcq" && formData.options) {
          const optionsObj = formData.options as { A: string; B: string; C: string; D: string; correct: string }
          const optionLetters = ["A", "B", "C", "D"]
          return {
            options: optionLetters.map((letter, index) => ({
              text: optionsObj[letter as keyof typeof optionsObj] || "",
              is_correct: formData.answer === letter,
            })),
          }
        } else if (selectedType === "matching" && formData.pairs) {
          return { pairs: formData.pairs.map((pair) => ({ left: pair.left, right: pair.right })) }
        } else if (selectedType === "fill" && formData.answer) {
          return { answers: [formData.answer as string] }
        } else if (selectedType === "reorder" && formData.options && Array.isArray(formData.options)) {
          return {
            items: (formData.options as string[]).map((item, index) => ({
              text: item,
              correct_position: index + 1,
            })),
          }
        } else if (selectedType === "truefalse") {
          return {
            correct_answer: formData.answer === true || formData.answer === "true",
            explanation: "",
          }
        }
        return {}
      }

      const subjectName = formData.subject ? formData.subject.toLowerCase() : selectedSubject.toLowerCase()
      const levelNum = formData.level || selectedLevel

      if (editingId) {
        // UPDATE via API
        const res = await fetch("/api/admin/questions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: parseInt(editingId),
            subject: subjectName,
            level: levelNum,
            type: selectedType,
            question_text: formData.question,
            instruction: formData.instruction || "",
            image_url: imageUrl,
            timer_seconds: formData.timer || 30,
            answer_data: buildAnswerData(),
            created_by: currentUser,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Update failed")
        }
        alert("Question updated successfully!")
      } else {
        // CREATE via API
        const res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: subjectName,
            level: levelNum,
            type: selectedType,
            question_text: formData.question,
            instruction: formData.instruction || "",
            image_url: imageUrl,
            timer_seconds: formData.timer || 30,
            answer_data: buildAnswerData(),
            created_by: currentUser,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Create failed")
        }
        alert("Question created successfully!")
      }

      setShowForm(false)
      setImagePreview(null)
      setPendingImageBlob(null)
      // Refresh questions based on the current viewMode
      if (viewMode === "filtered") {
        fetchQuestions()
      } else {
        // viewMode === "all"
        fetchAllQuestions()
      }
    } catch (error: any) {
      console.error("Error saving question:", error)
      const errorMessage = error?.message || JSON.stringify(error) || "Failed to save question"
      alert(`Error: ${errorMessage}`)
    }
  }

  const handleSaveEditedQuestion = async (updatedQuestion: Question) => {
    try {
      // Build answer_data for API based on question type
      let answer_data: any = {}
      if (updatedQuestion.type === "mcq" && updatedQuestion.options) {
        const optionsObj = updatedQuestion.options as { A: string; B: string; C: string; D: string; correct: string }
        const optionLetters = ["A", "B", "C", "D"]
        answer_data = {
          options: optionLetters.map((letter, index) => ({
            text: optionsObj[letter as keyof typeof optionsObj] || "",
            is_correct: updatedQuestion.answer === letter,
          })),
        }
      } else if (updatedQuestion.type === "matching" && updatedQuestion.pairs) {
        answer_data = { pairs: updatedQuestion.pairs.map((pair) => ({ left: pair.left, right: pair.right })) }
      } else if (updatedQuestion.type === "fill" && updatedQuestion.answer) {
        answer_data = { answers: [updatedQuestion.answer as string] }
      } else if (updatedQuestion.type === "reorder" && updatedQuestion.options && Array.isArray(updatedQuestion.options)) {
        answer_data = {
          items: (updatedQuestion.options as string[]).map((item, index) => ({
            text: item,
            correct_position: index + 1,
          })),
        }
      } else if (updatedQuestion.type === "truefalse") {
        answer_data = {
          correct_answer: updatedQuestion.answer === true || updatedQuestion.answer === "true",
          explanation: "",
        }
      }

      const res = await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parseInt(updatedQuestion.id),
          subject: updatedQuestion.subject,
          level: updatedQuestion.level,
          type: updatedQuestion.type,
          question_text: updatedQuestion.question,
          image_url: updatedQuestion.image || "",
          timer_seconds: updatedQuestion.timer || 30,
          answer_data,
          created_by: currentUser,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Update failed")
      }

      setEditModalOpen(false)
      setQuestionToEdit(null)
      alert("Question updated successfully!")
      if (viewMode === "filtered") {
        fetchQuestions()
      } else {
        fetchAllQuestions()
      }
    } catch (error) {
      console.error("Error updating question:", error)
      alert("Failed to update question")
    }
  }

  const handleExcelImport = async (questions: any[]) => {
    // Validate currentUser (any authenticated admin is allowed)
    const normalizedUser = currentUser ? currentUser.trim().toUpperCase() : null
    if (!normalizedUser) {
      alert('Error: Admin user not properly authenticated. Please refresh the page and try again.')
      return
    }
    
    try {
      console.log("[v0] Sending to API - questions:", questions)
      console.log("[v0] Sending to API - createdBy:", normalizedUser)
      
      const formData = new FormData()
      formData.append("questions", JSON.stringify(questions))
      formData.append("createdBy", normalizedUser)
      
      const response = await fetch("/api/import-excel", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("[v0] API response:", result)

      if (!response.ok) {
        throw new Error(result.error || result.message || "Import failed")
      }

      // Show detailed result with formatted error messages
      if (result.errorCount > 0) {
        // Format errors with better readability
        const errorMessages = Array.isArray(result.errors) 
          ? result.errors.join('\n\n') 
          : 'Unknown error'
        
        const message = `
📊 IMPORT SUMMARY
═══════════════════════════════════════
✅ Successful: ${result.successCount} questions
❌ Failed: ${result.errorCount} questions
Total Processed: ${result.totalProcessed}

📋 ERROR DETAILS:
═══════════════════════════════════════

${errorMessages}

═══════════════════════════════════════
💡 TIP: Review the errors above, fix your Excel file, and try again.
        `
        alert(message)
      } else {
        alert(`✅ SUCCESS!\n\n${result.successCount} questions imported successfully!\n\n${result.message || ''}`)
      }
      
      // Refresh questions based on the current viewMode
      if (viewMode === "filtered") {
        fetchQuestions()
      } else {
        // viewMode === "all"
        fetchAllQuestions()
      }
      
    } catch (error) {
      console.error("[v0] Excel import error:", error)
      alert(`❌ Import Error:\n\n${(error as Error).message}\n\nPlease check your Excel file and try again.`)
      throw error
    }
  }

  const getFilteredAllQuestions = () => {
    return allQuestions.filter((q) => {
      const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSubject = filterSubject === "all" || q.subject === filterSubject
      const matchesLevel = filterLevel === "all" || q.level === filterLevel
      const matchesType = filterType === "all" || q.type === filterType
      return matchesSearch && matchesSubject && matchesLevel && matchesType
    })
  }

  // Memoize the filtered questions to avoid recalculating on every render
  const filteredAllQuestionsForCheckbox = useMemo(() => getFilteredAllQuestions(), [
    allQuestions,
    searchQuery,
    filterSubject,
    filterLevel,
    filterType,
  ])

  const filteredQuestions = questions.filter((q) => q.subject === selectedSubject && q.level === selectedLevel)

  if (!currentUser) {
    return (
      <AdminLoginModal
        onClose={() => setShowLoginModal(false)}
        onLogin={(username) => {
          sessionStorage.setItem("adminUser", username)
          setCurrentUser(username)
          setShowLoginModal(false)
        }}
      />
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="mx-auto max-w-2xl">
          <Button onClick={() => setShowForm(false)} variant="outline" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Button>

          <Card className="p-8 border-0 shadow-lg flex flex-col max-h-[80vh]">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">
              {editingId ? "Edit Question" : `Add New ${selectedType.toUpperCase()} Question`}
            </h2>

            <div className="space-y-6 overflow-y-auto pr-4 flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-2">Question Type</Label>
                  <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-900 font-medium">
                    {selectedType.toUpperCase()}
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-2">Subject</Label>
                  <Select
                    value={formData.subject || selectedSubject}
                    onValueChange={(val) => setFormData({ ...formData, subject: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-2">Level</Label>
                  <Select
                    value={formData.level?.toString() || selectedLevel.toString()}
                    onValueChange={(val) => setFormData({ ...formData, level: Number.parseInt(val) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((l) => (
                        <SelectItem key={l} value={l.toString()}>
                          Level {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-700 mb-2">Question Text</Label>
                <Textarea
                  value={formData.question || ""}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question"
                  className="resize-none min-h-24"
                />
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-700 mb-2">Optional Instruction</Label>
                <Textarea
                  value={formData.instruction || ""}
                  onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                  placeholder="Add custom instruction text (e.g., 'Match each item on the left with its description on the right')"
                  className="resize-none min-h-16"
                />
                <p className="text-xs text-slate-500 mt-1">This instruction will be shown to students when they answer this question</p>
              </div>

              {selectedType === "mcq" && (
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-3">Options & Correct Answer</Label>
                  <div className="space-y-3">
                    {["A", "B", "C", "D"].map((key) => (
                      <div key={key} className="flex gap-2 items-center">
                        <Input
                          type="radio"
                          name="correct-answer"
                          checked={formData.answer === key}
                          onChange={() => setFormData({ ...formData, answer: key })}
                          className="h-4 w-4"
                        />
                        <Input
                          type="text"
                          value={formData.options?.[key] || ""}
                          onChange={(e) => {
                            const newOpts = { ...formData.options, [key]: e.target.value }
                            setFormData({ ...formData, options: newOpts })
                          }}
                          placeholder={`Option ${key}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedType === "matching" && (
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-3">Matching Pairs</Label>
                  <div className="space-y-3">
                    {(formData.pairs || []).map((pair, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          type="text"
                          value={pair?.left || ""}
                          onChange={(e) => {
                            const newPairs = [...(formData.pairs || [])]
                            if (!newPairs[idx]) newPairs[idx] = { left: "", right: "" }
                            newPairs[idx].left = e.target.value
                            setFormData({ ...formData, pairs: newPairs, answer: newPairs })
                          }}
                          placeholder="Left item"
                          className="flex-1"
                        />
                        <span className="text-slate-400 px-2 py-2">↔</span>
                        <Input
                          type="text"
                          value={pair?.right || ""}
                          onChange={(e) => {
                            const newPairs = [...(formData.pairs || [])]
                            if (!newPairs[idx]) newPairs[idx] = { left: "", right: "" }
                            newPairs[idx].right = e.target.value
                            setFormData({ ...formData, pairs: newPairs, answer: newPairs })
                          }}
                          placeholder="Right item"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => {
                            const newPairs = formData.pairs?.filter((_, i) => i !== idx) || []
                            setFormData({ ...formData, pairs: newPairs, answer: newPairs })
                          }}
                          variant="ghost"
                          className="text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        const newPairs = [...(formData.pairs || []), { left: "", right: "" }]
                        setFormData({ ...formData, pairs: newPairs, answer: newPairs })
                      }}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Pair
                    </Button>
                  </div>
                </div>
              )}

              {selectedType === "fill" && (
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-2">Missing Word/Answer</Label>
                  <Input
                    type="text"
                    value={formData.answer || ""}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Enter the missing word or correct answer"
                  />
                </div>
              )}

              {selectedType === "reorder" && (
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-3">
                    Items to Reorder (in correct order)
                  </Label>
                  <div className="space-y-3">
                    {(formData.options || []).map((opt, idx) => (
                      <Input
                        key={idx}
                        type="text"
                        value={opt || ""}
                        onChange={(e) => {
                          const newOpts = [...(formData.options || [])]
                          newOpts[idx] = e.target.value
                          // For reorder, the answer is the ordered list of items
                          setFormData({ ...formData, options: newOpts, answer: newOpts })
                        }}
                        placeholder={`Item ${idx + 1}`}
                        className="w-full"
                      />
                    ))}
                    <Button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          options: [...(formData.options || []), ""],
                          answer: [...(formData.options || []), ""],
                        })
                      }}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </div>
              )}

              {selectedType === "truefalse" && (
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-2">Correct Answer</Label>
                  <Select
                    value={formData.answer?.toString() || "true"}
                    onValueChange={(val) => setFormData({ ...formData, answer: val === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="block text-sm font-semibold text-slate-700 mb-2">Countdown Timer (seconds)</Label>
                <Input
                  type="number"
                  min="5"
                  max="300"
                  value={formData.timer || 30}
                  onChange={(e) => setFormData({ ...formData, timer: Number.parseInt(e.target.value) })}
                  placeholder="Enter timer duration in seconds"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Set the time limit for answering this question (5-300 seconds)
                </p>
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-700 mb-2">Question Image (Optional)</Label>
                <div className="space-y-3">
                  {/* Image Upload Section */}
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <div className="flex items-center justify-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        id="image-upload"
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex-1 cursor-pointer text-center py-3 px-4 bg-blue-50 hover:bg-blue-100 rounded border-2 border-blue-200 transition-colors"
                      >
                        <span className="text-sm font-medium text-blue-700">
                          {isUploadingImage ? "Processing..." : "📤 Click to Upload Image"}
                        </span>
                        <p className="text-xs text-slate-600 mt-1">or drag and drop</p>
                      </label>
                    </div>
                  </div>

                  {/* OR Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-700 font-medium">OR</span>
                    </div>
                  </div>

                  {/* Image URL Input */}
                  <div>
                    <Label className="text-xs font-medium text-slate-600 mb-2 block">Paste Image URL</Label>
                    <input
                      type="url"
                      value={formData.image || ""}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">Accepted formats: JPG, PNG, GIF, WebP (max 5MB recommended)</p>
                  </div>
                </div>

                {/* Image Preview */}
                {(imagePreview || formData.image) && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-700 mb-2">📸 Image Preview:</p>
                    <img
                      src={imagePreview || formData.image || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-xs max-h-48 rounded border border-slate-300 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                    {pendingImageBlob && (
                      <p className="text-xs text-green-600 font-medium mt-2">✓ Image ready to upload</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200 mt-6">
              <Button onClick={handleSaveQuestion} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Save Question
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button className="gap-2 bg-gradient-to-r from-secondary via-secondary/80 to-secondary hover:shadow-lg hover:shadow-secondary/50 text-white font-bold transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3">
                <ArrowLeft className="h-4 w-4 transition-transform hover:translate-x-1" />
                🏠 Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">
                Logged in as: <span className="font-semibold">{currentUser}</span>
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              sessionStorage.removeItem("adminUser")
              setCurrentUser(null)
              setShowLoginModal(true)
            }}
            variant="outline"
            className="gap-2 text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <ExcelImportSection onImport={handleExcelImport} isLoading={loading} />

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Question Management</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setViewMode("all")
                  fetchAllQuestions() // Fetch all questions when switching view
                }}
                variant={viewMode === "all" ? "default" : "outline"}
                size="sm"
              >
                View All Questions
              </Button>
              <Button
                onClick={() => {
                  setViewMode("filtered")
                  fetchQuestions() // Fetch filtered questions when switching view
                }}
                variant={viewMode === "filtered" ? "default" : "outline"}
                size="sm"
              >
                View by Subject/Level
              </Button>
              <Button
                onClick={handleBulkDelete}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200"
                disabled={selectedIds.length === 0}
              >
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          </div>

          {viewMode === "all" && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="md:col-span-4">
                  <Label className="text-sm font-medium mb-2">Search Questions</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by question text..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">Subject</Label>
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">Level</Label>
                  <Select
                    value={filterLevel.toString()}
                    onValueChange={(v) => setFilterLevel(v === "all" ? "all" : Number.parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="mcq">MCQ</SelectItem>
                      <SelectItem value="matching">Matching</SelectItem>
                      <SelectItem value="fill">Fill in Blanks</SelectItem>
                      <SelectItem value="reorder">Reorder</SelectItem>
                      <SelectItem value="truefalse">True/False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setFilterSubject("all")
                      setFilterLevel("all")
                      setFilterType("all")
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
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
                            checked={filteredAllQuestionsForCheckbox.length > 0 && selectedIds.length === filteredAllQuestionsForCheckbox.length}
                            onChange={(e) => {
                              const displayed = filteredAllQuestionsForCheckbox.map((q) => q.id)
                              if (e.target.checked) setSelectedIds(displayed)
                              else clearSelection()
                            }}
                          />
                        </TableHead>
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="w-[120px]">Subject</TableHead>
                        <TableHead className="w-[80px]">Level</TableHead>
                        <TableHead className="min-w-[300px]">Question</TableHead>
                        <TableHead className="w-[100px]">Image</TableHead>
                        <TableHead className="w-[100px]">Timer</TableHead>
                        <TableHead className="w-[120px]">Created By</TableHead>
                        <TableHead className="w-[150px]">Created At</TableHead>
                        <TableHead className="w-[140px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                            Loading questions...
                          </TableCell>
                        </TableRow>
                      ) : filteredAllQuestionsForCheckbox.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                            No questions found. Try adjusting your filters or create a new question.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAllQuestionsForCheckbox.map((question) => (
                          <TableRow key={question.id} className="hover:bg-slate-50">
                            <TableCell className="w-12">
                              <Input type="checkbox" className="h-4 w-4" checked={selectedIds.includes(question.id)} onChange={() => toggleSelectId(question.id)} />
                            </TableCell>
                            <TableCell className="font-mono text-xs">{question.id}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                {question.type === "mcq"
                                  ? "MCQ"
                                  : question.type === "matching"
                                    ? "Match"
                                    : question.type === "fill"
                                      ? "Fill"
                                      : question.type === "reorder"
                                        ? "Reorder"
                                        : "T/F"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold capitalize">
                                {question.subject}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                                L{question.level}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              <p className="truncate text-sm">{question.question}</p>
                            </TableCell>
                            <TableCell>
                              {question.image ? (
                                <img
                                  src={question.image || "/placeholder.svg"}
                                  alt="Question Image"
                                  className="w-16 h-16 object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                                  }}
                                />
                              ) : (
                                <span className="text-slate-400 text-xs">No image</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {question.timer && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                  {question.timer}s
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{question.createdBy || "MES"}</TableCell>
                            <TableCell className="text-xs text-slate-600">
                              {question.createdAt ? new Date(question.createdAt).toLocaleString() : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  onClick={() => handleEditQuestion(question)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteQuestion(question.id)}
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

              <div className="text-sm text-slate-600 text-center">
                Showing {filteredAllQuestionsForCheckbox.length} of {allQuestions.length} total questions
              </div>
            </div>
          )}

          {viewMode === "filtered" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-2">Subject</Label>
                  <Select
                    value={selectedSubject}
                    onValueChange={(val) => {
                      setSelectedSubject(val)
                      fetchQuestions() // Fetch questions when subject changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-sm font-semibold text-slate-700 mb-2">Level</Label>
                  <Select
                    value={selectedLevel.toString()}
                    onValueChange={(val) => {
                      setSelectedLevel(Number.parseInt(val))
                      fetchQuestions() // Fetch questions when level changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((l) => (
                        <SelectItem key={l} value={l.toString()}>
                          Level {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      // Determine a default type if none is selected or to offer a choice
                      const defaultTypeToAdd: QuestionType = "mcq" // Or any other default
                      handleAddQuestion(defaultTypeToAdd)
                    }}
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Question
                  </Button>
                </div>
              </div>

              {/* Button group for adding specific question types */}
              <div className="space-y-2">
                {questionTypes.map((type) => (
                  <Button
                    key={type}
                    onClick={() => handleAddQuestion(type)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {type.toUpperCase()} Question
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => (
                    <Card key={question.id} className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Input type="checkbox" className="h-4 w-4 mt-2" checked={selectedIds.includes(question.id)} onChange={() => toggleSelectId(question.id)} />
                          <div className="flex-1">
                            <div className="flex gap-2 mb-2 flex-wrap items-center">
                              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                {question.type === "mcq"
                                  ? "MCQ"
                                  : question.type === "matching"
                                    ? "Matching"
                                    : question.type === "fill"
                                      ? "Fill"
                                      : question.type === "reorder"
                                        ? "Reorder"
                                        : "T/F"}
                              </span>
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold capitalize">
                                {question.subject}
                              </span>
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                                Level {question.level}
                              </span>
                              {question.timer && (
                                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                  Timer: {question.timer}s
                                </span>
                              )}
                            </div>
                            <p className="text-slate-900 font-medium">{question.question}</p>
                            {question.image && <p className="text-xs text-slate-500 mt-2">📷 Image attached</p>}
                            <div className="flex gap-4 text-xs text-slate-500 mt-3 flex-wrap">
                              <span>
                                Created: <span className="text-slate-700 font-medium">{question.createdAt ? new Date(question.createdAt).toLocaleString() : "N/A"}</span>
                              </span>
                              {question.createdBy && (
                                <span>
                                  By: <span className="text-slate-700 font-medium">{question.createdBy}</span>
                                </span>
                              )}
                              {question.updatedAt && question.updatedAt !== question.createdAt && (
                                <span>
                                  Updated: <span className="text-slate-700 font-medium">{new Date(question.updatedAt).toLocaleString()}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleEditQuestion(question)} size="sm" variant="outline" className="gap-2">
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button onClick={() => handleDeleteQuestion(question.id)} size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4">No questions found for the selected subject and level.</p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
      <QuestionEditModal
        question={questionToEdit}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setQuestionToEdit(null)
        }}
        onSave={handleSaveEditedQuestion}
      />
    </div>
  )
}
