"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ClipboardCheck, Bug, Moon, Sun, Menu, X, FlaskConical, RotateCcw, LogOut, User } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/contexts/auth-context"

const getNavItems = (isAdmin: boolean) => {
  const items = [
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
      href: "/functional",
      label: "Functional Testing",
      icon: FlaskConical,
    },
    {
      href: "/regression",
      label: "Regression Testing",
      icon: RotateCcw,
    },
  ]
  
  if (isAdmin) {
    items.push({
      href: "/accounts",
      label: "Accounts",
      icon: User,
    })
  }
  
  return items
}

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Don't show sidebar on auth pages
  if (!user || pathname === "/signin" || pathname === "/signup") {
    return null
  }

  const navItems = getNavItems(user.userType === "admin")

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 z-50">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">QA CHECKLIST</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="relative w-full h-12">
            <Image
              src="/di-joker-logo.png"
              alt="DJ Joker Logo"
              fill
              className="object-contain object-center"
            />
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
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

        {/* User Info & Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
          {/* User Info */}
          <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                  {user?.userType.replace(/-/g, " ")}
                </p>
              </div>
            </div>
            <div className="mt-2 px-2 py-1 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded text-xs font-medium text-red-600 dark:text-red-400 text-center">
              {user?.team}
            </div>
          </div>

          {/* Theme Toggle */}
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

          {/* Sign Out Button */}
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          {/* Footer */}
          <div className="text-center space-y-0.5 pt-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">QA SHEESH</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-600">by Robert Kevin Ian</p>
          </div>
        </div>
      </aside>
    </>
  )
}
