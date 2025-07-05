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
import { useToast } from "@/hooks/use-toast"

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
  // IEC Registration Documents
  iecCertificate: string
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
  // AD Code Registration Documents
  adCodeLetterFromBankUrl: string
  // ICEGATE Registration Documents
  bankDocumentUrl: string // Specific to ICEGATE
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

export default function ICEGATERegistration() {
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
    adCodeLetterFromBankUrl: "",
    bankDocumentUrl: "",
  })
  const [businessDetails, setBusinessDetails] = useState({
    iecNumber: "",
    gstinNumber: "",
    dscNumber: "",
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
  const [registrationStatus, setRegistrationStatus] = useState<string>("") // New state for registration status
  const router = useRouter() // Initialize useRouter
  const { toast } = useToast()

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
          // IEC Documents
          iecCertificate: data.user.iecCertificate || "",
          // GST Documents
          gstCertificate: data.user.gstCertificate || "",
          rentAgreementUrl: data.user.rentAgreementUrl || "",
          electricityBillUrl: data.user.electricityBillUrl || "",
          nocUrl: data.user.nocUrl || "",
          propertyProofUrl: data.user.propertyProofUrl || "",
          electricityBillOwnedUrl: data.user.electricityBillOwnedUrl || "",
          otherProofUrl: data.user.otherProofUrl || "",
          dscCertificate: data.user.dscCertificate || "",
          // AD Code Documents
          adCodeLetterFromBankUrl: data.user.adCodeLetterFromBankUrl || "",
          // ICEGATE Documents
          bankDocumentUrl: data.user.bankDocumentUrl || "",
        })

        // Pre-fill registration-specific documents from dashboard data
        const icegateStep = data.registrationSteps.find((step) => step.id === 5) // Corrected stepId for ICEGATE
        const icegateStepDocuments = icegateStep?.documents || []
        const icegateStepDetails = icegateStep?.details || {} // Get stored details
        setRegistrationStatus(icegateStep?.status || "") // Set registration status

        // Pre-fill text fields from dashboard details
        setBusinessDetails({
          iecNumber: icegateStepDetails.iecNumber || "",
          gstinNumber: icegateStepDetails.gstinNumber || "",
          dscNumber: icegateStepDetails.dscNumber || "",
        })
        setBankDetails((prev) => ({
          ...prev,
          accountNumber: icegateStepDetails.accountNumber || "",
          bankName: icegateStepDetails.bankName || "",
          branchName: icegateStepDetails.branchName || "",
          ifscCode: icegateStepDetails.ifscCode || "",
        }))

        const newDocumentsState: Record<string, DocumentUploadState> = {}
        const newBankDetailsState: BankDetails = { ...bankDetails }

        // Helper to get document state, prioritizing profileData
        const getDocState = (docName: string, profileUrl: string | undefined) => {
          const dashboardDoc = icegateStepDocuments.find((d) => d.name === docName)
          const finalUrl = profileUrl || dashboardDoc?.url
          const finalStatus = profileUrl ? "uploaded" : dashboardDoc?.status
          return {
            name: docName,
            file: finalUrl ? ({} as File) : null,
            uploaded: !!finalUrl,
            url: finalUrl,
            status: finalStatus || "pending",
            tempFile: null,
            tempUrl: null,
          }
        }

        // Handle IEC Certificate
        newDocumentsState.iecCertificate = getDocState("iecCertificate", data.user.iecCertificate)

        // Handle GST Certificate
        newDocumentsState.gstCertificate = getDocState("gstCertificate", data.user.gstCertificate)

        // Handle DSC Certificate
        newDocumentsState.dscCertificate = getDocState("dscCertificate", data.user.dscCertificate)

        // Handle Bank Document (specific to ICEGATE)
        newDocumentsState.bankDocument = getDocState("bankDocument", data.user.bankDocumentUrl)

        // Handle Authorization Letter (conditional, shared)
        newDocumentsState.authorizationLetter = getDocState("authorizationLetter", data.user.authorizationLetterUrl)

        // Handle Cancelled Cheque (shared, optional)
        newBankDetailsState.cancelledChequeUrl =
          data.user.cancelledChequeUrl || icegateStepDocuments.find((d) => d.name === "cancelledCheque")?.url
        newBankDetailsState.cancelledCheque = newBankDetailsState.cancelledChequeUrl ? ({} as File) : null
        newBankDetailsState.cancelledChequeStatus =
          (data.user.cancelledChequeUrl
            ? "uploaded"
            : icegateStepDocuments.find((d) => d.name === "cancelledCheque")?.status) || "pending"
        newBankDetailsState.tempCancelledCheque = null
        newBankDetailsState.tempCancelledChequeUrl = null

        setDocuments(newDocumentsState)
        setBankDetails(newBankDetailsState)
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
      if (bankDetails.tempCancelledChequeUrl) URL.revokeObjectURL(bankDetails.tempCancelledChequeUrl)
    }
  }, [documents, bankDetails.tempCancelledChequeUrl])

  // Map business types to document requirements
  const getBusinessTypeKey = (businessType: string) => {
    switch (businessType) {
      case "Proprietorship":
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

  // Check if document is required based on business type and registration type
  const isDocumentRequired = (docType: string) => {
    const businessTypeKey = getBusinessTypeKey(profileData.businessType)

    switch (docType) {
      case "panCard":
      case "proofOfAddress":
      case "photograph":
      case "aadhaarCard":
        return true // Required for all business types for ICEGATE
      case "authorizationLetter":
        return businessTypeKey !== "individual" // Required for all except individual
      case "iecCertificate":
      case "gstCertificate":
      case "dscCertificate":
      case "bankDocument":
        return true // Required for ICEGATE for all business types
      default:
        return false
    }
  }

  const calculateProgress = useCallback(() => {
    let completed = 0
    let total = 10 // Base requirements for sole proprietorship: panCard, aadhaarCard, photograph, proofOfAddress, email, mobile, iecNumber, gstinNumber, dscNumber, bankDocument

    // Basic details (auto-filled from profile)
    if (profileData.panCardUrl) completed++
    if (profileData.aadharCardUrl) completed++
    if (profileData.photographUrl) completed++
    if (profileData.proofOfAddressUrl) completed++
    if (profileData.email.trim()) completed++
    if (profileData.mobile.trim()) completed++

    // Business details
    if (businessDetails.iecNumber.trim()) completed++
    if (businessDetails.gstinNumber.trim()) completed++
    if (businessDetails.dscNumber.trim()) completed++

    // Documents: Check for either uploaded URL, temp file, or shared documents
    if (
      (documents.iecCertificate?.url || documents.iecCertificate?.tempFile || profileData.iecCertificate) &&
      documents.iecCertificate?.status !== "rejected"
    )
      completed++
    if (
      (documents.gstCertificate?.url || documents.gstCertificate?.tempFile || profileData.gstCertificate) &&
      documents.gstCertificate?.status !== "rejected"
    )
      completed++
    if (
      (documents.dscCertificate?.url || documents.dscCertificate?.tempFile || profileData.dscCertificate) &&
      documents.dscCertificate?.status !== "rejected"
    )
      completed++
    if (
      (documents.bankDocument?.url || documents.bankDocument?.tempFile) &&
      documents.bankDocument?.status !== "rejected"
    )
      completed++

    // Add conditional document requirements to total
    if (isDocumentRequired("authorizationLetter")) {
      total++
      if (
        (documents.authorizationLetter?.url ||
          documents.authorizationLetter?.tempFile ||
          profileData.authorizationLetterUrl) &&
        documents.authorizationLetter?.status !== "rejected"
      )
        completed++
    }

    // Bank details are optional, so not included in progress calculation

    return Math.round((completed / total) * 100)
  }, [profileData, businessDetails, documents])

  const handleDocumentSelect = (docType: string, file: File | null) => {
    if (!file) return

    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "❌ File Size Too Large",
        description: `File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please upload a file smaller than 1MB.`,
      })
      return
    }

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

  const handleBankDocumentSelect = (file: File | null) => {
    if (!file) return

    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "❌ File Size Too Large",
        description: `File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please upload a file smaller than 1MB.`,
      })
      return
    }

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
    if (progress < 100) {
      alert("Please complete all required fields and upload all necessary documents.")
      return
    }

    const detailsToSave = {
      iecNumber: businessDetails.iecNumber,
      gstinNumber: businessDetails.gstinNumber,
      dscNumber: businessDetails.dscNumber,
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

    // Bank cancelled cheque (optional)
    if (
      bankDetails.tempCancelledCheque &&
      (!bankDetails.cancelledChequeUrl || bankDetails.cancelledChequeStatus === "rejected")
    ) {
      filesToUpload.push({ docType: "cancelledCheque", file: bankDetails.tempCancelledCheque })
    }

    const result = await submitRegistrationApplication({
      stepId: 5, // ICEGATE step ID
      details: detailsToSave,
      filesToUpload: filesToUpload,
      userId: profileData.id,
      dashboardId: profileData.dashboardId,
      registrationType: "ICEGATE Registration",
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
          <h1 className="text-3xl font-bold text-gray-900">ICEGATE Registration</h1>
          <p className="text-gray-600 mt-1">Indian Customs Electronic Gateway registration</p>
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
            Complete all required sections below to proceed with your ICEGATE registration
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
      {(profileData.gstCertificate || profileData.iecCertificate || profileData.dscCertificate) && (
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

                {profileData.iecCertificate && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Award className="h-4 w-4 text-purple-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">IEC Certificate</div>
                      <div className="flex items-center gap-1 text-purple-600 text-xs">
                        <Check className="h-3 w-3" />
                        <span>From IEC Registration</span>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs mt-1"
                        onClick={() => window.open(profileData.iecCertificate, "_blank")}
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
          <CardDescription>Provide your business information for ICEGATE registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="iecNumber">
              IEC Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="iecNumber"
              placeholder="Enter your 10-digit IEC number"
              value={businessDetails.iecNumber}
              onChange={(e) => setBusinessDetails((prev) => ({ ...prev, iecNumber: e.target.value }))}
              maxLength={10}
            />
            <p className="text-xs text-gray-500">Your Import Export Code number</p>
          </div>

          <DocumentUploadSection
            docType="iecCertificate"
            label="IEC Certificate"
            description="Upload your IEC certificate copy"
            required={true}
            currentDocState={documents.iecCertificate || { name: "", file: null, uploaded: false }}
            onFileSelect={(file) => handleDocumentSelect("iecCertificate", file)}
            colorClass="purple"
          />

          <div className="space-y-2">
            <Label htmlFor="gstinNumber">
              GSTIN Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="gstinNumber"
              placeholder="Enter your 15-digit GSTIN"
              value={businessDetails.gstinNumber}
              onChange={(e) => setBusinessDetails((prev) => ({ ...prev, gstinNumber: e.target.value }))}
              maxLength={15}
            />
            <p className="text-xs text-gray-500">Your Goods and Services Tax Identification Number</p>
          </div>

          <DocumentUploadSection
            docType="gstCertificate"
            label="GST Certificate"
            description="Upload your GST certificate copy"
            required={true}
            currentDocState={documents.gstCertificate || { name: "", file: null, uploaded: false }}
            onFileSelect={(file) => handleDocumentSelect("gstCertificate", file)}
            colorClass="teal"
          />

          <div className="space-y-2">
            <Label htmlFor="dscNumber">
              DSC Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dscNumber"
              placeholder="Enter your DSC number"
              value={businessDetails.dscNumber}
              onChange={(e) => setBusinessDetails((prev) => ({ ...prev, dscNumber: e.target.value }))}
            />
            <p className="text-xs text-gray-500">Your Digital Signature Certificate number</p>
          </div>

          <DocumentUploadSection
            docType="dscCertificate"
            label="DSC Certificate"
            description="Upload your DSC certificate copy"
            required={true}
            currentDocState={documents.dscCertificate || { name: "", file: null, uploaded: false }}
            onFileSelect={(file) => handleDocumentSelect("dscCertificate", file)}
            colorClass="indigo"
          />

          <DocumentUploadSection
            docType="bankDocument"
            label="Bank Document (Cancelled Cheque / Bank Statement)"
            description="Upload a cancelled cheque or bank statement for bank details verification"
            required={true}
            currentDocState={documents.bankDocument || { name: "", file: null, uploaded: false }}
            onFileSelect={(file) => handleDocumentSelect("bankDocument", file)}
            colorClass="emerald"
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
              description="Authorization letter or board resolution for ICEGATE application"
              required={true}
              currentDocState={documents.authorizationLetter || { name: "", file: null, uploaded: false }}
              onFileSelect={(file) => handleDocumentSelect("authorizationLetter", file)}
              colorClass="orange"
            />
          </CardContent>
        </Card>
      )}

      {/* Bank Details (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-slate-600" />
            Bank Details (Optional at the time of registration)
          </CardTitle>
          <CardDescription>You can provide bank details now or add them later</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Bank Details Include:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Bank Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  placeholder="Enter IFSC code"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, ifscCode: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="Enter bank name"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, bankName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  placeholder="Enter branch name"
                  value={bankDetails.branchName}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, branchName: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cancelled Cheque, Bank Statement, or Passbook (Front Page)</Label>
              <p className="text-sm text-gray-600 mb-2">
                Upload a cancelled cheque, bank statement, or the front page of your passbook for account verification.
              </p>
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById("bankCancelledCheque")?.click()}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleBankDocumentSelect(e.target.files?.[0] || null)}
                  className="hidden"
                  id="bankCancelledCheque"
                />
                {bankDetails.tempCancelledChequeUrl || bankDetails.cancelledChequeUrl ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <Check className="h-3 w-3" />
                      <span>Document Selected</span>
                    </div>
                    {(bankDetails.tempCancelledChequeUrl || bankDetails.cancelledChequeUrl) && (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          const url = bankDetails.tempCancelledChequeUrl || bankDetails.cancelledChequeUrl
                          if (url) window.open(url, "_blank")
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                    )}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-slate-600 text-xs mt-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        document.getElementById("bankCancelledCheque")?.click()
                      }}
                    >
                      <Upload className="h-3 w-3 mr-1" /> Change / Re-upload
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <span className="text-slate-600">Click to upload</span>
                    </div>
                    <p className="text-xs text-gray-400">Supported formats: .pdf, .jpg, .jpeg, .png</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ICEGATE Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            ICEGATE Information
          </CardTitle>
          <CardDescription>Important information about ICEGATE registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-900 mb-3">🌐 What is ICEGATE?</h4>
            <ul className="text-emerald-800 text-sm space-y-2">
              <li>• Indian Customs Electronic Gateway is a portal for trade and customs clearance</li>
              <li>• Provides e-filing services for various customs documents (e.g., Bill of Entry, Shipping Bill)</li>
              <li>• Facilitates online payment of customs duties and other charges</li>
              <li>• Essential for importers and exporters to interact with Indian Customs</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">📋 Benefits of ICEGATE Registration:</h4>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Streamlined customs clearance process</li>
              <li>• Faster processing of import and export consignments</li>
              <li>• Online access to customs data and status updates</li>
              <li>• Reduced paperwork and manual intervention</li>
              <li>• Enhanced transparency and efficiency in trade operations</li>
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
                Your ICEGATE registration application has been submitted and is currently being processed. You can track
                the progress in the Progress section.
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
              Submit ICEGATE Application ({progress}%)
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
