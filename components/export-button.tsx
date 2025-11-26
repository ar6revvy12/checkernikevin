"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ChecklistItem } from "@/types/checklist"

interface ExportButtonProps {
  checklist: Record<string, ChecklistItem[]>
  selectedPackage: string
  gameName: string
}

export function ExportButton({ checklist, selectedPackage, gameName }: ExportButtonProps) {
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
    <Button onClick={handleExport} variant="outline" size="lg">
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  )
}
