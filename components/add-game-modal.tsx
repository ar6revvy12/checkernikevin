"use client"

import type React from "react"

import { useState } from "react"
import { gamePackages } from "@/lib/game-packages"
import { X } from "lucide-react"

interface AddGameModalProps {
  isOpen: boolean
  onClose: () => void
  onAddGame: (name: string, packageId: string) => void
}

export function AddGameModal({ isOpen, onClose, onAddGame }: AddGameModalProps) {
  const [gameName, setGameName] = useState("")
  const [selectedPackage, setSelectedPackage] = useState("package1")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gameName.trim()) {
      setError("Game name is required")
      return
    }
    onAddGame(gameName, selectedPackage)
    setGameName("")
    setSelectedPackage("package1")
    setError("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Game</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Game Name</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => {
                setGameName(e.target.value)
                setError("")
              }}
              placeholder="e.g., Dragon's Gold, Ocean Quest"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Game Package</label>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(gamePackages).map(([key, pkg]) => (
                <option key={key} value={key}>
                  {pkg.name} ({pkg.reels} - {pkg.volatility} Volatility)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-md text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white mb-1">Package Info:</p>
            {(() => {
              const pkg = gamePackages[selectedPackage as keyof typeof gamePackages]
              return (
                <>
                  <p>Max Win: {pkg.maxWin}</p>
                  <p>
                    Bet Range: {pkg.minBet.toFixed(2)} - {pkg.maxBet.toFixed(2)}
                  </p>
                  <p>Features: {pkg.features.length} unique mechanics</p>
                </>
              )
            })()}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Create Game
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
