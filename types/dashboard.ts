export interface DashboardData {
  user?: {
    id: string
    fullName: string
    businessName: string
    businessType: string
    mobileNo: string
    email: string
    emailVerified: boolean
    aadharCardUrl: string
    panCardUrl: string
    photographUrl: string
    proofOfAddressUrl: string
    authorizationLetterUrl: string
    partnershipDeedUrl: string
    llpAgreementUrl: string
    certificateOfIncorporationUrl: string
    moaAoaUrl: string
    cancelledChequeUrl: string
    iecCertificate: string
    dscCertificate: string
    gstCertificate: string
    rentAgreementUrl: string
    electricityBillUrl: string
    nocUrl: string
    propertyProofUrl: string
    electricityBillOwnedUrl: string
    otherProofUrl: string
    adCodeLetterFromBankUrl: string
    bankDocumentUrl: string
  }
  hasStartedRegistration?: boolean
  profileCompletion?: number
  registrationSteps?: Array<{
    id: number
    name: string
    status: string
    icon: string
    completedAt?: string | null
    documents?: Array<{
      name: string
      uploadedAt?: string | null
      status: string
      url?: string
    }>
    details?: Record<string, any>
  }>
  overallProgress?: number
  notifications?: Array<{
    id: string
    title: string
    message: string
    type: string
    read: boolean
    createdAt: string
  }>
  unreadNotificationCount?: number
  isProfileComplete?: boolean
  error?: string
}

export interface DocumentUploadState {
  name: string
  file: File | null
  uploaded: boolean
  url?: string
  status?: "pending" | "uploaded" | "verified" | "rejected"
  tempFile?: File | null
  tempUrl?: string | undefined
}

export interface BankDetails {
  accountNumber: string
  bankName: string
  branchName: string
  ifscCode: string
  cancelledCheque: File | null
  cancelledChequeUrl?: string
  cancelledChequeStatus?: "pending" | "uploaded" | "verified" | "rejected"
  tempCancelledCheque?: File | null
  tempCancelledChequeUrl?: string | undefined
}
