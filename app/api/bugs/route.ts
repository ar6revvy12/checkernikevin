import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

type BugRow = {
  id: string
  game_id: string
  games?: { name?: string | null } | null
  casino?: string | null
  description: string
  screenshot_url?: string | null
  status: string
  dev_status?: string | null
  dev_comment?: string | null
  created_at: number | string
  updated_at?: number | string | null
}

// GET all bugs (optionally filtered by gameId)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")

    let query = supabase
      .from("bugs")
      .select(`
        *,
        games (name)
      `)
      .order("created_at", { ascending: false })

    if (gameId) {
      query = query.eq("game_id", gameId)
    }

    const { data: bugs, error } = await query

    if (error) {
      console.error("Error fetching bugs:", error)
      return NextResponse.json([])
    }

    const formattedBugs = bugs?.map((bug: BugRow) => ({
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

    const { id, gameId, casino, description, screenshotUrl, status, devStatus, createdAt } = body

    const { error } = await supabase.from("bugs").insert({
      id,
      game_id: gameId,
      casino: casino || null,
      description,
      screenshot_url: screenshotUrl || null,
      status: status || "open",
      dev_status: devStatus || "pending",
      created_at: createdAt,
    })

    if (error) throw error

    return NextResponse.json({ id })
  } catch (error) {
    console.error("Error creating bug:", error)
    return NextResponse.json({ error: "Failed to create bug" }, { status: 500 })
  }
}
