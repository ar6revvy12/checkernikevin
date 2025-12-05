"use client"

import { useState, useEffect } from "react"
import { Plus, Bug, ClipboardCheck, Share2 } from "lucide-react"
import Link from "next/link"
import { useBugs } from "@/hooks/use-bugs"
import { encodeShareFilters } from "@/lib/share-utils"
import { BugsTable } from "@/components/bugs-table"
import { AddBugModal } from "@/components/add-bug-modal"
import { EditBugModal } from "@/components/edit-bug-modal"
import { ConfirmModal } from "@/components/confirm-modal"
import { ShareModal } from "@/components/share-modal"
import type { Game } from "@/types/checklist"
import type { Bug as BugType, BugStatus } from "@/types/bugs"

const statusLabels: Record<string, string> = {
  open: "Open",
  "in-progress": "In Progress",
  done: "Done",
  "wont-fix": "Won't Fix",
}

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
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; url: string; filters: { gameName?: string; status?: string; search?: string } }>({
    isOpen: false,
    url: "",
    filters: {},
  })
  const [currentFilters, setCurrentFilters] = useState({ gameId: "all", status: "all", search: "" })

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
      devStatus: "pending",
      devComment: null,
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

  const handleShareLink = () => {
    const filters: { gameId?: string; status?: string; search?: string } = {}
    if (currentFilters.gameId !== "all") filters.gameId = currentFilters.gameId
    if (currentFilters.status !== "all") filters.status = currentFilters.status
    if (currentFilters.search) filters.search = currentFilters.search
    
    const hasFilters = Object.keys(filters).length > 0
    const encoded = hasFilters ? encodeShareFilters(filters) : ""
    const viewUrl = `${window.location.origin}/bugs-view${encoded ? `?f=${encoded}` : ""}`
    
    // Get display names for filters
    const gameName = currentFilters.gameId !== "all" 
      ? games.find(g => g.id === currentFilters.gameId)?.name 
      : undefined
    const statusLabel = currentFilters.status !== "all" 
      ? statusLabels[currentFilters.status] || currentFilters.status
      : undefined
    
    setShareModal({
      isOpen: true,
      url: viewUrl,
      filters: {
        gameName,
        status: statusLabel,
        search: currentFilters.search || undefined,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Bug className="w-5 h-5 sm:w-7 sm:h-7 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Bugs & Errors</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Track and manage reported issues</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Checklist</span>
              </Link>
              <button
                onClick={handleShareLink}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg transition-colors"
                title="Share bugs view"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Bug</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-200 dark:border-red-800 border-t-red-600 dark:border-t-red-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading bugs...</p>
            </div>
          </div>
        ) : (
          <BugsTable
            bugs={bugs}
            games={games.map(g => ({ id: g.id, name: g.name }))}
            onUpdateStatus={handleUpdateStatus}
            onDeleteBug={handleDeleteBug}
            onEditBug={handleEditBug}
            onFiltersChange={setCurrentFilters}
          />
        )}
      </div>

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

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, url: "", filters: {} })}
        shareUrl={shareModal.url}
        filters={shareModal.filters}
      />
    </div>
  )
}
