"use client"

import { useState } from "react"
import { Plus, Bug, AlertCircle, Clock, CheckCircle, RefreshCw, Share2 } from "lucide-react"
import { useGames } from "@/hooks/use-games"
import { useBugs } from "@/hooks/use-bugs"
import { BugsTable } from "@/components/bugs-table"
import { AddBugModal } from "@/components/add-bug-modal"
import { EditBugModal } from "@/components/edit-bug-modal"
import { ConfirmModal } from "@/components/confirm-modal"
import { ShareModal } from "@/components/share-modal"
import { encodeShareFilters } from "@/lib/share-utils"
import type { Bug as BugType, BugStatus } from "@/types/bugs"

export default function BugsPage() {
  const { games, isLoading: gamesLoading } = useGames()
  const { bugs, isLoading: bugsLoading, addBug, updateBug, deleteBug, refreshBugs } = useBugs()
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedBug, setSelectedBug] = useState<BugType | null>(null)
  const [bugToDelete, setBugToDelete] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState({ gameId: "all", status: "all", search: "" })

  const handleAddBug = async (data: {
    gameId: string
    casino: string
    description: string
    screenshotUrl: string
    status: BugStatus
  }) => {
    await addBug({
      gameId: data.gameId,
      casino: data.casino || null,
      description: data.description,
      screenshotUrl: data.screenshotUrl || null,
      status: data.status,
      devStatus: "pending",
      devComment: null,
    })
  }

  const handleEditBug = async (bugId: string, data: {
    gameId: string
    casino: string
    description: string
    screenshotUrl: string
    status: BugStatus
  }) => {
    await updateBug(bugId, {
      gameId: data.gameId,
      casino: data.casino || null,
      description: data.description,
      screenshotUrl: data.screenshotUrl || null,
      status: data.status,
    })
  }

  const handleUpdateStatus = async (bugId: string, status: BugStatus) => {
    await updateBug(bugId, { status })
  }

  const handleDeleteClick = (bugId: string) => {
    setBugToDelete(bugId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (bugToDelete) {
      await deleteBug(bugToDelete)
      setBugToDelete(null)
    }
    setIsDeleteModalOpen(false)
  }

  const handleEditClick = (bug: BugType) => {
    setSelectedBug(bug)
    setIsEditModalOpen(true)
  }

  // Filter bugs based on current filters for stats
  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch =
      currentFilters.search === "" ||
      bug.description.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
      bug.gameName?.toLowerCase().includes(currentFilters.search.toLowerCase())
    const matchesStatus = currentFilters.status === "all" || bug.status === currentFilters.status
    const matchesGame = currentFilters.gameId === "all" || bug.gameId === currentFilters.gameId
    return matchesSearch && matchesStatus && matchesGame
  })

  // Calculate stats based on filtered data
  const openCount = filteredBugs.filter((b) => b.status === "open").length
  const inProgressCount = filteredBugs.filter((b) => b.status === "in-progress").length
  const doneCount = filteredBugs.filter((b) => b.status === "done").length
  const totalCount = filteredBugs.length

  // Generate share URL
  const selectedGame = games.find(g => g.id === currentFilters.gameId)
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/bugs-view?data=${encodeShareFilters({
        gameId: currentFilters.gameId,
        status: currentFilters.status,
        search: currentFilters.search,
      })}`
    : ""

  const isLoading = gamesLoading || bugsLoading

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Bug className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bugs & Errors</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage bugs across all games</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshBugs()}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Bug</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              <Bug className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Bugs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{openCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{inProgressCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{doneCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : (
        <BugsTable
          bugs={bugs}
          games={games.map(g => ({ id: g.id, name: g.name }))}
          onUpdateStatus={handleUpdateStatus}
          onDeleteBug={handleDeleteClick}
          onEditBug={handleEditClick}
          filters={currentFilters}
          onFiltersChange={setCurrentFilters}
        />
      )}

      {/* Modals */}
      <AddBugModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBug}
        games={games.map(g => ({ id: g.id, name: g.name }))}
      />

      <EditBugModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleEditBug}
        bug={selectedBug}
        games={games.map(g => ({ id: g.id, name: g.name }))}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Bug"
        message="Are you sure you want to delete this bug? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        filters={{
          gameName: selectedGame?.name || (currentFilters.gameId === "all" ? "All Games" : ""),
          status: currentFilters.status === "all" ? "All Status" : currentFilters.status,
          search: currentFilters.search,
        }}
      />
    </div>
  )
}
