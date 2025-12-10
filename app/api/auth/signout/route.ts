import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/server"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (token) {
      const supabase = await createClient()

      // Delete session from database
      await supabase.from("sessions").delete().eq("token", token)
    }

    // Clear session cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete("session_token")

    return response
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
