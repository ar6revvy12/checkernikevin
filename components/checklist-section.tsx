"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronRight, ExternalLink } from "lucide-react"
import type { ChecklistItem } from "@/types/checklist"

interface ChecklistSectionProps {
  title: string
  items: ChecklistItem[]
  isExpanded: boolean
  onToggleExpand: () => void
  onUpdateItem: (itemId: string, updates: Partial<ChecklistItem>) => void
}

const statusConfig = {
  unchecked: { dot: "bg-gray-400", label: "Pending", text: "text-gray-500" },
  checking: { dot: "bg-blue-500", label: "Checking", text: "text-blue-500" },
  done: { dot: "bg-green-500", label: "Done", text: "text-green-500" },
  failed: { dot: "bg-red-500", label: "Failed", text: "text-red-500" },
  "need-rework": { dot: "bg-yellow-500", label: "Rework", text: "text-yellow-500" },
}

const statusOptions: { value: ChecklistItem["status"]; label: string }[] = [
  { value: "unchecked", label: "Pending" },
  { value: "checking", label: "Checking" },
  { value: "done", label: "Done" },
  { value: "failed", label: "Failed" },
  { value: "need-rework", label: "Rework" },
]

// Expandable Content Component with smooth animation
function ExpandableContent({ isExpanded, children }: { isExpanded: boolean; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isExpanded ? contentRef.current.scrollHeight : 0)
    }
  }, [isExpanded])

  // Update height when content changes
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight)
        }
      })
      resizeObserver.observe(contentRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [isExpanded])

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ height }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  )
}

// Custom Status Dropdown Component
function StatusDropdown({ 
  value, 
  onChange 
}: { 
  value: ChecklistItem["status"]
  onChange: (status: ChecklistItem["status"]) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const config = statusConfig[value]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const dropdownHeight = 200
      const openUpward = spaceBelow < dropdownHeight

      setDropdownStyle({
        position: 'fixed',
        right: window.innerWidth - rect.right,
        ...(openUpward 
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }
        ),
      })
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-2 text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 w-[110px] hover:border-gray-300 dark:hover:border-slate-500 transition-colors`}
      >
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={config.text}>{config.label}</span>
        </span>
        <ChevronRight className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div 
          style={dropdownStyle}
          className="z-[9999] min-w-[120px] bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden"
        >
          {statusOptions.map((option) => {
            const optionConfig = statusConfig[option.value]
            const isSelected = value === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected 
                    ? `bg-gray-100 dark:bg-slate-700 ${optionConfig.text}` 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${optionConfig.dot}`} />
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ChecklistSection({ title, items, isExpanded, onToggleExpand, onUpdateItem }: ChecklistSectionProps) {
  const completedCount = items.filter((item) => item.status === "done").length
  const percentage = Math.round((completedCount / items.length) * 100)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggleExpand}
        className="w-full px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`}
          />
          <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{title}</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
            {completedCount}/{items.length}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-16 sm:w-24 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className={`text-xs font-medium min-w-[2rem] sm:min-w-[2.5rem] text-right ${percentage === 100 ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {percentage}%
          </span>
        </div>
      </button>

      {/* Section Content with smooth animation */}
      <ExpandableContent isExpanded={isExpanded}>
        <div className="border-t border-gray-100 dark:border-slate-700/50">
          {/* Desktop Table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700/50">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider w-48">Evidence</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
              {items.map((item) => {
                return (
                  <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 w-48">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add link..."
                          value={item.evidence ?? ""}
                          onChange={(e) => onUpdateItem(item.id, { evidence: e.target.value })}
                          className="flex-1 px-2 py-1 text-xs rounded border border-transparent hover:border-gray-200 dark:hover:border-slate-600 focus:border-blue-500 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-colors"
                        />
                        {item.evidence && (
                          <a
                            href={item.evidence}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Open link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 w-32">
                      <div className="flex justify-end">
                        <StatusDropdown
                          value={item.status}
                          onChange={(status) => onUpdateItem(item.id, { status })}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-gray-100 dark:divide-slate-700/50">
            {items.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <StatusDropdown
                    value={item.status}
                    onChange={(status) => onUpdateItem(item.id, { status })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add evidence link..."
                    value={item.evidence ?? ""}
                    onChange={(e) => onUpdateItem(item.id, { evidence: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {item.evidence && (
                    <a
                      href={item.evidence}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ExpandableContent>
    </div>
  )
}
