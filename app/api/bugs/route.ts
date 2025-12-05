import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

// GET all bugs
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: bugs, error } = await supabase
      .from("bugs")
      .select(`
        *,
        games (name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching bugs:", error)
      return NextResponse.json([])
    }

    const formattedBugs = bugs?.map((bug: any) => ({
      id: bug.id,
      gameId: bug.game_id,
      gameName: bug.games?.name || "Unknown Game",
      description: bug.description,
      screenshotUrl: bug.screenshot_url,
      status: bug.status,
      devStatus: bug.dev_status || "pending",
      createdAt: bug.created_at,
      updatedAt: bug.updated_at,
    })) || []

    return NextResponse.json(formattedBugs)
  } catch (error) {
    console.error("Error fetching bugs:", error)
    return NextResponse.json([])
  }
}

// POST new bug
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { id, gameId, description, screenshotUrl, status, createdAt } = body

    const { error } = await supabase.from("bugs").insert({
      id,
      game_id: gameId,
      description,
      screenshot_url: screenshotUrl || null,
      status: status || "open",
      created_at: createdAt,
    })

    if (error) throw error

    return NextResponse.json({ id })
  } catch (error) {
    console.error("Error creating bug:", error)
    return NextResponse.json({ error: "Failed to create bug" }, { status: 500 })
  }
}
