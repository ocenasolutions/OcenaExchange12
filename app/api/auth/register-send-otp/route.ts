import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import OTP from "@/models/otp"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() })

    // Store OTP with user data
    await OTP.create({
      email: email.toLowerCase(),
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      userData: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    })

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - Ocena Exchange",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f59e0b; margin: 0;">Ocena Exchange</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 8px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p style="color: #666; margin-bottom: 30px;">Hi ${firstName}, please use the verification code below to complete your registration:</p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #f59e0b; letter-spacing: 8px;">${otpCode}</div>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This code will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>&copy; 2024 Ocena Exchange. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      {
        message: "Verification code sent to your email",
        email: email.toLowerCase(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Register send OTP error:", error)
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
  }
}
