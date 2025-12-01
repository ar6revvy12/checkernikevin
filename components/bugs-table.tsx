"use client"

import { useState } from "react"
import { Trash2, ExternalLink, Search, X, Play, Pencil } from "lucide-react"
import type { Bug, BugStatus } from "@/types/bugs"

interface BugsTableProps {
  bugs: Bug[]
  onUpdateStatus: (bugId: string, status: BugStatus) => void
  onDeleteBug: (bugId: string) => void
  onEditBug: (bug: Bug) => void
}

const statusColors: Record<BugStatus, string> = {
  open: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  "in-progress": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  done: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  "wont-fix": "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-slate-600",
}

const statusLabels: Record<BugStatus, string> = {
  open: "Open",
  "in-progress": "In Progress",
  done: "Done",
  "wont-fix": "Won't Fix",
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes("youtube") || url.includes("vimeo")
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url)
}

function MediaPreview({ url, onClose }: { url: string; onClose: () => void }) {
  const isVideo = isVideoUrl(url)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
          aria-label="Close preview"
        >
          <X className="w-8 h-8" />
        </button>
        {isVideo ? (
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={url}
            alt="Bug screenshot"
            className="max-w-full max-h-[80vh] rounded-lg object-contain"
          />
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white hover:text-gray-300 flex items-center gap-1 text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Open in new tab
        </a>
      </div>
    </div>
  )
}

function ThumbnailPreview({ url, onClick }: { url: string; onClick: () => void }) {
  const isVideo = isVideoUrl(url)
  const isImage = isImageUrl(url)

  if (!isImage && !isVideo) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
      >
        <ExternalLink className="w-4 h-4" />
        View
      </a>
    )
  }

  return (
    <button
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      {isVideo ? (
        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center group-hover:bg-gray-300 transition-colors">
          <Play className="w-6 h-6 text-gray-600" />
        </div>
      ) : (
        <img
          src={url}
          alt="Bug screenshot thumbnail"
          className="w-16 h-12 object-cover rounded border border-gray-200 group-hover:border-blue-400 transition-colors"
        />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded transition-colors">
        <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    </button>
  )
}

export function BugsTable({ bugs, onUpdateStatus, onDeleteBug, onEditBug }: BugsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<BugStatus | "all">("all")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch =
      bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.gameName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || bug.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search bugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BugStatus | "all")}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
          <option value="wont-fix">Won't Fix</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Game</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">SS/Vid</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredBugs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No bugs found
                </td>
              </tr>
            ) : (
              filteredBugs.map((bug) => (
                <tr key={bug.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(bug.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {bug.gameName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    {bug.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {bug.screenshotUrl ? (
                      <div className="flex justify-center">
                        <ThumbnailPreview
                          url={bug.screenshotUrl}
                          onClick={() => setPreviewUrl(bug.screenshotUrl)}
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <select
                      value={bug.status}
                      onChange={(e) => onUpdateStatus(bug.id, e.target.value as BugStatus)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${statusColors[bug.status]}`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEditBug(bug)}
                        className="p-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit bug"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBug(bug.id)}
                        className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete bug"
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

      {/* Media Preview Modal */}
      {previewUrl && (
        <MediaPreview url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </div>
  )
}
