import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

// GET single functional test
export async function GET(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const supabase = await createClient()
    const { testId } = await params

    const { data: test, error } = await supabase
      .from("functional_tests")
      .select(`
        *,
        games (name)
      `)
      .eq("id", testId)
      .single()

    if (error) throw error

    const formattedTest = {
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
    }

    return NextResponse.json(formattedTest)
  } catch (error) {
    console.error("Error fetching functional test:", error)
    return NextResponse.json({ error: "Failed to fetch functional test" }, { status: 500 })
  }
}

// PATCH update functional test
export async function PATCH(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const supabase = await createClient()
    const { testId } = await params
    const body = await request.json()

    const updateData: any = {
      updated_at: Date.now(),
    }

    if (body.gameId !== undefined) updateData.game_id = body.gameId
    if (body.testCaseId !== undefined) updateData.test_case_id = body.testCaseId
    if (body.module !== undefined) updateData.module = body.module
    if (body.testScenario !== undefined) updateData.test_scenario = body.testScenario
    if (body.precondition !== undefined) updateData.precondition = body.precondition
    if (body.testSteps !== undefined) updateData.test_steps = body.testSteps
    if (body.expectedResult !== undefined) updateData.expected_result = body.expectedResult
    if (body.status !== undefined) updateData.status = body.status
    if (body.comments !== undefined) updateData.comments = body.comments

    const { error } = await supabase
      .from("functional_tests")
      .update(updateData)
      .eq("id", testId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating functional test:", error)
    return NextResponse.json({ error: "Failed to update functional test" }, { status: 500 })
  }
}

// DELETE functional test
export async function DELETE(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const supabase = await createClient()
    const { testId } = await params

    const { error } = await supabase
      .from("functional_tests")
      .delete()
      .eq("id", testId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting functional test:", error)
    return NextResponse.json({ error: "Failed to delete functional test" }, { status: 500 })
  }
}
