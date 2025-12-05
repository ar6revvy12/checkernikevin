"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { BugStatus } from "@/types/bugs"

interface AddBugModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: {
    gameId: string
    casino: string
    description: string
    screenshotUrl: string
    status: BugStatus
  }) => void
  games: { id: string; name: string }[]
}

export function AddBugModal({ isOpen, onClose, onAdd, games }: AddBugModalProps) {
  const [gameId, setGameId] = useState("")
  const [casino, setCasino] = useState("")
  const [description, setDescription] = useState("")
  const [screenshotUrl, setScreenshotUrl] = useState("")
  const [status, setStatus] = useState<BugStatus>("open")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gameId || !description.trim()) return

    setIsSubmitting(true)
    await onAdd({
      gameId,
      casino: casino.trim(),
      description: description.trim(),
      screenshotUrl: screenshotUrl.trim(),
      status,
    })
    setIsSubmitting(false)
    
    // Reset form
    setGameId("")
    setCasino("")
    setDescription("")
    setScreenshotUrl("")
    setStatus("open")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Bug</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Game Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Game <span className="text-red-500">*</span>
            </label>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a game</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          {/* Casino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Casino
            </label>
            <input
              type="text"
              value={casino}
              onChange={(e) => setCasino(e.target.value)}
              placeholder="Enter casino name"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe the bug in detail..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Screenshot URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Screenshot URL
            </label>
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="https://example.com/screenshot.png"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BugStatus)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="wont-fix">Won't Fix</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !gameId || !description.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Adding..." : "Add Bug"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
