import { connectDB } from './db'
import User from '@/models/User'
import Dashboard from '@/models/Dashboard'
import Document, { DocumentType, DocumentStatus, DocumentCategory } from '@/models/Document'
import mongoose from 'mongoose'

// Document field mapping for User model
export const USER_DOCUMENT_FIELD_MAP: Record<string, string> = {
  // Profile documents
  aadharCard: "aadharCardUrl",
  panCard: "panCardUrl",
  photograph: "photographUrl",
  proofOfAddress: "proofOfAddressUrl",

  // Registration certificates
  gstCertificate: "gstCertificate",
  iecCertificate: "iecCertificate",
  dscCertificate: "dscCertificate",
  icegateCertificate: "icegateCertificate",
  adcodeCertificate: "adcodeCertificate",

  // GST Registration Documents
  rentAgreement: "rentAgreementUrl",
  electricityBill: "electricityBillUrl",
  noc: "nocUrl",
  propertyProof: "propertyProofUrl",
  electricityBillOwned: "electricityBillOwnedUrl",
  otherProof: "otherProofUrl",

  // Business Entity Documents
  authorizationLetter: "authorizationLetterUrl",
  partnershipDeed: "partnershipDeedUrl",
  llpAgreement: "llpAgreementUrl",
  certificateOfIncorporation: "certificateOfIncorporationUrl",
  moaAoa: "moaAoaUrl",

  // Bank Documents
  cancelledCheque: "cancelledChequeUrl",
  bankDocument: "bankDocumentUrl",
  adCodeLetterFromBank: "adCodeLetterFromBankUrl",
}

// Documents required for each registration step
export const STEP_REQUIRED_DOCUMENTS: Record<number, string[]> = {
  2: [ // GST Registration
    "panCard", "aadharCard", "photograph", "proofOfAddress",
    "authorizationLetter", "partnershipDeed", "llpAgreement",
    "certificateOfIncorporation", "moaAoa", "cancelledCheque",
    "rentAgreement", "electricityBill", "noc", "propertyProof",
    "electricityBillOwned", "otherProof"
  ],
  3: [ // IEC Code
    "panCard", "aadharCard", "photograph", "proofOfAddress",
    "authorizationLetter", "partnershipDeed", "llpAgreement",
    "certificateOfIncorporation", "moaAoa", "cancelledCheque"
  ],
  4: [ // DSC Registration
    "panCard", "aadharCard", "photograph", "proofOfAddress",
    "authorizationLetter"
  ],
  5: [ // ICEGATE Registration
    "panCard", "aadharCard", "photograph", "proofOfAddress",
    "iecCertificate", "dscCertificate", "authorizationLetter",
    "bankDocument"
  ],
  6: [ // AD Code
    "panCard", "aadharCard", "photograph", "proofOfAddress",
    "iecCertificate", "dscCertificate", "adCodeLetterFromBank",
    "authorizationLetter", "cancelledCheque"
  ]
}

// Profile documents that should not be stored in dashboard steps
export const PROFILE_DOCUMENT_TYPES = ["aadharCard", "panCard", "photograph", "proofOfAddress"]

/**
 * Get document URL from User model or new Document model
 */
export async function getDocumentUrl(userId: string, documentType: DocumentType): Promise<string> {
  await connectDB()
  
  // First check new Document model
  const document = await Document.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    type: documentType,
    status: { $in: [DocumentStatus.UPLOADED, DocumentStatus.VERIFIED] }
  }).sort({ createdAt: -1 })
  
  if (document) {
    return document.url
  }
  
  // Fallback to User model
  const user = await User.findById(userId)
  if (user) {
    const fieldName = USER_DOCUMENT_FIELD_MAP[documentType]
    if (fieldName) {
      return (user as any)[fieldName] || ''
    }
  }
  
  return ''
}

/**
 * Save document to both User model (for backwards compatibility) and new Document model
 */
export async function saveDocument({
  userId,
  dashboardId,
  documentType,
  url,
  metadata,
  stepId
}: {
  userId: string
  dashboardId?: string
  documentType: string
  url: string
  metadata: {
    fileSize: number
    mimeType: string
    originalFilename: string
    cloudinaryPublicId?: string
    uploadedByIP?: string
    uploadSource?: "web" | "mobile" | "api"
  }
  stepId?: number
}): Promise<{ success: boolean; message: string }> {
  await connectDB()
  
  try {
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: "User not found" }
    }
    
    // Save to User model (backwards compatibility)
    const userFieldName = USER_DOCUMENT_FIELD_MAP[documentType]
    if (userFieldName) {
      (user as any)[userFieldName] = url
      await user.save()
    }
    
    // Save to new Document model
    const documentCategory = getDocumentCategory(documentType as DocumentType)
    
    const newDocument = new Document({
      userId: new mongoose.Types.ObjectId(userId),
      dashboardId: dashboardId ? new mongoose.Types.ObjectId(dashboardId) : undefined,
      type: documentType as DocumentType,
      category: documentCategory,
      name: getDocumentDisplayName(documentType as DocumentType),
      url,
      metadata: {
        ...metadata,
        uploadSource: metadata.uploadSource || "web"
      },
      status: DocumentStatus.UPLOADED
    })
    
    await newDocument.save()
    
    // Update Dashboard if it's a registration document and stepId is provided
    if (stepId && !PROFILE_DOCUMENT_TYPES.includes(documentType)) {
      const dashboard = await Dashboard.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      if (dashboard) {
        const step = dashboard.registrationSteps.find((s: any) => s.id === stepId)
        if (step) {
          const docEntry = step.documents.find((d: any) => d.name === documentType)
          if (docEntry) {
            docEntry.url = url
            docEntry.uploadedAt = new Date()
            docEntry.status = "uploaded"
          } else {
            step.documents.push({
              name: documentType,
              url,
              uploadedAt: new Date(),
              status: "uploaded"
            })
          }
          await dashboard.save()
        }
      }
    }
    
    return { success: true, message: "Document saved successfully" }
  } catch (error: any) {
    console.error("Error saving document:", error)
    return { success: false, message: `Failed to save document: ${error.message}` }
  }
}

/**
 * Get all documents for a user, organized by category
 */
export async function getUserDocuments(userId: string) {
  await connectDB()
  
  const documents = await Document.find({ 
    userId: new mongoose.Types.ObjectId(userId) 
  }).sort({ createdAt: -1 })
  
  // Group by category
  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<DocumentCategory, typeof documents>)
  
  return groupedDocuments
}

/**
 * Get documents required for a specific registration step
 */
export async function getStepDocuments(userId: string, stepId: number) {
  await connectDB()
  
  const requiredDocs = STEP_REQUIRED_DOCUMENTS[stepId] || []
  const documents = []
  
  for (const docType of requiredDocs) {
    const url = await getDocumentUrl(userId, docType as DocumentType)
    documents.push({
      type: docType,
      url,
      status: url ? DocumentStatus.UPLOADED : DocumentStatus.PENDING,
      required: true
    })
  }
  
  return documents
}

/**
 * Check if user has all required documents for a step
 */
export async function hasRequiredDocuments(userId: string, stepId: number): Promise<boolean> {
  const requiredDocs = STEP_REQUIRED_DOCUMENTS[stepId] || []
  
  for (const docType of requiredDocs) {
    const url = await getDocumentUrl(userId, docType as DocumentType)
    if (!url) {
      return false
    }
  }
  
  return true
}

/**
 * Get document category based on document type
 */
export function getDocumentCategory(documentType: DocumentType): DocumentCategory {
  if ([DocumentType.AADHAR_CARD, DocumentType.PAN_CARD, DocumentType.PHOTOGRAPH].includes(documentType)) {
    return DocumentCategory.PROFILE
  } else if ([
    DocumentType.GST_CERTIFICATE, 
    DocumentType.IEC_CERTIFICATE, 
    DocumentType.DSC_CERTIFICATE,
    DocumentType.ICEGATE_CERTIFICATE,
    DocumentType.ADCODE_CERTIFICATE
  ].includes(documentType)) {
    return DocumentCategory.REGISTRATION
  } else if ([
    DocumentType.AUTHORIZATION_LETTER, 
    DocumentType.PARTNERSHIP_DEED,
    DocumentType.CERTIFICATE_OF_INCORPORATION
  ].includes(documentType)) {
    return DocumentCategory.BUSINESS
  } else {
    return DocumentCategory.COMPLIANCE
  }
}

/**
 * Get human-readable display name for document type
 */
export function getDocumentDisplayName(documentType: DocumentType): string {
  const displayNames: Record<DocumentType, string> = {
    [DocumentType.AADHAR_CARD]: "Aadhar Card",
    [DocumentType.PAN_CARD]: "PAN Card",
    [DocumentType.PHOTOGRAPH]: "Photograph",
    [DocumentType.PROOF_OF_ADDRESS]: "Proof of Address",
    [DocumentType.RENT_AGREEMENT]: "Rent Agreement",
    [DocumentType.ELECTRICITY_BILL]: "Electricity Bill",
    [DocumentType.ELECTRICITY_BILL_OWNED]: "Electricity Bill (Owned)",
    [DocumentType.NOC]: "NOC",
    [DocumentType.PROPERTY_PROOF]: "Property Proof",
    [DocumentType.OTHER_PROOF]: "Other Proof",
    [DocumentType.AUTHORIZATION_LETTER]: "Authorization Letter",
    [DocumentType.PARTNERSHIP_DEED]: "Partnership Deed",
    [DocumentType.LLP_AGREEMENT]: "LLP Agreement",
    [DocumentType.CERTIFICATE_OF_INCORPORATION]: "Certificate of Incorporation",
    [DocumentType.MOA_AOA]: "MOA/AOA",
    [DocumentType.CANCELLED_CHEQUE]: "Cancelled Cheque",
    [DocumentType.BANK_DOCUMENT]: "Bank Document",
    [DocumentType.AD_CODE_LETTER_FROM_BANK]: "AD Code Letter from Bank",
    [DocumentType.GST_CERTIFICATE]: "GST Certificate",
    [DocumentType.IEC_CERTIFICATE]: "IEC Certificate",
    [DocumentType.DSC_CERTIFICATE]: "DSC Certificate",
    [DocumentType.ICEGATE_CERTIFICATE]: "ICEGATE Certificate",
    [DocumentType.ADCODE_CERTIFICATE]: "AD Code Certificate"
  }
  
  return displayNames[documentType] || documentType
}

/**
 * Migrate legacy documents to new Document model
 */
export async function migrateLegacyDocuments(userId: string) {
  await connectDB()
  
  const user = await User.findById(userId)
  if (!user) {
    throw new Error("User not found")
  }
  
  const documentsToMigrate = []
  
  // Check each document field in User model
  for (const [docType, fieldName] of Object.entries(USER_DOCUMENT_FIELD_MAP)) {
    const url = (user as any)[fieldName]
    if (url) {
      // Check if already exists in Document model
      const existingDoc = await Document.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        type: docType as DocumentType
      })
      
      if (!existingDoc) {
        documentsToMigrate.push({
          type: docType as DocumentType,
          url,
          fieldName
        })
      }
    }
  }
  
  // Create Document entries for legacy documents
  for (const docInfo of documentsToMigrate) {
    const category = getDocumentCategory(docInfo.type)
    const name = getDocumentDisplayName(docInfo.type)
    
    const newDocument = new Document({
      userId: new mongoose.Types.ObjectId(userId),
      type: docInfo.type,
      category,
      name,
      url: docInfo.url,
      metadata: {
        fileSize: 0, // Unknown for legacy documents
        mimeType: "unknown",
        originalFilename: "legacy_document",
        uploadSource: "web"
      },
      status: DocumentStatus.UPLOADED
    })
    
    await newDocument.save()
  }
  
  return documentsToMigrate.length
}

/**
 * Clean up duplicate documents
 */
export async function cleanupDuplicateDocuments(userId: string) {
  await connectDB()
  
  const documents = await Document.find({ 
    userId: new mongoose.Types.ObjectId(userId) 
  }).sort({ createdAt: -1 })
  
  const seenTypes = new Set<DocumentType>()
  const duplicatesToRemove = []
  
  for (const doc of documents) {
    if (seenTypes.has(doc.type)) {
      duplicatesToRemove.push(doc._id)
    } else {
      seenTypes.add(doc.type)
    }
  }
  
  if (duplicatesToRemove.length > 0) {
    await Document.deleteMany({ _id: { $in: duplicatesToRemove } })
  }
  
  return duplicatesToRemove.length
}
