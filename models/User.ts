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

  // Registration documents
  gstNumber: string
  gstCertificate: string // URL from Cloudinary
  iecNumber: string
  iecCertificate: string // URL from Cloudinary
  dscNumber: string
  dscCertificate: string // URL from Cloudinary
  icegateNumber: string
  icegateCertificate: string // URL from Cloudinary
  adcodeNumber: string
  adcodeCertificate: string // URL from Cloudinary

  // GST Registration Documents
  rentAgreementUrl: string
  electricityBillUrl: string
  nocUrl: string
  propertyProofUrl: string
  electricityBillOwnedUrl: string
  otherProofUrl: string

  // Business Entity Documents
  authorizationLetterUrl: string
  partnershipDeedUrl: string
  llpAgreementUrl: string
  certificateOfIncorporationUrl: string
  moaAoaUrl: string

  // Bank Documents
  cancelledChequeUrl: string

  // AD Code Specific Documents
  adCodeLetterFromBankUrl: string

  // Bank Document (for various registrations)
  bankDocumentUrl: string
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

    // Registration documents - Basic certificates
    gstNumber: { type: String, default: "" },
    gstCertificate: { type: String, default: "" }, // URL from Cloudinary
    iecNumber: { type: String, default: "" },
    iecCertificate: { type: String, default: "" }, // URL from Cloudinary
    dscNumber: { type: String, default: "" },
    dscCertificate: { type: String, default: "" }, // URL from Cloudinary
    icegateNumber: { type: String, default: "" },
    icegateCertificate: { type: String, default: "" }, // URL from Cloudinary
    adcodeNumber: { type: String, default: "" },
    adcodeCertificate: { type: String, default: "" }, // URL from Cloudinary

    // GST Registration Documents
    rentAgreementUrl: { type: String, default: "" },
    electricityBillUrl: { type: String, default: "" },
    nocUrl: { type: String, default: "" },
    propertyProofUrl: { type: String, default: "" },
    electricityBillOwnedUrl: { type: String, default: "" },
    otherProofUrl: { type: String, default: "" },

    // Business Entity Documents
    authorizationLetterUrl: { type: String, default: "" },
    partnershipDeedUrl: { type: String, default: "" },
    llpAgreementUrl: { type: String, default: "" },
    certificateOfIncorporationUrl: { type: String, default: "" },
    moaAoaUrl: { type: String, default: "" },

    // Bank Documents
    cancelledChequeUrl: { type: String, default: "" },

    // AD Code Specific Documents
    adCodeLetterFromBankUrl: { type: String, default: "" },

    // Bank Document (for various registrations)
    bankDocumentUrl: { type: String, default: "" },
  },
  { timestamps: true },
)

// Clear any existing model to avoid caching issues
if (mongoose.models.User) {
  delete mongoose.models.User
}

const User = mongoose.model<IUser>("User", UserSchema)

export default User
