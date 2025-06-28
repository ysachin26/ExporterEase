"use client"

import { useState, useEffect, useCallback } from "react"
import type React from "react"
import { ArrowLeft, Check, FileText, User, MapPin, Shield, Key, Clock, XCircle, Eye, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { getDashboardData, uploadDocument } from "@/app/actions"

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
}

interface DocumentUploadState {
  name: string
  file: File | null
  uploaded: boolean
  url?: string
  status?: "pending" | "uploaded" | "verified" | "rejected"
  tempFile?: File | null // New: for temporary local storage
  tempUrl?: string | null // New: for temporary local preview URL
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
          disabled={!!currentDocState.url && currentDocState.status !== "rejected" && !hasTempFile}
        />
        {displayUrl ? (
          <div className="flex flex-col items-center justify-center gap-2">
            {getStatusDisplay(currentDocState.status, hasTempFile)}
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

export default function DSCRegistration() {
  const [certificateType, setCertificateType] = useState<"individual" | "organization" | "">("")
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
  })
  const [businessDetails, setBusinessDetails] = useState({
    organizationName: "",
    designation: "",
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
        })
        // Pre-fill organization name with business name
        setBusinessDetails((prev) => ({
          ...prev,
          organizationName: data.user.businessName,
        }))

        // Pre-fill registration-specific documents from dashboard data
        const dscStep = data.registrationSteps.find((step) => step.id === 7) // Assuming DSC is step 7 (adjust if needed)
        if (dscStep) {
          const newDocumentsState: Record<string, DocumentUploadState> = {}
          dscStep.documents.forEach((doc) => {
            newDocumentsState[doc.name] = {
              name: doc.name,
              file: doc.url ? ({} as File) : null,
              uploaded: !!doc.url,
              url: doc.url,
              status: doc.status,
            }
          })
          setDocuments(newDocumentsState)
        }
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

  const calculateProgress = useCallback(() => {
    let completed = 0
    let total = 7 // Basic items + certificate type

    // Basic details (auto-filled from profile)
    if (profileData.panCardUrl) completed++
    if (profileData.aadharCardUrl) completed++
    if (profileData.photographUrl) completed++
    if (profileData.proofOfAddressUrl) completed++
    if (profileData.email.trim()) completed++
    if (profileData.mobile.trim()) completed++

    // Certificate type
    if (certificateType) completed++

    // Organization details (if organization type)
    if (certificateType === "organization") {
      total += 2
      if (businessDetails.organizationName.trim()) completed++
      if (businessDetails.designation.trim()) completed++
    }

    return Math.round((completed / total) * 100)
  }, [profileData, certificateType, businessDetails])

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
    // First, validate all required fields are filled
    if (progress < 100) {
      alert("Please complete all required fields and upload all necessary documents.")
      return
    }

    // Handle document uploads (DSC page doesn't have specific document uploads in the original,
    // but if it were to have them, this is where they'd be handled)
    const documentsToUpload: { docType: string; file: File }[] = []

    for (const key in documents) {
      const doc = documents[key]
      if (doc.tempFile && (!doc.url || doc.status === "rejected")) {
        documentsToUpload.push({ docType: key, file: doc.tempFile })
      }
    }

    if (documentsToUpload.length === 0) {
      alert("No new documents to upload or all documents already processed. Proceeding with final form submission.")
      console.log("Final form submission logic would go here.")
      return
    }

    let allUploadsSuccessful = true
    for (const docInfo of documentsToUpload) {
      const formData = new FormData()
      formData.append("file", docInfo.file)
      formData.append("documentType", docInfo.docType)
      formData.append("stepId", "7") // DSC Registration step ID

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

    if (allUploadsSuccessful) {
      alert("All documents uploaded successfully! Your application is submitted.")
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
          <h1 className="text-3xl font-bold text-gray-900">DSC Registration</h1>
          <p className="text-gray-600 mt-1">Digital Signature Certificate for secure online transactions</p>
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
            Complete all required sections below to proceed with your DSC registration
          </p>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
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

      {/* Certificate Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-purple-600" />
            Certificate Type <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>Select the type of Digital Signature Certificate you need</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>
              Select certificate type: <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={certificateType}
              onValueChange={(value) => setCertificateType(value as typeof certificateType)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual">Individual DSC</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="organization" id="organization" />
                <Label htmlFor="organization">Organization DSC</Label>
              </div>
            </RadioGroup>
          </div>

          {certificateType === "individual" && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">👤 Individual DSC</h4>
              <p className="text-blue-700 text-sm">
                This certificate will be issued in your personal name and can be used for personal digital transactions.
              </p>
            </div>
          )}

          {certificateType === "organization" && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-3">🏢 Organization DSC</h4>
              <p className="text-purple-700 text-sm mb-4">
                This certificate will be issued for your organization and requires additional details.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">
                    Organization Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="organizationName"
                    placeholder="Enter organization name"
                    value={businessDetails.organizationName}
                    onChange={(e) => setBusinessDetails((prev) => ({ ...prev, organizationName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">
                    Your Designation <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="designation"
                    placeholder="e.g., Director, Manager, etc."
                    value={businessDetails.designation}
                    onChange={(e) => setBusinessDetails((prev) => ({ ...prev, designation: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Verification Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-amber-600" />
            Video Verification / eKYC
          </CardTitle>
          <CardDescription>Required for DSC registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-3">📹 Video Verification Process:</h4>
            <ul className="text-amber-800 text-sm space-y-2">
              <li>• Video verification will be scheduled after document submission</li>
              <li>• You'll need to appear for a video call with the Registration Authority</li>
              <li>• Keep your original documents ready for verification</li>
              <li>• The process typically takes 10-15 minutes</li>
              <li>• Ensure good lighting and stable internet connection</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* DSC Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            DSC Information
          </CardTitle>
          <CardDescription>Important information about Digital Signature Certificate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-900 mb-3">🔐 What is DSC?</h4>
            <ul className="text-emerald-800 text-sm space-y-2">
              <li>• Digital Signature Certificate is a secure digital key that certifies your identity</li>
              <li>• Required for filing income tax returns, GST returns, and other government forms</li>
              <li>• Ensures authenticity and integrity of digital documents</li>
              <li>• Valid for 1-3 years depending on the type selected</li>
              <li>• Can be used on multiple devices with proper installation</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-3">📋 Next Steps After Registration:</h4>
            <ul className="text-amber-800 text-sm space-y-2">
              <li>• You will receive a token number for tracking your application</li>
              <li>• Physical verification may be required at the Registration Authority</li>
              <li>• DSC will be issued within 3-7 working days after verification</li>
              <li>• You will receive the certificate via email or USB token</li>
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
          Submit DSC Application ({progress}%)
        </Button>
      </div>
    </div>
  )
}
