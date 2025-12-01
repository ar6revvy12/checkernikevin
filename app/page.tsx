"use client"

import { useState, useEffect } from "react"
import { ClipboardCheck } from "lucide-react"
import { ChecklistSection } from "@/components/checklist-section"
import { ProgressBar } from "@/components/progress-bar"
import { ExportButton } from "@/components/export-button"
import { AddGameModal } from "@/components/add-game-modal"
import { EditGameModal } from "@/components/edit-game-modal"
import { ConfirmModal } from "@/components/confirm-modal"
import { GameTabs } from "@/components/game-tabs"
import { useGames } from "@/hooks/use-games"
import type { Game, ChecklistItem } from "@/types/checklist"
import { gamePackages } from "@/lib/game-packages"
import { generateChecklist } from "@/lib/checklist-generator"

export default function Home() {
  const { games, isLoading, addGame, deleteGame, updateGame, updateChecklist } = useGames()
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editModal, setEditModal] = useState<{ isOpen: boolean; gameId: string; gameName: string }>({
    isOpen: false,
    gameId: "",
    gameName: "",
  })
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["ui-ux"]))
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; gameId: string | null; gameName: string }>({
    isOpen: false,
    gameId: null,
    gameName: "",
  })

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

  const handleDeleteGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId)
    setDeleteConfirm({ isOpen: true, gameId, gameName: game?.name || "" })
  }

  const handleEditGame = (gameId: string, gameName: string) => {
    setEditModal({ isOpen: true, gameId, gameName })
  }

  const confirmEditGame = async (gameId: string, name: string) => {
    try {
      await updateGame(gameId, name)
    } catch (error) {
      console.error("Failed to update game:", error)
    }
  }

  const confirmDeleteGame = async () => {
    if (deleteConfirm.gameId) {
      try {
        await deleteGame(deleteConfirm.gameId)
        if (activeGameId === deleteConfirm.gameId) {
          setActiveGameId(games.length > 1 ? games.find((g) => g.id !== deleteConfirm.gameId)?.id || null : null)
        }
      } catch (error) {
        console.error("Failed to delete game:", error)
      }
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
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checklist</h1>
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

      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800">
        <div className="px-8">
          <GameTabs
            games={games}
            activeGameId={activeGameId}
            onSelectGame={setActiveGameId}
            onAddGame={() => setShowAddModal(true)}
            onDeleteGame={handleDeleteGame}
            onEditGame={handleEditGame}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="px-8 py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading games...</p>
        </div>
      ) : activeGame ? (
        <div className="px-8 py-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Package Details</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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
        <div className="px-8 py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No games added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Game
          </button>
        </div>
      )}

      <AddGameModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAddGame={handleAddGame} />

      {/* Edit Game Modal */}
      <EditGameModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, gameId: "", gameName: "" })}
        onSubmit={confirmEditGame}
        gameId={editModal.gameId}
        currentName={editModal.gameName}
      />

      {/* Delete Game Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, gameId: null, gameName: "" })}
        onConfirm={confirmDeleteGame}
        title="Delete Game"
        message={`Are you sure you want to delete "${deleteConfirm.gameName}"? This will also delete all checklist items associated with this game. This action cannot be undone.`}
        confirmText="Delete Game"
        confirmColor="red"
      />
    </main>
  )
}
