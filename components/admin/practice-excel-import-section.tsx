"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Upload, AlertCircle, AlertTriangle, CheckCircle, X } from "lucide-react"
import {
  generatePracticeExcelTemplate,
  parsePracticeExcelFile,
  validatePracticeExcelQuestions,
  type PracticeValidationResult,
} from "@/lib/practice-excel-utils"

interface PracticeExcelImportSectionProps {
  onImport: (questions: any[]) => Promise<void>
  isLoading?: boolean
}

export default function PracticeExcelImportSection({ onImport, isLoading }: PracticeExcelImportSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState("")
  const [validationResult, setValidationResult] = useState<PracticeValidationResult | null>(null)
  const [showValidationDetails, setShowValidationDetails] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)
  const progressIntervalRef = useRef<number | null>(null)
  const pendingMessageTimeoutsRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      try {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current as any)
          progressIntervalRef.current = null
        }
      } catch (e) {
        // ignore
      }
      try {
        pendingMessageTimeoutsRef.current.forEach((t) => clearTimeout(t))
      } catch (e) {
        // ignore
      }
      pendingMessageTimeoutsRef.current = []
    }
  }, [])

  const handleDownloadTemplate = async () => {
    try {
      await generatePracticeExcelTemplate()
      setImportMessage("Template downloaded! Edit and upload back.")
      const t = window.setTimeout(() => setImportMessage(""), 3000)
      pendingMessageTimeoutsRef.current.push(t)
    } catch (error) {
      console.error("[practice-import] Error generating template:", error)
      setImportMessage("❌ Could not generate the Excel template. Please try again.")
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setImporting(true)
      setImportMessage("Parsing file...")
      setValidationResult(null)

      const questions = await parsePracticeExcelFile(file)

      if (questions.length === 0) {
        setImportMessage("❌ No questions found in the file. Make sure you're using the correct template.")
        setImporting(false)
        return
      }

      // Validate questions
      setImportMessage("Validating questions...")
      const validation = validatePracticeExcelQuestions(questions)
      setValidationResult(validation)

      if (!validation.isValid) {
        setImportMessage(
          `❌ Validation failed: ${validation.errors.length} error(s) found. Fix the issues and try again.`
        )
        setShowValidationDetails(true)
        if (fileInputRef.current) fileInputRef.current.value = ""
        setImporting(false)
        return
      }

      // Show warnings but proceed with import
      if (validation.warnings.length > 0) {
        setShowValidationDetails(true)
      }

      setImportMessage(`Found ${validation.validQuestions.length} valid questions. Uploading...`)
      setProgressPercent(0)

      // Simulate progress during upload
      progressIntervalRef.current = window.setInterval(() => {
        setProgressPercent((prev) => Math.min(prev + Math.random() * 30, 90))
      }, 300) as unknown as number

      await onImport(validation.validQuestions)

      try {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current as any)
          progressIntervalRef.current = null
        }
      } catch (e) {
        // ignore
      }
      setProgressPercent(100)

      setImportMessage(
        `✓ ${validation.validQuestions.length} questions imported successfully!${
          validation.skippedCount > 0 ? ` (${validation.skippedCount} skipped)` : ""
        }`
      )
      const clearTimer = window.setTimeout(() => {
        setImportMessage("")
        setValidationResult(null)
        setShowValidationDetails(false)
        setProgressPercent(0)
      }, 5000)
      pendingMessageTimeoutsRef.current.push(clearTimer)
    } catch (error: any) {
      console.error("[practice-import] Error importing:", error)
      const errorMessage = error?.message || String(error) || "Unknown error"
      setImportMessage(`❌ Error importing file: ${errorMessage}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card className="p-6 border-0 shadow-md bg-gradient-to-r from-emerald-50 to-teal-50 mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4">📚 Practice Mode — Excel Import/Export</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={handleDownloadTemplate}
          disabled={isLoading}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="h-4 w-4" />
          Download Practice Template
        </Button>

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            disabled={importing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <Button
            disabled={importing}
            variant="outline"
            className="w-full gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Upload className="h-4 w-4" />
            {importing ? "Importing..." : "Upload Practice Questions"}
          </Button>
        </div>

        <div className="flex items-center">
          <p className="text-xs text-slate-600">
            Use <strong>unit</strong> column (1–6) instead of subject/level. Timer column is ignored in practice mode.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {progressPercent > 0 && progressPercent < 100 && (
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Import message */}
      {importMessage && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            importMessage.startsWith("❌")
              ? "bg-red-50 text-red-700 border border-red-200"
              : importMessage.startsWith("✓")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {importMessage}
        </div>
      )}

      {/* Validation details */}
      {validationResult && showValidationDetails && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Validation Details</p>
            <Button
              onClick={() => setShowValidationDetails(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {validationResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto">
              {validationResult.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-red-700 mb-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Row {err.row} ({err.field}): {err.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-h-32 overflow-y-auto">
              {validationResult.warnings.map((warn, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-amber-700 mb-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Row {warn.row} ({warn.field}): {warn.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {validationResult.isValid && validationResult.warnings.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-green-700">
              <CheckCircle className="h-3 w-3" />
              All questions validated successfully!
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
