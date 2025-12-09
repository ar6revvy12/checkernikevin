"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ["/signin"]
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicRoute) {
        // Not authenticated and trying to access protected route
        router.push("/signin")
      } else if (user && isPublicRoute) {
        // Authenticated and on auth page, redirect to home
        router.push("/")
      } else if (user && user.team !== "Di Joker") {
        // User not in Di Joker team
        router.push("/signin")
      }
    }
  }, [user, isLoading, isPublicRoute, router, pathname])

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user && !isPublicRoute) {
    return null
  }

  if (user && isPublicRoute) {
    return null
  }

  return <>{children}</>
}
