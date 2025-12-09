import { NextResponse } from "next/server"
import { createClient } from "@/lib/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (error) {
      console.error("Database error fetching user:", error)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user) {
      console.error("User not found:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is in Di Joker team
    if (user.team !== "Di Joker") {
      return NextResponse.json(
        { error: "Access denied. Only Di Joker team members can sign in." },
        { status: 403 }
      )
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
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
