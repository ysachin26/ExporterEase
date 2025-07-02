"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Check,
  Upload,
  FileText,
  User,
  Building,
  MapPin,
  Key,
  Clock,
  Eye,
  XCircle,
  ExternalLink,
  Award,
  Shield,
  CreditCard,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { getDashboardData, uploadDocument, updateRegistrationStep } from "@/app/actions" // Import updateRegistrationStep
import { useRouter } from "next/navigation" // Import useRouter
import type React from "react"

interface DocumentUploadState {
  name: string
  file: File | null
  uploaded: boolean
  url?: string
  status?: "pending" | "uploaded" | "verified" | "rejected"
  tempFile?: File | null
  tempUrl?: string
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
  bankDocumentUrl: string
}

// Helper component for document upload sections with certificate redirect option
const DocumentUploadSection = ({
  docType,
  label,
  description,
  required,
  currentDocState,
  onFileSelect,
  colorClass = "purple",
  showCertificateRedirect = false,
  certificateRedirectUrl = "",
  certificateRedirectText = "",
}: {
  docType: string
  label: string
  description: string
  required: boolean
  currentDocState: DocumentUploadState
  onFileSelect: (file: File | null) => void
  colorClass?: "purple" | "orange" | "indigo" | "emerald" | "teal" | "blue"
  showCertificateRedirect?: boolean
  certificateRedirectUrl?: string
  certificateRedirectText?: string
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

      {/* Certificate redirect link */}
      {showCertificateRedirect && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">Don't have {certificateRedirectText}? Get it made from us!</p>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-300 hover:bg-blue-100 bg-transparent"
            asChild
          >
            <Link href={certificateRedirectUrl} className="flex items-center gap-2">
              <ExternalLink className="h-3 w-3" />
              Apply for {certificateRedirectText}
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default function ICEGATERegistration() {
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
    dscNumber: "",
  })
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
  })
  const [documents, setDocuments] = useState<Record<string, DocumentUploadState>>({})
  const router = useRouter() // Initialize useRouter

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
          // DSC Documents
          dscCertificate: data.user.dscCertificate || "",
          // AD Code Documents
          adCodeLetterFromBankUrl: data.user.adCodeLetterFromBankUrl || "",
          bankDocumentUrl: data.user.bankDocumentUrl || "",
        })

        // Pre-fill registration-specific documents from dashboard data
        const icegateStep = data.registrationSteps.find((step) => step.id === 5) // Corrected stepId for ICEGATE
        const icegateStepDocuments = icegateStep?.documents || []

        const newDocumentsState: Record<string, DocumentUploadState> = {}

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

        // Handle DSC Certificate
        newDocumentsState.dscCertificate = getDocState("dscCertificate", data.user.dscCertificate)

        // Handle Authorization Letter (conditional, shared)
        newDocumentsState.authorizationLetter = getDocState("authorizationLetter", data.user.authorizationLetterUrl)

        // Handle Bank Document (specific to ICEGATE, optional)
        newDocumentsState.bankDocument = getDocState("bankDocument", data.user.bankDocumentUrl)

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
    }
  }, [documents])

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
        return true // Required for all business types for ICEGATE
      case "authorizationLetter":
        return businessTypeKey !== "individual" // Required for all except individual
      case "iecCertificate":
        return true // Required for ICEGATE for all business types
      case "dscCertificate":
        return true // Required for ICEGATE for all business types
      case "gstCertificate":
        return false // GST certificate not required for ICEGATE registration for any business type
      default:
        return false
    }
  }

  const calculateProgress = useCallback(() => {
    let completed = 0
    let total = 10 // Base requirements: panCard, aadhaarCard, photograph, proofOfAddress, email, mobile, iecNumber, dscNumber, iecCertificate, dscCertificate

    // Basic details (auto-filled from profile)
    if (profileData.panCardUrl) completed++
    if (profileData.aadharCardUrl) completed++
    if (profileData.photographUrl) completed++
    if (profileData.proofOfAddressUrl) completed++
    if (profileData.email.trim()) completed++
    if (profileData.mobile.trim()) completed++

    // Business details
    if (businessDetails.iecNumber.trim()) completed++
    if (businessDetails.dscNumber.trim()) completed++

    // Documents: Check for either uploaded URL, temp file, or shared documents
    if (
      (documents.iecCertificate?.url || documents.iecCertificate?.tempFile || profileData.iecCertificate) &&
      documents.iecCertificate?.status !== "rejected"
    )
      completed++
    if (
      (documents.dscCertificate?.url || documents.dscCertificate?.tempFile || profileData.dscCertificate) &&
      documents.dscCertificate?.status !== "rejected"
    )
      completed++

    // Add conditional document requirements to total for non-individual business types
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

    return Math.round((completed / total) * 100)
  }, [profileData, businessDetails, documents])

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

  const handleSubmitApplication = async () => {
    if (calculateProgress() < 100) {
      alert("Please complete all required fields and upload all necessary documents.")
      return
    }

    const documentsToUpload: { docType: string; file: File }[] = []

    for (const key in documents) {
      const doc = documents[key]
      if (doc.tempFile && (!doc.url || doc.status === "rejected")) {
        documentsToUpload.push({ docType: key, file: doc.tempFile })
      }
    }

    let allUploadsSuccessful = true
    if (documentsToUpload.length > 0) {
      for (const docInfo of documentsToUpload) {
        const formData = new FormData()
        formData.append("file", docInfo.file)
        formData.append("documentType", docInfo.docType)
        formData.append("stepId", "5") // Corrected stepId for ICEGATE

        try {
          const result = await uploadDocument(formData)
          if (result.success) {
            setDocuments((prev) => ({
              ...prev,
              [docInfo.docType]: {
                ...prev[docInfo.docType],
                url: result.fileUrl,
                status: "uploaded",
                tempFile: null,
                tempUrl: null,
              },
            }))
            console.log(`Successfully uploaded ${docInfo.docType}`)
          } else {
            allUploadsSuccessful = false
            console.error(`Upload failed for ${docInfo.docType}:`, result.message)
            setDocuments((prev) => ({ ...prev, [docInfo.docType]: { ...prev[docInfo.docType], status: "rejected" } }))
          }
        } catch (error) {
          allUploadsSuccessful = false
          console.error(`Upload error for ${docInfo.docType}:`, error)
          setDocuments((prev) => ({ ...prev, [docInfo.docType]: { ...prev[docInfo.docType], status: "rejected" } }))
        }
      }
    }

    if (allUploadsSuccessful) {
      // Mark the ICEGATE step as completed
      const updateResult = await updateRegistrationStep(5, "completed") // Corrected stepId for ICEGATE
      if (updateResult.success) {
        alert("All documents uploaded successfully! Your ICEGATE application is submitted.")
        router.push("/dashboard/progress") // Redirect to progress page
      } else {
        alert(`ICEGATE application submitted, but failed to update step status: ${updateResult.message}`)
      }
    } else {
      alert("Some documents failed to upload. Please check the console for details and re-upload if necessary.")
    }
  }

  const progress = calculateProgress()
  // const isSoleProprietorship = getBusinessTypeKey(profileData.businessType) === "individual" // Not used

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
      {(profileData.gstCertificate ||
        profileData.iecCertificate ||
        profileData.dscCertificate ||
        profileData.adCodeLetterFromBankUrl) && (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            showCertificateRedirect={true}
            certificateRedirectUrl="/dashboard/registration/iec"
            certificateRedirectText="IEC Certificate"
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
            showCertificateRedirect={true}
            certificateRedirectUrl="/dashboard/registration/dsc"
            certificateRedirectText="DSC Certificate"
          />

          {/* GST Certificate - Removed for all business types in ICEGATE registration */}
          {/* GST certificate is not required for ICEGATE registration for any business type */}
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

      {/* Bank Details - Optional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-600" />
            Bank Details (Optional at the time of registration)
          </CardTitle>
          <CardDescription className="text-gray-600">
            You can provide bank details now or add them later
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-4 w-4 text-slate-600" />
              <h4 className="font-medium text-slate-900">Bank Details Include:</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-900">
                  Bank Account Number
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode" className="text-sm font-medium text-gray-900">
                  IFSC Code
                </Label>
                <Input
                  id="ifscCode"
                  placeholder="Enter IFSC code"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, ifscCode: e.target.value }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-sm font-medium text-gray-900">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  placeholder="Enter bank name"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, bankName: e.target.value }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchName" className="text-sm font-medium text-gray-900">
                  Branch Name
                </Label>
                <Input
                  id="branchName"
                  placeholder="Enter branch name"
                  value={bankDetails.branchName}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, branchName: e.target.value }))}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-sm font-medium text-indigo-900">
                Cancelled Cheque, Bank Statement, or Passbook (Front Page)
              </h5>
              <p className="text-sm text-gray-600">
                Upload a cancelled cheque, bank statement, or the front page of your passbook for account verification.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer bg-white">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentSelect("bankDocument", e.target.files?.[0] || null)}
                  className="hidden"
                  id="bankDocument"
                />
                <label htmlFor="bankDocument" className="cursor-pointer">
                  {documents.bankDocument?.tempUrl || documents.bankDocument?.url ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Check className="h-4 w-4" />
                        <span>Document uploaded</span>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-sm"
                        onClick={(e) => {
                          e.preventDefault()
                          const url = documents.bankDocument?.tempUrl || documents.bankDocument?.url
                          if (url) window.open(url, "_blank")
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div className="text-base text-gray-900">Click to upload</div>
                      <p className="text-sm text-gray-500">Supported formats: .pdf, .jpg, .jpeg, .png</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ICEGATE Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-emerald-600" />
            ICEGATE Information
          </CardTitle>
          <CardDescription>Important information about ICEGATE registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-900 mb-3">🌐 What is ICEGATE?</h4>
            <ul className="text-emerald-800 text-sm space-y-2">
              <li>• Indian Customs Electronic Gateway is a portal for trade and cargo carriers</li>
              <li>• Facilitates e-filing of import and export documents</li>
              <li>• Provides services like duty payment, status inquiry, and more</li>
              <li>• Essential for smooth customs clearance processes</li>
              <li>• Integrates with various government agencies for trade facilitation</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">📋 Benefits of ICEGATE Registration:</h4>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Online filing of Bill of Entry and Shipping Bill</li>
              <li>• Real-time status updates on customs clearance</li>
              <li>• Electronic payment of customs duties</li>
              <li>• Access to various trade-related reports and data</li>
              <li>• Reduced paperwork and faster processing times</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/dashboard/registration">Save & Continue Later</Link>
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmitApplication} disabled={progress < 100}>
          Submit ICEGATE Application ({progress}%)
        </Button>
      </div>
    </div>
  )
}
