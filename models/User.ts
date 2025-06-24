import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  fullName: string
  mobileNo: string
  businessType: "Propatorship" | "Partnership" | "LLP" | "PVT LTD" | "Other"
  otherBusinessType?: string
  businessName: string
  password: string // Hashed password
  isMobileVerified: boolean

  // Profile completion fields - now storing URLs instead of booleans
  email: string
  emailVerified: boolean
  aadharCardUrl: string // Changed from aadharCardUploaded boolean
  panCardUrl: string // Changed from panCardUploaded boolean
  photographUrl: string // Changed from photographUploaded boolean
  proofOfAddressUrl: string // Changed from proofOfAddressUploaded boolean
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    mobileNo: { type: String, required: true, unique: true },
    businessType: {
      type: String,
      required: true,
      enum: ["Propatorship", "Partnership", "LLP", "PVT LTD", "Other"],
    },
    otherBusinessType: { type: String, required: false },
    businessName: { type: String, required: true },
    password: { type: String, required: true },
    isMobileVerified: { type: Boolean, default: false },

    // Profile completion fields - now storing URLs
    email: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    aadharCardUrl: { type: String, default: "" }, // URL to uploaded Aadhar card
    panCardUrl: { type: String, default: "" }, // URL to uploaded PAN card
    photographUrl: { type: String, default: "" }, // URL to uploaded photograph
    proofOfAddressUrl: { type: String, default: "" }, // URL to uploaded proof of address
  },
  { timestamps: true },
)

// Clear any existing model to avoid caching issues
if (mongoose.models.User) {
  delete mongoose.models.User
}

const User = mongoose.model<IUser>("User", UserSchema)

export default User
