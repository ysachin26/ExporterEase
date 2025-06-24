"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, Upload, FileText, User, Building, CreditCard, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { getDashboardData } from "@/app/actions"

interface DocumentUpload {
  name: string
  file: File | null
  uploaded: boolean
}

interface BankDetails {
  accountNumber: string
  bankName: string
  branchName: string
  ifscCode: string
  cancelledCheque: File | null
}

interface ProfileData {
  fullName: string
  email: string
  mobile: string
  businessType: string
  businessName: string
  panCard: boolean
  aadhaarCard: boolean
  photograph: boolean
  proofOfAddress: boolean
}

export default function IECRegistration() {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    mobile: "",
    businessType: "",
    businessName: "",
    panCard: false,
    aadhaarCard: false,
    photograph: false,
    proofOfAddress: false,
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
  })
  const [documents, setDocuments] = useState<Record<string, DocumentUpload>>({})

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
          panCard: !!data.user.panCardUrl,
          aadhaarCard: !!data.user.aadharCardUrl,
          photograph: !!data.user.photographUrl,
          proofOfAddress: !!data.user.proofOfAddressUrl,
        })
        // Pre-fill business name
        setBusinessDetails((prev) => ({
          ...prev,
          businessName: data.user.businessName,
        }))
      } catch (error) {
        console.error("Failed to fetch profile data:", error)
      }
    }
    fetchProfileData()
  }, [])

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
      case "moaAoa":
        return businessTypeKey === "pvt_ltd"
      default:
        return false
    }
  }

  const calculateProgress = () => {
    let completed = 0
    let total = 9 // Base requirements

    // Basic details (auto-filled from profile)
    if (profileData.panCard) completed++
    if (profileData.aadhaarCard) completed++
    if (profileData.photograph) completed++
    if (profileData.proofOfAddress) completed++
    if (profileData.email.trim()) completed++
    if (profileData.mobile.trim()) completed++

    // Business details
    if (businessDetails.natureOfBusiness.trim()) completed++
    if (businessDetails.businessAddress.trim()) completed++

    // Bank details
    if (bankDetails.accountNumber.trim() && bankDetails.ifscCode.trim() && bankDetails.cancelledCheque) completed++

    // Add conditional document requirements to total
    if (isDocumentRequired("authorizationLetter")) {
      total++
      if (documents.authorizationLetter?.uploaded) completed++
    }
    if (isDocumentRequired("partnershipDeed")) {
      total++
      if (documents.partnershipDeed?.uploaded) completed++
    }
    if (isDocumentRequired("llpAgreement")) {
      total++
      if (documents.llpAgreement?.uploaded) completed++
    }
    if (isDocumentRequired("certificateOfIncorporation")) {
      total++
      if (documents.certificateOfIncorporation?.uploaded) completed++
    }
    if (isDocumentRequired("moaAoa")) {
      total++
      if (documents.moaAoa?.uploaded) completed++
    }

    return Math.round((completed / total) * 100)
  }

  const handleDocumentUpload = (docType: string, file: File | null) => {
    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        name: file?.name || "",
        file: file,
        uploaded: !!file,
      },
    }))
  }

  const handleBankDocumentUpload = (file: File | null) => {
    setBankDetails((prev) => ({
      ...prev,
      cancelledCheque: file,
    }))
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
                { key: "panCard", label: "PAN Card", icon: FileText },
                { key: "aadhaarCard", label: "Aadhaar Card", icon: FileText },
                { key: "photograph", label: "Photograph", icon: User },
                { key: "proofOfAddress", label: "Proof of Address", icon: MapPin },
              ].map((doc) => (
                <div key={doc.key} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <doc.icon className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {doc.label} <span className="text-red-500">*</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <Check className="h-3 w-3" />
                      <span>Uploaded in profile</span>
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

      {/* Conditional Documents Based on Business Type */}
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
            <div className="space-y-2">
              <Label>
                Authorization Letter / Board Resolution <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload("authorizationLetter", e.target.files?.[0] || null)}
                  className="hidden"
                  id="authorizationLetter"
                />
                {documents.authorizationLetter?.uploaded ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="text-sm font-medium">{documents.authorizationLetter.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-orange-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-orange-600"
                        onClick={() => document.getElementById("authorizationLetter")?.click()}
                      >
                        Click to upload Authorization Letter
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Authorization letter or board resolution for IEC application
                    </p>
                  </div>
                )}
              </div>
            </div>
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
            <div className="space-y-2">
              <Label>
                Partnership Deed <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload("partnershipDeed", e.target.files?.[0] || null)}
                  className="hidden"
                  id="partnershipDeed"
                />
                {documents.partnershipDeed?.uploaded ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="text-sm font-medium">{documents.partnershipDeed.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-purple-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-purple-600"
                        onClick={() => document.getElementById("partnershipDeed")?.click()}
                      >
                        Click to upload Partnership Deed
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Registered partnership deed document</p>
                  </div>
                )}
              </div>
            </div>
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
            <div className="space-y-2">
              <Label>
                LLP Agreement <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload("llpAgreement", e.target.files?.[0] || null)}
                  className="hidden"
                  id="llpAgreement"
                />
                {documents.llpAgreement?.uploaded ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="text-sm font-medium">{documents.llpAgreement.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-indigo-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-indigo-600"
                        onClick={() => document.getElementById("llpAgreement")?.click()}
                      >
                        Click to upload LLP Agreement
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Limited Liability Partnership agreement document</p>
                  </div>
                )}
              </div>
            </div>
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
            <div className="space-y-2">
              <Label>
                Certificate of Incorporation <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed border-emerald-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload("certificateOfIncorporation", e.target.files?.[0] || null)}
                  className="hidden"
                  id="certificateOfIncorporation"
                />
                {documents.certificateOfIncorporation?.uploaded ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="text-sm font-medium">{documents.certificateOfIncorporation.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-emerald-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-emerald-600"
                        onClick={() => document.getElementById("certificateOfIncorporation")?.click()}
                      >
                        Click to upload Certificate of Incorporation
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Company incorporation certificate from ROC</p>
                  </div>
                )}
              </div>
            </div>
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
            <div className="space-y-2">
              <Label>
                Memorandum & Articles of Association <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed border-teal-300 rounded-lg p-4 text-center hover:border-teal-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload("moaAoa", e.target.files?.[0] || null)}
                  className="hidden"
                  id="moaAoa"
                />
                {documents.moaAoa?.uploaded ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="text-sm font-medium">{documents.moaAoa.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-teal-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-teal-600"
                        onClick={() => document.getElementById("moaAoa")?.click()}
                      >
                        Click to upload MOA & AOA
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Memorandum and Articles of Association documents</p>
                  </div>
                )}
              </div>
            </div>
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

            <div className="space-y-2">
              <Label>
                Cancelled Cheque or Bank Statement <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleBankDocumentUpload(e.target.files?.[0] || null)}
                  className="hidden"
                  id="cancelledCheque"
                />
                {bankDetails.cancelledCheque ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="text-sm font-medium">{bankDetails.cancelledCheque.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-indigo-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-indigo-600"
                        onClick={() => document.getElementById("cancelledCheque")?.click()}
                      >
                        Click to upload
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload cancelled cheque or bank statement for account verification
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/dashboard/registration">Save & Continue Later</Link>
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" disabled={progress < 100}>
          Submit IEC Application ({progress}%)
        </Button>
      </div>
    </div>
  )
}
