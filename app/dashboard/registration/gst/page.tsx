"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Check,
  Upload,
  FileText,
  Home,
  User,
  Building,
  CreditCard,
  MapPin,
  Shield,
  Users,
  Award,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { getDashboardData } from "@/app/actions" // Import getDashboardData

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

interface BusinessDocuments {
  authorizationLetter: File | null
  partnershipDeed: File | null
  certificateOfIncorporation: File | null
  moaAoa: File | null
}

export default function GSTRegistration() {
  const [premiseType, setPremiseType] = useState<"rented" | "owned" | "">("")
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    panCardUploaded: false,
    aadharCardUploaded: false,
    photographUploaded: false,
    proofOfAddressUploaded: false,
  })
  const [businessDetails, setBusinessDetails] = useState({
    natureOfBusiness: "",
    businessName: "",
  })
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    cancelledCheque: null,
  })
  const [businessDocuments, setBusinessDocuments] = useState<BusinessDocuments>({
    authorizationLetter: null,
    partnershipDeed: null,
    certificateOfIncorporation: null,
    moaAoa: null,
  })
  const [documents, setDocuments] = useState<Record<string, DocumentUpload>>({})
  const [businessType, setBusinessType] = useState<"individual" | "partnership" | "llp" | "pvt_ltd" | "">("")

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await getDashboardData()

        // Map business type from database to form values
        let mappedBusinessType: "individual" | "partnership" | "llp" | "pvt_ltd" = "individual"
        switch (data.user.businessType) {
          case "Propatorship":
            mappedBusinessType = "individual"
            break
          case "Partnership":
            mappedBusinessType = "partnership"
            break
          case "LLP":
            mappedBusinessType = "llp"
            break
          case "PVT LTD":
            mappedBusinessType = "pvt_ltd"
            break
          default:
            mappedBusinessType = "individual"
        }

        setBusinessType(mappedBusinessType)
        setProfileData({
          fullName: data.user.fullName,
          email: data.user.email,
          mobile: data.user.mobileNo,
          panCardUploaded: !!data.user.panCardUrl,
          aadharCardUploaded: !!data.user.aadharCardUrl,
          photographUploaded: !!data.user.photographUrl,
          proofOfAddressUploaded: !!data.user.proofOfAddressUrl,
        })

        // Pre-fill business name from profile
        setBusinessDetails({
          natureOfBusiness: "",
          businessName: data.user.businessName || "",
        })
      } catch (error) {
        console.error("Failed to fetch initial GST registration data:", error)
      }
    }
    fetchInitialData()
  }, [])

  const calculateProgress = () => {
    let completed = 0
    let total = 0

    // Basic details (from profileData)
    total += 7 // fullName, mobile, email, panCard, aadhaarCard, photograph, proofOfAddress
    if (profileData.fullName.trim()) completed++
    if (profileData.mobile.trim()) completed++
    if (profileData.email.trim()) completed++
    if (profileData.panCardUploaded) completed++
    if (profileData.aadharCardUploaded) completed++
    if (profileData.photographUploaded) completed++
    if (profileData.proofOfAddressUploaded) completed++

    // Business type selection
    // Remove this line from calculateProgress():
    // total += 1
    // if (businessType) completed++

    // Business details (only count if business type is selected)
    if (businessType) {
      total += 2
      if (businessDetails.natureOfBusiness.trim()) completed++
      if (businessDetails.businessName.trim()) completed++
    }

    // Business entity documents (based on business type)
    if (businessType) {
      total += 1 // Authorization letter (required for all)
      if (businessDocuments.authorizationLetter) completed++

      if (businessType === "partnership" || businessType === "llp") {
        total += 1 // Partnership deed/LLP agreement
        if (businessDocuments.partnershipDeed) completed++
      }

      if (businessType === "pvt_ltd") {
        total += 2 // Certificate of incorporation + MOA & AOA
        if (businessDocuments.certificateOfIncorporation) completed++
        if (businessDocuments.moaAoa) completed++
      }
    }

    // Premise documents (add to total based on type)
    if (premiseType === "rented") {
      total += 3
      if (documents.rentAgreement?.uploaded) completed++
      if (documents.electricityBill?.uploaded) completed++
      if (documents.noc?.uploaded) completed++
    } else if (premiseType === "owned") {
      total += 2
      if (documents.propertyProof?.uploaded) completed++
      if (documents.electricityBillOwned?.uploaded) completed++
    }

    // Bank Details (optional, so not added to total unless filled)
    if (
      bankDetails.accountNumber.trim() ||
      bankDetails.bankName.trim() ||
      bankDetails.branchName.trim() ||
      bankDetails.ifscCode.trim() ||
      bankDetails.cancelledCheque
    ) {
      total += 5 // account, bank, branch, ifsc, cheque
      if (bankDetails.accountNumber.trim()) completed++
      if (bankDetails.bankName.trim()) completed++
      if (bankDetails.branchName.trim()) completed++
      if (bankDetails.ifscCode.trim()) completed++
      if (bankDetails.cancelledCheque) completed++
    }

    return total === 0 ? 0 : Math.round((completed / total) * 100)
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

  const handleBusinessDocumentUpload = (docType: keyof BusinessDocuments, file: File | null) => {
    setBusinessDocuments((prev) => ({
      ...prev,
      [docType]: file,
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
          <h1 className="text-3xl font-bold text-gray-900">GST Registration</h1>
          <p className="text-gray-600 mt-1">Complete all required steps to register for GST</p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-teal-900">Registration Progress</h3>
            <span className="text-teal-600 font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-teal-700 text-sm mt-2">
            Complete all required sections below to proceed with your GST registration
          </p>
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
                { key: "panCardUploaded", label: "PAN Card", icon: FileText, completed: profileData.panCardUploaded },
                {
                  key: "aadharCardUploaded",
                  label: "Aadhaar Card",
                  icon: FileText,
                  completed: profileData.aadharCardUploaded,
                },
                {
                  key: "photographUploaded",
                  label: "Photograph",
                  icon: User,
                  completed: profileData.photographUploaded,
                },
                {
                  key: "proofOfAddressUploaded",
                  label: "Proof of Address",
                  icon: MapPin,
                  completed: profileData.proofOfAddressUploaded,
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

      {/* Business Type Display - Fetched from Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Business Entity Type
          </CardTitle>
          <CardDescription>Business type from your registration profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-medium text-blue-900">
                {businessType === "individual"
                  ? "Individual / Sole Proprietor"
                  : businessType === "partnership"
                    ? "Partnership Firm"
                    : businessType === "llp"
                      ? "LLP (Limited Liability Partnership)"
                      : businessType === "pvt_ltd"
                        ? "Private Limited Company"
                        : "Loading..."}
              </span>
            </div>
            <p className="text-blue-700 text-sm">
              Fetched from your registration profile. Document requirements are customized based on this business type.
            </p>
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

          <div className="space-y-2">
            <Label htmlFor="businessName">
              Name of Business / Trade Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessName"
              placeholder="Enter your business or trade name"
              value={businessDetails.businessName}
              onChange={(e) => setBusinessDetails((prev) => ({ ...prev, businessName: e.target.value }))}
            />
            {businessDetails.businessName && (
              <div className="flex items-center gap-1 text-green-600 text-xs">
                <Check className="h-3 w-3" />
                <span>Pre-filled from your profile</span>
              </div>
            )}
            <p className="text-xs text-gray-500">This name will appear on your GST certificate</p>
          </div>
        </CardContent>
      </Card>

      {/* Business Entity Documents - Show based on business type */}
      {businessType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Business Entity Documents <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription>
              Upload required documents for{" "}
              {businessType === "individual"
                ? "Individual/Sole Proprietor"
                : businessType === "partnership"
                  ? "Partnership Firm"
                  : businessType === "llp"
                    ? "LLP"
                    : "Private Limited Company"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Authorization Letter - Required for all types */}
            <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h4 className="font-medium text-indigo-900">📋 Authorization Documents:</h4>
              <div className="space-y-2">
                <Label>
                  Authorization Letter / Board Resolution <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleBusinessDocumentUpload("authorizationLetter", e.target.files?.[0] || null)}
                    className="hidden"
                    id="authorizationLetter"
                  />
                  {businessDocuments.authorizationLetter ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">{businessDocuments.authorizationLetter.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Shield className="h-8 w-8 text-indigo-400 mx-auto" />
                      <div className="text-sm text-gray-600">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-indigo-600"
                          onClick={() => document.getElementById("authorizationLetter")?.click()}
                        >
                          Click to upload
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {businessType === "individual"
                          ? "Self-declaration letter"
                          : businessType === "partnership"
                            ? "Authorization from partners"
                            : businessType === "llp"
                              ? "Authorization from designated partners"
                              : "Board resolution from directors"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Partnership Deed - Only for Partnership and LLP */}
            {(businessType === "partnership" || businessType === "llp") && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900">🤝 Partnership Documents:</h4>
                <div className="space-y-2">
                  <Label>
                    {businessType === "partnership" ? "Partnership Deed" : "LLP Agreement"}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleBusinessDocumentUpload("partnershipDeed", e.target.files?.[0] || null)}
                      className="hidden"
                      id="partnershipDeed"
                    />
                    {businessDocuments.partnershipDeed ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span className="text-sm font-medium">{businessDocuments.partnershipDeed.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Users className="h-8 w-8 text-purple-400 mx-auto" />
                        <div className="text-sm text-gray-600">
                          <Button
                            variant="link"
                            className="p-0 h-auto text-purple-600"
                            onClick={() => document.getElementById("partnershipDeed")?.click()}
                          >
                            Click to upload
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          {businessType === "partnership" ? "Registered partnership deed" : "LLP agreement"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Company Documents - Only for Private Limited Company */}
            {businessType === "pvt_ltd" && (
              <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-medium text-emerald-900">🏢 Company Documents:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Certificate of Incorporation */}
                  <div className="space-y-2">
                    <Label>
                      Certificate of Incorporation <span className="text-red-500">*</span>
                    </Label>
                    <div className="border-2 border-dashed border-emerald-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleBusinessDocumentUpload("certificateOfIncorporation", e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="certificateOfIncorporation"
                      />
                      {businessDocuments.certificateOfIncorporation ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <Check className="h-5 w-5" />
                          <span className="text-xs font-medium">
                            {businessDocuments.certificateOfIncorporation.name}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Award className="h-6 w-6 text-emerald-400 mx-auto" />
                          <div className="text-sm text-gray-600">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-emerald-600 text-xs"
                              onClick={() => document.getElementById("certificateOfIncorporation")?.click()}
                            >
                              Upload
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MOA & AOA */}
                  <div className="space-y-2">
                    <Label>
                      MOA & AOA <span className="text-red-500">*</span>
                    </Label>
                    <div className="border-2 border-dashed border-emerald-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleBusinessDocumentUpload("moaAoa", e.target.files?.[0] || null)}
                        className="hidden"
                        id="moaAoa"
                      />
                      {businessDocuments.moaAoa ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <Check className="h-5 w-5" />
                          <span className="text-xs font-medium">{businessDocuments.moaAoa.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileText className="h-6 w-6 text-emerald-400 mx-auto" />
                          <div className="text-sm text-gray-600">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-emerald-600 text-xs"
                              onClick={() => document.getElementById("moaAoa")?.click()}
                            >
                              Upload
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-emerald-700">
                  MOA (Memorandum of Association) & AOA (Articles of Association) documents
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Premises Proof */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Business Premises Proof <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>Choose documents based on your business premise situation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>
              Select your premise type: <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={premiseType} onValueChange={(value) => setPremiseType(value as "rented" | "owned")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rented" id="rented" />
                <Label htmlFor="rented">Rented Property</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owned" id="owned" />
                <Label htmlFor="owned">Owned Property</Label>
              </div>
            </RadioGroup>
          </div>

          {premiseType === "rented" && (
            <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900">📌 Required for Rented Property:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: "rentAgreement", label: "Rent/Lease Agreement (Registered)" },
                  { key: "electricityBill", label: "Electricity Bill (latest)" },
                  { key: "noc", label: "NOC from Property Owner" },
                ].map((doc) => (
                  <div key={doc.key} className="space-y-2">
                    <Label>
                      {doc.label} <span className="text-red-500">*</span>
                    </Label>
                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-3 text-center">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload(doc.key, e.target.files?.[0] || null)}
                        className="hidden"
                        id={doc.key}
                      />
                      {documents[doc.key]?.uploaded ? (
                        <div className="text-green-600">
                          <Check className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-xs">Uploaded</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-6 w-6 text-orange-400 mx-auto mb-1" />
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-orange-600 text-xs"
                            onClick={() => document.getElementById(doc.key)?.click()}
                          >
                            Upload
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {premiseType === "owned" && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900">📌 Required for Owned Property:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "propertyProof", label: "Index II / Sale Deed / Property Tax Receipt" },
                  { key: "electricityBillOwned", label: "Electricity Bill (latest)" },
                ].map((doc) => (
                  <div key={doc.key} className="space-y-2">
                    <Label>
                      {doc.label} <span className="text-red-500">*</span>
                    </Label>
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-3 text-center">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload(doc.key, e.target.files?.[0] || null)}
                        className="hidden"
                        id={doc.key}
                      />
                      {documents[doc.key]?.uploaded ? (
                        <div className="text-green-600">
                          <Check className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-xs">Uploaded</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-6 w-6 text-green-400 mx-auto mb-1" />
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-green-600 text-xs"
                            onClick={() => document.getElementById(doc.key)?.click()}
                          >
                            Upload
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Details (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            Bank Details (Optional at the time of registration)
          </CardTitle>
          <CardDescription>You can provide bank details now or add them later</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h4 className="font-medium text-indigo-900">🏦 Bank Details Include:</h4>

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
              <Label>Cancelled Cheque or First Page of Passbook</Label>
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
                      Upload cancelled cheque or first page of passbook with name and account details clearly visible
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
        <Button className="bg-primary hover:bg-primary/90" disabled={progress < 100}>
          Submit GST Application ({progress}%)
        </Button>
      </div>
    </div>
  )
}
