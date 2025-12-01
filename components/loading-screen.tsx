"use client"

import { useEffect, useState } from "react"
import Lottie from "lottie-react"
import animationData from "@/blackrainbowcat.json"

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
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-48 h-48">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
          />
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
