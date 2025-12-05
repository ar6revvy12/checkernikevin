"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Bug } from "lucide-react"
import { BugsTableViewOnly } from "@/components/bugs-table-view-only"
import { decodeShareFilters } from "@/lib/share-utils"
import type { Game } from "@/types/checklist"
import type { Bug as BugType, DevStatus } from "@/types/bugs"

function BugsViewContent() {
  const searchParams = useSearchParams()
  const [bugs, setBugs] = useState<BugType[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Decode filters from URL param
  const encodedFilters = searchParams.get("f") || ""
  const decodedFilters = decodeShareFilters(encodedFilters)
  const initialGameFilter = decodedFilters.gameId || "all"
  const initialStatusFilter = decodedFilters.status || "all"
  const initialSearch = decodedFilters.search || ""

  useEffect(() => {
    // Fetch bugs
    fetch("/api/bugs")
      .then((res) => res.json())
      .then((data) => {
        setBugs(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching bugs:", err)
        setIsLoading(false)
      })

    // Fetch games for the dropdown
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((err) => console.error("Error fetching games:", err))
  }, [])

  const handleUpdateDevStatus = async (bugId: string, devStatus: DevStatus) => {
    try {
      const response = await fetch(`/api/bugs/${bugId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devStatus }),
      })

      if (!response.ok) throw new Error("Failed to update dev status")

      // Update local state
      setBugs((prev) =>
        prev.map((bug) =>
          bug.id === bugId ? { ...bug, devStatus } : bug
        )
      )
    } catch (err) {
      console.error("Error updating dev status:", err)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Bug className="w-5 h-5 sm:w-7 sm:h-7 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Bugs & Errors</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">View reported issues - Update your Dev Status</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs sm:text-sm font-medium self-start sm:self-auto">
              Developer View
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
          <BugsTableViewOnly
            bugs={bugs}
            games={games.map(g => ({ id: g.id, name: g.name }))}
            initialGameFilter={initialGameFilter}
            initialStatusFilter={initialStatusFilter}
            initialSearch={initialSearch}
            onUpdateDevStatus={handleUpdateDevStatus}
          />
        )}
      </div>
    </div>
  )
}

export default function BugsViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-200 dark:border-red-800 border-t-red-600 dark:border-t-red-400 rounded-full animate-spin"></div>
      </div>
    }>
      <BugsViewContent />
    </Suspense>
  )
}
