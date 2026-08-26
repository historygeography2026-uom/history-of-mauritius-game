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
  const [importResult, setImportResult] = useState<{
    inserted: number
    errors: number
    errorList?: string[]
    unitStats?: Record<string, UnitStats>
  } | null>(null)
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
        setParsedRows([
          {
            row: 0,
            unit_no: "",
            question_type: "",
            prompt: "",
            status: "error",
            message: "No questions found in file. Please download and check the template.",
          },
        ])
        return
      }

      const validation = validatePracticeExcelQuestions(questions)
      const rows: ParsedRow[] = []

      validation.errors.forEach((err) => {
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
          row: idx + 2,
          unit_no: q.unit || "",
          question_type: q.type || "",
          prompt: q.question || "",
          status: "valid",
          message: "",
        })
      })

      // Sort rows by row index
      rows.sort((a, b) => a.row - b.row)
      setParsedRows(rows)
      setValidQuestionsToUpload(validation.validQuestions)
    } catch (err: any) {
      console.error("[PracticeImportModal] parse error:", err)
      setParsedRows([
        {
          row: 0,
          unit_no: "",
          question_type: "",
          prompt: "",
          status: "error",
          message: "Failed to parse file: " + (err?.message || "Please check format."),
        },
      ])
    } finally {
      setUploading(false)
    }
  }

  const handleImport = async () => {
    if (validQuestionsToUpload.length === 0) {
      alert("No valid questions found to import! Please check the Preview table for errors. Make sure you are using the Practice Template.")
      return
    }
    setImporting(true)

    try {
      const formData = new FormData()
      formData.append("questions", JSON.stringify(validQuestionsToUpload))
      formData.append("createdBy", "MES")

      const res = await fetch("/api/admin/practice/import", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      setImportResult({
        inserted: data.successCount ?? 0,
        errors: data.errorCount ?? (res.ok ? 0 : 1),
        errorList: data.errors || (data.error ? [data.error] : undefined),
        unitStats: data.unitStats,
      })

      if ((data.successCount ?? 0) > 0) {
        onImportComplete()
      }
    } catch (err: any) {
      console.error("[PracticeImportModal] import error:", err)
      setImportResult({
        inserted: 0,
        errors: 1,
        errorList: ["Network or server error during upload: " + (err?.message || "Unknown")],
        unitStats: {},
      })
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      await generatePracticeExcelTemplate()
    } catch (err) {
      console.error("Failed to download template:", err)
      alert("Failed to generate template: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4 py-8 font-sans" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-slate-50">
          <div>
            <h1 id="import-title" className="text-lg font-bold text-gray-900">Import Practice Questions</h1>
            <p className="text-xs text-gray-500">Upload bulk questions using the curriculum Excel template</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import dialog"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-blue-900">Need the Practice Questions Template?</p>
              <p className="text-xs text-blue-700">Download the template populated with sample Grade 5 & Grade 6 questions.</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Template
            </button>
          </div>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/30">
            <UploadCloud className="h-10 w-10 text-blue-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-800">
              {uploading ? "Parsing questions from spreadsheet..." : <>Drag & drop your Excel file here, or <span className="text-blue-600 underline">browse files</span></>}
            </span>
            <span className="text-xs text-gray-500">Supports .xlsx and .csv files</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          {fileName && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-xs">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              <span className="font-semibold">{fileName}</span>
              <span className="ml-auto text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-md text-gray-600">{parsedRows.length} rows processed</span>
            </div>
          )}

          {importResult && (
            <div className={`mt-4 rounded-xl border p-4 text-sm font-medium ${importResult.inserted > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>
              <div className="flex items-center gap-2 mb-2 font-bold text-lg">
                {importResult.inserted > 0 ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    Import Successfully Completed!
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-rose-600" />
                    Import Encountered Issues
                  </>
                )}
              </div>
              <div className="text-sm">
                Successfully imported <span className="font-bold text-emerald-700">{importResult.inserted}</span> practice questions into the bank.
              </div>
              {importResult.errors > 0 && (
                <div className="mt-1 text-sm text-rose-700">
                  <span className="font-bold">{importResult.errors}</span> questions could not be imported due to errors.
                </div>
              )}

              {importResult.errorList && importResult.errorList.length > 0 && (
                <div className="mt-3 bg-white/80 p-3 rounded-lg border border-rose-200 text-xs space-y-1 font-mono text-rose-800 max-h-36 overflow-y-auto">
                  {importResult.errorList.map((err, i) => (
                    <div key={i} className="whitespace-pre-wrap">{err}</div>
                  ))}
                </div>
              )}

              {importResult.unitStats && Object.keys(importResult.unitStats).length > 0 && (
                <div className="mt-4 border-t pt-3 border-emerald-200/60">
                  <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <LayoutList className="w-4 h-4" /> Breakdown by Unit:
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(importResult.unitStats).map(([unit, stats]) => (
                      <div key={unit} className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-xs">
                        <div className="font-bold text-gray-800">{unit}</div>
                        <div className="text-xs mt-1 flex justify-between">
                          <span className="text-emerald-700 font-semibold">{stats.success} Added</span>
                          {stats.errors.length > 0 && <span className="text-rose-600 font-semibold">{stats.errors.length} Failed</span>}
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
                <h2 className="text-sm font-bold text-gray-900">Questions Preview</h2>
                <p className="text-xs">
                  <span className="font-bold text-emerald-700">{validQuestionsToUpload.length} valid</span>
                  {" · "}
                  <span className={errorCount > 0 ? "font-bold text-rose-600" : "text-gray-500"}>{errorCount} errors</span>
                </p>
              </div>
              <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200 shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 border-b border-gray-200 bg-slate-100 text-xs font-bold uppercase tracking-wider text-gray-600">
                    <tr>
                      <th scope="col" className="px-3 py-2.5">Row</th>
                      <th scope="col" className="px-3 py-2.5">Unit</th>
                      <th scope="col" className="px-3 py-2.5">Type</th>
                      <th scope="col" className="px-3 py-2.5">Question Prompt</th>
                      <th scope="col" className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.map((row, i) => (
                      <tr key={i} className={row.status === "error" ? "bg-rose-50/60" : "hover:bg-slate-50/60"}>
                        <td className="px-3 py-2 font-mono text-xs text-gray-500">#{row.row}</td>
                        <td className="px-3 py-2 font-bold text-gray-700">Unit {row.unit_no || "—"}</td>
                        <td className="px-3 py-2 font-mono text-xs text-gray-600 uppercase">{row.question_type || "—"}</td>
                        <td className="max-w-xs px-3 py-2 text-gray-800">
                          <span className="line-clamp-1">{row.prompt || "—"}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          {row.status === "valid" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md" title={row.message}>
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

        <footer className="flex items-center justify-between border-t border-gray-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-100"
          >
            Close
          </button>
          <button
            type="button"
            disabled={validQuestionsToUpload.length === 0 || importing}
            onClick={handleImport}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importing ? "Importing Questions..." : `Import ${validQuestionsToUpload.length} Questions`}
          </button>
        </footer>
      </div>
    </div>
  )
}
