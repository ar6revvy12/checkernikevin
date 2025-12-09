"use client"

import { useState, useEffect } from "react"
import { Plus, RotateCcw, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useGames } from "@/hooks/use-games"
import { useRegressionTests } from "@/hooks/use-regression"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { RegressionTable } from "@/components/regression-table"
import { AddRegressionModal } from "@/components/add-regression-modal"
import { EditRegressionModal } from "@/components/edit-regression-modal"
import { ConfirmModal } from "@/components/confirm-modal"
import type { RegressionTest, RegressionStatus, RegressionPriority } from "@/types/regression"

export default function RegressionTestingPage() {
  const { user } = useAuth()
  const { games, isLoading: gamesLoading } = useGames()
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const { tests, isLoading: testsLoading, addTest, updateTest, deleteTest, refreshTests } = useRegressionTests(selectedGameId)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<RegressionTest | null>(null)
  const [testToDelete, setTestToDelete] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState({ status: "all", priority: "all", search: "" })

  // Set the first game as selected when games load
  useEffect(() => {
    if (games.length > 0 && !selectedGameId) {
      setSelectedGameId(games[0].id)
    }
  }, [games, selectedGameId])

  // Get the selected game name
  const selectedGame = games.find((g) => g.id === selectedGameId)

  const handleAddTest = async (data: {
    testCaseDescription: string
    priority: RegressionPriority
    expectedResult: string
    actualResult: string
    status: RegressionStatus
    comments: string
  }) => {
    if (!selectedGameId) return
    
    await addTest({
      gameId: selectedGameId,
      ...data,
    })
  }

  const handleEditTest = async (testId: string, data: {
    testCaseDescription: string
    priority: RegressionPriority
    expectedResult: string
    actualResult: string
    status: RegressionStatus
    comments: string
  }) => {
    await updateTest(testId, data)
  }

  const handleUpdateStatus = async (testId: string, status: RegressionStatus) => {
    await updateTest(testId, { status })
  }

  const handleDeleteClick = (testId: string) => {
    setTestToDelete(testId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (testToDelete) {
      await deleteTest(testToDelete)
      setTestToDelete(null)
    }
    setIsDeleteModalOpen(false)
  }

  const handleEditClick = (test: RegressionTest) => {
    setSelectedTest(test)
    setIsEditModalOpen(true)
  }

  // Calculate stats
  const passedCount = tests.filter((t) => t.status === "pass").length
  const failedCount = tests.filter((t) => t.status === "fail").length
  const totalCount = tests.length

  const isLoading = gamesLoading || testsLoading

  const isDev = user?.userType === "backend" || user?.userType === "game-developer"

  if (isDev) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Developer accounts do not have access to Regression Testing. Please use the Bugs &amp; Errors page instead.
            </p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Regression Testing</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track regression test cases</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshTests()}
            className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!selectedGameId}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Test
          </button>
        </div>
      </div>

      {/* Game Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGameId(game.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                selectedGameId === game.id
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current Game Indicator */}
      {selectedGame && (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <RotateCcw className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Currently viewing: <span className="font-bold">{selectedGame.name}</span>
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Tests</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{passedCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Passed</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{failedCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading tests...</p>
          </div>
        </div>
      ) : (
        <RegressionTable
          tests={tests}
          onUpdateStatus={handleUpdateStatus}
          onDeleteTest={handleDeleteClick}
          onEditTest={handleEditClick}
          filters={currentFilters}
          onFiltersChange={setCurrentFilters}
        />
      )}

      {/* Modals */}
      <AddRegressionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTest}
      />

      <EditRegressionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditTest}
        test={selectedTest}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Regression Test"
        message="Are you sure you want to delete this regression test? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
    </AuthGuard>
  )
}
