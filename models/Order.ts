import mongoose, { Schema, type Document } from "mongoose"

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId
  symbol: string
  side: "buy" | "sell"
  type: "market" | "limit" | "stop" | "stop_limit" | "oco"
  quantity: number
  price?: number
  stopPrice?: number
  timeInForce: "GTC" | "IOC" | "FOK"
  status: "pending" | "filled" | "cancelled" | "expired"
  executedQuantity: number
  executedPrice?: number
  createdAt: Date
  updatedAt: Date
}

const OrderSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  side: { type: String, enum: ["buy", "sell"], required: true },
  type: { type: String, enum: ["market", "limit", "stop", "stop_limit", "oco"], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number },
  stopPrice: { type: Number },
  timeInForce: { type: String, enum: ["GTC", "IOC", "FOK"], default: "GTC" },
  status: { type: String, enum: ["pending", "filled", "cancelled", "expired"], default: "pending" },
  executedQuantity: { type: Number, default: 0 },
  executedPrice: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
export default Order
