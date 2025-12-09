import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

type RegressionTestUpdatePayload = {
  [key: string]: string | number | null
}

// GET single regression test
export async function GET(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const supabase = await createClient()
    const { testId } = await params

    const { data: test, error } = await supabase
      .from("regression_tests")
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
      testId: test.test_id,
      testCaseDescription: test.test_case_description,
      priority: test.priority,
      expectedResult: test.expected_result,
      actualResult: test.actual_result,
      status: test.status,
      comments: test.comments,
      createdAt: test.created_at,
      updatedAt: test.updated_at,
    }

    return NextResponse.json(formattedTest)
  } catch (error) {
    console.error("Error fetching regression test:", error)
    return NextResponse.json({ error: "Failed to fetch regression test" }, { status: 500 })
  }
}

// PATCH update regression test
export async function PATCH(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const supabase = await createClient()
    const { testId } = await params
    const body = await request.json()

    const updateData: RegressionTestUpdatePayload = {
      updated_at: Date.now(),
    }

    if (body.gameId !== undefined) updateData.game_id = body.gameId
    if (body.testId !== undefined) updateData.test_id = body.testId
    if (body.testCaseDescription !== undefined) updateData.test_case_description = body.testCaseDescription
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.expectedResult !== undefined) updateData.expected_result = body.expectedResult
    if (body.actualResult !== undefined) updateData.actual_result = body.actualResult
    if (body.status !== undefined) updateData.status = body.status
    if (body.comments !== undefined) updateData.comments = body.comments

    const { error } = await supabase
      .from("regression_tests")
      .update(updateData)
      .eq("id", testId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating regression test:", error)
    return NextResponse.json({ error: "Failed to update regression test" }, { status: 500 })
  }
}

// DELETE regression test
export async function DELETE(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const supabase = await createClient()
    const { testId } = await params

    const { error } = await supabase
      .from("regression_tests")
      .delete()
      .eq("id", testId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting regression test:", error)
    return NextResponse.json({ error: "Failed to delete regression test" }, { status: 500 })
  }
}
