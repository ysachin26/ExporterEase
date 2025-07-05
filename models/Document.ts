import mongoose, { Schema, type Document as MongoDocument, type Types } from "mongoose"

export enum DocumentType {
  // Identity Documents
  AADHAR_CARD = "aadharCard",
  PAN_CARD = "panCard",
  PHOTOGRAPH = "photograph",
  
  // Address Proof Documents
  PROOF_OF_ADDRESS = "proofOfAddress",
  RENT_AGREEMENT = "rentAgreement",
  ELECTRICITY_BILL = "electricityBill",
  ELECTRICITY_BILL_OWNED = "electricityBillOwned",
  NOC = "noc",
  PROPERTY_PROOF = "propertyProof",
  OTHER_PROOF = "otherProof",
  
  // Business Documents
  AUTHORIZATION_LETTER = "authorizationLetter",
  PARTNERSHIP_DEED = "partnershipDeed",
  LLP_AGREEMENT = "llpAgreement",
  CERTIFICATE_OF_INCORPORATION = "certificateOfIncorporation",
  MOA_AOA = "moaAoa",
  
  // Bank Documents
  CANCELLED_CHEQUE = "cancelledCheque",
  BANK_DOCUMENT = "bankDocument",
  AD_CODE_LETTER_FROM_BANK = "adCodeLetterFromBank",
  
  // Registration Certificates
  GST_CERTIFICATE = "gstCertificate",
  IEC_CERTIFICATE = "iecCertificate",
  DSC_CERTIFICATE = "dscCertificate",
  ICEGATE_CERTIFICATE = "icegateCertificate",
  ADCODE_CERTIFICATE = "adcodeCertificate"
}

export enum DocumentStatus {
  PENDING = "pending",
  UPLOADED = "uploaded",
  VERIFIED = "verified",
  REJECTED = "rejected",
  EXPIRED = "expired"
}

export enum DocumentCategory {
  PROFILE = "profile",
  BUSINESS = "business",
  REGISTRATION = "registration",
  COMPLIANCE = "compliance"
}

interface DocumentMetadata {
  fileSize: number
  mimeType: string
  originalFilename: string
  cloudinaryPublicId?: string
  uploadedByIP?: string
  uploadSource: "web" | "mobile" | "api"
}

export interface IDocument extends MongoDocument {
  // Ownership
  userId: Types.ObjectId
  dashboardId?: Types.ObjectId
  
  // Document identification
  type: DocumentType
  category: DocumentCategory
  name: string
  description?: string
  
  // File information
  url: string
  metadata: DocumentMetadata
  
  // Status tracking
  status: DocumentStatus
  statusHistory: Array<{
    status: DocumentStatus
    changedAt: Date
    changedBy?: Types.ObjectId
    reason?: string
    notes?: string
  }>
  
  // Verification details
  verifiedAt?: Date
  verifiedBy?: Types.ObjectId
  rejectedAt?: Date
  rejectionReason?: string
  
  // Expiry handling (for time-sensitive documents)
  expiresAt?: Date
  isExpired: boolean
  
  // Related documents (for grouping)
  relatedTo?: Types.ObjectId[]
  tags?: string[]
  
  // Methods
  updateStatus(status: DocumentStatus, reason?: string, notes?: string): void
  isValid(): boolean
  getPublicUrl(): string
}

const DocumentMetadataSchema = new Schema({
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  originalFilename: { type: String, required: true },
  cloudinaryPublicId: { type: String },
  uploadedByIP: { type: String },
  uploadSource: { 
    type: String, 
    enum: ["web", "mobile", "api"], 
    default: "web" 
  }
}, { _id: false })

const StatusHistorySchema = new Schema({
  status: { 
    type: String, 
    enum: Object.values(DocumentStatus), 
    required: true 
  },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reason: { type: String },
  notes: { type: String, maxlength: 500 }
}, { _id: false })

const DocumentSchema: Schema = new Schema(
  {
    // Ownership
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },
    dashboardId: { 
      type: Schema.Types.ObjectId, 
      ref: "Dashboard",
      index: true
    },
    
    // Document identification
    type: { 
      type: String, 
      enum: Object.values(DocumentType), 
      required: true,
      index: true
    },
    category: { 
      type: String, 
      enum: Object.values(DocumentCategory), 
      required: true,
      index: true
    },
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200
    },
    description: { 
      type: String, 
      maxlength: 500 
    },
    
    // File information
    url: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v)
        },
        message: "URL must be a valid HTTP/HTTPS URL"
      }
    },
    metadata: {
      type: DocumentMetadataSchema,
      required: true
    },
    
    // Status tracking
    status: { 
      type: String, 
      enum: Object.values(DocumentStatus), 
      default: DocumentStatus.UPLOADED,
      index: true
    },
    statusHistory: [StatusHistorySchema],
    
    // Verification details
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, maxlength: 300 },
    
    // Expiry handling
    expiresAt: { type: Date },
    
    // Related documents and tags
    relatedTo: [{ type: Schema.Types.ObjectId, ref: "Document" }],
    tags: [{ type: String, maxlength: 50 }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Instance Methods
DocumentSchema.methods.updateStatus = function(
  status: DocumentStatus, 
  reason?: string, 
  notes?: string
): void {
  const oldStatus = this.status
  this.status = status
  
  // Add to status history
  this.statusHistory.push({
    status,
    changedAt: new Date(),
    reason,
    notes
  })
  
  // Update verification/rejection timestamps
  if (status === DocumentStatus.VERIFIED && oldStatus !== DocumentStatus.VERIFIED) {
    this.verifiedAt = new Date()
  } else if (status === DocumentStatus.REJECTED && oldStatus !== DocumentStatus.REJECTED) {
    this.rejectedAt = new Date()
    this.rejectionReason = reason
  }
}

DocumentSchema.methods.isValid = function(): boolean {
  if (this.status === DocumentStatus.REJECTED || this.status === DocumentStatus.PENDING) {
    return false
  }
  
  if (this.expiresAt && this.expiresAt < new Date()) {
    return false
  }
  
  return this.status === DocumentStatus.VERIFIED || this.status === DocumentStatus.UPLOADED
}

DocumentSchema.methods.getPublicUrl = function(): string {
  // Could implement signed URLs or thumbnail generation here
  return this.url
}

// Virtual for expiry check
DocumentSchema.virtual('isExpired').get(function() {
  return this.expiresAt ? this.expiresAt < new Date() : false
})

// Pre-save middleware
DocumentSchema.pre('save', function(next) {
  // Auto-set category based on document type
  if (!this.category) {
    if ([DocumentType.AADHAR_CARD, DocumentType.PAN_CARD, DocumentType.PHOTOGRAPH].includes(this.type)) {
      this.category = DocumentCategory.PROFILE
    } else if ([DocumentType.GST_CERTIFICATE, DocumentType.IEC_CERTIFICATE, DocumentType.DSC_CERTIFICATE].includes(this.type)) {
      this.category = DocumentCategory.REGISTRATION
    } else if ([DocumentType.AUTHORIZATION_LETTER, DocumentType.PARTNERSHIP_DEED].includes(this.type)) {
      this.category = DocumentCategory.BUSINESS
    } else {
      this.category = DocumentCategory.COMPLIANCE
    }
  }
  
  // Ensure status history has initial entry
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    })
  }
  
  next()
})

// Indexes for better performance
DocumentSchema.index({ userId: 1, type: 1 }, { unique: false })
DocumentSchema.index({ userId: 1, category: 1 })
DocumentSchema.index({ userId: 1, status: 1 })
DocumentSchema.index({ type: 1, status: 1 })
DocumentSchema.index({ category: 1, status: 1 })
DocumentSchema.index({ createdAt: -1 })
DocumentSchema.index({ expiresAt: 1 }, { sparse: true })
DocumentSchema.index({ verifiedAt: -1 }, { sparse: true })

// Compound indexes for common queries
DocumentSchema.index({ userId: 1, type: 1, status: 1 })
DocumentSchema.index({ userId: 1, category: 1, status: 1 })

// Text index for search
DocumentSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
})

// Static methods
DocumentSchema.statics.getDocumentsByUser = function(userId: string, category?: DocumentCategory) {
  const query: any = { userId: new mongoose.Types.ObjectId(userId) }
  if (category) {
    query.category = category
  }
  return this.find(query).sort({ createdAt: -1 })
}

DocumentSchema.statics.getValidDocuments = function(userId: string, documentType: DocumentType) {
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    type: documentType,
    status: { $in: [DocumentStatus.UPLOADED, DocumentStatus.VERIFIED] },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ createdAt: -1 })
}

const Document = mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema)

export default Document
