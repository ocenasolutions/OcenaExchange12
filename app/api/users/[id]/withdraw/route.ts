import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import Transaction from "@/models/Transaction"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const userId = params.id
    const body = await request.json()
    const { amount, currency, address } = body

    if (!amount || !currency || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find user's wallet for the currency
    const wallet = user.wallets.find((w) => w.currency === currency)
    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Create withdrawal transaction
    const transaction = new Transaction({
      userId,
      type: "withdraw",
      amount,
      currency,
      status: "pending",
    })

    await transaction.save()

    // Update wallet balance
    wallet.balance -= amount
    await user.save()

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      transaction: {
        id: transaction._id,
        amount,
        currency,
        status: "pending",
        timestamp: transaction.createdAt,
      },
    })
  } catch (error) {
    console.error("Withdrawal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
