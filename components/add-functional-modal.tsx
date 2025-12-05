"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { FunctionalStatus } from "@/types/functional"

interface AddFunctionalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    module: string
    testScenario: string
    precondition: string
    testSteps: string
    expectedResult: string
    status: FunctionalStatus
    comments: string
  }) => void
}

export function AddFunctionalModal({ isOpen, onClose, onSubmit }: AddFunctionalModalProps) {
  const [module, setModule] = useState("")
  const [testScenario, setTestScenario] = useState("")
  const [precondition, setPrecondition] = useState("")
  const [testSteps, setTestSteps] = useState("")
  const [expectedResult, setExpectedResult] = useState("")
  const [status, setStatus] = useState<FunctionalStatus>("not-tested")
  const [comments, setComments] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!module.trim() || !testScenario.trim() || !testSteps.trim() || !expectedResult.trim()) return

    onSubmit({
      module: module.trim(),
      testScenario: testScenario.trim(),
      precondition: precondition.trim(),
      testSteps: testSteps.trim(),
      expectedResult: expectedResult.trim(),
      status,
      comments: comments.trim(),
    })

    // Reset form
    setModule("")
    setTestScenario("")
    setPrecondition("")
    setTestSteps("")
    setExpectedResult("")
    setStatus("not-running")
    setComments("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Functional Test</h2>
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
              Module
            </label>
            <input
              type="text"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              placeholder="e.g., Login, Dashboard, Settings"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Test Scenario
            </label>
            <textarea
              value={testScenario}
              onChange={(e) => setTestScenario(e.target.value)}
              placeholder="Describe the test scenario..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precondition (Optional)
            </label>
            <textarea
              value={precondition}
              onChange={(e) => setPrecondition(e.target.value)}
              placeholder="Any prerequisites or setup required..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Test Steps
            </label>
            <textarea
              value={testSteps}
              onChange={(e) => setTestSteps(e.target.value)}
              placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
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
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as FunctionalStatus)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="not-tested">Not Tested</option>
              <option value="running">Running</option>
              <option value="not-running">Not Running</option>
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
              Add Test
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
