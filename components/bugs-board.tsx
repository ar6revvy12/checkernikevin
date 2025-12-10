"use client"

import { useState, useRef, useEffect } from "react"
import { Trash2, Pencil, ExternalLink, GripVertical } from "lucide-react"
import type { Bug, BugStatus } from "@/types/bugs"

interface BugsBoardProps {
  bugs: Bug[]
  games: { id: string; name: string }[]
  onUpdateStatus: (bugId: string, status: BugStatus) => void
  onDeleteBug: (bugId: string) => void
  onEditBug: (bug: Bug) => void
}

const columns: { status: BugStatus; label: string; color: string }[] = [
  { status: "open", label: "Open", color: "bg-red-500" },
  { status: "in-progress", label: "In Progress", color: "bg-yellow-500" },
  { status: "done", label: "Done", color: "bg-green-500" },
  { status: "wont-fix", label: "Won't Fix", color: "bg-gray-500" },
]

export function BugsBoard({ bugs, games, onUpdateStatus, onDeleteBug, onEditBug }: BugsBoardProps) {
  const [draggedBug, setDraggedBug] = useState<Bug | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<BugStatus | null>(null)

  const handleDragStart = (bug: Bug) => {
    setDraggedBug(bug)
  }

  const handleDragEnd = () => {
    setDraggedBug(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, status: BugStatus) => {
    e.preventDefault()
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, status: BugStatus) => {
    e.preventDefault()
    if (draggedBug && draggedBug.status !== status) {
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
          const isOver = dragOverColumn === column.status

          return (
            <div
              key={column.status}
              className="flex-1 min-w-[320px] max-w-[400px] flex flex-col"
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
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
                      draggable
                      onDragStart={() => handleDragStart(bug)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3 cursor-move hover:shadow-md transition-shadow ${
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

                      {/* Description */}
                      <p className="text-sm text-gray-900 dark:text-white mb-3 line-clamp-3">
                        {bug.description}
                      </p>

                      {/* Dev Status Badge */}
                      {bug.devStatus && (
                        <div className="mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                              bug.devStatus === "pending"
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                : bug.devStatus === "in-progress"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : bug.devStatus === "completed"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                            }`}
                          >
                            Dev: {bug.devStatus}
                          </span>
                        </div>
                      )}

                      {/* Dev Comment */}
                      {bug.devComment && (
                        <div className="mb-3 p-2 bg-gray-50 dark:bg-slate-700/50 rounded text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                          {bug.devComment}
                        </div>
                      )}

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
    </div>
  )
}
