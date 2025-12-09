"use client"

import { useState, useEffect, useCallback } from "react"
import type { Bug } from "@/types/bugs"

export function useBugs() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBugs = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/bugs")
      if (!response.ok) throw new Error("Failed to fetch bugs")
      const data = await response.json()
      setBugs(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching bugs:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch bugs")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBugs()
  }, [fetchBugs])

  const addBug = async (bug: Omit<Bug, "id" | "createdAt" | "updatedAt" | "gameName">) => {
    try {
      const newBug = {
        ...bug,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      }

      const response = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBug),
      })

      if (!response.ok) throw new Error("Failed to create bug")

      await fetchBugs()
      return true
    } catch (err) {
      console.error("Failed to add bug:", err)
      return false
    }
  }

  const updateBug = async (bugId: string, updates: Partial<Bug>) => {
    try {
      const response = await fetch(`/api/bugs/${bugId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update bug")

      await fetchBugs()
      return true
    } catch (err) {
      console.error("Failed to update bug:", err)
      return false
    }
  }

  const deleteBug = async (bugId: string) => {
    try {
      const response = await fetch(`/api/bugs/${bugId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete bug")

      await fetchBugs()
      return true
    } catch (err) {
      console.error("Failed to delete bug:", err)
      return false
    }
  }

  return {
    bugs,
    isLoading,
    error,
    addBug,
    updateBug,
    deleteBug,
    refreshBugs: fetchBugs,
  }
}
