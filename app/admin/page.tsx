"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
import { createBrowserClient } from "@supabase/ssr"

type QuestionType = "mcq" | "matching" | "fill" | "reorder" | "truefalse"

interface Question {
  id: string
  type: QuestionType
  subject: string
  level: number
  question: string
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
  const [supabase, setSupabase] = useState<any>(null) // Initialize supabase client state

  const subjects = ["history", "geography", "combined"]
  const levels = [1, 2, 3]
  const questionTypes: QuestionType[] = ["mcq", "matching", "fill", "reorder", "truefalse"]

  useEffect(() => {
    const savedUser = sessionStorage.getItem("adminUser")
    if (savedUser) {
      setCurrentUser(savedUser)
      const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      setSupabase(sb)
    } else {
      setShowLoginModal(true)
    }
  }, [])

  useEffect(() => {
    if (currentUser && supabase) {
      // Check if currentUser and supabase are initialized
      fetchQuestions()
    }
  }, [selectedSubject, selectedLevel, currentUser, supabase])

  const initializeBaseData = async () => {
    if (!supabase) return
    console.log("[v0] Initializing base data...")
    await supabase
      .from("subjects")
      .insert([
        { name: "history", description: "History of Mauritius" },
        { name: "geography", description: "Geography of Mauritius" },
        { name: "combined", description: "Combined History and Geography" },
      ])
      .or("name.eq.history,name.eq.geography,name.eq.combined") // Use .or to avoid duplicates if they somehow exist

    await supabase
      .from("levels")
      .insert([
        { level_number: 1, difficulty: "Easy" },
        { level_number: 2, difficulty: "Medium" },
        { level_number: 3, difficulty: "Hard" },
      ])
      .or("level_number.eq.1,level_number.eq.2,level_number.eq.3") // Use .or to avoid duplicates

    await supabase
      .from("question_types")
      .insert([{ name: "mcq" }, { name: "matching" }, { name: "fill" }, { name: "reorder" }, { name: "truefalse" }])
      .or("name.eq.mcq,name.eq.matching,name.eq.fill,name.eq.reorder,name.eq.truefalse") // Use .or to avoid duplicates
  }

  const fetchQuestions = async () => {
    if (!supabase) return // Ensure supabase client is available
    try {
      setLoading(true)

      const { data: subjectsCheck } = await supabase.from("subjects").select("id").limit(1)
      if (!subjectsCheck || subjectsCheck.length === 0) {
        await initializeBaseData()
      }

      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .ilike("name", selectedSubject)
        .single()

      if (subjectError || !subjectData) {
        console.log("[v0] Subject not found")
        setQuestions([])
        setLoading(false)
        return
      }

      const { data: levelData, error: levelError } = await supabase
        .from("levels")
        .select("id")
        .eq("level_number", selectedLevel)
        .single()

      if (levelError || !levelData) {
        console.log("[v0] Level not found")
        setQuestions([])
        setLoading(false)
        return
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select(`
          id,
          question_text,
          timer_seconds,
          created_at,
          updated_at,
          subject_id,
          level_id,
          question_type_id,
          image_url,
          created_by,
          subjects(name),
          levels(level_number),
          question_types(name)
        `)
        .eq("subject_id", subjectData.id)
        .eq("level_id", levelData.id)

      if (questionsError) throw questionsError

      if (questionsData) {
        const transformedQuestions = await Promise.all(
          questionsData.map(async (q: any) => {
            const type = q.question_types?.name || "mcq"
            const subject = q.subjects?.name || selectedSubject
            const level = q.levels?.level_number || selectedLevel

            let typeSpecificData = {}
            if (type === "mcq") {
              const { data: options } = await supabase
                .from("mcq_options")
                .select("option_text, is_correct, option_order") // Fetch relevant fields
                .eq("question_id", q.id)
                .order("option_order")
              const formattedOptions = options.map((opt: any) => ({
                text: opt.option_text,
                correct: opt.is_correct,
                order: opt.option_order,
              }))
              // Map to the expected format
              const mcqOptions: { [key: string]: string } = {}
              formattedOptions
                .sort((a, b) => a.order - b.order)
                .forEach((opt, index) => {
                  const key = String.fromCharCode(65 + index) // A, B, C, D
                  mcqOptions[key] = opt.text
                })
              const correctAnswerKey =
                formattedOptions.find((opt) => opt.correct)?.order !== undefined
                  ? String.fromCharCode(65 + formattedOptions.find((opt) => opt.correct).order)
                  : ""
              typeSpecificData = { options: { ...mcqOptions, correct: correctAnswerKey }, answer: correctAnswerKey }
            } else if (type === "matching") {
              const { data: pairs } = await supabase
                .from("matching_pairs")
                .select("left_item, right_item, pair_order")
                .eq("question_id", q.id)
                .order("pair_order")
              const transformedPairs = pairs?.map((p: any) => ({ left: p.left_item, right: p.right_item })) || []
              typeSpecificData = {
                pairs: transformedPairs,
                answer: transformedPairs,
              }
            } else if (type === "fill") {
              const { data: answers } = await supabase
                .from("fill_answers")
                .select("answer_text")
                .eq("question_id", q.id)
              typeSpecificData = { answer: answers?.[0]?.answer_text }
            } else if (type === "reorder") {
              const { data: items } = await supabase
                .from("reorder_items")
                .select("item_text, item_order")
                .eq("question_id", q.id)
                .order("item_order")
              const sortedItems = items.sort((a: any, b: any) => a.item_order - b.item_order)
              typeSpecificData = {
                options: sortedItems.map((item: any) => item.item_text),
                answer: sortedItems.map((item: any) => item.item_text),
              } // Options are the items, answer is the correctly ordered list
            } else if (type === "truefalse") {
              const { data: answers } = await supabase
                .from("truefalse_answers")
                .select("correct_answer")
                .eq("question_id", q.id)
              typeSpecificData = { answer: answers?.[0]?.correct_answer }
            }

            return {
              id: q.id.toString(),
              type,
              subject,
              level,
              question: q.question_text,
              timer: q.timer_seconds,
              createdBy: q.created_by || "MES", // DB enforces MES or MIE only
              image: q.image_url,
              ...typeSpecificData,
              createdAt: new Date(q.created_at).getTime(),
              updatedAt: new Date(q.updated_at).getTime(),
            }
          }),
        )
        setQuestions(transformedQuestions)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllQuestions = async () => {
    if (!supabase) return // Ensure supabase client is available
    try {
      setLoading(true)

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select(`
          id,
          question_text,
          timer_seconds,
          created_at,
          updated_at,
          subject_id,
          level_id,
          question_type_id,
          image_url,
          created_by,
          subjects(name),
          levels(level_number),
          question_types(name)
        `)
        .order("created_at", { ascending: false })

      if (questionsError) throw questionsError

      if (questionsData) {
        const transformedQuestions = await Promise.all(
          questionsData.map(async (q: any) => {
            const type = q.question_types?.name || "mcq"
            const subject = q.subjects?.name || "history"
            const level = q.levels?.level_number || 1

            let typeSpecificData = {}
            if (type === "mcq") {
              const { data: options } = await supabase
                .from("mcq_options")
                .select("option_text, is_correct, option_order") // Fetch relevant fields
                .eq("question_id", q.id)
                .order("option_order")
              const formattedOptions = options.map((opt: any) => ({
                text: opt.option_text,
                correct: opt.is_correct,
                order: opt.option_order,
              }))
              // Map to the expected format
              const mcqOptions: { [key: string]: string } = {}
              formattedOptions
                .sort((a, b) => a.order - b.order)
                .forEach((opt, index) => {
                  const key = String.fromCharCode(65 + index) // A, B, C, D
                  mcqOptions[key] = opt.text
                })
              const correctAnswerKey =
                formattedOptions.find((opt) => opt.correct)?.order !== undefined
                  ? String.fromCharCode(65 + formattedOptions.find((opt) => opt.correct).order)
                  : ""
              typeSpecificData = { options: { ...mcqOptions, correct: correctAnswerKey }, answer: correctAnswerKey }
            } else if (type === "matching") {
              const { data: pairs } = await supabase
                .from("matching_pairs")
                .select("left_item, right_item, pair_order")
                .eq("question_id", q.id)
                .order("pair_order")
              const transformedPairs = pairs?.map((p: any) => ({ left: p.left_item, right: p.right_item })) || []
              typeSpecificData = {
                pairs: transformedPairs,
                answer: transformedPairs,
              }
            } else if (type === "fill") {
              const { data: answers } = await supabase
                .from("fill_answers")
                .select("answer_text")
                .eq("question_id", q.id)
              typeSpecificData = { answer: answers?.[0]?.answer_text }
            } else if (type === "reorder") {
              const { data: items } = await supabase
                .from("reorder_items")
                .select("item_text, item_order")
                .eq("question_id", q.id)
                .order("item_order")
              const sortedItems = items.sort((a: any, b: any) => a.item_order - b.item_order)
              typeSpecificData = {
                options: sortedItems.map((item: any) => item.item_text),
                answer: sortedItems.map((item: any) => item.item_text),
              } // Options are the items, answer is the correctly ordered list
            } else if (type === "truefalse") {
              const { data: answers } = await supabase
                .from("truefalse_answers")
                .select("correct_answer")
                .eq("question_id", q.id)
              typeSpecificData = { answer: answers?.[0]?.correct_answer }
            }

            return {
              id: q.id.toString(),
              type,
              subject,
              level,
              question: q.question_text,
              timer: q.timer_seconds,
              createdBy: q.created_by || "MES", // DB enforces MES or MIE only
              image: q.image_url || "", // Use image_url from database
              ...typeSpecificData,
              createdAt: new Date(q.created_at).getTime(),
              updatedAt: new Date(q.updated_at).getTime(),
            }
          }),
        )
        setAllQuestions(transformedQuestions)
      }
    } catch (error) {
      console.error("Error fetching all questions:", error)
      alert("Failed to fetch questions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      setSupabase(supabase)
      // Fetch all questions initially if viewMode is 'all' or if it's the first load
      if (viewMode === "all") {
        fetchAllQuestions()
      }
      // Fetch filtered questions if viewMode is 'filtered'
      if (viewMode === "filtered") {
        fetchQuestions()
      }
    }
  }, [currentUser, viewMode]) // Re-run when viewMode changes

  // Adjusting useEffect to correctly trigger fetching based on viewMode
  useEffect(() => {
    if (currentUser && supabase) {
      if (viewMode === "all") {
        fetchAllQuestions()
      } else {
        // viewMode === "filtered"
        fetchQuestions()
      }
    }
  }, [selectedSubject, selectedLevel, currentUser, supabase, viewMode])

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
    if (!supabase) return

    try {
      // First delete type-specific data, then the main question
      const { data: qType } = await supabase.from("questions").select("question_type_id").eq("id", id).single()
      if (qType) {
        const { data: typeName } = await supabase
          .from("question_types")
          .select("name")
          .eq("id", qType.question_type_id)
          .single()
        switch (typeName.name) {
          case "mcq":
            await supabase.from("mcq_options").delete().eq("question_id", id)
            break
          case "matching":
            await supabase.from("matching_pairs").delete().eq("question_id", id)
            break
          case "fill":
            await supabase.from("fill_answers").delete().eq("question_id", id)
            break
          case "reorder":
            await supabase.from("reorder_items").delete().eq("question_id", id)
            break
          case "truefalse":
            await supabase.from("truefalse_answers").delete().eq("question_id", id)
            break
          default:
            break
        }
      }

      const { error } = await supabase.from("questions").delete().eq("id", id)
      if (error) throw error
      alert("Question deleted successfully!")
      // Refresh questions based on the current viewMode
      if (viewMode === "filtered") {
        fetchQuestions()
      } else {
        // viewMode === "all"
        fetchAllQuestions()
      }
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("Failed to delete question.")
    }
  }

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const clearSelection = () => setSelectedIds([])

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} selected question(s)? This cannot be undone.`)) return
    if (!supabase) return

    try {
      setLoading(true)
      for (const id of selectedIds) {
        try {
          // Delete type-specific rows first
          const { data: qType } = await supabase.from("questions").select("question_type_id").eq("id", id).single()
          if (qType) {
            const { data: typeName } = await supabase
              .from("question_types")
              .select("name")
              .eq("id", qType.question_type_id)
              .single()
            switch (typeName?.name) {
              case "mcq":
                await supabase.from("mcq_options").delete().eq("question_id", id)
                break
              case "matching":
                await supabase.from("matching_pairs").delete().eq("question_id", id)
                break
              case "fill":
                await supabase.from("fill_answers").delete().eq("question_id", id)
                break
              case "reorder":
                await supabase.from("reorder_items").delete().eq("question_id", id)
                break
              case "truefalse":
                await supabase.from("truefalse_answers").delete().eq("question_id", id)
                break
              default:
                break
            }
          }

          await supabase.from("questions").delete().eq("id", id)
        } catch (err) {
          console.error("Error deleting question id", id, err)
        }
      }

      alert(`${selectedIds.length} question(s) deleted successfully!`)
      clearSelection()
      // Refresh
      if (viewMode === "filtered") {
        fetchQuestions()
      } else {
        fetchAllQuestions()
      }
    } catch (error) {
      console.error("Bulk delete failed:", error)
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

  // Upload image to Supabase Storage
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

  // Check if URL is an external image (not Supabase Storage)
  const isExternalImageUrl = (url: string): boolean => {
    if (!url || url.startsWith('data:')) return false
    if (url.includes('supabase.co/storage')) return false
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

    if (!supabase) return

    try {
      // Upload pending image to Supabase Storage if exists
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
        // If there's an external URL, download and upload to Supabase
        try {
          const blob = await downloadExternalImage(imageUrl)
          imageUrl = await uploadImageToStorage(blob, editingId || undefined)
        } catch (downloadError) {
          console.error("Error downloading external image:", downloadError)
          // Keep external URL if download fails
          alert("Could not download external image. It will be kept as external URL.")
        }
      }

      // Fetch IDs for subject, level, and type, creating them if they don't exist
      const ensureSubjectLevelType = async () => {
        const subjectName = formData.subject ? formData.subject.toLowerCase() : selectedSubject.toLowerCase()
        let levelNum: any = formData.level || selectedLevel
        const typeName = selectedType

        let subjectId: number
        let levelId: number
        let typeId: number

        // Ensure Subject - fetch all and find case-insensitive match
        const { data: allSubjects } = await supabase.from("subjects").select("id, name")
        const matchedSubject = allSubjects?.find(s => s.name.toLowerCase() === subjectName)
        
        if (!matchedSubject) {
          const { data: insertedSub, error: subError } = await supabase
            .from("subjects")
            .insert([{ name: subjectName, description: `Auto-generated ${subjectName}` }])
            .select("id")
            .single()
          if (subError) throw subError
          subjectId = insertedSub.id
        } else {
          subjectId = matchedSubject.id
        }

        // Ensure Level
        const { data: allLevels } = await supabase.from("levels").select("id, level_number")
        const matchedLevel = allLevels?.find(l => l.level_number === levelNum)
        
        if (!matchedLevel) {
          const { data: insertedLvl, error: lvlError } = await supabase
            .from("levels")
            .insert([{ level_number: levelNum, name: `Level ${levelNum}`, difficulty: `Level ${levelNum}` }])
            .select("id")
            .single()
          if (lvlError) throw lvlError
          levelId = insertedLvl.id
        } else {
          levelId = matchedLevel.id
        }

        // Ensure Question Type
        const { data: allTypes } = await supabase.from("question_types").select("id, name")
        const matchedType = allTypes?.find(t => t.name === typeName)
        
        if (!matchedType) {
          const { data: insertedType, error: typeError } = await supabase
            .from("question_types")
            .insert([{ name: typeName }])
            .select("id")
            .single()
          if (typeError) throw typeError
          typeId = insertedType.id
        } else {
          typeId = matchedType.id
        }

        return { subject_id: subjectId, level_id: levelId, question_type_id: typeId }
      }

      const { subject_id, level_id, question_type_id } = await ensureSubjectLevelType()

      if (editingId) {
        // UPDATE operation
        const { error: updateError } = await supabase
          .from("questions")
          .update({
            question_text: formData.question,
            timer_seconds: formData.timer || 30,
            subject_id: subject_id,
            level_id: level_id,
            question_type_id: question_type_id,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
            created_by: currentUser, // Update created_by on edit as well
          })
          .eq("id", editingId)

        if (updateError) throw updateError

        // Delete old type-specific data
        await supabase.from("mcq_options").delete().eq("question_id", editingId)
        await supabase.from("matching_pairs").delete().eq("question_id", editingId)
        await supabase.from("fill_answers").delete().eq("question_id", editingId)
        await supabase.from("reorder_items").delete().eq("question_id", editingId)
        await supabase.from("truefalse_answers").delete().eq("question_id", editingId)

        // Insert new type-specific data
        if (selectedType === "mcq" && formData.options) {
          const optionsObj = formData.options as { A: string; B: string; C: string; D: string; correct: string }
          const optionLetters = ["A", "B", "C", "D"]
          const mcqInserts = optionLetters.map((letter, index) => ({
            question_id: parseInt(editingId),
            option_order: index + 1,
            option_text: optionsObj[letter as keyof typeof optionsObj] || "",
            is_correct: formData.answer === letter,
          }))
          const { error: mcqError } = await supabase.from("mcq_options").insert(mcqInserts)
          if (mcqError) throw mcqError
        } else if (selectedType === "matching" && formData.pairs) {
          const matchingInserts = formData.pairs.map((pair, index) => ({
            question_id: parseInt(editingId),
            pair_order: index + 1,
            left_item: pair.left,
            right_item: pair.right,
          }))
          const { error: matchError } = await supabase.from("matching_pairs").insert(matchingInserts)
          if (matchError) throw matchError
        } else if (selectedType === "fill" && formData.answer) {
          const { error: fillError } = await supabase.from("fill_answers").insert({
            question_id: parseInt(editingId),
            answer_text: formData.answer as string,
            case_sensitive: false,
          })
          if (fillError) throw fillError
        } else if (selectedType === "reorder" && formData.options && Array.isArray(formData.options)) {
          const reorderInserts = (formData.options as string[]).map((item, index) => ({
            question_id: parseInt(editingId),
            item_order: index + 1,
            item_text: item,
            correct_position: index + 1,
          }))
          const { error: reorderError } = await supabase.from("reorder_items").insert(reorderInserts)
          if (reorderError) throw reorderError
        } else if (selectedType === "truefalse") {
          const { error: tfError } = await supabase.from("truefalse_answers").insert({
            question_id: parseInt(editingId),
            correct_answer: formData.answer === true || formData.answer === "true",
            explanation: null,
          })
          if (tfError) throw tfError
        }

        alert("Question updated successfully!")
      } else {
        // CREATE operation
        console.log("[MCQ DEBUG] Inserting question with:", {
          question_text: formData.question,
          timer_seconds: formData.timer || 30,
          subject_id: subject_id,
          level_id: level_id,
          question_type_id: question_type_id,
          image_url: imageUrl,
          created_by: currentUser,
        })
        
        const { data: newQuestion, error: insertError } = await supabase
          .from("questions")
          .insert([
            {
              question_text: formData.question,
              timer_seconds: formData.timer || 30,
              subject_id: subject_id,
              level_id: level_id,
              question_type_id: question_type_id,
              image_url: imageUrl,
              created_by: currentUser,
            },
          ])
          .select("id, created_at")
          .single()
        
        console.log("[MCQ DEBUG] Question insert result:", { newQuestion, insertError })
        if (insertError) throw insertError

        const newQuestionId = newQuestion.id
        console.log("[MCQ DEBUG] New question ID:", newQuestionId)

        // Insert type-specific data directly instead of using RPC
        if (selectedType === "mcq" && formData.options) {
          const optionsObj = formData.options as { A: string; B: string; C: string; D: string; correct: string }
          const optionLetters = ["A", "B", "C", "D"]
          const mcqInserts = optionLetters.map((letter, index) => ({
            question_id: newQuestionId,
            option_order: index + 1,
            option_text: optionsObj[letter as keyof typeof optionsObj] || "",
            is_correct: formData.answer === letter,
          }))
          console.log("[MCQ DEBUG] Inserting MCQ options:", mcqInserts)
          const { error: mcqError } = await supabase.from("mcq_options").insert(mcqInserts)
          console.log("[MCQ DEBUG] MCQ options insert error:", mcqError)
          if (mcqError) throw mcqError
        } else if (selectedType === "matching" && formData.pairs) {
          const matchingInserts = formData.pairs.map((pair, index) => ({
            question_id: newQuestionId,
            pair_order: index + 1,
            left_item: pair.left,
            right_item: pair.right,
          }))
          const { error: matchError } = await supabase.from("matching_pairs").insert(matchingInserts)
          if (matchError) throw matchError
        } else if (selectedType === "fill" && formData.answer) {
          const { error: fillError } = await supabase.from("fill_answers").insert({
            question_id: newQuestionId,
            answer_text: formData.answer as string,
            case_sensitive: false,
          })
          if (fillError) throw fillError
        } else if (selectedType === "reorder" && formData.options && Array.isArray(formData.options)) {
          const reorderInserts = (formData.options as string[]).map((item, index) => ({
            question_id: newQuestionId,
            item_order: index + 1,
            item_text: item,
            correct_position: index + 1,
          }))
          const { error: reorderError } = await supabase.from("reorder_items").insert(reorderInserts)
          if (reorderError) throw reorderError
        } else if (selectedType === "truefalse") {
          const { error: tfError } = await supabase.from("truefalse_answers").insert({
            question_id: newQuestionId,
            correct_answer: formData.answer === true || formData.answer === "true",
            explanation: null,
          })
          if (tfError) throw tfError
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
      // Handle Supabase PostgresError which has message property
      const errorMessage = error?.message || error?.details || error?.hint || JSON.stringify(error) || "Failed to save question"
      alert(`Error: ${errorMessage}`)
    }
  }

  const handleSaveEditedQuestion = async (updatedQuestion: Question) => {
    if (!supabase) return

    try {
      const { error: updateError } = await supabase
        .from("questions")
        .update({
          question_text: updatedQuestion.question,
          timer_seconds: updatedQuestion.timer,
          image_url: updatedQuestion.image, // Assuming image is handled by URL
          updated_at: new Date().toISOString(),
          created_by: currentUser, // Update created_by on edit
        })
        .eq("id", updatedQuestion.id)

      if (updateError) throw updateError

      // Delete old type-specific data
      const questionId = parseInt(updatedQuestion.id)
      await supabase.from("mcq_options").delete().eq("question_id", questionId)
      await supabase.from("matching_pairs").delete().eq("question_id", questionId)
      await supabase.from("fill_answers").delete().eq("question_id", questionId)
      await supabase.from("reorder_items").delete().eq("question_id", questionId)
      await supabase.from("truefalse_answers").delete().eq("question_id", questionId)

      // Insert new type-specific data
      if (updatedQuestion.type === "mcq" && updatedQuestion.options) {
        const optionsObj = updatedQuestion.options as { A: string; B: string; C: string; D: string; correct: string }
        const optionLetters = ["A", "B", "C", "D"]
        const mcqInserts = optionLetters.map((letter, index) => ({
          question_id: questionId,
          option_order: index + 1,
          option_text: optionsObj[letter as keyof typeof optionsObj] || "",
          is_correct: updatedQuestion.answer === letter,
        }))
        const { error: mcqError } = await supabase.from("mcq_options").insert(mcqInserts)
        if (mcqError) throw mcqError
      } else if (updatedQuestion.type === "matching" && updatedQuestion.pairs) {
        const matchingInserts = updatedQuestion.pairs.map((pair, index) => ({
          question_id: questionId,
          pair_order: index + 1,
          left_item: pair.left,
          right_item: pair.right,
        }))
        const { error: matchError } = await supabase.from("matching_pairs").insert(matchingInserts)
        if (matchError) throw matchError
      } else if (updatedQuestion.type === "fill" && updatedQuestion.answer) {
        const { error: fillError } = await supabase.from("fill_answers").insert({
          question_id: questionId,
          answer_text: updatedQuestion.answer as string,
          case_sensitive: false,
        })
        if (fillError) throw fillError
      } else if (updatedQuestion.type === "reorder" && updatedQuestion.options && Array.isArray(updatedQuestion.options)) {
        const reorderInserts = (updatedQuestion.options as string[]).map((item, index) => ({
          question_id: questionId,
          item_order: index + 1,
          item_text: item,
          correct_position: index + 1,
        }))
        const { error: reorderError } = await supabase.from("reorder_items").insert(reorderInserts)
        if (reorderError) throw reorderError
      } else if (updatedQuestion.type === "truefalse") {
        const { error: tfError } = await supabase.from("truefalse_answers").insert({
          question_id: questionId,
          correct_answer: updatedQuestion.answer === true || updatedQuestion.answer === "true",
          explanation: null,
        })
        if (tfError) throw tfError
      }

      setEditModalOpen(false)
      setQuestionToEdit(null)
      alert("Question updated successfully!")
      // Refresh questions based on the current viewMode
      if (viewMode === "filtered") {
        fetchQuestions()
      } else {
        // viewMode === "all"
        fetchAllQuestions()
      }
    } catch (error) {
      console.error("Error updating question:", error)
      alert("Failed to update question")
    }
  }

  const handleExcelImport = async (questions: any[]) => {
    if (!supabase) return
    
    // Validate and normalize currentUser
    const normalizedUser = currentUser ? currentUser.trim().toUpperCase() : null
    if (!normalizedUser || (normalizedUser !== 'MES' && normalizedUser !== 'MIE')) {
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

      // Show detailed result
      if (result.errorCount > 0) {
        alert(`Import completed: ${result.successCount} succeeded, ${result.errorCount} failed.\n\nErrors:\n${result.errors?.join('\n') || 'Unknown'}`)
      } else {
        alert(`✓ ${result.successCount} questions imported successfully!`)
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
      alert(`Error: ${(error as Error).message}`)
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

  const filteredQuestions = questions.filter((q) => q.subject === selectedSubject && q.level === selectedLevel)

  if (!currentUser || !supabase) {
    return (
      <AdminLoginModal
        onClose={() => setShowLoginModal(false)}
        onLogin={(username) => {
          sessionStorage.setItem("adminUser", username)
          setCurrentUser(username)
          const sb = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          )
          setSupabase(sb)
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

          <Card className="p-8 border-0 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">
              {editingId ? "Edit Question" : `Add New ${selectedType.toUpperCase()} Question`}
            </h2>

            <div className="space-y-6">
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
                <label className="text-sm font-medium mb-2 block">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border rounded-lg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-xs max-h-48 rounded border"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <Button onClick={handleSaveQuestion} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Save Question
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
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
              <Button variant="outline" className="gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
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
              setSupabase(null) // Clear supabase client on logout
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
                      <SelectItem value="combined">Combined</SelectItem>
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
                            checked={getFilteredAllQuestions().length > 0 && selectedIds.length === getFilteredAllQuestions().length}
                            onChange={(e) => {
                              const displayed = getFilteredAllQuestions().map((q) => q.id)
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
                      ) : getFilteredAllQuestions().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                            No questions found. Try adjusting your filters or create a new question.
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredAllQuestions().map((question) => (
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
                Showing {getFilteredAllQuestions().length} of {allQuestions.length} total questions
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
