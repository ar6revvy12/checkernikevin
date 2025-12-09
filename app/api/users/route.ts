import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/server"
import bcrypt from "bcryptjs"

// GET - Fetch all users (admin only)
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabase = await createClient()

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

    // Fetch all users
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, name, user_type, team, created_at")
      .eq("team", "Di Joker")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Format user data
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.user_type,
      team: user.team,
      createdAt: new Date(user.created_at).getTime(),
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new user (admin only)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabase = await createClient()

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

    const { email, password, name, userType } = await request.json()

    // Validate input
    if (!email || !password || !name || !userType) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Validate user type
    const validUserTypes = ["admin", "quality-assurance", "backend", "game-developer", "team"]
    if (!validUserTypes.includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        name,
        user_type: userType,
        team: "Di Joker",
      })
      .select("id, email, name, user_type, team, created_at")
      .single()

    if (error) {
      console.error("Failed to create user:", error)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
