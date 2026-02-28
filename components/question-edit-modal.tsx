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
import { X, Save, Image, Settings, FileText, CheckCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Question {
  id: string
  type: "mcq" | "matching" | "fill" | "reorder" | "truefalse"
  question: string
  instruction?: string
  subject: string
  level: number
  timer?: number
  image?: string
  options?: { A: string; B: string; C: string; D: string; correct: string }
  pairs?: Array<{ left: string; right: string }>
  answer?: string
  items?: string[]
  correctAnswer?: boolean
  createdAt?: string
  createdBy?: string
  updatedAt?: string
}

interface QuestionEditModalProps {
  question: Question | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedQuestion: Question) => void
}

export default function QuestionEditModal({ question, isOpen, onClose, onSave }: QuestionEditModalProps) {
  const [formData, setFormData] = useState<Question | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (question) {
      setFormData({ ...question })
      setImagePreview(question.image || null)
    }
  }, [question])

  const [isSaving, setIsSaving] = useState(false)

  if (!formData) return null

  // Check if URL is an external image (not stored on our server)
  const isExternalImageUrl = (url: string): boolean => {
    if (!url || url.startsWith('data:')) return false
    if (url.startsWith('/api/images/')) return false
    if (url.startsWith('/')) return false
    return url.startsWith('http://') || url.startsWith('https://')
  }

  // Download external image and return as Blob
  const downloadExternalImage = async (url: string): Promise<Blob> => {
    // Use a proxy approach - load image into canvas
    return new Promise((resolve, reject) => {
      const img = document.createElement('img')
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Resize to max 800x600
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
      img.onerror = () => reject(new Error('Failed to load external image. The image may not allow cross-origin access.'))
      img.src = url
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      let finalFormData = { ...formData }

      // If there's an external image URL, download and upload to server
      if (formData.image && isExternalImageUrl(formData.image)) {
        try {
          const blob = await downloadExternalImage(formData.image)
          const uploadedUrl = await uploadImageToStorage(blob, formData.id)
          finalFormData = { ...finalFormData, image: uploadedUrl }
        } catch (error) {
          console.error('Error processing external image:', error)
          // Keep original URL if download fails
          alert('Could not download external image. It will be kept as external URL.')
        }
      }

      onSave(finalFormData)
    } finally {
      setIsSaving(false)
    }
  }

  // Resize image on canvas and return as Blob for upload
  const resizeImageToBlob = (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.85): Promise<{ blob: Blob; previewUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = img
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Use better image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob for upload
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

  // Upload image to Render persistent disk
  const uploadImageToStorage = async (blob: Blob, questionId?: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', blob, `image-${Date.now()}.jpg`)
    if (questionId) {
      formData.append('questionId', questionId)
    }

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const data = await response.json()
    return data.url
  }

  // Delete image from server storage
  const deleteImageFromStorage = async (imageUrl: string) => {
    if (!imageUrl || !imageUrl.includes('question-images')) return
    
    try {
      await fetch(`/api/upload-image?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error deleting old image:', error)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsResizing(true)
        
        // Resize the image
        const { blob, previewUrl } = await resizeImageToBlob(file)
        setImagePreview(previewUrl)
        
        // Upload to Render persistent disk
        const uploadedUrl = await uploadImageToStorage(blob, formData.id)
        
        // Delete old image if it was stored on our server
        if (formData.image && formData.image.includes('question-images')) {
          await deleteImageFromStorage(formData.image)
        }
        
        setFormData({ ...formData, image: uploadedUrl })
        
        // Show file size info
        const originalSize = (file.size / 1024).toFixed(1)
        const newSize = (blob.size / 1024).toFixed(1)
        console.log(`Image uploaded: ${originalSize}KB → ${newSize}KB`)
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image. Please try again.')
      } finally {
        setIsResizing(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Edit Question
          </DialogTitle>
          <DialogDescription>
            Update the question details below. Changes will be saved to the database.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-6 space-y-8">
          {/* Section: Basic Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Settings className="h-5 w-5" />
              <span>Basic Settings</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-lg border bg-card">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Subject</Label>
                <Select value={formData.subject} onValueChange={(val) => setFormData({ ...formData, subject: val })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="history">📚 History</SelectItem>
                    <SelectItem value="geography">🗺️ Geography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Level</Label>
                <Select
                  value={formData.level.toString()}
                  onValueChange={(val) => setFormData({ ...formData, level: Number.parseInt(val) })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">⭐ Level 1 (Easy)</SelectItem>
                    <SelectItem value="2">⭐⭐ Level 2 (Medium)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ Level 3 (Hard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Timer (seconds)</Label>
                <Input
                  type="number"
                  value={formData.timer || 30}
                  onChange={(e) => setFormData({ ...formData, timer: Number.parseInt(e.target.value) })}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Section: Question Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <FileText className="h-5 w-5" />
              <span>Question Content</span>
            </div>
            <div className="p-4 rounded-lg border bg-card space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Question Text</Label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows={3}
                  className="resize-none"
                  placeholder="Enter your question here..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Optional Instruction</Label>
                <Textarea
                  value={formData.instruction || ""}
                  onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                  rows={2}
                  className="resize-none"
                  placeholder="Add custom instruction text (e.g., 'Match each item on the left with its description on the right')"
                />
                <p className="text-xs text-muted-foreground">
                  Custom instruction shown to students when they answer this question
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section: Image */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Image className="h-5 w-5" />
              <span>Question Image</span>
              <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
            </div>
            <div className="p-4 rounded-lg border bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Upload Image</Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="h-10"
                    disabled={isResizing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, GIF, WebP. Auto-resized to max 800×600px.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Or Paste Image URL</Label>
                  <Input
                    type="url"
                    value={formData.image || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value })
                      setImagePreview(e.target.value)
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="h-10"
                    disabled={isResizing}
                  />
                </div>
              </div>
              {isResizing && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-primary/10 text-primary">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                  <span className="text-sm font-medium">Uploading image...</span>
                </div>
              )}
              {imagePreview && !isResizing && (
                <div className="flex items-start gap-4 p-3 rounded-md bg-muted/50">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-24 rounded border object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=128&width=200"
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        // Delete from server storage if stored locally
                        if (formData.image && formData.image.includes('question-images')) {
                          await deleteImageFromStorage(formData.image)
                        }
                        setImagePreview(null)
                        setFormData({ ...formData, image: "" })
                      }}
                      className="gap-1"
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {formData.image?.includes('question-images') || formData.image?.startsWith('/api/images/') ? '✓ Stored on server' : 'External URL'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Section: Answer Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <CheckCircle className="h-5 w-5" />
              <span>Answer Options</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary uppercase">
                {formData.type}
              </span>
            </div>
            <div className="p-4 rounded-lg border bg-card space-y-4">
              {/* MCQ Options */}
              {formData.type === "mcq" && formData.options && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["A", "B", "C", "D"].map((opt) => (
                      <div key={opt} className="space-y-2">
                        <Label className="text-sm font-medium">Option {opt}</Label>
                        <Input
                          value={formData.options![opt as keyof typeof formData.options]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              options: { ...formData.options!, [opt]: e.target.value },
                            })
                          }
                          className="h-10"
                          placeholder={`Enter option ${opt}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t">
                    <div className="space-y-2 max-w-xs">
                      <Label className="text-sm font-medium">Correct Answer</Label>
                      <Select
                        value={formData.options.correct}
                        onValueChange={(val) =>
                          setFormData({
                            ...formData,
                            options: { ...formData.options!, correct: val },
                          })
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">✓ Option A</SelectItem>
                          <SelectItem value="B">✓ Option B</SelectItem>
                          <SelectItem value="C">✓ Option C</SelectItem>
                          <SelectItem value="D">✓ Option D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Matching Pairs */}
              {formData.type === "matching" && formData.pairs && (
                <div className="space-y-3">
                  {formData.pairs.map((pair, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-4 p-3 rounded-md bg-muted/30">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Left {idx + 1}</Label>
                        <Input
                          value={pair.left}
                          onChange={(e) => {
                            const newPairs = [...formData.pairs!]
                            newPairs[idx].left = e.target.value
                            setFormData({ ...formData, pairs: newPairs })
                          }}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Right {idx + 1}</Label>
                        <Input
                          value={pair.right}
                          onChange={(e) => {
                            const newPairs = [...formData.pairs!]
                            newPairs[idx].right = e.target.value
                            setFormData({ ...formData, pairs: newPairs })
                          }}
                          className="h-10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fill in the Blank */}
              {formData.type === "fill" && (
                <div className="space-y-2 max-w-md">
                  <Label className="text-sm font-medium">Correct Answer</Label>
                  <Input
                    value={formData.answer || ""}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="h-10"
                    placeholder="Enter the correct answer"
                  />
                </div>
              )}

              {/* Reorder Items */}
              {formData.type === "reorder" && formData.items && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Enter items in the correct order (top to bottom)</p>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {idx + 1}
                      </span>
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newItems = [...formData.items!]
                          newItems[idx] = e.target.value
                          setFormData({ ...formData, items: newItems })
                        }}
                        className="h-10 flex-1"
                        placeholder={`Item ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* True/False */}
              {formData.type === "truefalse" && (
                <div className="space-y-2 max-w-xs">
                  <Label className="text-sm font-medium">Correct Answer</Label>
                  <Select
                    value={formData.correctAnswer ? "true" : "false"}
                    onValueChange={(val) => setFormData({ ...formData, correctAnswer: val === "true" })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">✓ True</SelectItem>
                      <SelectItem value="false">✗ False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 flex flex-wrap gap-4">
            <span>
              📅 Created: {formData.createdAt ? new Date(formData.createdAt).toLocaleString() : "N/A"}
            </span>
            {formData.createdBy && <span>👤 By: {formData.createdBy}</span>}
            {formData.updatedAt && <span>🔄 Updated: {new Date(formData.updatedAt).toLocaleString()}</span>}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isResizing} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
