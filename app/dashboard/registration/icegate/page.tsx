"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, Upload, FileText, User, Building, MapPin, Globe, Truck } from "lucide-react"
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

export default function ICEGateRegistration() {
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
    iecNumber: "",
    businessAddress: "",
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
        return true // Required for all business types for ICEGATE
      case "authorizationLetter":
        return businessTypeKey !== "individual" // Required for all except individual
      case "dsc":
        return true // Required for ICEGATE for all business types
      case "activeIecCertificate":
        return true // Required for ICEGATE for all business types
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
    if (businessDetails.iecNumber.trim()) completed++
    if (businessDetails.businessAddress.trim()) completed++

    // IEC Certificate upload
    if (documents.iecCertificate?.uploaded) completed++

    // Add conditional document requirements to total
    if (isDocumentRequired("authorizationLetter")) {
      total++
      if (documents.authorizationLetter?.uploaded) completed++
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
          <h1 className="text-3xl font-bold text-gray-900">ICE Gate Registration</h1>
          <p className="text-gray-600 mt-1">Indian Customs EDI Gateway for customs clearance</p>
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
            Complete all required sections below to proceed with your ICE Gate registration
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

      {/* IEC Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            IEC Details <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>Your Import Export Code details are required for ICE Gate registration</CardDescription>
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
            <p className="text-xs text-gray-500">Your Import Export Code number (10 digits)</p>
          </div>

          <div className="space-y-2">
            <Label>
              IEC Certificate <span className="text-red-500">*</span>
            </Label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleDocumentUpload("iecCertificate", e.target.files?.[0] || null)}
                className="hidden"
                id="iecCertificate"
              />
              {documents.iecCertificate?.uploaded ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="text-sm font-medium">{documents.iecCertificate.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-blue-400 mx-auto" />
                  <div className="text-sm text-gray-600">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600"
                      onClick={() => document.getElementById("iecCertificate")?.click()}
                    >
                      Click to upload IEC Certificate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Upload your IEC certificate copy</p>
                </div>
              )}
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
          <CardDescription>Provide your business information for ICE Gate registration</CardDescription>
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
            <p className="text-xs text-gray-500">Address should match your IEC certificate</p>
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
                      Authorization letter or board resolution for ICEGATE application
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Documents Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            Additional Requirements
          </CardTitle>
          <CardDescription>Documents you'll need for ICEGATE registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-3">📋 Additional Requirements for ICEGATE:</h4>
            <ul className="text-amber-800 text-sm space-y-2">
              <li>
                • <strong>Digital Signature Certificate (DSC):</strong> Required for signing documents electronically
              </li>
              <li>
                • <strong>Active IEC Certificate:</strong> Your IEC should be active and valid
              </li>
              <li>• These will be verified during the registration process</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* ICE Gate Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-600" />
            ICE Gate Information
          </CardTitle>
          <CardDescription>Important information about ICE Gate registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-900 mb-3">🚢 What is ICE Gate?</h4>
            <ul className="text-emerald-800 text-sm space-y-2">
              <li>• Indian Customs EDI Gateway for electronic filing of customs documents</li>
              <li>• Required for import/export customs clearance procedures</li>
              <li>• Enables online submission of shipping bills and bills of entry</li>
              <li>• Facilitates faster customs clearance and reduced paperwork</li>
              <li>• Integration with other government systems for seamless trade</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">📋 Benefits of ICE Gate Registration:</h4>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Online filing of customs documents 24/7</li>
              <li>• Real-time tracking of shipment status</li>
              <li>• Reduced processing time for customs clearance</li>
              <li>• Electronic payment of customs duties</li>
              <li>• Access to trade statistics and reports</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/dashboard/registration">Save & Continue Later</Link>
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" disabled={progress < 100}>
          Submit ICE Gate Application ({progress}%)
        </Button>
      </div>
    </div>
  )
}
