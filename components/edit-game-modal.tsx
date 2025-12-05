"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface EditGameModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (gameId: string, name: string) => void
  gameId: string
  currentName: string
}

export function EditGameModal({ isOpen, onClose, onSubmit, gameId, currentName }: EditGameModalProps) {
  const [name, setName] = useState(currentName)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setName(currentName)
      setError("")
    }
  }, [isOpen, currentName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Game name is required")
      return
    }
    onSubmit(gameId, name.trim())
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Edit Game</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded" aria-label="Close">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError("") }}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex gap-2">
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
