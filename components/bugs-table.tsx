"use client"

import {
  useState,
  useRef,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from "react"
import { Trash2, Search, Pencil, ChevronDown, Filter, AlertCircle, ExternalLink, MessageSquare } from "lucide-react"
import type { Bug, BugStatus, DevStatus } from "@/types/bugs"

interface BugsTableProps {
  bugs: Bug[]
  games: { id: string; name: string }[]
  onUpdateStatus?: (bugId: string, status: BugStatus) => void
  onDeleteBug?: (bugId: string) => void
  onEditBug?: (bug: Bug) => void
  onUpdateDevStatus?: (bugId: string, devStatus: DevStatus, devComment?: string) => void
  onSelectBug?: (bug: Bug) => void
  canEditDevInfo?: boolean
  filters?: { gameId: string; status: string; search: string }
  onFiltersChange?: (filters: { gameId: string; status: string; search: string }) => void
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

const statusOptions: BugStatus[] = ["open", "in-progress", "done", "wont-fix"]

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

export function DevStatusDropdown({ value, onChange }: { value: DevStatus; onChange: (status: DevStatus) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const config = devStatusConfig[value]

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
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

export function DevCommentInput({
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
        className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors max-w-[200px]"
        title={comment || "Add comment"}
      >
        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
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

function StatusBadge({ status }: { status: BugStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

// Custom Status Dropdown
function StatusDropdown({ value, onChange }: { value: BugStatus; onChange: (status: BugStatus) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const config = statusConfig[value]

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
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
          {statusOptions.map((status) => {
            const opt = statusConfig[status]
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

// Dev Status Badge (read-only)
function DevStatusBadge({ status }: { status: DevStatus }) {
  const config = devStatusConfig[status || "pending"]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

export function BugsTable({ bugs, games, onUpdateStatus, onDeleteBug, onEditBug, onUpdateDevStatus, onSelectBug, canEditDevInfo = false, filters, onFiltersChange }: BugsTableProps) {
  const hasActions = Boolean(onEditBug || onDeleteBug)
  const searchQuery = filters?.search ?? ""
  const statusFilter = (filters?.status as BugStatus | "all") ?? "all"
  const gameFilter = filters?.gameId ?? "all"

  const handleFilterChange = (newFilters: Partial<{ gameId: string; status: string; search: string }>) => {
    onFiltersChange?.({
      gameId: newFilters.gameId ?? gameFilter,
      status: newFilters.status ?? statusFilter,
      search: newFilters.search ?? searchQuery,
    })
  }

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

  const handleRowClick = (event: ReactMouseEvent<HTMLTableRowElement>, bug: Bug) => {
    if (!onSelectBug) return
    const target = event.target as HTMLElement
    if (target.closest("button, a, input, textarea, select")) return
    onSelectBug(bug)
  }

  const handleCardClick = (event: ReactMouseEvent<HTMLDivElement>, bug: Bug) => {
    if (!onSelectBug) return
    const target = event.target as HTMLElement
    if (target.closest("button, a, input, textarea, select")) return
    onSelectBug(bug)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={searchQuery}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Row on Mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Game Filter */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
              <select
                value={gameFilter}
                onChange={(e) => handleFilterChange({ gameId: e.target.value })}
                className="flex-1 sm:flex-initial px-2 sm:px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Filter by game"
                aria-label="Filter by game"
              >
                <option value="all">All Games</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="flex-1 sm:flex-initial px-2 sm:px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by status"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="wont-fix">{"Won't Fix"}</option>
            </select>
          </div>

          {/* Results count */}
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 sm:ml-auto text-center sm:text-right">
            {filteredBugs.length} of {bugs.length} bugs
          </span>
        </div>
      </div>

      {/* Table - Desktop */}
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
              {hasActions && (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {filteredBugs.length === 0 ? (
              <tr>
                <td colSpan={hasActions ? 9 : 8} className="px-4 py-12 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No bugs found</p>
                </td>
              </tr>
            ) : (
              filteredBugs.map((bug) => (
                <tr
                  key={bug.id}
                  onClick={(event) => handleRowClick(event, bug)}
                  className={`transition-colors ${
                    onSelectBug ? "hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer" : "hover:bg-gray-50 dark:hover:bg-slate-700/30"
                  }`}
                >
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
                      {onUpdateStatus ? (
                        <StatusDropdown
                          value={bug.status}
                          onChange={(status) => onUpdateStatus(bug.id, status)}
                        />
                      ) : (
                        <StatusBadge status={bug.status} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {canEditDevInfo && onUpdateDevStatus ? (
                        <DevStatusDropdown
                          value={bug.devStatus || "pending"}
                          onChange={(devStatus) => onUpdateDevStatus(bug.id, devStatus, bug.devComment || undefined)}
                        />
                      ) : (
                        <DevStatusBadge status={bug.devStatus} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {canEditDevInfo && onUpdateDevStatus ? (
                      <DevCommentInput
                        bugId={bug.id}
                        initialComment={bug.devComment}
                        onSave={(bugId, comment) => onUpdateDevStatus(bugId, bug.devStatus || "pending", comment)}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate whitespace-pre-wrap" title={bug.devComment || ""}>
                        {bug.devComment || <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </p>
                    )}
                  </td>
                  {hasActions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {onEditBug && (
                          <button
                            onClick={() => onEditBug(bug)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit bug"
                            aria-label="Edit bug"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {onDeleteBug && (
                          <button
                            onClick={() => onDeleteBug(bug.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete bug"
                            aria-label="Delete bug"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
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
            <div
              key={bug.id}
              onClick={(event) => handleCardClick(event, bug)}
              className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 ${
                onSelectBug ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{bug.gameName}</p>
                  {bug.casino && <p className="text-xs text-blue-500 dark:text-blue-400">{bug.casino}</p>}
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(bug.createdAt)}</p>
                </div>
                {onUpdateStatus ? (
                  <StatusDropdown
                    value={bug.status}
                    onChange={(status) => onUpdateStatus(bug.id, status)}
                  />
                ) : (
                  <StatusBadge status={bug.status} />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-wrap">{bug.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">Dev Status:</span>
                {canEditDevInfo && onUpdateDevStatus ? (
                  <DevStatusDropdown
                    value={bug.devStatus || "pending"}
                    onChange={(devStatus) => onUpdateDevStatus(bug.id, devStatus, bug.devComment || undefined)}
                  />
                ) : (
                  <DevStatusBadge status={bug.devStatus} />
                )}
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Dev Comment:</p>
                {canEditDevInfo && onUpdateDevStatus ? (
                  <DevCommentInput
                    bugId={bug.id}
                    initialComment={bug.devComment}
                    onSave={(bugId, comment) => onUpdateDevStatus(bugId, bug.devStatus || "pending", comment)}
                  />
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{bug.devComment}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
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
                  <span className="text-sm text-gray-400">No media</span>
                )}
                <div className="flex items-center gap-1">
                  {onEditBug && (
                    <button
                      onClick={() => onEditBug(bug)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit bug"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {onDeleteBug && (
                    <button
                      onClick={() => onDeleteBug(bug.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete bug"
                    >
                      <Trash2 className="w-4 h-4" />
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
}
