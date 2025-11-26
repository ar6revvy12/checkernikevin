export interface ChecklistItem {
  id: string
  title: string
  description: string
  category: string
  status: "unchecked" | "checking" | "done" | "failed" | "need-rework"
  evidence?: string // URL or image path
  severity?: "critical" | "high" | "medium" | "low"
}

export interface GamePackage {
  id: string
  name: string
  reels: string
  paylines: string
  maxWin: string
  volatility: string
  minBet: number
  maxBet: number
  features: string[]
  symbols: Symbol[]
}

export interface Symbol {
  id: string
  name: string
  type: string
  payouts: Record<string, string>
}

export interface Game {
  id: string
  name: string
  packageId: string
  checklist: Record<string, ChecklistItem[]>
  createdAt: number
}
