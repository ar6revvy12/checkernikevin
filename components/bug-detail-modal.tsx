"use client"

import { useEffect, useState } from "react"
import { X, ExternalLink, Pencil, Trash2 } from "lucide-react"
import type { Bug, DevStatus, BugStatus } from "@/types/bugs"

const statusColors: Record<BugStatus, { bg: string; text: string; label: string }> = {
  open: { bg: "bg-red-500/10", text: "text-red-500", label: "Open" },
  "in-progress": { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "In Progress" },
  done: { bg: "bg-green-500/10", text: "text-green-500", label: "Done" },
  "wont-fix": { bg: "bg-gray-500/10", text: "text-gray-500", label: "Won't Fix" },
}

const devStatusOptions: { value: DevStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "needs-info", label: "Needs Info" },
]

interface BugDetailModalProps {
  bug: Bug | null
  isOpen: boolean
  onClose: () => void
  canManage: boolean
  canEditDevInfo: boolean
  onEditBug?: (bug: Bug) => void
  onDeleteBug?: (bugId: string) => void
  onUpdateDevInfo?: (bugId: string, status: DevStatus, comment?: string) => Promise<void>
}

export function BugDetailModal({
  bug,
  isOpen,
  onClose,
  canManage,
  canEditDevInfo,
  onEditBug,
  onDeleteBug,
  onUpdateDevInfo,
}: BugDetailModalProps) {
  const [devStatus, setDevStatus] = useState<DevStatus>("pending")
  const [devComment, setDevComment] = useState("")
  const [isSavingDevInfo, setIsSavingDevInfo] = useState(false)

  useEffect(() => {
    if (bug) {
      setDevStatus(bug.devStatus || "pending")
      setDevComment(bug.devComment || "")
    }
  }, [bug])

  if (!isOpen || !bug) return null

  const gameName = bug.gameName || "Unknown Game"
  const statusConfig = statusColors[bug.status] ?? statusColors.open

  const handleSaveDevInfo = async () => {
    if (!onUpdateDevInfo) return
    setIsSavingDevInfo(true)
    await onUpdateDevInfo(bug.id, devStatus, devComment.trim() || undefined)
    setIsSavingDevInfo(false)
  }

  const createdDate = new Date(bug.createdAt).toLocaleString()

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Bug Detail</p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{gameName}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close detail"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-6">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
              <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                {bug.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Casino</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{bug.casino || "—"}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Reported</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{createdDate}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Media Evidence</p>
                {bug.screenshotUrl && (
                  <a
                    href={bug.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open link
                  </a>
                )}
              </div>
              {bug.screenshotUrl ? (
                <div className="aspect-video w-full bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-slate-600">
                  Media available
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No media attached.</p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
              <p className="text-xs uppercase tracking-wider text-white/60">QA Status</p>
              <p className="text-3xl font-bold mt-2">{statusConfig.label}</p>
              <p className="text-sm text-white/60 mt-1">Assigned to {gameName}</p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Dev Status</p>
              {canEditDevInfo ? (
                <div className="space-y-3">
                  <select
                    value={devStatus}
                    onChange={(e) => setDevStatus(e.target.value as DevStatus)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  >
                    {devStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={devComment}
                    onChange={(e) => setDevComment(e.target.value)}
                    rows={4}
                    placeholder="Add developer notes..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-500"
                  />
                  <button
                    onClick={handleSaveDevInfo}
                    disabled={isSavingDevInfo}
                    className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSavingDevInfo ? "Saving..." : "Save Dev Notes"}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">{bug.devStatus || "pending"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                    {bug.devComment || "No developer comment."}
                  </p>
                </>
              )}
            </div>

            {canManage && (onEditBug || onDeleteBug) && (
              <div className="grid grid-cols-2 gap-3">
                {onEditBug && (
                  <button
                    onClick={() => bug && onEditBug(bug)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Bug
                  </button>
                )}
                {onDeleteBug && (
                  <button
                    onClick={() => bug && onDeleteBug(bug.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
