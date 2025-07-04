"use client"

import { useState, useEffect, useCallback } from "react"
import type React from "react"
import {
  ArrowLeft,
  Check,
  Upload,
  FileText,
  User,
  Building,
  MapPin,
  CreditCard,
  Clock,
  Eye,
  XCircle,
  Award,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { getDashboardData, submitRegistrationApplication } from "@/app/actions" // Import submitRegistrationApplication
import { useRouter } from "next/navigation" // Import useRouter

interface DocumentUploadState {
  name: string
  file: File | null
  uploaded: boolean
  url?: string
  status?: "pending" | "uploaded" | "verified" | "rejected"
  tempFile?: File | null
  tempUrl?: string
}

interface BankDetails {
  accountNumber: string
  bankName: string
  branchName: string
  ifscCode: string
  cancelledCheque: File | null
  cancelledChequeUrl?: string
  cancelledChequeStatus?: "pending" | "uploaded" | "verified" | "rejected"
  tempCancelledCheque?: File | null
  tempCancelledChequeUrl?: string
}

interface BusinessDocuments {
  authorizationLetter: File | null
  partnershipDeed: File | null
  llpAgreement: File | null // Added LLP Agreement to businessDocuments state
  certificateOfIncorporation: File | null
  moaAoa: File | null
  authorizationLetterUrl?: string
  partnershipDeedUrl?: string
  llpAgreementUrl?: string // Added LLP Agreement URL
  certificateOfIncorporationUrl?: string
  moaAoaUrl?: string
  authorizationLetterStatus?: "pending" | "uploaded" | "verified" | "rejected"
  partnershipDeedStatus?: "pending" | "uploaded" | "verified" | "rejected"
  llpAgreementStatus?: "pending" | "uploaded" | "verified" | "rejected" // Added LLP Agreement Status
  certificateOfIncorporationStatus?: "pending" | "uploaded" | "verified" | "rejected"
  moaAoaStatus?: "pending" | "uploaded" | "verified" | "rejected"
}

interface ProfileData {
  id: string // Add user ID
  dashboardId: string // Add dashboard ID
  fullName: string
  email: string
  mobile: string
  businessType: string
  businessName: string
  panCardUrl: string
  aadharCardUrl: string
  photographUrl: string
  proofOfAddressUrl: string
  // ALL SHARED DOCUMENTS FROM ALL REGISTRATIONS
  authorizationLetterUrl: string
  partnershipDeedUrl: string
  llpAgreementUrl: string
  certificateOfIncorporationUrl: string
  moaAoaUrl: string
  cancelledChequeUrl: string
  // GST Registration Documents
  gstCertificate: string
  rentAgreementUrl: string
  electricityBillUrl: string
  nocUrl: string
  propertyProofUrl: string
  electricityBillOwnedUrl: string
  otherProofUrl: string
  // DSC Registration Documents
  dscCertificate: string
  // ICEGATE Registration Documents
  bankDocumentUrl: string
  // AD Code Registration Documents
  adCodeLetterFromBankUrl: string
}

// Helper component for document upload sections
const DocumentUploadSection = ({
  docType,
  label,
  description,
  required,
  currentDocState,
  onFileSelect,
  colorClass = "purple",
}: {
  docType: string
  label: string
  description: string
  required: boolean
  currentDocState: DocumentUploadState
  onFileSelect: (file: File | null) => void
  colorClass?: "purple" | "orange" | "indigo" | "emerald" | "teal" | "blue"
}) => {
  const fileInputId = docType
  const displayUrl = currentDocState.tempUrl || currentDocState.url
  const hasTempFile = currentDocState.tempFile

  const getStatusDisplay = (status?: string, hasTemp?: boolean) => {
    if (status === "rejected") {
      return (
        <div className="flex items-center gap-1 text-red-600 text-xs">
          <XCircle className="h-3 w-3" />
          <span>Rejected, Re-upload required</span>
        </div>
      )
    } else if (hasTemp) {
      return (
        <div className="flex items-center gap-1 text-amber-600 text-xs">
          <Clock className="h-3 w-3" />
          <span>Ready for Upload</span>
        </div>
      )
    } else if (status === "uploaded" || status === "verified") {
      return (
        <div className="flex items-center gap-1 text-green-600 text-xs">
          <Check className="h-3 w-3" />
          <span>Uploaded & Pending Verification</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <Clock className="h-3 w-3" />
          <span>Not Uploaded</span>
        </div>
      )
    }
  }

  const handleContainerClick = () => {
    document.getElementById(fileInputId)?.click()
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    document.getElementById(fileInputId)?.click()
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fileInputId}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div
        className={`border-2 border-dashed border-${colorClass}-300 rounded-lg p-4 text-center hover:border-${colorClass}-400 transition-colors cursor-pointer`}
        onClick={handleContainerClick}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          className="hidden"
          id={fileInputId}
          disabled={!!currentDocState.url && currentDocState.status !== "rejected" && !hasTempFile}
        />
        {displayUrl ? (
          <div className="flex flex-col items-center justify-center gap-2">
            {getStatusDisplay(currentDocState.status, hasTempFile)}
            {/* Add shared from previous registration message if applicable */}
            {currentDocState.url && !hasTempFile && currentDocState.status !== "rejected" && (
              <div className="flex items-center gap-1 text-blue-600 text-xs">
                <Check className="h-3 w-3" />
                <span>Shared from previous registration</span>
              </div>
            )}
            {displayUrl && (
              <Button
                variant="link"
                className="p-0 h-auto text-primary text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(displayUrl, "_blank")
                }}
              >
                <Eye className="h-3 w-3 mr-1" /> View
              </Button>
            )}
            {(currentDocState.status === "rejected" || hasTempFile || !currentDocState.url) && (
              <Button
                variant="link"
                className={`p-0 h-auto text-${colorClass}-600 text-xs mt-1`}
                onClick={handleButtonClick}
              >
                <Upload className="h-3 w-3 mr-1" />{" "}
                {currentDocState.status === "rejected" ? "Re-upload" : "Change / Re-upload"}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className={`h-8 w-8 text-${colorClass}-400 mx-auto`} />
            <div className="text-sm text-gray-600">
              <span className={`text-${colorClass}-600`}>Click to upload</span>
            </div>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function IECRegistration() {
  const [profileData, setProfileData] = useState<ProfileData>({
    id: "",
    dashboardId: "",
    fullName: "",
    email: "",
    mobile: "",
    businessType: "",
    businessName: "",
    panCardUrl: "",
    aadharCardUrl: "",
    photographUrl: "",
    proofOfAddressUrl: "",
    authorizationLetterUrl: "",
    partnershipDeedUrl: "",
    llpAgreementUrl: "",
    certificateOfIncorporationUrl: "",
    moaAoaUrl: "",
    cancelledChequeUrl: "",
    iecCertificate: "",
    gstCertificate: "",
    rentAgreementUrl: "",
    electricityBillUrl: "",
    nocUrl: "",
    propertyProofUrl: "",
    electricityBillOwnedUrl: "",
    otherProofUrl: "",
    dscCertificate: "",
    bankDocumentUrl: "",
    adCodeLetterFromBankUrl: "",
  })
  const [businessDetails, setBusinessDetails] = useState({
    businessAddress: "",
    natureOfBusiness: "",
  })
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    cancelledCheque: null,
    cancelledChequeUrl: "",
    cancelledChequeStatus: "pending",
    tempCancelledCheque: null,
    tempCancelledChequeUrl: undefined,
  })
  const [documents, setDocuments] = useState<Record<string, DocumentUploadState>>({})
  const [businessDocuments, setBusinessDocuments] = useState<BusinessDocuments>({
    authorizationLetter: null,
    partnershipDeed: null,
    llpAgreement: null, // Initialize
    certificateOfIncorporation: null,
    moaAoa: null,
    authorizationLetterUrl: "",
    partnershipDeedUrl: "",
    llpAgreementUrl: "", // Initialize
    certificateOfIncorporationUrl: "",
    moaAoaUrl: "",
    authorizationLetterStatus: "pending",
    partnershipDeedStatus: "pending",
    llpAgreementStatus: "pending", // Initialize
    certificateOfIncorporationStatus: "pending",
    moaAoaStatus: "pending",
  })
  const [registrationStatus, setRegistrationStatus] = useState<string>("") // New state for registration status
  const router = useRouter() // Initialize useRouter

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getDashboardData()
        setProfileData({
          id: data.user.id, // Set user ID
          dashboardId: data.dashboard._id, // Set dashboard ID
          fullName: data.user.fullName,
          email: data.user.email,
          mobile: data.user.mobileNo,
          businessType: data.user.businessType,
          businessName: data.user.businessName,
          panCardUrl: data.user.panCardUrl,
          aadharCardUrl: data.user.aadharCardUrl,
          photographUrl: data.user.photographUrl,
          proofOfAddressUrl: data.user.proofOfAddressUrl,
          // 🔥 ALL SHARED DOCUMENTS FROM ALL REGISTRATIONS
          authorizationLetterUrl: data.user.authorizationLetterUrl || "",
          partnershipDeedUrl: data.user.partnershipDeedUrl || "",
          llpAgreementUrl: data.user.llpAgreementUrl || "",
          certificateOfIncorporationUrl: data.user.certificateOfIncorporationUrl || "",
          moaAoaUrl: data.user.moaAoaUrl || "",
          cancelledChequeUrl: data.user.cancelledChequeUrl || "",
          // GST Documents
          gstCertificate: data.user.gstCertificate || "",
          rentAgreementUrl: data.user.rentAgreementUrl || "",
          electricityBillUrl: data.user.electricityBillUrl || "",
          nocUrl: data.user.nocUrl || "",
          propertyProofUrl: data.user.propertyProofUrl || "",
          electricityBillOwnedUrl: data.user.electricityBillOwnedUrl || "",
          otherProofUrl: data.user.otherProofUrl || "",
          // DSC Documents
          dscCertificate: data.user.dscCertificate || "",
          // ICEGATE Documents
          bankDocumentUrl: data.user.bankDocumentUrl || "",
          // AD Code Documents
          adCodeLetterFromBankUrl: data.user.adCodeLetterFromBankUrl || "",
        })

        // Pre-fill registration-specific documents from dashboard data
        const iecStep = data.registrationSteps.find((step) => step.id === 3) // Corrected stepId for IEC
        const iecStepDocuments = iecStep?.documents || []
        const iecStepDetails = iecStep?.details || {} // Get stored details
        setRegistrationStatus(iecStep?.status || "") // Set registration status

        // Pre-fill text fields from dashboard details
        setBusinessDetails({
          businessAddress: iecStepDetails.businessAddress || "",
          natureOfBusiness: iecStepDetails.natureOfBusiness || "",
        })
        setBankDetails((prev) => ({
          ...prev,
          accountNumber: iecStepDetails.accountNumber || "",
          bankName: iecStepDetails.bankName || "",
          branchName: iecStepDetails.branchName || "",
          ifscCode: iecStepDetails.ifscCode || "",
        }))

        // 🔥 PRE-FILL BUSINESS DOCUMENTS FROM USER MODEL (SHARED DOCUMENTS)
        setBusinessDocuments((prev) => ({
          ...prev,
          authorizationLetterUrl: data.user.authorizationLetterUrl || "",
          partnershipDeedUrl: data.user.partnershipDeedUrl || "",
          llpAgreementUrl: data.user.llpAgreementUrl || "", // Ensure this is fetched
          certificateOfIncorporationUrl: data.user.certificateOfIncorporationUrl || "",
          moaAoaUrl: data.user.moaAoaUrl || "",
          // Mark as uploaded if URL exists
          authorizationLetter: data.user.authorizationLetterUrl ? ({} as File) : null,
          partnershipDeed: data.user.partnershipDeedUrl ? ({} as File) : null,
          llpAgreement: data.user.llpAgreementUrl ? ({} as File) : null, // Pre-fill LLP Agreement file state
          certificateOfIncorporation: data.user.certificateOfIncorporationUrl ? ({} as File) : null,
          moaAoa: data.user.moaAoaUrl ? ({} as File) : null,
          authorizationLetterStatus: data.user.authorizationLetterUrl ? "uploaded" : "pending",
          partnershipDeedStatus: data.user.partnershipDeedUrl ? "uploaded" : "pending",
          llpAgreementStatus: data.user.llpAgreementUrl ? "uploaded" : "pending", // Pre-fill LLP Agreement status
          certificateOfIncorporationStatus: data.user.certificateOfIncorporationUrl ? "uploaded" : "pending",
          moaAoaStatus: data.user.moaAoaUrl ? "uploaded" : "pending",
        }))

        // 🔥 PRE-FILL BANK DETAILS FROM USER MODEL (SHARED DOCUMENTS)
        setBankDetails((prev) => ({
          ...prev,
          cancelledChequeUrl: data.user.cancelledChequeUrl || "",
          cancelledCheque: data.user.cancelledChequeUrl ? ({} as File) : null,
          cancelledChequeStatus: data.user.cancelledChequeUrl ? "uploaded" : "pending",
        }))

        const newDocumentsState: Record<string, DocumentUploadState> = {}
        setDocuments(newDocumentsState)
      } catch (error) {
        console.error("Failed to fetch profile data:", error)
      }
    }
    fetchProfileData()
  }, [])

  // Cleanup for temporary URLs
  useEffect(() => {
    return () => {
      Object.values(documents).forEach((doc) => {
        if (doc.tempUrl) URL.revokeObjectURL(doc.tempUrl)
      })
      Object.values(businessDocuments).forEach((doc) => {
        if (doc.tempFile && doc.tempUrl) URL.revokeObjectURL(doc.tempUrl)
      })
      if (bankDetails.tempCancelledChequeUrl) URL.revokeObjectURL(bankDetails.tempCancelledChequeUrl)
    }
  }, [documents, businessDocuments, bankDetails.tempCancelledChequeUrl])

  // Map business types to document requirements
  const getBusinessTypeKey = (businessType: string) => {
    switch (businessType) {
      case "Propatorship":
        return "individual"
      case "Partnership":
        return "partnership"
      case "LLP":
        return "llp"
      case "PVT LTD":
        return "pvt_ltd"
      default:
        return "individual"
    }
  }

  // Check if document is required based on business type
  const isDocumentRequired = (docType: string) => {
    const businessTypeKey = getBusinessTypeKey(profileData.businessType)

    switch (docType) {
      case "panCard":
      case "proofOfAddress":
      case "photograph":
      case "aadhaarCard":
        return true // Required for all business types for IEC
      case "authorizationLetter":
        return businessTypeKey !== "individual" // Required for all except individual
      case "partnershipDeed":
        return businessTypeKey === "partnership" // Only for partnership
      case "llpAgreement":
        return businessTypeKey === "llp" // Only for LLP
      case "certificateOfIncorporation":
      case "moaAoa":
        return businessTypeKey === "pvt_ltd" // Only for Pvt Ltd
      case "cancelledCheque":
        return true // Required for all business types for IEC
      default:
        return false
    }
  }

  const calculateProgress = useCallback(() => {
    let completed = 0
    let total = 8 // Base requirements for sole proprietorship: panCard, aadhaarCard, photograph, proofOfAddress, email, mobile, businessAddress, natureOfBusiness

    // Basic details (auto-filled from profile)
    if (profileData.panCardUrl) completed++
    if (profileData.aadharCardUrl) completed++
    if (profileData.photographUrl) completed++
    if (profileData.proofOfAddressUrl) completed++
    if (profileData.email.trim()) completed++
    if (profileData.mobile.trim()) completed++

    // Business details
    if (businessDetails.businessAddress.trim()) completed++
    if (businessDetails.natureOfBusiness.trim()) completed++

    // Documents: Check for either uploaded URL, temp file, or shared documents
    if (
      (bankDetails.cancelledChequeUrl || bankDetails.tempCancelledCheque) &&
      bankDetails.cancelledChequeStatus !== "rejected"
    ) {
      total++
      completed++
    } else {
      total++ // Still count as a required field even if not uploaded
    }

    // Add conditional document requirements to total
    if (isDocumentRequired("authorizationLetter")) {
      total++
      if (
        (businessDocuments.authorizationLetterUrl ||
          businessDocuments.authorizationLetter?.tempFile ||
          profileData.authorizationLetterUrl) &&
        businessDocuments.authorizationLetterStatus !== "rejected"
      )
        completed++
    }
    if (isDocumentRequired("partnershipDeed")) {
      total++
      if (
        (businessDocuments.partnershipDeedUrl ||
          businessDocuments.partnershipDeed?.tempFile ||
          profileData.partnershipDeedUrl) &&
        businessDocuments.partnershipDeedStatus !== "rejected"
      )
        completed++
    }
    if (isDocumentRequired("llpAgreement")) {
      total++
      if (
        (businessDocuments.llpAgreementUrl ||
          businessDocuments.llpAgreement?.tempFile ||
          profileData.llpAgreementUrl) &&
        businessDocuments.llpAgreementStatus !== "rejected"
      )
        completed++
    }
    if (isDocumentRequired("certificateOfIncorporation")) {
      total++
      if (
        (businessDocuments.certificateOfIncorporationUrl ||
          businessDocuments.certificateOfIncorporation?.tempFile ||
          profileData.certificateOfIncorporationUrl) &&
        businessDocuments.certificateOfIncorporationStatus !== "rejected"
      )
        completed++
    }
    if (isDocumentRequired("moaAoa")) {
      total++
      if (
        (businessDocuments.moaAoaUrl || businessDocuments.moaAoa?.tempFile || profileData.moaAoaUrl) &&
        businessDocuments.moaAoaStatus !== "rejected"
      )
        completed++
    }

    // Bank details are optional, so not included in progress calculation

    return Math.round((completed / total) * 100)
  }, [profileData, businessDetails, bankDetails, businessDocuments])

  const handleDocumentSelect = (docType: string, file: File | null) => {
    if (!file) return

    if (documents[docType]?.tempUrl) {
      URL.revokeObjectURL(documents[docType].tempUrl!)
    }

    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        name: file.name,
        tempFile: file,
        tempUrl: URL.createObjectURL(file),
        uploaded: false,
        status: "pending",
      },
    }))
  }

  const handleBusinessDocumentSelect = (docType: keyof BusinessDocuments, file: File | null) => {
    if (!file) return

    const currentDoc = businessDocuments[docType] as DocumentUploadState | undefined
    if (currentDoc?.tempUrl) {
      URL.revokeObjectURL(currentDoc.tempUrl)
    }

    setBusinessDocuments((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        tempFile: file,
        tempUrl: URL.createObjectURL(file),
        uploaded: false,
        status: "pending",
      },
    }))
  }

  const handleBankDocumentSelect = (file: File | null) => {
    if (!file) return

    if (bankDetails.tempCancelledChequeUrl) {
      URL.revokeObjectURL(bankDetails.tempCancelledChequeUrl)
    }

    setBankDetails((prev) => ({
      ...prev,
      cancelledCheque: file,
      tempCancelledCheque: file,
      tempCancelledChequeUrl: URL.createObjectURL(file),
      cancelledChequeStatus: "pending",
    }))
  }

  const handleSubmitApplication = async () => {
    if (calculateProgress() < 100) {
      alert("Please complete all required fields and upload all necessary documents.")
      return
    }

    const detailsToSave = {
      businessAddress: businessDetails.businessAddress,
      natureOfBusiness: businessDetails.natureOfBusiness,
      accountNumber: bankDetails.accountNumber,
      bankName: bankDetails.bankName,
      branchName: bankDetails.branchName,
      ifscCode: bankDetails.ifscCode,
    }

    const filesToUpload: { docType: string; file: File }[] = []

    // General documents
    for (const key in documents) {
      const doc = documents[key]
      if (doc.tempFile && (!doc.url || doc.status === "rejected")) {
        filesToUpload.push({ docType: key, file: doc.tempFile })
      }
    }

    // Business documents
    for (const key in businessDocuments) {
      const doc = (businessDocuments as any)[key]
      if (doc.tempFile && (!doc.url || doc.status === "rejected")) {
        filesToUpload.push({ docType: key, file: doc.tempFile })
      }
    }

    // Bank cancelled cheque (optional)
    if (
      bankDetails.tempCancelledCheque &&
      (!bankDetails.cancelledChequeUrl || bankDetails.cancelledChequeStatus === "rejected")
    ) {
      filesToUpload.push({ docType: "cancelledCheque", file: bankDetails.tempCancelledCheque })
    }

    const result = await submitRegistrationApplication({
      stepId: 3, // IEC step ID
      details: detailsToSave,
      filesToUpload: filesToUpload,
      userId: profileData.id,
      dashboardId: profileData.dashboardId,
      registrationType: "IEC Code",
      registrationName: profileData.businessName || profileData.fullName,
    })

    if (result.success) {
      alert(result.message)
      router.push("/dashboard/progress") // Redirect to progress page
    } else {
      alert(`Submission failed: ${result.message}`)
    }
  }

  const progress = calculateProgress()

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/registration">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IEC Code Registration</h1>
          <p className="text-gray-600 mt-1">Import Export Code registration for international trade</p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-900">Registration Progress</h3>
            <span className="text-blue-600 font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-blue-700 text-sm mt-2">
            Complete all required sections below to proceed with your IEC Code registration
          </p>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Business Information
          </CardTitle>
          <CardDescription>Information from your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Input value={profileData.businessType} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input value={profileData.businessName} disabled className="bg-gray-50" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates from Other Registrations */}
      {(profileData.gstCertificate || profileData.dscCertificate || profileData.adCodeLetterFromBankUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              Available Certificates from Other Registrations
            </CardTitle>
            <CardDescription>Certificates you've obtained from other registration processes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <h4 className="font-medium text-emerald-900 mb-3">📜 Available Certificates:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileData.gstCertificate && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Award className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">GST Certificate</div>
                      <div className="flex items-center gap-1 text-green-600 text-xs">
                        <Check className="h-3 w-3" />
                        <span>From GST Registration</span>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs mt-1"
                        onClick={() => window.open(profileData.gstCertificate, "_blank")}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                    </div>
                  </div>
                )}

                {profileData.dscCertificate && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Shield className="h-4 w-4 text-indigo-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">DSC Certificate</div>
                      <div className="flex items-center gap-1 text-indigo-600 text-xs">
                        <Check className="h-3 w-3" />
                        <span>From DSC Registration</span>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs mt-1"
                        onClick={() => window.open(profileData.dscCertificate, "_blank")}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                    </div>
                  </div>
                )}

                {profileData.adCodeLetterFromBankUrl && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">AD Code Letter</div>
                      <div className="flex items-center gap-1 text-blue-600 text-xs">
                        <Check className="h-3 w-3" />
                        <span>From AD Code Registration</span>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs mt-1"
                        onClick={() => window.open(profileData.adCodeLetterFromBankUrl, "_blank")}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Details Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Basic Details Required <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>Information fetched from your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-3">✅ Auto-filled from your profile:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input value={profileData.fullName} disabled className="bg-gray-50" />
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Check className="h-3 w-3" />
                  <span>Fetched from profile</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input value={profileData.mobile} disabled className="bg-gray-50" />
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Check className="h-3 w-3" />
                  <span>Fetched from profile</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input value={profileData.email} disabled className="bg-gray-50" />
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Check className="h-3 w-3" />
                  <span>Fetched from profile</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {[
                { key: "panCardUrl", label: "PAN Card", icon: FileText, completed: !!profileData.panCardUrl },
                { key: "aadharCardUrl", label: "Aadhaar Card", icon: FileText, completed: !!profileData.aadharCardUrl },
                { key: "photographUrl", label: "Photograph", icon: User, completed: !!profileData.photographUrl },
                {
                  key: "proofOfAddressUrl",
                  label: "Proof of Address",
                  icon: MapPin,
                  completed: !!profileData.proofOfAddressUrl,
                },
              ].map((doc) => (
                <div key={doc.key} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <doc.icon className={`h-4 w-4 ${doc.completed ? "text-green-600" : "text-gray-400"}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {doc.label} <span className="text-red-500">*</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs ${doc.completed ? "text-green-600" : "text-gray-500"}`}
                    >
                      {doc.completed ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      <span>{doc.completed ? "Uploaded in profile" : "Pending in profile"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            Business Details <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>Provide your business information for IEC Code registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessAddress">
              Business Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessAddress"
              placeholder="Enter complete business address"
              value={businessDetails.businessAddress}
              onChange={(e) => setBusinessDetails((prev) => ({ ...prev, businessAddress: e.target.value }))}
            />
            <p className="text-xs text-gray-500">Complete address where business operations are conducted</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="natureOfBusiness">
              Nature of Business <span className="text-red-500">*</span>
            </Label>
            <Input
              id="natureOfBusiness"
              placeholder="e.g., Trading, Manufacturing, Service, Consultancy, etc."
              value={businessDetails.natureOfBusiness}
              onChange={(e) => setBusinessDetails((prev) => ({ ...prev, natureOfBusiness: e.target.value }))}
            />
            <p className="text-xs text-gray-500">Specify the primary nature of your business activities</p>
          </div>

          <DocumentUploadSection
            docType="cancelledCheque"
            label="Cancelled Cheque / Bank Statement / Passbook Front Page"
            description="Upload a cancelled cheque, bank statement, or the front page of your passbook for account verification."
            required={true}
            currentDocState={
              bankDetails.cancelledChequeUrl
                ? {
                    name: "cancelledCheque",
                    file: null,
                    uploaded: true,
                    url: bankDetails.cancelledChequeUrl,
                    status: bankDetails.cancelledChequeStatus,
                  }
                : {
                    name: "cancelledCheque",
                    file: null,
                    uploaded: false,
                    tempFile: bankDetails.tempCancelledCheque,
                    tempUrl: bankDetails.tempCancelledChequeUrl,
                    status: bankDetails.cancelledChequeStatus,
                  }
            }
            onFileSelect={(file) => handleBankDocumentSelect(file)}
            colorClass="purple"
          />
        </CardContent>
      </Card>

      {/* Conditional Documents Based on Business Type - HIDE for individual/sole proprietorship */}
      {isDocumentRequired("authorizationLetter") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Authorization Letter <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription>Required for {profileData.businessType} business type</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadSection
              docType="authorizationLetter"
              label="Authorization Letter / Board Resolution"
              description="Authorization letter or board resolution for IEC application"
              required={true}
              currentDocState={
                businessDocuments.authorizationLetterUrl
                  ? {
                      name: "authorizationLetter",
                      file: null,
                      uploaded: true,
                      url: businessDocuments.authorizationLetterUrl,
                      status: businessDocuments.authorizationLetterStatus,
                    }
                  : {
                      name: "authorizationLetter",
                      file: null,
                      uploaded: false,
                      tempFile: businessDocuments.authorizationLetter,
                      tempUrl: (businessDocuments.authorizationLetter as any)?.tempUrl,
                      status: businessDocuments.authorizationLetterStatus,
                    }
              }
              onFileSelect={(file) => handleBusinessDocumentSelect("authorizationLetter", file)}
              colorClass="orange"
            />
          </CardContent>
        </Card>
      )}

      {/* Partnership Deed - Only for Partnership */}
      {isDocumentRequired("partnershipDeed") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Partnership Deed <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription>Required for Partnership Firm</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadSection
              docType="partnershipDeed"
              label="Partnership Deed"
              description="Registered partnership deed"
              required={true}
              currentDocState={
                businessDocuments.partnershipDeedUrl
                  ? {
                      name: "partnershipDeed",
                      file: null,
                      uploaded: true,
                      url: businessDocuments.partnershipDeedUrl,
                      status: businessDocuments.partnershipDeedStatus,
                    }
                  : {
                      name: "partnershipDeed",
                      file: null,
                      uploaded: false,
                      tempFile: businessDocuments.partnershipDeed,
                      tempUrl: (businessDocuments.partnershipDeed as any)?.tempUrl,
                      status: businessDocuments.partnershipDeedStatus,
                    }
              }
              onFileSelect={(file) => handleBusinessDocumentSelect("partnershipDeed", file)}
              colorClass="purple"
            />
          </CardContent>
        </Card>
      )}

      {/* LLP Agreement - Only for LLP */}
      {isDocumentRequired("llpAgreement") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              LLP Agreement <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription>Required for Limited Liability Partnership</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadSection
              docType="llpAgreement"
              label="LLP Agreement"
              description="Limited Liability Partnership agreement"
              required={true}
              currentDocState={
                businessDocuments.llpAgreementUrl
                  ? {
                      name: "llpAgreement",
                      file: null,
                      uploaded: true,
                      url: businessDocuments.llpAgreementUrl,
                      status: businessDocuments.llpAgreementStatus,
                    }
                  : {
                      name: "llpAgreement",
                      file: null,
                      uploaded: false,
                      tempFile: businessDocuments.llpAgreement,
                      tempUrl: (businessDocuments.llpAgreement as any)?.tempUrl,
                      status: businessDocuments.llpAgreementStatus,
                    }
              }
              onFileSelect={(file) => handleBusinessDocumentSelect("llpAgreement", file)}
              colorClass="purple"
            />
          </CardContent>
        </Card>
      )}

      {/* Company Documents - Only for Private Limited Company */}
      {isDocumentRequired("certificateOfIncorporation") && isDocumentRequired("moaAoa") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Company Documents <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription>Required for Private Limited Company</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentUploadSection
              docType="certificateOfIncorporation"
              label="Certificate of Incorporation"
              description="Company incorporation certificate from ROC"
              required={true}
              currentDocState={
                businessDocuments.certificateOfIncorporationUrl
                  ? {
                      name: "certificateOfIncorporation",
                      file: null,
                      uploaded: true,
                      url: businessDocuments.certificateOfIncorporationUrl,
                      status: businessDocuments.certificateOfIncorporationStatus,
                    }
                  : {
                      name: "certificateOfIncorporation",
                      file: null,
                      uploaded: false,
                      tempFile: businessDocuments.certificateOfIncorporation,
                      tempUrl: (businessDocuments.certificateOfIncorporation as any)?.tempUrl,
                      status: businessDocuments.certificateOfIncorporationStatus,
                    }
              }
              onFileSelect={(file) => handleBusinessDocumentSelect("certificateOfIncorporation", file)}
              colorClass="emerald"
            />
            <DocumentUploadSection
              docType="moaAoa"
              label="MOA & AOA"
              description="Memorandum and Articles of Association documents"
              required={true}
              currentDocState={
                businessDocuments.moaAoaUrl
                  ? {
                      name: "moaAoa",
                      file: null,
                      uploaded: true,
                      url: businessDocuments.moaAoaUrl,
                      status: businessDocuments.moaAoaStatus,
                    }
                  : {
                      name: "moaAoa",
                      file: null,
                      uploaded: false,
                      tempFile: businessDocuments.moaAoa,
                      tempUrl: (businessDocuments.moaAoa as any)?.tempUrl,
                      status: businessDocuments.moaAoaStatus,
                    }
              }
              onFileSelect={(file) => handleBusinessDocumentSelect("moaAoa", file)}
              colorClass="emerald"
            />
          </CardContent>
        </Card>
      )}

      {/* IEC Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            IEC Information
          </CardTitle>
          <CardDescription>Important information about Import Export Code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-900 mb-3">🌍 What is IEC?</h4>
            <ul className="text-emerald-800 text-sm space-y-2">
              <li>• Import Export Code is a mandatory business identification number</li>
              <li>• Issued by the Directorate General of Foreign Trade (DGFT)</li>
              <li>• Required for importing or exporting goods and services from India</li>
              <li>• Valid for a lifetime, no renewal required</li>
              <li>• Helps in availing benefits under foreign trade policy</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">📋 Benefits of IEC Code:</h4>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Enables international trade operations</li>
              <li>• Access to export incentives and schemes</li>
              <li>• Simplifies customs clearance procedures</li>
              <li>• No annual compliance or filing requirements</li>
              <li>• Can be obtained by individuals, firms, or companies</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-3">⚠️ Important Notes:</h4>
            <ul className="text-amber-800 text-sm space-y-2">
              <li>• Not required for import/export of services or technology if payment is not in foreign currency</li>
              <li>• Not required for import/export for personal use</li>
              <li>• Only one IEC can be issued against a single PAN</li>
              <li>• Any changes in business details require updating the IEC</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        {registrationStatus === "in-progress" ? (
          <Card className="w-full bg-amber-50 border-amber-200 text-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Application Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Your IEC Code registration application has been submitted and is currently being processed. You can
                track the progress in the Progress section.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/registration">Save & Continue Later</Link>
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmitApplication}
              disabled={progress < 100}
            >
              Submit IEC Application ({progress}%)
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
