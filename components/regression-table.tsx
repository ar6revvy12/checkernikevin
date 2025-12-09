"use client"

import { useState, useRef, useEffect } from "react"
import { Trash2, Search, Pencil, ChevronDown, Filter, CheckCircle, XCircle, CircleDashed, ExternalLink } from "lucide-react"
import type { RegressionTest, RegressionStatus, RegressionPriority } from "@/types/regression"

interface RegressionTableProps {
  tests: RegressionTest[]
  onUpdateStatus: (testId: string, status: RegressionStatus) => void
  onDeleteTest: (testId: string) => void
  onEditTest: (test: RegressionTest) => void
  filters?: { status: string; priority: string; search: string }
  onFiltersChange?: (filters: { status: string; priority: string; search: string }) => void
}

const statusConfig: Record<RegressionStatus, { bg: string; text: string; dot: string; label: string }> = {
  pass: { bg: "bg-green-500/10", text: "text-green-500", dot: "bg-green-500", label: "Pass" },
  fail: { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500", label: "Fail" },
  "not-tested": { bg: "bg-yellow-500/10", text: "text-yellow-500", dot: "bg-yellow-500", label: "Not Tested" },
}

const priorityConfig: Record<RegressionPriority, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-gray-500/10", text: "text-gray-500", label: "Low" },
  medium: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Medium" },
  high: { bg: "bg-orange-500/10", text: "text-orange-500", label: "High" },
  critical: { bg: "bg-red-500/10", text: "text-red-500", label: "Critical" },
}

const statusOptions: RegressionStatus[] = ["pass", "fail", "not-tested"]

// Check if text is a URL
function isUrl(text: string): boolean {
  try {
    const url = new URL(text.trim())
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

// Text or Link Component
function TextOrLink({ text, maxLength = 100 }: { text: string; maxLength?: number }) {
  const trimmedText = text.trim()
  
  if (isUrl(trimmedText)) {
    return (
      <a
        href={trimmedText}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        View
      </a>
    )
  }
  
  return <ExpandableText text={text} maxLength={maxLength} />
}

// Expandable Text Component
function ExpandableText({ text, maxLength = 100 }: { text: string; maxLength?: number }) {
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

// Custom Status Dropdown
function StatusDropdown({ value, onChange }: { value: RegressionStatus; onChange: (status: RegressionStatus) => void }) {
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
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[100px] bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
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

// Priority Badge
function PriorityBadge({ priority }: { priority: RegressionPriority }) {
  const config = priorityConfig[priority]
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

export function RegressionTable({ tests, onUpdateStatus, onDeleteTest, onEditTest, filters, onFiltersChange }: RegressionTableProps) {
  const searchQuery = filters?.search ?? ""
  const statusFilter = (filters?.status as RegressionStatus | "all") ?? "all"
  const priorityFilter = (filters?.priority as RegressionPriority | "all") ?? "all"

  const handleFilterChange = (newFilters: Partial<{ status: string; priority: string; search: string }>) => {
    onFiltersChange?.({
      status: newFilters.status ?? statusFilter,
      priority: newFilters.priority ?? priorityFilter,
      search: newFilters.search ?? searchQuery,
    })
  }

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.testId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testCaseDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.expectedResult.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.actualResult.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || test.status === statusFilter
    const matchesPriority = priorityFilter === "all" || test.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
          />
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={priorityFilter}
            onChange={(e) => handleFilterChange({ priority: e.target.value })}
            className="pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange({ status: e.target.value })}
            className="pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="not-tested">Not Tested</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test Case Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Result</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actual Result</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comments</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    No regression tests found
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-semibold text-orange-600 dark:text-orange-400">
                        {test.testId}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[250px]">
                      <ExpandableText text={test.testCaseDescription} maxLength={100} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={test.priority} />
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <TextOrLink text={test.expectedResult} maxLength={80} />
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <TextOrLink text={test.actualResult} maxLength={80} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusDropdown value={test.status} onChange={(status) => onUpdateStatus(test.id, status)} />
                    </td>
                    <td className="px-4 py-3 max-w-[150px]">
                      <ExpandableText text={test.comments || "-"} maxLength={60} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(test.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditTest(test)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit test"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTest(test.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete test"
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

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredTests.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No regression tests found
          </div>
        ) : (
          filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-orange-600 dark:text-orange-400">
                    {test.testId}
                  </span>
                  <PriorityBadge priority={test.priority} />
                </div>
                <StatusDropdown value={test.status} onChange={(status) => onUpdateStatus(test.id, status)} />
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Test Case Description</span>
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{test.testCaseDescription}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Expected Result</span>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {isUrl(test.expectedResult) ? (
                      <a href={test.expectedResult} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium">
                        <ExternalLink className="w-3.5 h-3.5" />View
                      </a>
                    ) : (
                      <span className="whitespace-pre-wrap">{test.expectedResult}</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Actual Result</span>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {isUrl(test.actualResult) ? (
                      <a href={test.actualResult} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium">
                        <ExternalLink className="w-3.5 h-3.5" />View
                      </a>
                    ) : (
                      <span className="whitespace-pre-wrap">{test.actualResult}</span>
                    )}
                  </div>
                </div>
                {test.comments && (
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Comments</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{test.comments}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(test.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditTest(test)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTest(test.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Showing {filteredTests.length} of {tests.length} test{tests.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
