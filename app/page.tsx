"use client"

import { useState, useEffect } from "react"
import { ChecklistSection } from "@/components/checklist-section"
import { ProgressBar } from "@/components/progress-bar"
import { ExportButton } from "@/components/export-button"
import { AddGameModal } from "@/components/add-game-modal"
import { GameTabs } from "@/components/game-tabs"
import { useGames } from "@/hooks/use-games"
import type { Game, ChecklistItem } from "@/types/checklist"
import { gamePackages } from "@/lib/game-packages"
import { generateChecklist } from "@/lib/checklist-generator"

export default function Home() {
  const { games, isLoading, addGame, deleteGame, updateChecklist } = useGames()
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["ui-ux"]))

  useEffect(() => {
    if (games.length > 0 && !activeGameId) {
      setActiveGameId(games[0].id)
    }
  }, [games, activeGameId])

  const activeGame = games.find((g) => g.id === activeGameId)
  const checklist = activeGame?.checklist || {}

  const handleAddGame = async (name: string, packageId: string) => {
    const newGame: Game = {
      id: Date.now().toString(),
      name,
      packageId,
      checklist: generateChecklist(gamePackages[packageId as keyof typeof gamePackages]),
      createdAt: Date.now(),
    }

    try {
      await addGame(newGame)
      setActiveGameId(newGame.id)
      setShowAddModal(false)
      setExpandedSections(new Set(["ui-ux"]))
    } catch (error) {
      console.error("Failed to add game:", error)
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    try {
      await deleteGame(gameId)
      if (activeGameId === gameId) {
        setActiveGameId(games.length > 1 ? games.find((g) => g.id !== gameId)?.id || null : null)
      }
    } catch (error) {
      console.error("Failed to delete game:", error)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const toggleItem = (sectionId: string, itemId: string) => {
    if (!activeGame) return

    const item = activeGame.checklist[sectionId]?.find((i) => i.id === itemId)
    if (!item) return

    const newStatus = item.status === "unchecked" ? "checking" : item.status === "checking" ? "done" : "unchecked"

    updateChecklist(activeGameId!, sectionId, itemId, { status: newStatus })
  }

  const updateItem = (sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    updateChecklist(activeGameId!, sectionId, itemId, updates)
  }

  const completionPercentage = activeGame
    ? Math.round(
        (Object.values(activeGame.checklist)
          .flat()
          .filter((item) => item.status === "done").length /
          Object.values(activeGame.checklist).flat().length) *
          100,
      )
    : 0

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">CHECKLIST NI KEVIN</h1>
            </div>
            {activeGame && (
              <ExportButton
                checklist={activeGame.checklist}
                selectedPackage={activeGame.packageId}
                gameName={activeGame.name}
              />
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GameTabs
            games={games}
            activeGameId={activeGameId}
            onSelectGame={setActiveGameId}
            onAddGame={() => setShowAddModal(true)}
            onDeleteGame={handleDeleteGame}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">Loading games...</p>
        </div>
      ) : activeGame ? (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground">Package Details</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {gamePackages[activeGame.packageId as keyof typeof gamePackages]?.name}
                  </p>
                </div>
                <ProgressBar percentage={completionPercentage} />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {Object.entries(activeGame.checklist).map(([sectionId, items]) => (
                <ChecklistSection
                  key={sectionId}
                  title={items[0]?.category || sectionId}
                  items={items}
                  isExpanded={expandedSections.has(sectionId)}
                  onToggleExpand={() => toggleSection(sectionId)}
                  onUpdateItem={(itemId, updates) => updateItem(sectionId, itemId, updates)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground mb-4">No games added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            Add Your First Game
          </button>
        </div>
      )}

      <AddGameModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAddGame={handleAddGame} />
    </main>
  )
}
