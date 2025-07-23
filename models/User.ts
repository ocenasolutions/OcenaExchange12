import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    wallets: [
      {
        currency: String,
        balance: {
          type: Number,
          default: 0,
        },
        address: String,
      },
    ],
    portfolio: [
      {
        symbol: String,
        quantity: Number,
        averagePrice: Number,
        currentPrice: Number,
      },
    ],
    transactions: [
      {
        type: {
          type: String,
          enum: ["buy", "sell", "deposit", "withdraw"],
        },
        symbol: String,
        quantity: Number,
        price: Number,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User
