"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Minimum display time for the loading screen
    const timer = setTimeout(() => {
      setFadeOut(true)
      // Wait for fade animation to complete before hiding
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Glow effect behind the logo */}
          <div className="absolute inset-0 blur-2xl bg-green-600/20 rounded-full animate-pulse" />
          
          {/* Logo with animations */}
          <div className="relative w-48 h-48 animate-logo-pulse">
            <Image
              src="/di-joker.png"
              alt="DJ Joker Logo"
              fill
              className="object-contain drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              priority
            />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-semibold text-white">Loading Gar</p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  )
}
