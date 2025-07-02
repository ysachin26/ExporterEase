"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Check,
  Upload,
  FileText,
  User,
  Building,
  CreditCard,
  MapPin,
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
import { getDashboardData, uploadDocument } from "@/app/actions"

interface DocumentUploadState {
  name: string
  file: File | null // This will represent the *uploaded* file, or null if not yet uploaded
  uploaded: boolean
  url?: string
  status?: "pending" | "uploaded" | "verified" | "rejected"
  tempFile?: File | null // New: for temporary local storage
  tempUrl?: string | null // New: for temporary local preview URL
}

interface BankDetails {
  accountNumber: string
  bankName: string
  branchName: string
  ifscCode: string
  cancelledCheque: File | null // This will represent the *uploaded* file, or null if not yet uploaded
  cancelledChequeUrl?: string
  cancelledChequeStatus?: "pending" | "uploaded" | "verified" | "rejected"
  tempCancelledCheque?: File | null // New: for temporary local storage
  tempCancelledChequeUrl?: string | null // New: for temporary local preview URL
}

interface ProfileData {
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
  colorClass = "purple", // Default color
}: {
  docType: string
  label: string
  description: string
  required: boolean
  currentDocState:
    | DocumentUploadState
    | {
        name: string
        file: File | null
        uploaded: boolean
        url?: string | undefined
        status?: "pending" | "uploaded" | "verified" | "rejected" | undefined
        tempFile?: File | null | undefined
        tempUrl?: string | null | undefined
      }
  onFileSelect: (file: File | null) => void
  colorClass?: "purple" | "orange" | "indigo" | "emerald" | "teal" | "blue" // Added all possible colors
}) => {
  const fileInputId = docType
  const displayUrl = currentDocState.tempUrl || currentDocState.url
  const hasTempFile =
    (currentDocState as DocumentUploadState).tempFile || (currentDocState as BankDetails).tempCancelledCheque

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
    e.stopPropagation() // Prevent event bubbling
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
          // Disable input if already uploaded and not rejected, and no new temp file is selected
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
            {currentDocState.url && !hasTempFile && currentDocState.status !== "rejected" && (
              <Button
                variant="link"
                className={`p-0 h-auto text-${colorClass}-600 text-xs mt-1`}
                onClick={handleButtonClick}
              >
                <Upload className="h-3 w-3 mr-1" /> Replace
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
    natureOfBusiness: "",
    businessAddress: "",
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
    tempCancelledChequeUrl: null,
  })
  const [documents, setDocuments] = useState<Record<string, DocumentUploadState>>({})

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getDashboardData()
        setProfileData({
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
        // Pre-fill business name
        setBusinessDetails((prev) => ({
          ...prev,
          businessName: data.user.businessName,
        }))

        // Pre-fill registration-specific documents from dashboard data
        const iecStep = data.registrationSteps.find((step) => step.id === 4)
        const iecStepDocuments = iecStep?.documents || []

        const newDocumentsState: Record<string, DocumentUploadState> = {}
        const newBankDetailsState: BankDetails = { ...bankDetails }

        // Helper to get document state, prioritizing profileData
        const getDocState = (docName: string, profileUrl: string | undefined) => {
          const dashboardDoc = iecStepDocuments.find((d) => d.name === docName)
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

        // Handle shared business entity documents
        newDocumentsState.authorizationLetter = getDocState("authorizationLetter", data.user.authorizationLetterUrl)
        newDocumentsState.partnershipDeed = getDocState("partnershipDeed", data.user.partnershipDeedUrl)
        newDocumentsState.llpAgreement = getDocState("llpAgreement", data.user.llpAgreementUrl)
        newDocumentsState.certificateOfIncorporation = getDocState(
          "certificateOfIncorporation",
          data.user.certificateOfIncorporationUrl,
        )
        newDocumentsState.moaAoa = getDocState("moaAoa", data.user.moaAoaUrl)

        // Handle Cancelled Cheque (shared, required)
        newBankDetailsState.cancelledChequeUrl =
          data.user.cancelledChequeUrl || iecStepDocuments.find((d) => d.name === "cancelledCheque")?.url
        newBankDetailsState.cancelledCheque = newBankDetailsState.cancelledChequeUrl ? ({} as File) : null
        newBankDetailsState.cancelledChequeStatus =
          (data.user.cancelledChequeUrl
            ? "uploaded"
            : iecStepDocuments.find((d) => d.name === "cancelledCheque")?.status) || "pending"
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
      // Revoke all temporary URLs when component unmounts
      Object.values(documents).forEach((doc) => {
        if (doc.tempUrl) URL.revokeObjectURL(doc.tempUrl)
      })
      if (bankDetails.tempCancelledChequeUrl) URL.revokeObjectURL(bankDetails.tempCancelledChequeUrl)
    }
  }, [documents, bankDetails.tempCancelledChequeUrl])

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

  // Check if document is required based on business type and registration type
  const isDocumentRequired = (docType: string) => {
    const businessTypeKey = getBusinessTypeKey(profileData.businessType)

    switch (docType) {
      case "panCard":
      case "proofOfAddress":
      case "photograph":
      case "aadhaarCard":
      case "bankProof":
        return true // Required for all business types for IEC
      case "authorizationLetter":
        return businessTypeKey !== "individual" // Required for all except individual
      case "partnershipDeed":
        return businessTypeKey === "partnership"
      case "llpAgreement":
        return businessTypeKey === "llp"
      case "certificateOfIncorporation":
        return businessTypeKey === "pvt_ltd"
      case "moaAoa":
        return businessTypeKey === "pvt_ltd"
      default:
        return false
    }
  }

  const calculateProgress = useCallback(() => {
    let completed = 0
    let total = 9 // Base requirements

    // Basic details (auto-filled from profile)
    if (profileData.panCardUrl) completed++
    if (profileData.aadharCardUrl) completed++
    if (profileData.photographUrl) completed++
    if (profileData.proofOfAddressUrl) completed++
    if (profileData.email.trim()) completed++
    if (profileData.mobile.trim()) completed++

    // Business details
    if (businessDetails.natureOfBusiness.trim()) completed++
    if (businessDetails.businessAddress.trim()) completed++

    // Bank details: Consider complete if either uploaded (url) or temporarily selected (tempCancelledCheque)
    if (
      bankDetails.accountNumber.trim() &&
      bankDetails.ifscCode.trim() &&
      (bankDetails.cancelledChequeUrl || bankDetails.tempCancelledCheque || profileData.cancelledChequeUrl) &&
      bankDetails.cancelledChequeStatus !== "rejected"
    )
      completed++

    // Add conditional document requirements to total and check for tempFile, url, or shared documents
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
    if (isDocumentRequired("partnershipDeed")) {
      total++
      if (
        (documents.partnershipDeed?.url || documents.partnershipDeed?.tempFile || profileData.partnershipDeedUrl) &&
        documents.partnershipDeed?.status !== "rejected"
      )
        completed++
    }
    if (isDocumentRequired("llpAgreement")) {
      total++
      if (
        (documents.llpAgreement?.url || documents.llpAgreement?.tempFile || profileData.llpAgreementUrl) &&
        documents.llpAgreement?.status !== "rejected"
      )
        completed++
    }
    if (isDocumentRequired("certificateOfIncorporation")) {
      total++
      if (
        (documents.certificateOfIncorporation?.url ||
          documents.certificateOfIncorporation?.tempFile ||
          profileData.certificateOfIncorporationUrl) &&
        documents.certificateOfIncorporation?.status !== "rejected"
      )
        completed++
    }
    if (isDocumentRequired("moaAoa")) {
      total++
      if (
        (documents.moaAoa?.url || documents.moaAoa?.tempFile || profileData.moaAoaUrl) &&
        documents.moaAoa?.status !== "rejected"
      )
        completed++
    }

    return Math.round((completed / total) * 100)
  }, [profileData, businessDetails, documents, bankDetails])

  const handleDocumentSelect = (docType: string, file: File | null) => {
    if (!file) return

    // Revoke previous temp URL if exists
    if (documents[docType]?.tempUrl) {
      URL.revokeObjectURL(documents[docType].tempUrl!)
    }

    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType], // Keep existing uploaded status if any
        name: file.name,
        tempFile: file,
        tempUrl: URL.createObjectURL(file),
        uploaded: false, // Mark as not yet uploaded to Cloudinary
        status: "pending", // Status for local file, will change to 'uploaded' after Cloudinary upload
      },
    }))
  }

  const handleBankDocumentSelect = (file: File | null) => {
    if (!file) return

    // Revoke previous temp URL if exists
    if (bankDetails.tempCancelledChequeUrl) {
      URL.revokeObjectURL(bankDetails.tempCancelledChequeUrl)
    }

    setBankDetails((prev) => ({
      ...prev,
      cancelledCheque: file, // This will be the temp file for now
      tempCancelledCheque: file,
      tempCancelledChequeUrl: URL.createObjectURL(file),
      cancelledChequeStatus: "pending", // Status for local file
    }))
  }

  const handleSubmitApplication = async () => {
    // First, validate all required fields are filled
    const progress = calculateProgress()
    if (progress < 100) {
      alert("Please complete all required fields and upload all necessary documents.")
      return
    }

    // Handle document uploads
    const documentsToUpload: { docType: string; file: File; isBankDoc?: boolean }[] = []

    // General documents
    for (const key in documents) {
      const doc = documents[key]
      // Only upload if tempFile exists and not already uploaded successfully (or was rejected)
      if (doc.tempFile && (!doc.url || doc.status === "rejected")) {
        documentsToUpload.push({ docType: key, file: doc.tempFile })
      }
    }

    // Bank cancelled cheque
    if (
      bankDetails.tempCancelledCheque &&
      (!bankDetails.cancelledChequeUrl || bankDetails.cancelledChequeStatus === "rejected")
    ) {
      documentsToUpload.push({ docType: "cancelledCheque", file: bankDetails.tempCancelledCheque, isBankDoc: true })
    }

    if (documentsToUpload.length === 0) {
      alert("No new documents to upload or all documents already processed. Proceeding with final form submission.")
      // Here you would call your final form submission action
      // For now, just log and return
      console.log("Final form submission logic would go here.")
      return
    }

    let allUploadsSuccessful = true
    for (const docInfo of documentsToUpload) {
      const formData = new FormData()
      formData.append("file", docInfo.file)
      formData.append("documentType", docInfo.docType)
      formData.append("stepId", "4") // IEC Registration step ID

      try {
        const result = await uploadDocument(formData)
        if (result.success) {
          if (docInfo.isBankDoc) {
            setBankDetails((prev) => ({
              ...prev,
              cancelledChequeUrl: result.fileUrl,
              cancelledChequeStatus: "uploaded",
              tempCancelledCheque: null, // Clear temp file after successful upload
              tempCancelledChequeUrl: null,
            }))
          } else {
            setDocuments((prev) => ({
              ...prev,
              [docInfo.docType]: {
                ...prev[docInfo.docType],
                url: result.fileUrl,
                status: "uploaded",
                tempFile: null, // Clear temp file after successful upload
                tempUrl: null,
              },
            }))
          }
          console.log(`Successfully uploaded ${docInfo.docType}`)
        } else {
          allUploadsSuccessful = false
          console.error(`Upload failed for ${docInfo.docType}:`, result.message)
          // Optionally, update status to 'rejected' or show error for this specific document
          if (docInfo.isBankDoc) {
            setBankDetails((prev) => ({ ...prev, cancelledChequeStatus: "rejected" }))
          } else {
            setDocuments((prev) => ({ ...prev, [docInfo.docType]: { ...prev[docInfo.docType], status: "rejected" } }))
          }
        }
      } catch (error) {
        allUploadsSuccessful = false
        console.error(`Upload error for ${docInfo.docType}:`, error)
        if (docInfo.isBankDoc) {
          setBankDetails((prev) => ({ ...prev, cancelledChequeStatus: "rejected" }))
        } else {
          setDocuments((prev) => ({ ...prev, [docInfo.docType]: { ...prev[docInfo.docType], status: "rejected" } }))
        }
      }
    }

    if (allUploadsSuccessful) {
      alert("All documents uploaded successfully! Your application is submitted.")
      // Here you would typically navigate or show a success message
    } else {
      alert("Some documents failed to upload. Please check the console for details and re-upload if necessary.")
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
          <h1 className="text-3xl font-bold text-gray-900">IEC Registration</h1>
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
            Complete all required sections below to proceed with your IEC registration
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
                        <span>Available from GST Registration</span>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs mt-1"
                        onClick={() => window.open(profileData.gstCertificate, "_blank")}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View Certificate
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
                        <span>Available from DSC Registration</span>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs mt-1"
                        onClick={() => window.open(profileData.dscCertificate, "_blank")}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View Certificate
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
                        <span>Available from AD Code Registration</span>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs mt-1"
                        onClick={() => window.open(profileData.adCodeLetterFromBankUrl, "_blank")}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View Document
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
          <CardDescription>Provide your business information for IEC registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="natureOfBusiness">
              Nature of Business <span className="text-red-500">*</span>
            </Label>
            <Input
              id="natureOfBusiness"
              placeholder="e.g., Export/Import, Trading, Manufacturing, etc."
              value={businessDetails.natureOfBusiness}
              onChange={(e) => setBusinessDetails((prev) => ({ ...prev, natureOfBusiness: e.target.value }))}
            />
            <p className="text-xs text-gray-500">Specify the primary nature of your import/export business</p>
          </div>

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
              currentDocState={documents.authorizationLetter || { name: "", file: null, uploaded: false }}
              onFileSelect={(file) => handleDocumentSelect("authorizationLetter", file)}
              colorClass="orange"
            />
          </CardContent>
        </Card>
      )}

      {isDocumentRequired("partnershipDeed") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Partnership Deed <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription>Required for Partnership business type</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadSection
              docType="partnershipDeed"
              label="Partnership Deed"
              description="Registered partnership deed document"
              required={true}
              currentDocState={documents.partnershipDeed || { name: "", file: null, uploaded: false }}
              onFileSelect={(file) => handleDocumentSelect("partnershipDeed", file)}
              colorClass="purple"
            />
          </CardContent>
        </Card>
      )}

      {isDocumentRequired("llpAgreement") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              LLP Agreement <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription>Required for LLP business type</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadSection
              docType="llpAgreement"
              label="LLP Agreement"
              description="Limited Liability Partnership agreement document"
              required={true}
              currentDocState={documents.llpAgreement || { name: "", file: null, uploaded: false }}
              onFileSelect={(file) => handleDocumentSelect("llpAgreement", file)}
              colorClass="indigo"
            />
          </CardContent>
        </Card>
      )}

      {isDocumentRequired("certificateOfIncorporation") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Certificate of Incorporation <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription>Required for Private Limited Company</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadSection
              docType="certificateOfIncorporation"
              label="Certificate of Incorporation"
              description="Company incorporation certificate from ROC"
              required={true}
              currentDocState={documents.certificateOfIncorporation || { name: "", file: null, uploaded: false }}
              onFileSelect={(file) => handleDocumentSelect("certificateOfIncorporation", file)}
              colorClass="emerald"
            />
          </CardContent>
        </Card>
      )}

      {isDocumentRequired("moaAoa") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              MOA & AOA <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription>Required for Private Limited Company</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadSection
              docType="moaAoa"
              label="Memorandum & Articles of Association"
              description="Memorandum and Articles of Association documents"
              required={true}
              currentDocState={documents.moaAoa || { name: "", file: null, uploaded: false }}
              onFileSelect={(file) => handleDocumentSelect("moaAoa", file)}
              colorClass="teal"
            />
          </CardContent>
        </Card>
      )}

      {/* Bank Details (Required for IEC) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            Bank Details <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>Bank details are mandatory for IEC registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h4 className="font-medium text-indigo-900">🏦 Required Bank Details:</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">
                  Bank Account Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode">
                  IFSC Code <span className="text-red-500">*</span>
                </Label>
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

            <DocumentUploadSection
              docType="cancelledCheque"
              label="Cancelled Cheque or Bank Statement"
              description="Upload cancelled cheque or bank statement for account verification"
              required={true}
              currentDocState={{
                name: "cancelledCheque",
                file: bankDetails.cancelledCheque,
                uploaded: !!bankDetails.cancelledChequeUrl,
                url: bankDetails.cancelledChequeUrl,
                status: bankDetails.cancelledChequeStatus,
                tempFile: bankDetails.tempCancelledCheque,
                tempUrl: bankDetails.tempCancelledChequeUrl,
              }}
              onFileSelect={handleBankDocumentSelect}
              colorClass="indigo"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/dashboard/registration">Save & Continue Later</Link>
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmitApplication} disabled={progress < 100}>
          Submit IEC Application ({progress}%)
        </Button>
      </div>
    </div>
  )
}
