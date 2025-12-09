import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/server"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabase = createClient()

    // Get current user from session
    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", token)
      .single()

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { data: currentUser } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", session.user_id)
      .single()

    // Check if user is admin
    if (!currentUser || currentUser.user_type !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Prevent deleting yourself
    if (session.user_id === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user (sessions will be deleted automatically due to CASCADE)
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Failed to delete user:", error)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
