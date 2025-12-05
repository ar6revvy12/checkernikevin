import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

// GET single bug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ bugId: string }> }
) {
  try {
    const supabase = await createClient()
    const { bugId } = await params

    const { data: bug, error } = await supabase
      .from("bugs")
      .select(`
        *,
        games (name)
      `)
      .eq("id", bugId)
      .single()

    if (error) {
      console.error("Error fetching bug:", error)
      return NextResponse.json({ error: "Bug not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: bug.id,
      gameId: bug.game_id,
      gameName: bug.games?.name || "Unknown Game",
      casino: bug.casino || null,
      description: bug.description,
      screenshotUrl: bug.screenshot_url || null,
      status: bug.status,
      devStatus: bug.dev_status || "pending",
      devComment: bug.dev_comment || null,
      createdAt: bug.created_at,
      updatedAt: bug.updated_at,
    })
  } catch (error) {
    console.error("Error fetching bug:", error)
    return NextResponse.json({ error: "Failed to fetch bug" }, { status: 500 })
  }
}

// PATCH update bug
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bugId: string }> }
) {
  try {
    const supabase = await createClient()
    const { bugId } = await params
    const body = await request.json()

    const updates: any = {
      updated_at: Date.now(),
    }

    if (body.gameId !== undefined) updates.game_id = body.gameId
    if (body.casino !== undefined) updates.casino = body.casino
    if (body.description !== undefined) updates.description = body.description
    if (body.screenshotUrl !== undefined) updates.screenshot_url = body.screenshotUrl
    if (body.status !== undefined) updates.status = body.status
    if (body.devStatus !== undefined) updates.dev_status = body.devStatus
    if (body.devComment !== undefined) updates.dev_comment = body.devComment

    const { error } = await supabase
      .from("bugs")
      .update(updates)
      .eq("id", bugId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating bug:", error)
    return NextResponse.json({ error: "Failed to update bug" }, { status: 500 })
  }
}

// DELETE bug
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ bugId: string }> }
) {
  try {
    const supabase = await createClient()
    const { bugId } = await params

    const { error } = await supabase
      .from("bugs")
      .delete()
      .eq("id", bugId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting bug:", error)
    return NextResponse.json({ error: "Failed to delete bug" }, { status: 500 })
  }
}
