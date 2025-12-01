"use client"

import { useState, useRef, useEffect } from "react"
import { Trash2, Search, Pencil, ChevronDown, Filter, AlertCircle, ExternalLink } from "lucide-react"
import type { Bug, BugStatus } from "@/types/bugs"

interface BugsTableProps {
  bugs: Bug[]
  games: { id: string; name: string }[]
  onUpdateStatus: (bugId: string, status: BugStatus) => void
  onDeleteBug: (bugId: string) => void
  onEditBug: (bug: Bug) => void
}

const statusConfig: Record<BugStatus, { bg: string; text: string; dot: string; label: string }> = {
  open: { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500", label: "Open" },
  "in-progress": { bg: "bg-yellow-500/10", text: "text-yellow-500", dot: "bg-yellow-500", label: "In Progress" },
  done: { bg: "bg-green-500/10", text: "text-green-500", dot: "bg-green-500", label: "Done" },
  "wont-fix": { bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-500", label: "Won't Fix" },
}

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
    return <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
  }

  return (
    <div className="max-w-md">
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isExpanded ? `${contentHeight}px` : "2.5rem" }}
      >
        <div ref={contentRef}>
          <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
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

// Custom Status Dropdown
function StatusDropdown({ value, onChange }: { value: BugStatus; onChange: (status: BugStatus) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const config = statusConfig[value]

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

export function BugsTable({ bugs, games, onUpdateStatus, onDeleteBug, onEditBug }: BugsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<BugStatus | "all">("all")
  const [gameFilter, setGameFilter] = useState<string>("all")

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

  // Stats
  const openCount = bugs.filter((b) => b.status === "open").length
  const inProgressCount = bugs.filter((b) => b.status === "in-progress").length
  const doneCount = bugs.filter((b) => b.status === "done").length

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{bugs.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Bugs</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-red-500">{openCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Open</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-yellow-500">{inProgressCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-green-500">{doneCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Resolved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Game Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onChange={(e) => setStatusFilter(e.target.value as BugStatus | "all")}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Filter by status"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
            <option value="wont-fix">Won't Fix</option>
          </select>

          {/* Results count */}
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            {filteredBugs.length} of {bugs.length} bugs
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Game</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Media</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {filteredBugs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
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
                      <StatusDropdown
                        value={bug.status}
                        onChange={(status) => onUpdateStatus(bug.id, status)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEditBug(bug)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit bug"
                        aria-label="Edit bug"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBug(bug.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete bug"
                        aria-label="Delete bug"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
