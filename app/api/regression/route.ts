import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

type RegressionTestRow = {
  id: string
  game_id: string
  games?: { name?: string | null } | null
  test_id: string
  test_case_description: string
  priority: string
  expected_result: string
  actual_result: string
  status: string
  comments: string
  created_at: number | string
  updated_at?: number | string | null
}

// GET all regression tests (optionally filtered by gameId)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")

    let query = supabase
      .from("regression_tests")
      .select(`
        *,
        games (name)
      `)
      .order("created_at", { ascending: false })

    if (gameId) {
      query = query.eq("game_id", gameId)
    }

    const { data: tests, error } = await query

    if (error) {
      console.error("Error fetching regression tests:", error)
      return NextResponse.json([])
    }

    const formattedTests = tests?.map((test: RegressionTestRow) => ({
      id: test.id,
      gameId: test.game_id,
      gameName: test.games?.name || "Unknown Game",
      testId: test.test_id,
      testCaseDescription: test.test_case_description,
      priority: test.priority,
      expectedResult: test.expected_result,
      actualResult: test.actual_result,
      status: test.status,
      comments: test.comments,
      createdAt: test.created_at,
      updatedAt: test.updated_at,
    })) || []

    return NextResponse.json(formattedTests)
  } catch (error) {
    console.error("Error fetching regression tests:", error)
    return NextResponse.json([])
  }
}

// POST new regression test
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { id, gameId, testId, testCaseDescription, priority, expectedResult, actualResult, status, comments, createdAt } = body

    const { error } = await supabase.from("regression_tests").insert({
      id,
      game_id: gameId,
      test_id: testId,
      test_case_description: testCaseDescription,
      priority: priority || "medium",
      expected_result: expectedResult,
      actual_result: actualResult,
      status: status || "not-tested",
      comments: comments || "",
      created_at: createdAt,
    })

    if (error) throw error

    return NextResponse.json({ id })
  } catch (error) {
    console.error("Error creating regression test:", error)
    return NextResponse.json({ error: "Failed to create regression test" }, { status: 500 })
  }
}
