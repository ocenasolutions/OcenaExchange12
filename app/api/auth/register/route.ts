import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/db"
import User from "@/models/User"

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(request: NextRequest) {
  await dbConnect()
  try {
    const { firstName, lastName, email, password } = await request.json()

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      assets: [], // Initialize with empty assets
    })

    // Send welcome email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Ocena Exchange!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Ocena Exchange!</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <h2>Hello ${firstName} ${lastName},</h2>
            <p>Thank you for joining Ocena Exchange! Your account has been successfully created.</p>
            <p>You can now:</p>
            <ul>
              <li>Trade cryptocurrencies with real-time market data</li>
              <li>Access advanced trading tools</li>
              <li>Monitor your portfolio</li>
              <li>Earn rewards through our staking programs</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
                 style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Start Trading Now
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
          <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>&copy; 2024 Ocena Exchange. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      {
        message: "Account created successfully! Please check your email for confirmation.",
        user: { id: newUser._id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
