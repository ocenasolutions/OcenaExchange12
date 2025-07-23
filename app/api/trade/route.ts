import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
import mongoose from "mongoose"
import { getServerSession } from "next-auth" // Import getServerSession
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // Import your authOptions

export async function POST(request: NextRequest) {
  await dbConnect()
  try {
    const session = await getServerSession(authOptions) // Get session on the server
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id // Get userId from session

    const { coinId, symbol, type, amount, price, total } = await request.json()

    if (!coinId || !symbol || !type || !amount || !price || !total) {
      return NextResponse.json({ error: "Missing required trade parameters" }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const sessionMongoose = await mongoose.startSession()
    sessionMongoose.startTransaction()

    try {
      // Create new transaction
      const newTransaction = await Transaction.create(
        [
          {
            userId: new mongoose.Types.ObjectId(userId),
            coinId,
            symbol,
            type,
            amount,
            price,
            total,
            date: new Date(),
          },
        ],
        { session: sessionMongoose },
      )

      // Update user's assets
      const existingAssetIndex = user.assets.findIndex((asset) => asset.coinId === coinId)

      if (type === "buy") {
        if (existingAssetIndex > -1) {
          const existingAsset = user.assets[existingAssetIndex]
          const newTotalAmount = existingAsset.amount + amount
          const newAvgPurchasePrice =
            (existingAsset.amount * existingAsset.avgPurchasePrice + amount * price) / newTotalAmount
          user.assets[existingAssetIndex] = {
            ...existingAsset,
            amount: newTotalAmount,
            avgPurchasePrice: newAvgPurchasePrice,
          }
        } else {
          user.assets.push({ coinId, symbol, amount, avgPurchasePrice: price })
        }
      } else if (type === "sell") {
        if (existingAssetIndex > -1) {
          const existingAsset = user.assets[existingAssetIndex]
          if (existingAsset.amount < amount) {
            throw new Error("Insufficient balance to sell")
          }
          existingAsset.amount -= amount
          if (existingAsset.amount === 0) {
            user.assets.splice(existingAssetIndex, 1) // Remove asset if amount becomes zero
          }
        } else {
          throw new Error("Asset not found in portfolio to sell")
        }
      }

      await user.save({ session: sessionMongoose })
      await sessionMongoose.commitTransaction()
      sessionMongoose.endSession()

      return NextResponse.json(
        {
          message: "Trade executed successfully",
          transaction: newTransaction[0],
          updatedAssets: user.assets,
        },
        { status: 200 },
      )
    } catch (transactionError: any) {
      await sessionMongoose.abortTransaction()
      sessionMongoose.endSession()
      console.error("Transaction failed:", transactionError)
      return NextResponse.json({ error: transactionError.message || "Trade execution failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Trade API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
