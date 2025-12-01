"use client"

import { useState, useEffect } from "react"
import { Plus, Bug } from "lucide-react"
import { useBugs } from "@/hooks/use-bugs"
import { BugsTable } from "@/components/bugs-table"
import { AddBugModal } from "@/components/add-bug-modal"
import { EditBugModal } from "@/components/edit-bug-modal"
import { ConfirmModal } from "@/components/confirm-modal"
import type { Game } from "@/types/checklist"
import type { Bug as BugType, BugStatus } from "@/types/bugs"

export default function BugsPage() {
  const { bugs, isLoading, addBug, updateBug, deleteBug } = useBugs()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editModal, setEditModal] = useState<{ isOpen: boolean; bug: BugType | null }>({
    isOpen: false,
    bug: null,
  })
  const [games, setGames] = useState<Game[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; bugId: string | null }>({
    isOpen: false,
    bugId: null,
  })

  useEffect(() => {
    // Fetch games for the dropdown
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((err) => console.error("Error fetching games:", err))
  }, [])

  const handleAddBug = async (bugData: {
    gameId: string
    description: string
    screenshotUrl: string | null
    status: string
  }) => {
    await addBug({
      gameId: bugData.gameId,
      description: bugData.description,
      screenshotUrl: bugData.screenshotUrl,
      status: bugData.status as any,
    })
  }

  const handleUpdateStatus = async (bugId: string, status: string) => {
    await updateBug(bugId, { status: status as any })
  }

  const handleEditBug = (bug: BugType) => {
    setEditModal({ isOpen: true, bug })
  }

  const handleUpdateBug = async (bugId: string, updates: { gameId: string; description: string; screenshotUrl: string | null; status: BugStatus }) => {
    await updateBug(bugId, {
      gameId: updates.gameId,
      description: updates.description,
      screenshotUrl: updates.screenshotUrl,
      status: updates.status,
    })
  }

  const handleDeleteBug = (bugId: string) => {
    setDeleteConfirm({ isOpen: true, bugId })
  }

  const confirmDeleteBug = async () => {
    if (deleteConfirm.bugId) {
      await deleteBug(deleteConfirm.bugId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bug className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bugs & Errors</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Bug
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <BugsTable
            bugs={bugs}
            onUpdateStatus={handleUpdateStatus}
            onDeleteBug={handleDeleteBug}
            onEditBug={handleEditBug}
          />
        )}

        {/* Add Bug Modal */}
        <AddBugModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddBug}
          games={games}
        />

        {/* Edit Bug Modal */}
        <EditBugModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, bug: null })}
          onSubmit={handleUpdateBug}
          bug={editModal.bug}
          games={games}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, bugId: null })}
          onConfirm={confirmDeleteBug}
          title="Delete Bug"
          message="Are you sure you want to delete this bug? This action cannot be undone."
          confirmText="Delete Bug"
          confirmColor="red"
        />
      </div>
    </div>
  )
}
