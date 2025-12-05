"use client"

import { useEffect, useState } from "react"
import { X, Check, Copy, Link2, Filter, Gamepad2 } from "lucide-react"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  filters: {
    gameName?: string
    status?: string
    search?: string
  }
}

export function ShareModal({ isOpen, onClose, shareUrl, filters }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      setCopied(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(onClose, 200)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const hasFilters = filters.gameName || filters.status || filters.search

  if (!isOpen) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200 ${
        isAnimating ? "bg-black/50 backdrop-blur-sm" : "bg-transparent"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl transform transition-all duration-300 ease-out ${
          isAnimating 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-95 opacity-0 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Share Bugs View</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Copy the link to share</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Filters being shared */}
          {hasFilters && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Filter className="w-4 h-4" />
                Sharing with filters:
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.gameName && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs sm:text-sm font-medium animate-fadeIn">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    {filters.gameName}
                  </div>
                )}
                {filters.status && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs sm:text-sm font-medium animate-fadeIn animation-delay-100">
                    Status: {filters.status}
                  </div>
                )}
                {filters.search && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-xs sm:text-sm font-medium animate-fadeIn animation-delay-200">
                    Search: "{filters.search}"
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasFilters && (
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              Sharing all bugs (no filters applied)
            </div>
          )}

          {/* URL Preview */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Shareable Link
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate font-mono">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 animate-scaleIn" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-4 bg-gray-50 dark:bg-slate-700/50 rounded-b-2xl border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Recipients will see a read-only view of the bugs
          </p>
        </div>
      </div>
    </div>
  )
}
