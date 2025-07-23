import { NextResponse, type NextRequest } from "next/server"
import nodemailer from "nodemailer"
import crypto from "crypto"
import dbConnect from "@/lib/db"
import OTP from "@/models/otp"

export async function POST(req: NextRequest) {
  const { email } = await req.json<{ email: string }>()
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  // Generate a secure 6-digit code
  const code = crypto.randomInt(100_000, 999_999).toString()

  // Store / overwrite OTP in DB (runtime only – ignored at build)
  await dbConnect()
  await OTP.findOneAndUpdate(
    { email },
    { email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1_000) },
    { upsert: true, new: true },
  )

  // Send the code with Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Ocena Exchange" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Ocena Exchange login code",
    text: `Your one-time login code is ${code}. It expires in 10 minutes.`,
  })

  return NextResponse.json({ ok: true })
}
