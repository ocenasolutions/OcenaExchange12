import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import Transaction from "@/models/Transaction"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { symbol, type, amount, price } = await request.json()

    if (!symbol || !type || !amount || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const total = amount * price

    if (type === "buy") {
      // Check if user has enough balance
      if (user.balance < total) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
      }

      // Update user balance
      user.balance -= total

      // Update portfolio
      const existingHolding = user.portfolio.find((p) => p.symbol === symbol)
      if (existingHolding) {
        const newAmount = existingHolding.amount + amount
        const newAvgPrice = (existingHolding.avgPurchasePrice * existingHolding.amount + total) / newAmount
        existingHolding.amount = newAmount
        existingHolding.avgPurchasePrice = newAvgPrice
      } else {
        user.portfolio.push({
          coinId: symbol.toLowerCase(),
          symbol,
          amount,
          avgPurchasePrice: price,
        })
      }
    } else if (type === "sell") {
      // Check if user has enough of the asset
      const holding = user.portfolio.find((p) => p.symbol === symbol)
      if (!holding || holding.amount < amount) {
        return NextResponse.json({ error: "Insufficient holdings" }, { status: 400 })
      }

      // Update user balance
      user.balance += total

      // Update portfolio
      holding.amount -= amount
      if (holding.amount === 0) {
        user.portfolio = user.portfolio.filter((p) => p.symbol !== symbol)
      }
    }

    // Add transaction to user's transaction history
    user.transactions.push({
      coinId: symbol.toLowerCase(),
      symbol,
      type,
      amount,
      price,
      total,
      date: new Date(),
    })

    // Save user
    await user.save()

    // Create separate transaction record
    const transaction = new Transaction({
      userId: user._id,
      coinId: symbol.toLowerCase(),
      symbol,
      type,
      amount,
      price,
      total,
    })

    await transaction.save()

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction._id,
        symbol,
        type,
        amount,
        price,
        total,
        date: transaction.date,
      },
      newBalance: user.balance,
    })
  } catch (error) {
    console.error("Order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(50)

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Orders API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
