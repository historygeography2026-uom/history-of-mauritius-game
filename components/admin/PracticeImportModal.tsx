"use client"

import { useState, useRef } from "react"
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, UploadCloud, X, LayoutList } from "lucide-react"
import { parsePracticeExcelFile, validatePracticeExcelQuestions, generatePracticeExcelTemplate } from "@/lib/practice-excel-utils"

interface ParsedRow {
  row: number
  unit_no: number | string
  question_type: string
  prompt: string
  status: "valid" | "error"
  message: string
}

interface UnitStats {
  success: number
  errors: string[]
}

interface Props {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
}

export default function PracticeImportModal({ open, onClose, onImportComplete }: Props) {
  const [fileName, setFileName] = useState("")
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ inserted: number; errors: number; unitStats?: Record<string, UnitStats> } | null>(null)
  const [validQuestionsToUpload, setValidQuestionsToUpload] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validRows = parsedRows.filter((r) => r.status === "valid")
  const errorCount = parsedRows.length - validRows.length

  if (!open) return null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setUploading(true)
    setImportResult(null)
    setParsedRows([])
    setValidQuestionsToUpload([])

    try {
      const questions = await parsePracticeExcelFile(file)
      if (questions.length === 0) {
        setParsedRows([{
          row: 0,
          unit_no: "",
          question_type: "",
          prompt: "",
          status: "error",
          message: "No questions found in file.",
        }])
        return
      }

      const validation = validatePracticeExcelQuestions(questions)
      
      const rows: ParsedRow[] = []
      
      validation.errors.forEach(err => {
        rows.push({
          row: err.row,
          unit_no: "",
          question_type: "",
          prompt: err.question || "",
          status: "error",
          message: err.message,
        })
      })

      validation.validQuestions.forEach((q, idx) => {
        rows.push({
          row: idx + 2, // approximation
          unit_no: q.unit || "",
          question_type: q.type || "",
          prompt: q.question || "",
          status: "valid",
          message: "",
        })
      })

      // Sort rows
      rows.sort((a, b) => a.row - b.row)
      setParsedRows(rows)
      setValidQuestionsToUpload(validation.validQuestions)

    } catch (err) {
      setParsedRows([{
        row: 0,
        unit_no: "",
        question_type: "",
        prompt: "",
        status: "error",
        message: "Failed to parse file. Please try again.",
      }])
    } finally {
      setUploading(false)
    }
  }

  const handleImport = async () => {
    if (validQuestionsToUpload.length === 0) return
    setImporting(true)

    try {
      const formData = new FormData()
      formData.append("questions", JSON.stringify(validQuestionsToUpload))
      formData.append("createdBy", "MES") // Defaulting to MES

      const res = await fetch("/api/admin/practice/import", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      setImportResult({ 
        inserted: data.successCount ?? 0, 
        errors: data.errorCount ?? 0,
        unitStats: data.unitStats
      })

      if ((data.successCount ?? 0) > 0) {
        onImportComplete()
      }
    } catch (err) {
      setImportResult({ inserted: 0, errors: 1 })
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      await generatePracticeExcelTemplate()
    } catch (err) {
      console.error("Failed to download template:", err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4 py-8 font-sans" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h1 id="import-title" className="text-lg font-semibold text-gray-900">Import Practice Questions</h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import dialog"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">Upload a CSV or XLSX file of practice questions.</p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Template
            </button>
          </div>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition-colors hover:border-gray-400 hover:bg-gray-100">
            <UploadCloud className="h-8 w-8 text-gray-400" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-700">
              {uploading ? "Parsing..." : <>Drag & drop your file here, or <span className="text-blue-600">browse</span></>}
            </span>
            <span className="text-xs text-gray-500">CSV or XLSX, up to 5 MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          {fileName && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
              <FileSpreadsheet className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span className="font-medium">{fileName}</span>
              <span className="ml-auto text-xs text-gray-500">{parsedRows.length} rows parsed</span>
            </div>
          )}

          {importResult && (
            <div className={`mt-4 rounded-lg border px-4 py-4 text-sm font-medium ${importResult.inserted > 0 ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              <div className="flex items-center gap-2 mb-2 font-bold text-lg">
                {importResult.inserted > 0 ? "✓ Import Complete" : "✕ Import Failed"}
              </div>
              <div>Successfully imported {importResult.inserted} questions.</div>
              {importResult.errors > 0 && <div>Failed to import {importResult.errors} questions due to database errors.</div>}
              
              {importResult.unitStats && Object.keys(importResult.unitStats).length > 0 && (
                <div className="mt-4 border-t pt-3 border-green-200/50">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-1"><LayoutList className="w-4 h-4" /> Summary by Unit</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(importResult.unitStats).map(([unitName, stats]) => (
                      <div key={unitName} className="bg-white/60 p-2 rounded border border-green-100 shadow-sm">
                        <div className="font-bold text-gray-700">{unitName}</div>
                        <div className="text-xs mt-1 flex justify-between">
                          <span className="text-emerald-600 font-medium">{stats.success} Success</span>
                          {stats.errors.length > 0 && <span className="text-red-500 font-medium">{stats.errors.length} Failed</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {parsedRows.length > 0 && !importResult && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Preview</h2>
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-emerald-600">{validQuestionsToUpload.length} valid</span>
                  {" · "}
                  <span className={ont-medium }>{errorCount} errors</span>
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">Row</th>
                      <th scope="col" className="px-3 py-2">Unit</th>
                      <th scope="col" className="px-3 py-2">Type</th>
                      <th scope="col" className="px-3 py-2">Question</th>
                      <th scope="col" className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.map((row, i) => (
                      <tr key={i} className={row.status === "error" ? "bg-red-50/50" : undefined}>
                        <td className="px-3 py-2 font-mono text-xs text-gray-500">{row.row}</td>
                        <td className="px-3 py-2 text-gray-700">{row.unit_no || "—"}</td>
                        <td className="px-3 py-2 font-mono text-xs text-gray-600">{row.question_type || "—"}</td>
                        <td className="max-w-48 px-3 py-2 text-gray-700">
                          <span className="line-clamp-1">{row.prompt || "—"}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          {row.status === "valid" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700" title={row.message}>
                              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              {row.message}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={validQuestionsToUpload.length === 0 || importing}
            onClick={handleImport}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {importing ? "Importing..." : `Import ${previewData?.length || 0} valid rows`}
          </button>
        </footer>
      </div>
    </div>
  )
}
