"use client"

import type React from "react"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-9999 bg-gray-50 dark:bg-slate-900 overflow-auto ml-0 lg:ml-0">
      <style jsx global>{`
        .lg\\:ml-64 {
          margin-left: 0 !important;
        }
        aside {
          display: none !important;
        }
        .lg\\:translate-x-0 {
          transform: translateX(-100%) !important;
        }
      `}</style>
      {children}
    </div>
  )
}
