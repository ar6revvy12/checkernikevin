"use client"

import { useState } from "react"
import { Download, Eye } from "lucide-react"
import type { ChecklistItem } from "@/types/checklist"
import { CSVPreviewModal } from "@/components/csv-preview-modal"

interface ExportButtonProps {
  checklist: Record<string, ChecklistItem[]>
  selectedPackage: string
  gameName: string
}

export function ExportButton({ checklist, selectedPackage, gameName }: ExportButtonProps) {
  const [showPreview, setShowPreview] = useState(false)

  const handleExport = () => {
    const timestamp = new Date().toLocaleString()
    const completedCount = Object.values(checklist)
      .flat()
      .filter((item) => item.status === "done").length
    const totalCount = Object.values(checklist).flat().length

    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += `CHECKLIST NI KEVIN Export\n`
    csvContent += `Game: ${gameName}\n`
    csvContent += `Package: ${selectedPackage}\n`
    csvContent += `Date: ${timestamp}\n`
    csvContent += `Completion: ${completedCount}/${totalCount}\n\n`
    csvContent += `Category,Item,Status\n`

    Object.values(checklist)
      .flat()
      .forEach((item) => {
        const status = item.status === "done" ? "PASSED" : item.status === "failed" ? "FAILED" : "PENDING"
        csvContent += `"${item.category}","${item.title}","${status}"\n`
      })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `qa-checklist-${gameName}-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div className="flex gap-2">
        <button 
          onClick={() => setShowPreview(true)} 
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </button>
        <button 
          onClick={handleExport} 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </button>
      </div>

      <CSVPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        checklist={checklist}
        selectedPackage={selectedPackage}
        gameName={gameName}
      />
    </>
  )
}
