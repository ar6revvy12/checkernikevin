"use client"

import { X, Download, FileText } from "lucide-react"
import type { ChecklistItem } from "@/types/checklist"

interface CSVPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  checklist: Record<string, ChecklistItem[]>
  selectedPackage: string
  gameName: string
}

export function CSVPreviewModal({
  isOpen,
  onClose,
  checklist,
  selectedPackage,
  gameName,
}: CSVPreviewModalProps) {
  if (!isOpen) return null

  const timestamp = new Date().toLocaleString()
  const items = Object.values(checklist).flat()
  const completedCount = items.filter((item) => item.status === "done").length
  const totalCount = items.length

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "done":
        return "PASSED"
      case "failed":
        return "FAILED"
      case "checking":
        return "CHECKING"
      case "need-rework":
        return "NEED REWORK"
      default:
        return "PENDING"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
      case "failed":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
      case "checking":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
      case "need-rework":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700"
    }
  }

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += `CHECKLIST NI KEVIN Export\n`
    csvContent += `Game: ${gameName}\n`
    csvContent += `Package: ${selectedPackage}\n`
    csvContent += `Date: ${timestamp}\n`
    csvContent += `Completion: ${completedCount}/${totalCount}\n\n`
    csvContent += `Category,Item,Status\n`

    items.forEach((item) => {
      const status = getStatusLabel(item.status)
      csvContent += `"${item.category}","${item.title}","${status}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    const safeTimestamp = timestamp.replace(/[^0-9a-zA-Z]+/g, "-")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `qa-checklist-${gameName}-${safeTimestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CSV Preview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Review before exporting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Metadata */}
        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Game:</span>
              <p className="font-medium text-gray-900 dark:text-white">{gameName}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Package:</span>
              <p className="font-medium text-gray-900 dark:text-white">{selectedPackage}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Date:</span>
              <p className="font-medium text-gray-900 dark:text-white">{timestamp}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Completion:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {completedCount}/{totalCount} ({Math.round((completedCount / totalCount) * 100)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Table Preview */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 dark:bg-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 rounded-l-lg">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  Item
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 rounded-r-lg">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {item.category}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {item.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalCount} items total
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
