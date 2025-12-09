"use client"

import { Bug, Activity, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useBugs } from "@/hooks/use-bugs"
import type { DevStatus } from "@/types/bugs"

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function devStatusLabel(status: DevStatus) {
  switch (status) {
    case "pending":
      return "Pending"
    case "in-progress":
      return "In Progress"
    case "completed":
      return "Completed"
    case "needs-info":
      return "Needs Info"
    default:
      return status
  }
}

export default function DevDashboardPage() {
  const { bugs, isLoading } = useBugs()

  const devPending = bugs.filter((b) => b.devStatus === "pending")
  const devInProgress = bugs.filter((b) => b.devStatus === "in-progress")
  const devCompleted = bugs.filter((b) => b.devStatus === "completed")
  const devNeedsInfo = bugs.filter((b) => b.devStatus === "needs-info")

  const activeWork = bugs
    .filter((b) => b.devStatus === "pending" || b.devStatus === "in-progress" || b.devStatus === "needs-info")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 20)

  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dev Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Overview of bugs by developer status. Use this to plan your work.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <Bug className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{devPending.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dev Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{devInProgress.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dev In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{devCompleted.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dev Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{devNeedsInfo.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Needs Info</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Active dev work</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bugs where dev status is Pending, In Progress, or Needs Info.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-gray-500 dark:text-gray-400">
              Loading bugs...
            </div>
          ) : activeWork.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-gray-500 dark:text-gray-400">
              No active dev work. Nice.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {activeWork.map((bug) => (
                <div key={bug.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">
                        {bug.gameName}
                      </span>
                      {bug.casino && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px]">
                          {bug.casino}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {formatDate(bug.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                      {bug.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200">
                        QA: {bug.status}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        Dev: {devStatusLabel(bug.devStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
