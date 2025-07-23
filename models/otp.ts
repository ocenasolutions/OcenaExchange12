import mongoose, { Schema, type Document } from "mongoose"

export interface IOTP extends Document {
  email: string
  code: string
  expiresAt: Date
  userData?: {
    firstName: string
    lastName: string
    email: string
    password: string
  }
  createdAt: Date
}

const OTPSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    userData: {
      firstName: String,
      lastName: String,
      email: String,
      password: String,
    },
  },
  {
    timestamps: true,
  },
)

// Auto-delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema)
