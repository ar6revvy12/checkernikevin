"use client"

import { X, Plus } from "lucide-react"
import type { Game } from "@/types/checklist"

interface GameTabsProps {
  games: Game[]
  activeGameId: string | null
  onSelectGame: (gameId: string) => void
  onAddGame: () => void
  onDeleteGame: (gameId: string) => void
}

export function GameTabs({ games, activeGameId, onSelectGame, onAddGame, onDeleteGame }: GameTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-4">
      {games.map((game) => (
        <div
          key={game.id}
          className={`flex items-center gap-2 px-4 py-2 rounded-md border whitespace-nowrap transition-colors ${
            activeGameId === game.id
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          }`}
        >
          <button onClick={() => onSelectGame(game.id)} className="hover:underline">
            {game.name}
          </button>
          <button
            onClick={() => onDeleteGame(game.id)}
            className="p-1 hover:bg-destructive/20 rounded transition-colors"
            title="Delete game"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <button
        onClick={onAddGame}
        className="flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
      >
        <Plus size={18} />
        Add Game
      </button>
    </div>
  )
}
