"use client"

import { useState, useRef, useEffect } from "react"
import { AlertCircle, ExternalLink, ChevronDown, MessageSquare } from "lucide-react"
import type { Bug, BugStatus, DevStatus } from "@/types/bugs"

interface BugsTableViewOnlyProps {
  bugs: Bug[]
  games: { id: string; name: string }[]
  initialGameFilter?: string
  initialStatusFilter?: string
  initialSearch?: string
  onUpdateDevStatus?: (bugId: string, devStatus: DevStatus, devComment?: string) => void
}

const statusConfig: Record<BugStatus, { bg: string; text: string; dot: string; label: string }> = {
  open: { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500", label: "Open" },
  "in-progress": { bg: "bg-yellow-500/10", text: "text-yellow-500", dot: "bg-yellow-500", label: "In Progress" },
  done: { bg: "bg-green-500/10", text: "text-green-500", dot: "bg-green-500", label: "Done" },
  "wont-fix": { bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-500", label: "Won't Fix" },
}

const devStatusConfig: Record<DevStatus, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-500", label: "Pending" },
  "in-progress": { bg: "bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500", label: "In Progress" },
  completed: { bg: "bg-green-500/10", text: "text-green-500", dot: "bg-green-500", label: "Completed" },
  "needs-info": { bg: "bg-orange-500/10", text: "text-orange-500", dot: "bg-orange-500", label: "Needs Info" },
}

const devStatusOptions: DevStatus[] = ["pending", "in-progress", "completed", "needs-info"]

// Expandable Description Component
function ExpandableDescription({ text, maxLength = 100 }: { text: string; maxLength?: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const needsTruncation = text.length > maxLength

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [text, isExpanded])

  if (!needsTruncation) {
    return <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{text}</p>
  }

  return (
    <div className="max-w-md">
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isExpanded ? `${contentHeight}px` : "2.5rem" }}
      >
        <div ref={contentRef}>
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{text}</p>
        </div>
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 mt-1 font-medium transition-colors"
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>
    </div>
  )
}

// Status Badge (view only, no dropdown)
function StatusBadge({ status }: { status: BugStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

// Dev Status Dropdown (editable)
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
        className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text} transition-colors hover:opacity-80`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[130px] bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
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

// Dev Comment Input Component
function DevCommentInput({ 
  bugId, 
  initialComment, 
  onSave 
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
        className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors max-w-[200px]"
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
    <div className="flex flex-col gap-1.5 min-w-[180px]">
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

export function BugsTableViewOnly({ bugs, games, initialGameFilter = "all", initialStatusFilter = "all", initialSearch = "", onUpdateDevStatus }: BugsTableViewOnlyProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<BugStatus | "all">(initialStatusFilter as BugStatus | "all")
  const [gameFilter, setGameFilter] = useState<string>(initialGameFilter)

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch =
      bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.gameName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || bug.status === statusFilter
    const matchesGame = gameFilter === "all" || bug.gameId === gameFilter
    return matchesSearch && matchesStatus && matchesGame
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Bugs filtered by game only (for stats)
  const gameFilteredBugs = gameFilter === "all" ? bugs : bugs.filter((b) => b.gameId === gameFilter)

  // Stats based on game filter
  const totalCount = gameFilteredBugs.length
  const openCount = gameFilteredBugs.filter((b) => b.status === "open").length
  const inProgressCount = gameFilteredBugs.filter((b) => b.status === "in-progress").length
  const doneCount = gameFilteredBugs.filter((b) => b.status === "done").length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Total Bugs</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-red-500">{openCount}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Open</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-yellow-500">{inProgressCount}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">In Progress</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-green-500">{doneCount}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Resolved</p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Game</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Casino</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Media</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">QA Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dev Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dev Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {filteredBugs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No bugs found</p>
                </td>
              </tr>
            ) : (
              filteredBugs.map((bug) => (
                <tr key={bug.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(bug.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{bug.gameName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{bug.casino || <span className="text-gray-300 dark:text-gray-600">—</span>}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ExpandableDescription text={bug.description} maxLength={80} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {bug.screenshotUrl ? (
                      <a
                        href={bug.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View
                      </a>
                    ) : (
                      <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <StatusBadge status={bug.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <DevStatusDropdown
                        value={bug.devStatus || "pending"}
                        onChange={(devStatus) => onUpdateDevStatus?.(bug.id, devStatus)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <DevCommentInput
                      bugId={bug.id}
                      initialComment={bug.devComment}
                      onSave={(bugId, comment) => onUpdateDevStatus?.(bugId, bug.devStatus || "pending", comment)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredBugs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
            <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No bugs found</p>
          </div>
        ) : (
          filteredBugs.map((bug) => (
            <div key={bug.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{bug.gameName}</p>
                  {bug.casino && <p className="text-xs text-blue-500 dark:text-blue-400">{bug.casino}</p>}
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(bug.createdAt)}</p>
                </div>
                <StatusBadge status={bug.status} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-wrap">{bug.description}</p>
              <div className="flex items-center justify-between gap-3 mb-3">
                {bug.screenshotUrl ? (
                  <a
                    href={bug.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Media
                  </a>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Dev:</span>
                  <DevStatusDropdown
                    value={bug.devStatus || "pending"}
                    onChange={(devStatus) => onUpdateDevStatus?.(bug.id, devStatus)}
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Dev Comment:</p>
                <DevCommentInput
                  bugId={bug.id}
                  initialComment={bug.devComment}
                  onSave={(bugId, comment) => onUpdateDevStatus?.(bugId, bug.devStatus || "pending", comment)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
