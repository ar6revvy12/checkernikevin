"use client"

import { ChevronDown, X } from "lucide-react"
import type { ChecklistItem } from "@/types/checklist"

interface ChecklistSectionProps {
  title: string
  items: ChecklistItem[]
  isExpanded: boolean
  onToggleExpand: () => void
  onUpdateItem: (itemId: string, updates: Partial<ChecklistItem>) => void
}

const statusColors = {
  unchecked: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  checking: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  "need-rework": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
}

const statusLabel = {
  unchecked: "Unchecked",
  checking: "Checking",
  done: "Done",
  failed: "Failed",
  "need-rework": "Need Rework",
}

export function ChecklistSection({ title, items, isExpanded, onToggleExpand, onUpdateItem }: ChecklistSectionProps) {
  const completedCount = items.filter((item) => item.status === "done").length

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={onToggleExpand}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <ChevronDown
            className="h-5 w-5 transition-transform text-gray-500 dark:text-gray-400"
            style={{ transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {completedCount} of {items.length} completed
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round((completedCount / items.length) * 100)}%
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={item.status}
                  onChange={(e) =>
                    onUpdateItem(item.id, {
                      status: e.target.value as ChecklistItem["status"],
                    })
                  }
                  className={`text-xs font-medium px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 ${statusColors[item.status]}`}
                >
                  <option value="unchecked">{statusLabel.unchecked}</option>
                  <option value="checking">{statusLabel.checking}</option>
                  <option value="done">{statusLabel.done}</option>
                  <option value="failed">{statusLabel.failed}</option>
                  <option value="need-rework">{statusLabel["need-rework"]}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add evidence link or image URL..."
                  value={item.evidence || ""}
                  onChange={(e) => onUpdateItem(item.id, { evidence: e.target.value })}
                  className="text-xs px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {item.evidence && (
                  <button
                    onClick={() => onUpdateItem(item.id, { evidence: undefined })}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {item.evidence && (
                <div className="mt-2">
                  {item.evidence.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={item.evidence || "/placeholder.svg"}
                      alt="Evidence"
                      className="max-w-xs max-h-40 rounded-md border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <a
                      href={item.evidence}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline break-all"
                    >
                      {item.evidence}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
