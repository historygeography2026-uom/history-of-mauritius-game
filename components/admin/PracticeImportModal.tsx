// PracticeImportModal.tsx — Fable design, wired to real admin import API
"use client"

import { useState, useRef } from "react"
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, UploadCloud, X } from "lucide-react"

interface ParsedRow {
  row: number
  unit_no: number
  question_type: string
  prompt: string
  status: "valid" | "error"
  message: string
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
  const [importResult, setImportResult] = useState<{ inserted: number; errors: number } | null>(null)
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

    try {
      // Upload file for server-side validation
      const formData = new FormData()
      formData.append("file", file)
      formData.append("validate_only", "true")

      const res = await fetch("/api/admin/practice/import", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData,
      })

      const data = await res.json()

      if (data.validation_results) {
        // Server returned per-row validation
        setParsedRows(data.validation_results.map((r: any, i: number) => ({
          row: r.row ?? i + 1,
          unit_no: r.unit_no ?? 0,
          question_type: r.question_type ?? "",
          prompt: r.question_text ?? r.prompt ?? "",
          status: r.error ? "error" : "valid",
          message: r.error ?? "",
        })))
      } else if (data.inserted !== undefined) {
        // Server already imported — show result
        setImportResult({ inserted: data.inserted, errors: data.errors?.length ?? 0 })
        if (data.errors?.length) {
          setParsedRows(data.errors.map((e: any, i: number) => ({
            row: e.row ?? i + 1,
            unit_no: 0,
            question_type: "",
            prompt: "",
            status: "error" as const,
            message: e.error ?? e.message ?? "Unknown error",
          })))
        }
      } else if (data.results) {
        // Another possible response shape
        const rows: ParsedRow[] = data.results.map((r: any, i: number) => ({
          row: r.row ?? i + 1,
          unit_no: r.unit_no ?? 0,
          question_type: r.question_type ?? "",
          prompt: r.question_text ?? "",
          status: r.success === false ? "error" : "valid",
          message: r.error ?? "",
        }))
        setParsedRows(rows)
      }
    } catch (err) {
      setParsedRows([{
        row: 0,
        unit_no: 0,
        question_type: "",
        prompt: "",
        status: "error",
        message: "Failed to upload file. Please try again.",
      }])
    } finally {
      setUploading(false)
    }
  }

  const handleImport = async () => {
    if (validRows.length === 0) return
    setImporting(true)

    try {
      // Re-upload the file for actual import
      const fileInput = fileInputRef.current
      const file = fileInput?.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/practice/import", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      setImportResult({ inserted: data.inserted ?? 0, errors: data.errors?.length ?? 0 })

      if ((data.inserted ?? 0) > 0) {
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
      const res = await fetch("/api/admin/practice/import?template=true")
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "practice_questions_template.xlsx"
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("Failed to download template:", err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4 py-8 font-sans" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h1 id="import-title" className="text-lg font-semibold text-gray-900">Import Questions</h1>
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
              {uploading ? "Uploading..." : <>Drag & drop your file here, or <span className="text-blue-600">browse</span></>}
            </span>
            <span className="text-xs text-gray-500">CSV or XLSX, up to 5 MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
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
            <div className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${importResult.inserted > 0 ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {importResult.inserted > 0
                ? `✅ Successfully imported ${importResult.inserted} questions.`
                : `Import failed. ${importResult.errors} errors.`}
            </div>
          )}

          {parsedRows.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Preview</h2>
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-emerald-600">{validRows.length} valid</span>
                  {" · "}
                  <span className={`font-medium ${errorCount > 0 ? "text-red-600" : "text-gray-500"}`}>{errorCount} errors</span>
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
                    {parsedRows.map((row) => (
                      <tr key={row.row} className={row.status === "error" ? "bg-red-50/50" : undefined}>
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
            disabled={validRows.length === 0 || importing}
            onClick={handleImport}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {importing ? "Importing..." : `Import ${validRows.length} valid rows`}
          </button>
        </footer>
      </div>
    </div>
  )
}
