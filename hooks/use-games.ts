import useSWR from "swr"
import { fetchGames, createGame, deleteGame, updateChecklistItems } from "@/lib/api"
import type { Game, ChecklistItem } from "@/types/checklist"

export function useGames() {
  const { data: games = [], mutate, isLoading, error } = useSWR("games", fetchGames)

  const handleAddGame = async (game: Game) => {
    try {
      await createGame(game)
      await mutate()
    } catch (error) {
      console.error("Failed to add game:", error)
      throw error
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    try {
      await deleteGame(gameId)
      await mutate()
    } catch (error) {
      console.error("Failed to delete game:", error)
      throw error
    }
  }

  const handleUpdateChecklist = async (
    gameId: string,
    sectionId: string,
    itemId: string,
    updates: Partial<ChecklistItem>,
  ) => {
    try {
      const updatedGames = games.map((game) => {
        if (game.id === gameId) {
          return {
            ...game,
            checklist: {
              ...game.checklist,
              [sectionId]: game.checklist[sectionId].map((item) =>
                item.id === itemId ? { ...item, ...updates } : item,
              ),
            },
          }
        }
        return game
      })

      await mutate(updatedGames, false)

      const itemsToUpdate = []
      const activeGame = updatedGames.find((g) => g.id === gameId)
      if (activeGame) {
        const item = activeGame.checklist[sectionId]?.find((i) => i.id === itemId)
        if (item) {
          itemsToUpdate.push({ ...item, section_id: sectionId })
        }
      }

      if (itemsToUpdate.length > 0) {
        await updateChecklistItems(gameId, itemsToUpdate)
        await mutate()
      }
    } catch (error) {
      console.error("Failed to update checklist:", error)
      await mutate()
      throw error
    }
  }

  return {
    games,
    isLoading,
    error,
    addGame: handleAddGame,
    deleteGame: handleDeleteGame,
    updateChecklist: handleUpdateChecklist,
  }
}
