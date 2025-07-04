import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IPurchasedService extends Document {
  userId: Types.ObjectId
  dashboardId: Types.ObjectId
  registrationType: string // e.g., "GST Registration", "IEC Code", "DSC Registration"
  registrationName: string // e.g., "Maurya Exports", "Vinayak Maurya"
  purchasedPrice: number
  purchasedAt: Date
  status: "pending" | "in-progress" | "completed" | "cancelled"
  notes?: string
}

const PurchasedServiceSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dashboardId: { type: Schema.Types.ObjectId, ref: "Dashboard", required: true },
    registrationType: { type: String, required: true },
    registrationName: { type: String, required: true },
    purchasedPrice: { type: Number, required: true, default: 0 },
    purchasedAt: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true },
)

const PurchasedService =
  (mongoose.models.PurchasedService as mongoose.Model<IPurchasedService>) ||
  mongoose.model<IPurchasedService>("PurchasedService", PurchasedServiceSchema)

export default PurchasedService
