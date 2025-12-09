"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LogIn, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await signIn(email, password)
      if (success) {
        router.push("/")
      } else {
        setError("Invalid credentials or access denied")
      }
    } catch (error) {
      console.error("Sign-in failed:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Image / Brand Panel */}
        <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6">
          <div className="relative w-full h-20 mb-4">
            <Image
              src="/di-joker-logo.png"
              alt="Di Joker Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <div className="flex-1 flex items-center">
            <p className="text-sm text-slate-200 leading-relaxed">
              QA SHEESH
              <br />
              Track bugs, testing, and dev work across all Di Joker games in one place.
            </p>
          </div>
          <div className="pt-4 text-[11px] text-slate-400">
            by Robert Kevin Ian
          </div>
        </div>

        {/* Sign In Form */}
        <div className="p-6 md:p-8 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            {/* Logo/Header */}
            <div className="text-center mb-2">
              <div className="mx-auto mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome Back</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sign in to your Di Joker account</p>
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Footer Note */}
            <p className="text-center text-gray-500 dark:text-gray-400 text-xs">
              Contact admin for account access
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
