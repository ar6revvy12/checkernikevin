import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

// PUT update checklist items
export async function PUT(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { updates } = body

    // Update each item
    for (const item of updates) {
      const { error } = await supabase
        .from("checklist_items")
        .update({
          status: item.status,
          evidence: item.evidence,
          severity: item.severity,
        })
        .eq("id", item.id)
        .eq("game_id", gameId)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating checklist:", error)
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 })
  }
}
