import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { ethers } from "ethers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect()
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(params.id).select("wallets")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't expose private keys
    const wallets = user.wallets.map((wallet) => ({
      address: wallet.address,
      balance: wallet.balance,
      network: wallet.network,
    }))

    return NextResponse.json({ wallets }, { status: 200 })
  } catch (error) {
    console.error("Error fetching wallets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect()
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { network } = await request.json()

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom()
    const address = wallet.address
    const privateKey = wallet.privateKey

    // In production, encrypt the private key
    const encryptedPrivateKey = privateKey // TODO: Implement encryption

    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.wallets.push({
      address,
      privateKey: encryptedPrivateKey,
      balance: 0,
      network: network || "ethereum",
    })

    await user.save()

    return NextResponse.json(
      {
        message: "Wallet generated successfully",
        wallet: {
          address,
          balance: 0,
          network: network || "ethereum",
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error generating wallet:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
