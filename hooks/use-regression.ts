"use client"

import { useState, useEffect, useCallback } from "react"
import type { RegressionTest, RegressionStatus } from "@/types/regression"

export function useRegressionTests(gameId: string | null) {
  const [tests, setTests] = useState<RegressionTest[]>([])
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
      const response = await fetch(`/api/regression?gameId=${gameId}`)
      if (!response.ok) throw new Error("Failed to fetch regression tests")
      const data = await response.json()
      setTests(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching regression tests:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch regression tests")
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  const getNextTestId = (): string => {
    if (!tests || tests.length === 0) return "REG-001"
    
    // Find highest test ID number from existing tests
    let maxNum = 0
    tests.forEach((test) => {
      const match = test.testId?.match(/REG-(\d+)/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    })

    const nextNum = maxNum + 1
    return `REG-${nextNum.toString().padStart(3, "0")}`
  }

  const addTest = async (test: Omit<RegressionTest, "id" | "createdAt" | "updatedAt" | "gameName" | "testId">) => {
    try {
      const testId = getNextTestId()
      const newTest = {
        ...test,
        testId,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      }

      const response = await fetch("/api/regression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTest),
      })

      if (!response.ok) throw new Error("Failed to create regression test")

      await fetchTests()
      return true
    } catch (err) {
      console.error("Failed to add regression test:", err)
      return false
    }
  }

  const updateTest = async (testId: string, updates: Partial<RegressionTest>) => {
    try {
      const response = await fetch(`/api/regression/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update regression test")

      await fetchTests()
      return true
    } catch (err) {
      console.error("Failed to update regression test:", err)
      return false
    }
  }

  const deleteTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/regression/${testId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete regression test")

      await fetchTests()
      return true
    } catch (err) {
      console.error("Failed to delete regression test:", err)
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
    getNextTestId,
  }
}
