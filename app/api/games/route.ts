import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"
import type { ChecklistItem } from "@/types/checklist"

type GameRow = {
  id: string
  name: string
  package_id: string | null
  created_at: number | string
}

type ChecklistItemRow = {
  id: string
  game_id: string
  section_id: string
  title: string
  description: string | null
  category: string | null
  status: string
  evidence: string | null
  severity: string | null
}

type ChecklistApiItem = {
  id: string
  title: string
  description: string | null
  category: string | null
  status: string
  evidence: string | null
  severity: string | null
}

type ChecklistInsertRow = {
  id: string
  game_id: string
  section_id: string
  title: string
  description: string
  category: string
  status: ChecklistItem["status"]
  evidence: string | null
  severity: ChecklistItem["severity"] | null
  created_at: number
}

// GET all games
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false })

    if (gamesError) {
      console.error("Error fetching games:", gamesError)
      return NextResponse.json([])
    }

    if (!games || games.length === 0) {
      return NextResponse.json([])
    }

    const gameRows = games as GameRow[]

    // Fetch all checklist items for these games
    const gameIds = gameRows.map((g) => g.id)
    const { data: checklistItems, error: itemsError } = await supabase
      .from("checklist_items")
      .select("*")
      .in("game_id", gameIds)

    if (itemsError) { 
      console.error("Error fetching checklist items:", itemsError)
      // Return games without checklists
      return NextResponse.json(
        gameRows.map((game) => ({
          id: game.id,
          name: game.name,
          packageId: game.package_id,
          checklist: {},
          createdAt: game.created_at,
        })),
      )
    }

    // Reconstruct the nested checklist structure
    const checklistRows = (checklistItems ?? []) as ChecklistItemRow[]
    const gamesWithChecklists = gameRows.map((game) => {
      const checklist: Record<string, ChecklistApiItem[]> = {}

      const gameItems = checklistRows.filter((item) => item.game_id === game.id)

      gameItems.forEach((item: ChecklistItemRow) => {
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

      return {
        id: game.id,
        name: game.name,
        packageId: game.package_id,
        checklist,
        createdAt: game.created_at,
      }
    })

    return NextResponse.json(gamesWithChecklists)
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json([])
  }
}

// POST new game
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { id, name, packageId, checklist, createdAt } = body

    // Insert game
    const { error: gameError } = await supabase.from("games").insert({
      id,
      name,
      package_id: packageId,
      created_at: createdAt,
    })

    if (gameError) throw gameError

    // Insert checklist items
    const checklistItems: ChecklistInsertRow[] = []
    const typedChecklist = checklist as Record<string, ChecklistItem[]>
    for (const [sectionId, items] of Object.entries(typedChecklist)) {
      const sectionItems: ChecklistInsertRow[] = items.map((item) => ({
        id: item.id,
        game_id: id,
        section_id: sectionId,
        title: item.title,
        description: item.description,
        category: item.category,
        status: item.status,
        evidence: item.evidence ?? null,
        severity: item.severity ?? null,
        created_at: Date.now(),
      }))
      checklistItems.push(...sectionItems)
    }

    if (checklistItems.length > 0) {
      const { error: itemsError } = await supabase.from("checklist_items").insert(checklistItems)

      if (itemsError) throw itemsError
    }

    return NextResponse.json({ id })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 })
  }
}
