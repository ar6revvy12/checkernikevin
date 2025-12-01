"use client"

import { useState } from "react"
import { X, Plus, Search, Pencil } from "lucide-react"
import type { Game } from "@/types/checklist"

interface GameTabsProps {
  games: Game[]
  activeGameId: string | null
  onSelectGame: (gameId: string) => void
  onAddGame: () => void
  onDeleteGame: (gameId: string) => void
  onEditGame: (gameId: string, gameName: string) => void
}

export function GameTabs({ games, activeGameId, onSelectGame, onAddGame, onDeleteGame, onEditGame }: GameTabsProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4 py-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Game Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {filteredGames.map((game) => (
        <div
          key={game.id}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-colors ${
            activeGameId === game.id
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-slate-600"
          }`}
        >
          <button onClick={() => onSelectGame(game.id)} className="hover:underline font-medium">
            {game.name}
          </button>
          <button
            onClick={() => onEditGame(game.id, game.name)}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
            title="Edit game"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDeleteGame(game.id)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
            title="Delete game"
          >
            <X size={16} />
          </button>
        </div>
      ))}
        <button
          onClick={onAddGame}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Plus size={18} />
          Add Game
        </button>
      </div>
    </div>
  )
}
