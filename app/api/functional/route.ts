import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

type FunctionalTestRow = {
  id: string
  game_id: string
  games?: { name?: string | null } | null
  test_case_id: string
  module: string
  test_scenario: string
  precondition: string
  test_steps: string
  expected_result: string
  status: string
  comments: string
  created_at: number | string
  updated_at?: number | string | null
}

// GET all functional tests (optionally filtered by gameId)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")

    let query = supabase
      .from("functional_tests")
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
      console.error("Error fetching functional tests:", error)
      return NextResponse.json([])
    }

    const formattedTests = tests?.map((test: FunctionalTestRow) => ({
      id: test.id,
      gameId: test.game_id,
      gameName: test.games?.name || "Unknown Game",
      testCaseId: test.test_case_id,
      module: test.module,
      testScenario: test.test_scenario,
      precondition: test.precondition,
      testSteps: test.test_steps,
      expectedResult: test.expected_result,
      status: test.status,
      comments: test.comments,
      createdAt: test.created_at,
      updatedAt: test.updated_at,
    })) || []

    return NextResponse.json(formattedTests)
  } catch (error) {
    console.error("Error fetching functional tests:", error)
    return NextResponse.json([])
  }
}

// POST new functional test
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { id, gameId, testCaseId, module, testScenario, precondition, testSteps, expectedResult, status, comments, createdAt } = body

    const { error } = await supabase.from("functional_tests").insert({
      id,
      game_id: gameId,
      test_case_id: testCaseId,
      module: module,
      test_scenario: testScenario,
      precondition: precondition || "",
      test_steps: testSteps,
      expected_result: expectedResult,
      status: status || "not-tested",
      comments: comments || "",
      created_at: createdAt,
    })

    if (error) throw error

    return NextResponse.json({ id })
  } catch (error) {
    console.error("Error creating functional test:", error)
    return NextResponse.json({ error: "Failed to create functional test" }, { status: 500 })
  }
}
