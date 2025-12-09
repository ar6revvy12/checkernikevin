"use client"

import { useState, useEffect, useCallback } from "react"
import type { FunctionalTest } from "@/types/functional"

export function useFunctionalTests(gameId: string | null) {
  const [tests, setTests] = useState<FunctionalTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTests = useCallback(async () => {
    if (!gameId) {
      setTests([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/functional?gameId=${gameId}`)
      if (!response.ok) throw new Error("Failed to fetch functional tests")
      const data = await response.json()
      setTests(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching functional tests:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch functional tests")
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  const getNextTestCaseId = (): string => {
    if (!tests || tests.length === 0) return "TC-001"
    
    // Find highest test case ID number from existing tests
    let maxNum = 0
    tests.forEach((test) => {
      const match = test.testCaseId?.match(/TC-(\d+)/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    })

    const nextNum = maxNum + 1
    return `TC-${nextNum.toString().padStart(3, "0")}`
  }

  const addTest = async (test: Omit<FunctionalTest, "id" | "createdAt" | "updatedAt" | "gameName" | "testCaseId">) => {
    try {
      const testCaseId = getNextTestCaseId()
      const newTest = {
        ...test,
        testCaseId,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      }

      const response = await fetch("/api/functional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTest),
      })

      if (!response.ok) throw new Error("Failed to create functional test")

      await fetchTests()
      return true
    } catch (err) {
      console.error("Failed to add functional test:", err)
      return false
    }
  }

  const updateTest = async (testId: string, updates: Partial<FunctionalTest>) => {
    try {
      const response = await fetch(`/api/functional/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update functional test")

      await fetchTests()
      return true
    } catch (err) {
      console.error("Failed to update functional test:", err)
      return false
    }
  }

  const deleteTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/functional/${testId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete functional test")

      await fetchTests()
      return true
    } catch (err) {
      console.error("Failed to delete functional test:", err)
      return false
    }
  }

  return {
    tests,
    isLoading,
    error,
    addTest,
    updateTest,
    deleteTest,
    refreshTests: fetchTests,
    getNextTestCaseId,
  }
}
