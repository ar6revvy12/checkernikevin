export type BugStatus = "open" | "in-progress" | "done" | "wont-fix"
export type DevStatus = "pending" | "in-progress" | "completed" | "needs-info"

export interface Bug {
  id: string
  gameId: string
  gameName?: string
  casino: string | null
  description: string
  screenshotUrl: string | null
  status: BugStatus
  devStatus: DevStatus
  devComment: string | null
  createdAt: number
  updatedAt?: number
}
