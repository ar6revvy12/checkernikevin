import { NextResponse } from "next/server"
import { createClient } from "@/lib/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
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

    const supabase = await createClient()

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

    // Create user - all users are in "Di Joker" team by default
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        name,
        user_type: userType,
        team: "Di Joker",
      })
      .select("id, email, name, user_type, team, created_at, updated_at")
      .single()

    if (error) {
      console.error("Failed to create user:", error)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Create session token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    const { error: sessionError } = await supabase.from("sessions").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Failed to create session:", sessionError)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
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

    // Set session cookie
    const response = NextResponse.json({ user: userData })
    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
