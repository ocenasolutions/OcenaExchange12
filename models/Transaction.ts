import mongoose from "mongoose"

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["buy", "sell", "deposit", "withdraw"],
      required: true,
    },
    symbol: {
      type: String,
      required: function () {
        return this.type === "buy" || this.type === "sell"
      },
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: function () {
        return this.type === "buy" || this.type === "sell"
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    txHash: String,
    fees: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema)

export default Transaction
