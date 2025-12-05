"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { RegressionTest, RegressionPriority, RegressionStatus } from "@/types/regression"

interface EditRegressionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (testId: string, data: {
    testCaseDescription: string
    priority: RegressionPriority
    expectedResult: string
    actualResult: string
    status: RegressionStatus
    comments: string
  }) => void
  test: RegressionTest | null
}

export function EditRegressionModal({ isOpen, onClose, onSubmit, test }: EditRegressionModalProps) {
  const [testCaseDescription, setTestCaseDescription] = useState("")
  const [priority, setPriority] = useState<RegressionPriority>("medium")
  const [expectedResult, setExpectedResult] = useState("")
  const [actualResult, setActualResult] = useState("")
  const [status, setStatus] = useState<RegressionStatus>("pass")
  const [comments, setComments] = useState("")

  useEffect(() => {
    if (test) {
      setTestCaseDescription(test.testCaseDescription)
      setPriority(test.priority)
      setExpectedResult(test.expectedResult)
      setActualResult(test.actualResult)
      setStatus(test.status)
      setComments(test.comments || "")
    }
  }, [test])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!test || !testCaseDescription.trim() || !expectedResult.trim() || !actualResult.trim()) return

    onSubmit(test.id, {
      testCaseDescription: testCaseDescription.trim(),
      priority,
      expectedResult: expectedResult.trim(),
      actualResult: actualResult.trim(),
      status,
      comments: comments.trim(),
    })

    onClose()
  }

  if (!isOpen || !test) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Regression Test</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Test ID
            </label>
            <input
              type="text"
              value={test.testId}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Test Case Description
            </label>
            <textarea
              value={testCaseDescription}
              onChange={(e) => setTestCaseDescription(e.target.value)}
              placeholder="Describe the test case..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as RegressionPriority)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expected Result
            </label>
            <textarea
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              placeholder="What should happen..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Actual Result
            </label>
            <textarea
              value={actualResult}
              onChange={(e) => setActualResult(e.target.value)}
              placeholder="What actually happened..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RegressionStatus)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any additional comments..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
