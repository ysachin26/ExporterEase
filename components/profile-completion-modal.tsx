"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Check, Mail, Phone, User, CreditCard, FileText, Camera, MapPin, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getDashboardData, updateProfileCompletion, uploadDocument, verifyEmail } from "@/app/actions"

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

interface ProfileData {
  fullName: string
  mobileNumber: string
  email: string
  emailVerified: boolean
  aadharCardUrl: string
  panCardUrl: string
  photographUrl: string
  proofOfAddressUrl: string
  businessType: string
  businessName: string
}

export function ProfileCompletionModal({ isOpen, onClose, onUpdate }: ProfileCompletionModalProps) {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    mobileNumber: "",
    email: "",
    emailVerified: false,
    aadharCardUrl: "",
    panCardUrl: "",
    photographUrl: "",
    proofOfAddressUrl: "",
    businessType: "",
    businessName: "",
  })

  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingStates, setUploadingStates] = useState({
    aadharCard: false,
    panCard: false,
    photograph: false,
    proofOfAddress: false,
  })

  const aadharInputRef = useRef<HTMLInputElement>(null)
  const panInputRef = useRef<HTMLInputElement>(null)
  const photographInputRef = useRef<HTMLInputElement>(null)
  const proofOfAddressInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      const fetchInitialProfileData = async () => {
        try {
          const data = await getDashboardData()
          setProfileData({
            fullName: data.user.fullName,
            mobileNumber: data.user.mobileNo,
            email: data.user.email,
            emailVerified: data.user.emailVerified,
            aadharCardUrl: data.user.aadharCardUrl,
            panCardUrl: data.user.panCardUrl,
            photographUrl: data.user.photographUrl,
            proofOfAddressUrl: data.user.proofOfAddressUrl,
            businessType: data.user.businessType,
            businessName: data.user.businessName,
          })
        } catch (error) {
          console.error("Failed to fetch initial profile data:", error)
        }
      }
      fetchInitialProfileData()
    }
  }, [isOpen])

  const calculateProgress = () => {
    let completed = 0
    const total = 10 // Updated total to include businessType and businessName

    if (profileData.fullName.trim()) completed++
    if (profileData.mobileNumber.trim()) completed++
    if (profileData.email.trim()) completed++
    if (profileData.emailVerified) completed++
    if (profileData.aadharCardUrl.trim()) completed++
    if (profileData.panCardUrl.trim()) completed++
    if (profileData.photographUrl.trim()) completed++
    if (profileData.proofOfAddressUrl.trim()) completed++
    if (profileData.businessType.trim()) completed++
    if (profileData.businessName.trim()) completed++

    return Math.round((completed / total) * 100)
  }

  const handleEmailVerification = async () => {
    if (!profileData.email.trim()) {
      return
    }

    setIsVerifyingEmail(true)

    try {
      // In a real application, you would send an OTP or verification link
      // For demo purposes, we'll simulate a 2-second verification process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Call the server action to verify and save email
      const result = await verifyEmail(profileData.email)

      if (result.success) {
        setProfileData((prev) => ({ ...prev, emailVerified: true }))
        if (onUpdate) onUpdate() // Notify parent to re-fetch dashboard data
      } else {
        console.error("Email verification failed:", result.message)
        // You could show an error toast here
      }
    } catch (error) {
      console.error("Email verification error:", error)
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  const handleFileUpload = async (
    type: "aadharCard" | "panCard" | "photograph" | "proofOfAddress",
    file: File | null,
  ) => {
    if (!file) return

    setUploadingStates((prev) => ({ ...prev, [type]: true }))

    try {
      const result = await uploadDocument(type, file)
      if (result.success) {
        setProfileData((prev) => ({ ...prev, [`${type}Url`]: result.fileUrl }))
        if (onUpdate) onUpdate()
      } else {
        console.error("Upload failed:", result.message)
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploadingStates((prev) => ({ ...prev, [type]: false }))
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    // Update text fields
    await updateProfileCompletion("fullName", profileData.fullName)
    await updateProfileCompletion("mobileNo", profileData.mobileNumber)
    await updateProfileCompletion("email", profileData.email)
    await updateProfileCompletion("businessName", profileData.businessName)

    setIsSaving(false)
    if (onUpdate) onUpdate()
    onClose()
  }

  const progress = calculateProgress()

  const profileFields = [
    {
      icon: User,
      label: "Full Name",
      completed: !!profileData.fullName.trim(),
      description: "As per Aadhar Card",
    },
    {
      icon: Phone,
      label: "Mobile Number",
      completed: !!profileData.mobileNumber.trim(),
      description: "Verified mobile number",
    },
    {
      icon: Mail,
      label: "Email",
      completed: !!profileData.email.trim(),
      description: "Enter your email address",
    },
    {
      icon: Check,
      label: "Email Verified",
      completed: profileData.emailVerified,
      description: "Verified email address",
    },
    {
      icon: Building,
      label: "Business Type",
      completed: !!profileData.businessType.trim(),
      description: "Your business entity type",
    },
    {
      icon: Building,
      label: "Business Name",
      completed: !!profileData.businessName.trim(),
      description: "Your business/trade name",
    },
    {
      icon: Camera,
      label: "Photograph",
      completed: !!profileData.photographUrl.trim(),
      description: "Upload your photo",
    },
    {
      icon: CreditCard,
      label: "Aadhar Card",
      completed: !!profileData.aadharCardUrl.trim(),
      description: "Upload Aadhar document",
    },
    {
      icon: FileText,
      label: "PAN Card",
      completed: !!profileData.panCardUrl.trim(),
      description: "Upload PAN document",
    },
    {
      icon: MapPin,
      label: "Proof of Address",
      completed: !!profileData.proofOfAddressUrl.trim(),
      description: "Upload address proof document",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Complete your profile to unlock all features and start your export registration journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary-foreground">Profile Completion</span>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-primary-foreground mt-2">
              {profileFields.filter((f) => !f.completed).length} fields remaining
            </p>
          </div>

          {/* Progress Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profileFields.map((field, index) => {
              const Icon = field.icon
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    field.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      field.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{field.label}</div>
                    <div className="text-xs text-gray-600">{field.description}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name (as per Aadhar Card)</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={profileData.mobileNumber}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button
                  onClick={handleEmailVerification}
                  disabled={!profileData.email.trim() || profileData.emailVerified || isVerifyingEmail}
                  variant={profileData.emailVerified ? "default" : "outline"}
                  className={profileData.emailVerified ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isVerifyingEmail ? "Verifying..." : profileData.emailVerified ? "Verified" : "Verify"}
                </Button>
              </div>
              {profileData.emailVerified && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Check className="h-4 w-4" />
                  Email verified and saved to database
                </div>
              )}
              {!profileData.emailVerified && profileData.email.trim() && (
                <p className="text-xs text-amber-600">Click "Verify" to confirm and save your email address</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  value={profileData.businessType}
                  disabled
                  className="bg-gray-50"
                  placeholder="Business entity type"
                />
                <p className="text-xs text-gray-500">Set during registration - contact support to change</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={profileData.businessName}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Enter your business name"
                />
              </div>
            </div>

            {/* Document Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photograph Upload */}
              <div className="space-y-2">
                <Label>Photograph</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={photographInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("photograph", e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {profileData.photographUrl ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto" />
                      <div className="text-sm text-gray-600">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => photographInputRef.current?.click()}
                          disabled={uploadingStates.photograph}
                        >
                          {uploadingStates.photograph ? "Uploading..." : "Upload Photo"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Aadhar Card Upload */}
              <div className="space-y-2">
                <Label>Aadhar Card</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={aadharInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("aadharCard", e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {profileData.aadharCardUrl ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <div className="text-sm text-gray-600">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => aadharInputRef.current?.click()}
                          disabled={uploadingStates.aadharCard}
                        >
                          {uploadingStates.aadharCard ? "Uploading..." : "Click to upload"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PAN Card Upload */}
              <div className="space-y-2">
                <Label>PAN Card</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={panInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("panCard", e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {profileData.panCardUrl ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <div className="text-sm text-gray-600">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => panInputRef.current?.click()}
                          disabled={uploadingStates.panCard}
                        >
                          {uploadingStates.panCard ? "Uploading..." : "Click to upload"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof of Address Upload */}
              <div className="space-y-2">
                <Label>Proof of Address</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={proofOfAddressInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("proofOfAddress", e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {profileData.proofOfAddressUrl ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <MapPin className="h-8 w-8 text-gray-400 mx-auto" />
                      <div className="text-sm text-gray-600">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => proofOfAddressInputRef.current?.click()}
                          disabled={uploadingStates.proofOfAddress}
                        >
                          {uploadingStates.proofOfAddress ? "Uploading..." : "Click to upload"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Utility Bill, Bank Statement, Rent Agreement (PDF, PNG, JPG up to 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Proof of Address Information */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">📍 Acceptable Proof of Address Documents:</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Electricity/Water/Gas Bill (not older than 3 months)</li>
                <li>• Bank Statement (not older than 3 months)</li>
                <li>• Rent Agreement (registered)</li>
                <li>• Property Tax Receipt</li>
                <li>• Telephone/Mobile Bill (not older than 3 months)</li>
                <li>• Voter ID Card</li>
                <li>• Driving License</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Save & Continue Later
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : `Complete Profile (${progress}%)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
