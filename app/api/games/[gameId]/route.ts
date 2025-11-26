import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

// GET single game with checklist
export async function GET(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params
    const supabase = await createClient()

    const { data: game, error: gameError } = await supabase.from("games").select("*").eq("id", gameId).single()

    if (gameError) throw gameError

    const { data: items, error: itemsError } = await supabase.from("checklist_items").select("*").eq("game_id", gameId)

    if (itemsError) throw itemsError

    // Reorganize items by section
    const checklist: Record<string, any[]> = {}
    items?.forEach((item) => {
      if (!checklist[item.section_id]) {
        checklist[item.section_id] = []
      }
      checklist[item.section_id].push({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        status: item.status,
        evidence: item.evidence,
        severity: item.severity,
      })
    })

    return NextResponse.json({ ...game, checklist })
  } catch (error) {
    console.error("Error fetching game:", error)
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 })
  }
}

// DELETE game
export async function DELETE(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("games").delete().eq("id", gameId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 })
  }
}
