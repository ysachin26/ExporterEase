import mongoose, { Schema, type Document } from "mongoose"

// Enums for better type safety
export enum BusinessType {
  PROPRIETORSHIP = "Proprietorship",
  PARTNERSHIP = "Partnership", 
  LLP = "LLP",
  PVT_LTD = "PVT LTD",
  OTHER = "Other"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification"
}

// Address interface for structured address data
interface Address {
  street: string
  city: string
  state: string
  pincode: string
  country: string
}

// Contact information interface
interface ContactInfo {
  email: string
  emailVerified: boolean
  mobileNo: string
  isMobileVerified: boolean
  alternatePhone?: string
}

// Business information interface
interface BusinessInfo {
  name: string
  type: BusinessType
  otherType?: string
  description?: string
  address?: Address
  gstNumber?: string
  panNumber?: string
  incorporationDate?: Date
}

// Bank details interface
interface BankDetails {
  accountNumber?: string
  bankName?: string
  branchName?: string
  ifscCode?: string
  accountHolderName?: string
}

// User preferences interface
interface UserPreferences {
  language: string
  notifications: boolean
  theme: string
}

export interface IUser extends Document {
  // Basic Information
  fullName: string
  mobileNo: string
  email: string
  emailVerified: boolean
  password: string // Hashed password
  isMobileVerified: boolean
  status: UserStatus
  
  // Business Information
  businessType: BusinessType
  otherBusinessType?: string
  businessName: string
  businessDescription?: string
  businessAddress?: string
  
  // User preferences
  preferences: UserPreferences
  
  // Metadata
  lastLoginAt?: Date
  loginCount: number
  
  // Methods
  calculateProfileCompletion(): number
  getDocumentUrl(documentType: string): string
  updateLastLogin(): void
}

// User Preferences Schema
const PreferencesSchema = new Schema({
  language: { type: String, default: "en" },
  notifications: { type: Boolean, default: true },
  theme: { type: String, default: "light", enum: ["light", "dark"] }
}, { _id: false })

const UserSchema: Schema = new Schema(
  {
    // Basic Information
    fullName: { 
      type: String, 
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"]
    },
    mobileNo: { 
      type: String, 
      required: [true, "Mobile number is required"],
      unique: true,
      validate: {
        validator: function(v: string) {
          return /^[+]?[1-9][\d]{9,14}$/.test(v)
        },
        message: "Please enter a valid mobile number"
      }
    },
    email: { 
      type: String, 
      default: "",
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: "Please enter a valid email address"
      }
    },
    emailVerified: { type: Boolean, default: false },
    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"]
    },
    isMobileVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING_VERIFICATION
    },

    // Business Information
    businessType: {
      type: String,
      required: [true, "Business type is required"],
      enum: Object.values(BusinessType)
    },
    otherBusinessType: { 
      type: String,
      validate: {
        validator: function(this: IUser, v: string) {
          return this.businessType !== BusinessType.OTHER || (v && v.trim().length > 0)
        },
        message: "Other business type is required when business type is 'Other'"
      }
    },
    businessName: { 
      type: String, 
      required: [true, "Business name is required"],
      trim: true,
      maxlength: [200, "Business name cannot exceed 200 characters"]
    },
    businessDescription: {
      type: String,
      maxlength: [500, "Business description cannot exceed 500 characters"]
    },
    businessAddress: {
      type: String,
      maxlength: [300, "Business address cannot exceed 300 characters"]
    },

    // User preferences
    preferences: {
      type: PreferencesSchema,
      default: () => ({
        language: "en",
        notifications: true,
        theme: "light"
      })
    },

    // Metadata
    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 },

    // Legacy fields for backward compatibility (will be migrated)
    aadharCardUrl: { type: String, default: "" },
    panCardUrl: { type: String, default: "" },
    photographUrl: { type: String, default: "" },
    proofOfAddressUrl: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    gstCertificate: { type: String, default: "" },
    iecNumber: { type: String, default: "" },
    iecCertificate: { type: String, default: "" },
    dscNumber: { type: String, default: "" },
    dscCertificate: { type: String, default: "" },
    icegateNumber: { type: String, default: "" },
    icegateCertificate: { type: String, default: "" },
    adcodeNumber: { type: String, default: "" },
    adcodeCertificate: { type: String, default: "" },
    rentAgreementUrl: { type: String, default: "" },
    electricityBillUrl: { type: String, default: "" },
    nocUrl: { type: String, default: "" },
    propertyProofUrl: { type: String, default: "" },
    electricityBillOwnedUrl: { type: String, default: "" },
    otherProofUrl: { type: String, default: "" },
    authorizationLetterUrl: { type: String, default: "" },
    partnershipDeedUrl: { type: String, default: "" },
    llpAgreementUrl: { type: String, default: "" },
    certificateOfIncorporationUrl: { type: String, default: "" },
    moaAoaUrl: { type: String, default: "" },
    cancelledChequeUrl: { type: String, default: "" },
    adCodeLetterFromBankUrl: { type: String, default: "" },
    bankDocumentUrl: { type: String, default: "" }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Instance Methods
UserSchema.methods.calculateProfileCompletion = function(): number {
  let completed = 0
  let total = 10

  // Basic details (4 fields)
  if (this.fullName && this.fullName.trim()) completed++
  if (this.mobileNo && this.mobileNo.trim()) completed++
  if (this.email && this.email.trim()) completed++
  if (this.emailVerified) completed++
  
  // Business details (2 fields)
  if (this.businessName && this.businessName.trim()) completed++
  if (this.businessType) completed++
  
  // Essential documents (4 fields)
  if (this.aadharCardUrl) completed++
  if (this.panCardUrl) completed++
  if (this.photographUrl) completed++
  if (this.proofOfAddressUrl) completed++

  const percentage = Math.round((completed / total) * 100)
  
  return percentage
}

UserSchema.methods.getDocumentUrl = function(documentType: string): string {
  // Direct field mapping
  const fieldMapping: { [key: string]: string } = {
    'aadharCard': this.aadharCardUrl,
    'panCard': this.panCardUrl,
    'photograph': this.photographUrl,
    'proofOfAddress': this.proofOfAddressUrl,
    'gstCertificate': this.gstCertificate,
    'iecCertificate': this.iecCertificate,
    'dscCertificate': this.dscCertificate,
    'authorizationLetter': this.authorizationLetterUrl,
    'cancelledCheque': this.cancelledChequeUrl,
    'bankDocument': this.bankDocumentUrl
  }
  
  return fieldMapping[documentType] || ''
}

UserSchema.methods.updateLastLogin = function(): void {
  this.lastLoginAt = new Date()
  this.loginCount = (this.loginCount || 0) + 1
}

// Pre-save middleware to update profile completion
UserSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.calculateProfileCompletion()
  }
  next()
})

// Indexes for better query performance
UserSchema.index({ mobileNo: 1 }, { unique: true })
UserSchema.index({ email: 1 }, { sparse: true })
UserSchema.index({ businessType: 1 })
UserSchema.index({ status: 1 })
UserSchema.index({ createdAt: -1 })
UserSchema.index({ lastLoginAt: -1 })

// Compound indexes
UserSchema.index({ businessType: 1, status: 1 })
UserSchema.index({ emailVerified: 1, isMobileVerified: 1 })

// Text index for search functionality
UserSchema.index({
  fullName: 'text',
  businessName: 'text',
  email: 'text'
})

// Virtual for full profile completion status
UserSchema.virtual('isProfileComplete').get(function() {
  return this.calculateProfileCompletion() === 100
})

// Virtual for display name
UserSchema.virtual('displayName').get(function() {
  return this.businessName || this.fullName
})

// Clear any existing model to avoid caching issues
if (mongoose.models.User) {
  delete mongoose.models.User
}

const User = mongoose.model<IUser>("User", UserSchema)

export default User
