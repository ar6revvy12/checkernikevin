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
    <div className="py-3">
      {/* Search and Games in a row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-40 pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Games List */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {filteredGames.map((game) => {
            const isActive = activeGameId === game.id
            return (
              <div
                key={game.id}
                className={`group flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
                onClick={() => onSelectGame(game.id)}
              >
                <span>{game.name}</span>
                <div className={`flex items-center gap-0.5 ml-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditGame(game.id, game.name) }}
                    className={`p-1 rounded ${isActive ? 'hover:bg-blue-500' : 'hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                    title="Edit"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteGame(game.id) }}
                    className={`p-1 rounded ${isActive ? 'hover:bg-blue-500' : 'hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                    title="Delete"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Add Button */}
          <button
            onClick={onAddGame}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  )
}
