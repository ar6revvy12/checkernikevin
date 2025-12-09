"use client"

import { useState, useRef, useEffect } from "react"
import { Trash2, Pencil, ExternalLink, GripVertical, MessageSquare, ChevronDown, X } from "lucide-react"
import type { Bug, BugStatus, DevStatus } from "@/types/bugs"

interface BugsBoardProps {
  bugs: Bug[]
  games: { id: string; name: string }[]
  onUpdateStatus?: (bugId: string, status: BugStatus) => void
  onDeleteBug?: (bugId: string) => void
  onEditBug?: (bug: Bug) => void
  onUpdateDevStatus?: (bugId: string, devStatus: DevStatus, devComment?: string) => void
}

const devStatusConfig: Record<DevStatus, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-500", label: "Pending" },
  "in-progress": { bg: "bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500", label: "In Progress" },
  completed: { bg: "bg-green-500/10", text: "text-green-500", dot: "bg-green-500", label: "Completed" },
  "needs-info": { bg: "bg-orange-500/10", text: "text-orange-500", dot: "bg-orange-500", label: "Needs Info" },
}

const devStatusOptions: DevStatus[] = ["pending", "in-progress", "completed", "needs-info"]

function DevStatusBadge({ status }: { status: DevStatus }) {
  const config = devStatusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function DevStatusDropdown({ value, onChange }: { value: DevStatus; onChange: (status: DevStatus) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const config = devStatusConfig[value]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text} transition-colors hover:opacity-80`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-40 min-w-[130px] bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
          {devStatusOptions.map((status) => {
            const opt = devStatusConfig[status]
            return (
              <button
                key={status}
                onClick={() => { onChange(status); setIsOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                  value === status ? `${opt.bg} ${opt.text}` : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DevCommentInput({
  bugId,
  initialComment,
  onSave,
}: {
  bugId: string
  initialComment: string | null
  onSave: (bugId: string, comment: string) => void
}) {
  const [comment, setComment] = useState(initialComment || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(bugId, comment)
    setIsSaving(false)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors max-w-[220px]"
        title={comment || "Add comment"}
      >
        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate whitespace-pre-wrap line-clamp-2">
          {comment || "Add comment..."}
        </span>
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        ref={inputRef}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Enter your comment..."
        className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        rows={2}
      />
      <div className="flex gap-1.5">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => { setComment(initialComment || ""); setIsEditing(false) }}
          className="flex-1 px-2 py-1 text-xs bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function BugDetailsModal({
  bug,
  onClose,
  onUpdateDevStatus,
}: {
  bug: Bug
  onClose: () => void
  onUpdateDevStatus?: (bugId: string, devStatus: DevStatus, devComment?: string) => void
}) {
  const handleDevStatusChange = (status: DevStatus) => {
    if (!onUpdateDevStatus) return
    onUpdateDevStatus(bug.id, status, bug.devComment || undefined)
  }

  const handleDevCommentSave = async (bugId: string, comment: string) => {
    if (!onUpdateDevStatus) return
    await onUpdateDevStatus(bugId, bug.devStatus, comment)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bug Details</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {bug.description}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-200">{bug.gameName}</span>
            {bug.casino && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[11px]">
                {bug.casino}
              </span>
            )}
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
              Created: {new Date(bug.createdAt).toLocaleString()}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {bug.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">QA Status</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200">
                {bug.status}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Dev Status</p>
              {onUpdateDevStatus ? (
                <DevStatusDropdown value={bug.devStatus} onChange={handleDevStatusChange} />
              ) : (
                <DevStatusBadge status={bug.devStatus} />
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Dev Comment</p>
            {onUpdateDevStatus ? (
              <DevCommentInput
                bugId={bug.id}
                initialComment={bug.devComment}
                onSave={handleDevCommentSave}
              />
            ) : bug.devComment ? (
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-md text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                {bug.devComment}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">No developer comment yet.</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
            {bug.screenshotUrl ? (
              <a
                href={bug.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                Open media in new tab
              </a>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">No media attached</span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const columns: { status: BugStatus; label: string; color: string }[] = [
  { status: "open", label: "Open", color: "bg-red-500" },
  { status: "in-progress", label: "In Progress", color: "bg-yellow-500" },
  { status: "done", label: "Done", color: "bg-green-500" },
  { status: "wont-fix", label: "Won't Fix", color: "bg-gray-500" },
]

export function BugsBoard({ bugs, onUpdateStatus, onDeleteBug, onEditBug, onUpdateDevStatus }: BugsBoardProps) {
  const [draggedBug, setDraggedBug] = useState<Bug | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<BugStatus | null>(null)
  const isInteractive = Boolean(onUpdateStatus)
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null)

  const handleDragStart = (bug: Bug) => {
    setDraggedBug(bug)
  }

  const handleDragEnd = () => {
    setDraggedBug(null)
    setDragOverColumn(null)
  }

  const handleOpenDetails = (bugId: string) => {
    setSelectedBugId(bugId)
  }

  const handleCloseDetails = () => {
    setSelectedBugId(null)
  }

  const selectedBug = selectedBugId ? bugs.find((b) => b.id === selectedBugId) || null : null

  const handleDragOver = (e: React.DragEvent, status: BugStatus) => {
    e.preventDefault()
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, status: BugStatus) => {
    e.preventDefault()
    if (draggedBug && draggedBug.status !== status && onUpdateStatus) {
      onUpdateStatus(draggedBug.id, status)
    }
    setDraggedBug(null)
    setDragOverColumn(null)
  }

  const getBugsByStatus = (status: BugStatus) => {
    return bugs.filter((bug) => bug.status === status)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="h-[calc(100vh-300px)] overflow-x-auto">
      <div className="flex gap-4 h-full min-w-max pb-4">
        {columns.map((column) => {
          const columnBugs = getBugsByStatus(column.status)
          const isOver = isInteractive && dragOverColumn === column.status

          return (
            <div
              key={column.status}
              className="flex-1 min-w-[320px] max-w-[400px] flex flex-col"
              onDragOver={isInteractive ? (e) => handleDragOver(e, column.status) : undefined}
              onDragLeave={isInteractive ? handleDragLeave : undefined}
              onDrop={isInteractive ? (e) => handleDrop(e, column.status) : undefined}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {column.label}
                </h3>
                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                  {columnBugs.length}
                </span>
              </div>

              {/* Column Content */}
              <div
                className={`flex-1 bg-gray-50 dark:bg-slate-800/30 rounded-xl p-3 space-y-3 overflow-y-auto transition-colors ${
                  isOver ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                {columnBugs.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-500">
                    No bugs
                  </div>
                ) : (
                  columnBugs.map((bug) => (
                    <div
                      key={bug.id}
                      draggable={isInteractive}
                      onDragStart={isInteractive ? () => handleDragStart(bug) : undefined}
                      onDragEnd={isInteractive ? handleDragEnd : undefined}
                      className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3 ${
                        isInteractive ? "cursor-move" : "cursor-default"
                      } hover:shadow-md transition-shadow ${
                        draggedBug?.id === bug.id ? "opacity-50" : ""
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start gap-2 mb-2">
                        <GripVertical className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {bug.gameName}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                              {formatDate(bug.createdAt)}
                            </span>
                          </div>
                          {bug.casino && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded mb-2">
                              {bug.casino}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description (click to expand) */}
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(bug.id)}
                        className="w-full text-left text-sm text-gray-900 dark:text-white mb-3 line-clamp-3 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {bug.description}
                      </button>

                      {/* Dev Fields */}
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Dev Status:</span>
                        {onUpdateDevStatus ? (
                          <DevStatusDropdown
                            value={bug.devStatus}
                            onChange={(devStatus) => onUpdateDevStatus(bug.id, devStatus, bug.devComment || undefined)}
                          />
                        ) : (
                          <DevStatusBadge status={bug.devStatus} />
                        )}
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dev Comment:</p>
                        {onUpdateDevStatus ? (
                          <DevCommentInput
                            bugId={bug.id}
                            initialComment={bug.devComment}
                            onSave={(bugId, comment) => onUpdateDevStatus(bugId, bug.devStatus, comment)}
                          />
                        ) : bug.devComment ? (
                          <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                            {bug.devComment}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">No comment</span>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                        {bug.screenshotUrl ? (
                          <a
                            href={bug.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Media
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No media</span>
                        )}
                        <div className="flex items-center gap-1">
                          {onEditBug && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditBug(bug)
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Edit bug"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteBug && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteBug(bug.id)
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete bug"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedBug && (
        <BugDetailsModal
          bug={selectedBug}
          onClose={handleCloseDetails}
          onUpdateDevStatus={onUpdateDevStatus}
        />
      )}
    </div>
  )
}
