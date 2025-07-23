import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Transaction from "@/models/Transaction"
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

    const transactions = await Transaction.find({ userId }).sort({ date: -1 })

    return NextResponse.json({ transactions }, { status: 200 })
  } catch (error) {
    console.error("Error fetching user transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
