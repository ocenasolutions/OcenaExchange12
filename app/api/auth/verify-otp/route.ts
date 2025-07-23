import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import dbConnect from "@/lib/db"
import OTP from "@/models/otp"
import User from "@/models/User"

export async function POST(request: NextRequest) {
  await dbConnect()
  try {
    const { email, otp } = await request.json()

    // Validate input
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email, code: otp })

    // Check if OTP exists and is valid
    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 })
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id })
      return NextResponse.json({ error: "OTP has expired" }, { status: 401 })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id })

    // TODO: issue a session / JWT here.
    // For the stub we only return ok:true
    const token = crypto.randomBytes(32).toString("hex")

    return NextResponse.json({ ok: true, token })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
