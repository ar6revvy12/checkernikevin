"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Game } from "@/types/checklist"
import type { Bug as BugType, BugStatus } from "@/types/bugs"

interface EditBugModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (bugId: string, updates: { gameId: string; casino: string | null; description: string; screenshotUrl: string | null; status: BugStatus }) => void
  bug: BugType | null
  games: Game[]
}

export function EditBugModal({ isOpen, onClose, onSubmit, bug, games }: EditBugModalProps) {
  const [gameId, setGameId] = useState("")
  const [casino, setCasino] = useState("")
  const [description, setDescription] = useState("")
  const [screenshotUrl, setScreenshotUrl] = useState("")
  const [status, setStatus] = useState<BugStatus>("open")

  useEffect(() => {
    if (isOpen && bug) {
      setGameId(bug.gameId)
      setCasino(bug.casino || "")
      setDescription(bug.description)
      setScreenshotUrl(bug.screenshotUrl || "")
      setStatus(bug.status)
    }
  }, [isOpen, bug])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bug || !gameId || !description.trim()) return
    onSubmit(bug.id, {
      gameId,
      casino: casino.trim() || null,
      description: description.trim(),
      screenshotUrl: screenshotUrl.trim() || null,
      status,
    })
    onClose()
  }

  if (!isOpen || !bug) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Edit Bug</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded" aria-label="Close">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Game</label>
              <select
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a game</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Casino</label>
              <input
                type="text"
                value={casino}
                onChange={(e) => setCasino(e.target.value)}
                placeholder="Enter casino name..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the bug..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Screenshot/Video URL</label>
              <input
                type="url"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BugStatus)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="wont-fix">Won't Fix</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
