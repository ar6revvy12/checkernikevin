export interface Bug {
  id: string
  gameId: string
  gameName?: string
  casino: string | null
  description: string
  screenshotUrl: string | null
  status: "open" | "in-progress" | "done" | "wont-fix"
  devStatus: "pending" | "in-progress" | "completed" | "needs-info"
  devComment: string | null
  createdAt: number
  updatedAt: number
}

export type BugStatus = Bug["status"]
export type DevStatus = Bug["devStatus"]
