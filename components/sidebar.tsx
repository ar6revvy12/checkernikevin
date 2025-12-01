"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardCheck, Bug, Moon, Sun, Play } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

const navItems = [
  {
    href: "/",
    label: "Checklist",
    icon: ClipboardCheck,
  },
  {
    href: "/bugs",
    label: "Bugs & Errors",
    icon: Bug,
  },
  {
    href: "/video",
    label: "Video",
    icon: Play,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">QA CHECKLIST</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ni Kevin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Theme Toggle & Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-4">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          {theme === "light" ? (
            <>
              <Moon className="w-4 h-4" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              Light Mode
            </>
          )}
        </button>
        <div className="text-center space-y-0.5">
          <p className="text-xs text-gray-400 dark:text-gray-500">Game QA Tool v1.0</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-600">by jolo</p>
        </div>
      </div>
    </aside>
  )
}
