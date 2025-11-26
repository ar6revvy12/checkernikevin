"use client"

import { Card } from "@/components/ui/card"

interface ProgressBarProps {
  percentage: number
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <Card className="p-6 mt-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
          <span className="text-lg font-bold text-accent-foreground">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-foreground rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
