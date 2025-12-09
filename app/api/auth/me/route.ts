import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("user_id, expires_at")
      .eq("token", token)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name, user_type, team, created_at, updated_at")
      .eq("id", session.user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is in Di Joker team
    if (user.team !== "Di Joker") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Format user data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.user_type,
      team: user.team,
      createdAt: new Date(user.created_at).getTime(),
      updatedAt: new Date(user.updated_at).getTime(),
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
