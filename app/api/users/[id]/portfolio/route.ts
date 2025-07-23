import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { getServerSession } from "next-auth" // Import getServerSession
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // Import your authOptions

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect()
  try {
    const session = await getServerSession(authOptions) // Get session on the server
    if (!session || session.user?.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    const user = await User.findById(userId).select("assets")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ assets: user.assets }, { status: 200 })
  } catch (error) {
    console.error("Error fetching user portfolio:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
