"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, FileText, User, MapPin, Shield, Key } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { getDashboardData } from "@/app/actions"

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

export default function DSCRegistration() {
  const [certificateType, setCertificateType] = useState<"individual" | "organization" | "">("")
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
    organizationName: "",
    designation: "",
  })

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
        // Pre-fill organization name with business name
        setBusinessDetails((prev) => ({
          ...prev,
          organizationName: data.user.businessName,
        }))
      } catch (error) {
        console.error("Failed to fetch profile data:", error)
      }
    }
    fetchProfileData()
  }, [])

  const calculateProgress = () => {
    let completed = 0
    let total = 7 // Basic items + certificate type

    // Basic details (auto-filled from profile)
    if (profileData.panCard) completed++
    if (profileData.aadhaarCard) completed++
    if (profileData.photograph) completed++
    if (profileData.proofOfAddress) completed++
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
        <Button className="bg-blue-600 hover:bg-blue-700" disabled={progress < 100}>
          Submit DSC Application ({progress}%)
        </Button>
      </div>
    </div>
  )
}
