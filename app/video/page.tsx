"use client"

import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"
import { useState, useRef } from "react"

export default function VideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(progress)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const newTime = (clickX / width) * videoRef.current.duration
      videoRef.current.currentTime = newTime
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Video Player
        </h1>

        <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
          {/* Video Element */}
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnd}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
            >
              <source src="/ian_cocke.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Play overlay when paused */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                onClick={togglePlay}
              >
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-gray-900 ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gray-900 p-4 space-y-3">
            {/* Progress Bar */}
            <div 
              className="w-full h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors text-white"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors text-white"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
              </div>

              <button
                onClick={handleFullscreen}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors text-white"
                aria-label="Fullscreen"
              >
                <Maximize className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
          Playing: <code className="bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded">ian_cocke.mp4</code>
        </p>
      </div>
    </div>
  )
}
