"use client"

import { useState, useEffect } from "react"
import { ClipboardCheck, Package, Calendar, Plus, Pencil, Trash2, Search, Gamepad2, Bug } from "lucide-react"
import Link from "next/link"
import { ChecklistSection } from "@/components/checklist-section"
import { ExportButton } from "@/components/export-button"
import { AddGameModal } from "@/components/add-game-modal"
import { EditGameModal } from "@/components/edit-game-modal"
import { ConfirmModal } from "@/components/confirm-modal"
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; gameId: string | null; gameName: string }>({
    isOpen: false,
    gameId: null,
    gameName: "",
  })
  const [gameSearch, setGameSearch] = useState("")

  useEffect(() => {
    if (games.length > 0 && !activeGameId) {
      setActiveGameId(games[0].id)
    }
  }, [games, activeGameId])

  const activeGame = games.find((g) => g.id === activeGameId)
  const checklist = activeGame?.checklist || {}

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(gameSearch.toLowerCase())
  )

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
      setExpandedSections(new Set())
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

  const updateItem = (sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    updateChecklist(activeGameId!, sectionId, itemId, updates)
  }

  // Calculate statistics
  const allItems = activeGame ? Object.values(activeGame.checklist).flat() : []
  const totalItems = allItems.length
  const doneCount = allItems.filter((item) => item.status === "done").length
  const checkingCount = allItems.filter((item) => item.status === "checking").length
  const failedCount = allItems.filter((item) => item.status === "failed").length
  const reworkCount = allItems.filter((item) => item.status === "need-rework").length
  const uncheckedCount = allItems.filter((item) => item.status === "unchecked").length
  const completionPercentage = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <ClipboardCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QA Checklist</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage game testing progress</p>
              </div>
            </div>
            {activeGame && (
              <div className="flex items-center gap-3">
                <Link
                  href="/bugs"
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  Bugs
                </Link>
                <ExportButton
                  checklist={activeGame.checklist}
                  selectedPackage={activeGame.packageId}
                  gameName={activeGame.name}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading games...</p>
          </div>
        </div>
      ) : activeGame ? (
        <div className="p-8">
          {/* Game Info Card with Games Sidebar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 mb-8 overflow-hidden">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Game Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {activeGame.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeGame.name}</h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-4 h-4" />
                        {gamePackages[activeGame.packageId as keyof typeof gamePackages]?.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(activeGame.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="bg-green-500/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-500">{doneCount}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Done</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-500">{checkingCount}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Checking</p>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-500">{failedCount}</p>
                    <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
                  </div>
                  <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-500">{reworkCount}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Rework</p>
                  </div>
                  <div className="bg-gray-500/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-500">{uncheckedCount}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                  </div>
                </div>
              </div>

              {/* Games Sidebar */}
              <div className="w-72 bg-gray-50 dark:bg-slate-900/50 border-l border-gray-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Games</h3>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    title="Add game"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={gameSearch}
                    onChange={(e) => setGameSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Games List */}
                <div className="space-y-1 max-h-[180px] overflow-y-auto">
                  {filteredGames.map((game) => {
                    const isActive = activeGameId === game.id
                    const gameItems = Object.values(game.checklist).flat()
                    const gameDone = gameItems.filter((i) => i.status === "done").length
                    const gameTotal = gameItems.length
                    const gamePercent = gameTotal > 0 ? Math.round((gameDone / gameTotal) * 100) : 0

                    return (
                      <div
                        key={game.id}
                        onClick={() => setActiveGameId(game.id)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <Gamepad2 className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-200' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{game.name}</p>
                          <p className={`text-xs ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>{gamePercent}%</p>
                        </div>
                        <div className={`flex items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditGame(game.id, game.name) }}
                            className={`p-1 rounded ${isActive ? 'hover:bg-blue-500' : 'hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteGame(game.id) }}
                            className={`p-1 rounded ${isActive ? 'hover:bg-blue-500' : 'hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Sections */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Checklist Items</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(activeGame.checklist).length} categories
              </span>
            </div>
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
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardCheck className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Games Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by adding your first game to begin tracking QA progress.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20"
            >
              Add Your First Game
            </button>
          </div>
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
