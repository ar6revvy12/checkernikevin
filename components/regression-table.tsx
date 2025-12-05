"use client"

import { useState, useRef, useEffect } from "react"
import { Trash2, Search, Pencil, ChevronDown, Filter, AlertCircle } from "lucide-react"
import type { RegressionTest, RegressionStatus, RegressionPriority } from "@/types/regression"

interface RegressionTableProps {
  tests: RegressionTest[]
  onUpdateStatus: (testId: string, status: RegressionStatus) => void
  onDeleteTest: (testId: string) => void
  onEditTest: (test: RegressionTest) => void
  onFiltersChange?: (filters: { status: string; priority: string; search: string }) => void
}

const statusConfig: Record<RegressionStatus, { bg: string; text: string; dot: string; label: string }> = {
  pass: { bg: "bg-green-500/10", text: "text-green-500", dot: "bg-green-500", label: "Pass" },
  fail: { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500", label: "Fail" },
}

const priorityConfig: Record<RegressionPriority, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-gray-500/10", text: "text-gray-500", label: "Low" },
  medium: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Medium" },
  high: { bg: "bg-orange-500/10", text: "text-orange-500", label: "High" },
  critical: { bg: "bg-red-500/10", text: "text-red-500", label: "Critical" },
}

const statusOptions: RegressionStatus[] = ["pass", "fail"]
const priorityOptions: RegressionPriority[] = ["low", "medium", "high", "critical"]

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
    return <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
  }

  return (
    <div className="max-w-xs">
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

export function RegressionTable({ tests, onUpdateStatus, onDeleteTest, onEditTest, onFiltersChange }: RegressionTableProps) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    onFiltersChange?.({ status: statusFilter, priority: priorityFilter, search: searchQuery })
  }, [statusFilter, priorityFilter, searchQuery, onFiltersChange])

  const filteredTests = tests.filter((test) => {
    const matchesStatus = statusFilter === "all" || test.status === statusFilter
    const matchesPriority = priorityFilter === "all" || test.priority === priorityFilter
    const matchesSearch =
      searchQuery === "" ||
      test.testId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testCaseDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.expectedResult.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.actualResult.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.comments?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesPriority && matchesSearch
  })

  const clearFilters = () => {
    setStatusFilter("all")
    setPriorityFilter("all")
    setSearchQuery("")
  }

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || searchQuery !== ""

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            hasActiveFilters
              ? "border-blue-500 bg-blue-500/10 text-blue-500"
              : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
              {[statusFilter !== "all", priorityFilter !== "all", searchQuery !== ""].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Test ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Test Case Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Expected Result
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actual Result
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Comments
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
            {filteredTests.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">No regression tests found</p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTests.map((test) => {
                const priorityCfg = priorityConfig[test.priority]
                return (
                  <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">{test.testId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ExpandableText text={test.testCaseDescription} maxLength={80} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${priorityCfg.bg} ${priorityCfg.text}`}>
                        {priorityCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ExpandableText text={test.expectedResult} maxLength={60} />
                    </td>
                    <td className="px-4 py-3">
                      <ExpandableText text={test.actualResult} maxLength={60} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusDropdown
                        value={test.status}
                        onChange={(status) => onUpdateStatus(test.id, status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ExpandableText text={test.comments || "-"} maxLength={60} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditTest(test)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit test"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTest(test.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      {filteredTests.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredTests.length} of {tests.length} tests
        </p>
      )}
    </div>
  )
}
