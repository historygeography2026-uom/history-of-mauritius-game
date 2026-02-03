"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Upload, AlertCircle, AlertTriangle, CheckCircle, X } from "lucide-react"
import { generateExcelTemplate, parseExcelFile, validateExcelQuestions, type ValidationResult } from "@/lib/excel-utils"

interface ExcelImportSectionProps {
  onImport: (questions: any[]) => Promise<void>
  isLoading?: boolean
}

export default function ExcelImportSection({ onImport, isLoading }: ExcelImportSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showValidationDetails, setShowValidationDetails] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)

  const handleDownloadTemplate = () => {
    generateExcelTemplate()
    setImportMessage("Template downloaded! Edit and upload back.")
    setTimeout(() => setImportMessage(""), 3000)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setImporting(true)
      setImportMessage("Parsing file...")
      setValidationResult(null)

      const questions = await parseExcelFile(file)
      console.log("[v0] Parsed questions from Excel:", questions)

      if (questions.length === 0) {
        setImportMessage("❌ No questions found in the file. Make sure you're using the correct template.")
        setImporting(false)
        return
      }

      // Validate questions
      setImportMessage("Validating questions...")
      const validation = validateExcelQuestions(questions)
      setValidationResult(validation)

      if (!validation.isValid) {
        setImportMessage(`❌ Validation failed: ${validation.errors.length} error(s) found. Fix the issues and try again.`)
        setShowValidationDetails(true)
        fileInputRef.current!.value = ""
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
      const progressInterval = setInterval(() => {
        setProgressPercent(prev => Math.min(prev + Math.random() * 30, 90))
      }, 300)
      
      await onImport(validation.validQuestions)
      
      clearInterval(progressInterval)
      setProgressPercent(100)

      setImportMessage(`✓ ${validation.validQuestions.length} questions imported successfully!${validation.skippedCount > 0 ? ` (${validation.skippedCount} skipped)` : ''}`)
      setTimeout(() => {
        setImportMessage("")
        setValidationResult(null)
        setShowValidationDetails(false)
        setProgressPercent(0)
      }, 5000)
    } catch (error: any) {
      console.error("[v0] Error importing questions:", error)
      const errorMessage = error?.message || String(error) || "Unknown error"
      setImportMessage(`❌ Error importing file: ${errorMessage}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card className="p-6 border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Excel Import/Export</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={handleDownloadTemplate}
          disabled={isLoading}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            disabled={importing}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing || isLoading}
            className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Upload className="h-4 w-4" />
            {importing ? "Importing..." : "Upload Excel File"}
          </Button>
        </div>
      </div>

      {importMessage && (
        <div className={`mt-4 p-3 bg-white rounded-lg text-sm border-l-4 ${
          importMessage.includes('❌') ? 'border-red-500 text-red-700' :
          importMessage.includes('✓') ? 'border-green-500 text-green-700' :
          'border-blue-500 text-slate-700'
        }`}>
          {importMessage}
          {progressPercent > 0 && progressPercent < 100 && (
            <div className="mt-3">
              <div className="flex justify-between items-center text-xs mb-1">
                <span>Uploading...</span>
                <span className="font-semibold">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Details */}
      {validationResult && showValidationDetails && (
        <div className="mt-4 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center justify-between p-3 border-b">
            <h4 className="font-semibold text-sm">Validation Results</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowValidationDetails(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-red-600 font-medium text-sm mb-2">
                  <AlertCircle className="h-4 w-4" />
                  Errors ({validationResult.errors.length})
                </div>
                <ul className="space-y-1 text-xs text-red-700 bg-red-50 p-2 rounded">
                  {validationResult.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>
                      <span className="font-medium">Row {err.row}:</span> {err.field} - {err.message}
                    </li>
                  ))}
                  {validationResult.errors.length > 10 && (
                    <li className="italic">...and {validationResult.errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-amber-600 font-medium text-sm mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings ({validationResult.warnings.length})
                </div>
                <ul className="space-y-1 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                  {validationResult.warnings.slice(0, 5).map((warn, i) => (
                    <li key={i}>
                      <span className="font-medium">Row {warn.row}:</span> {warn.field} - {warn.message}
                    </li>
                  ))}
                  {validationResult.warnings.length > 5 && (
                    <li className="italic">...and {validationResult.warnings.length - 5} more warnings</li>
                  )}
                </ul>
              </div>
            )}

            {/* Summary */}
            {validationResult.isValid && (
              <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                <CheckCircle className="h-4 w-4" />
                {validationResult.validQuestions.length} questions ready to import
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600 mt-4">
        💡 Download the template, edit with your questions, and upload to populate the question bank.
        <br />📸 Use <code className="bg-slate-100 px-1 rounded">imageUrl</code> column for direct image links (e.g., https://example.com/image.jpg).
      </p>
    </Card>
  )
}
