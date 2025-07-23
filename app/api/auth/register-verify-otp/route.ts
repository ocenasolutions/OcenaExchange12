import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import OTP from "@/models/OTP"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, otp, firstName, lastName, password } = body

    if (!email || !otp || !firstName || !lastName || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: "registration",
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: true,
      wallets: [
        { currency: "USD", balance: 10000, address: "demo-usd-wallet" },
        { currency: "BTC", balance: 0, address: "demo-btc-wallet" },
        { currency: "ETH", balance: 0, address: "demo-eth-wallet" },
      ],
    })

    await user.save()

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id })

    return NextResponse.json({
      success: true,
      message: "Registration completed successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    console.error("Registration verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
