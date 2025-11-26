import { NextResponse } from "next/server"
import { createClient } from "@/lib/server"

export async function POST() {
  return NextResponse.json({ success: true })
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test database connection
    const { data, error } = await supabase
      .from('games')
      .select('count')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        connected: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      connected: true, 
      message: "Database connection successful" 
    })
  } catch (error) {
    return NextResponse.json({ 
      connected: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
