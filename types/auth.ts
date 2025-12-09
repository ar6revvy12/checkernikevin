export type UserType = "admin" | "quality-assurance" | "backend" | "game-developer" | "team"

export interface User {
  id: string
  email: string
  name: string
  userType: UserType
  team: string
  createdAt: number
  updatedAt: number
}

export interface AuthSession {
  user: User
  token: string
}
