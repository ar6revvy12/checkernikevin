import type { Game, ChecklistItem } from "@/types/checklist"

let initialized = false

export async function initializeDatabase(): Promise<void> {
  if (initialized) return

  try {
    const response = await fetch("/api/init", {
      method: "POST",
    })
    if (response.ok) {
      initialized = true
    }
  } catch (error) {
    console.error("Failed to initialize database:", error)
  }
}

export async function fetchGames(): Promise<Game[]> {
  await initializeDatabase()

  const response = await fetch("/api/games")
  if (!response.ok) throw new Error("Failed to fetch games")
  return response.json()
}

export async function fetchGame(gameId: string): Promise<Game> {
  const response = await fetch(`/api/games/${gameId}`)
  if (!response.ok) throw new Error("Failed to fetch game")
  return response.json()
}

export async function createGame(game: Game): Promise<void> {
  const response = await fetch("/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  })
  if (!response.ok) throw new Error("Failed to create game")
}

export async function deleteGame(gameId: string): Promise<void> {
  const response = await fetch(`/api/games/${gameId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete game")
}

export async function updateChecklistItems(
  gameId: string,
  items: (ChecklistItem & { section_id: string })[],
): Promise<void> {
  const response = await fetch(`/api/games/${gameId}/checklist`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      updates: items.map((item) => ({
        id: item.id,
        status: item.status,
        evidence: item.evidence,
        severity: item.severity,
      })),
    }),
  })
  if (!response.ok) throw new Error("Failed to update checklist")
}
