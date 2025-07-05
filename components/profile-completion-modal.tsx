"use client"

import { useState, useRef, useEffect } from "react"
import {
  Upload,
  Check,
  Mail,
  Phone,
  User,
  CreditCard,
  FileText,
  Camera,
  MapPin,
  Building,
  Eye,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getDashboardData, updateProfileCompletion, uploadDocument, verifyEmail } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

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
  // Add status fields
  aadharCardStatus: "pending" | "uploaded" | "verified" | "rejected"
  panCardStatus: "pending" | "uploaded" | "verified" | "rejected"
  photographStatus: "pending" | "uploaded" | "verified" | "rejected"
  proofOfAddressStatus: "pending" | "uploaded" | "verified" | "rejected"
}

interface StagedFileEntry {
  file: File
  previewUrl: string
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
    aadharCardStatus: "pending",
    panCardStatus: "pending",
    photographStatus: "pending",
    proofOfAddressStatus: "pending",
  })

  const [stagedFiles, setStagedFiles] = useState<Record<string, StagedFileEntry | null>>({
    aadharCard: null,
    panCard: null,
    photograph: null,
    proofOfAddress: null,
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

  const { toast } = useToast()

  // Define profile fields configuration
  const profileFieldsConfig = [
    {
      icon: User,
      label: "Full Name",
      description: "As per Aadhar Card",
      key: "fullName",
    },
    {
      icon: Phone,
      label: "Mobile Number",
      description: "Verified mobile number",
      key: "mobileNumber",
    },
    {
      icon: Mail,
      label: "Email",
      description: "Enter your email address",
      key: "email",
    },
    {
      icon: Check,
      label: "Email Verified",
      description: "Verified email address",
      key: "emailVerified",
    },
    {
      icon: Building,
      label: "Business Type",
      description: "Your business entity type",
      key: "businessType",
    },
    {
      icon: Building,
      label: "Business Name",
      description: "Your business/trade name",
      key: "businessName",
    },
    {
      icon: Camera,
      label: "Photograph",
      description: "Upload your photo",
      type: "photograph",
      ref: photographInputRef,
      accept: ".jpg,.jpeg,.png",
      uploadHint: "JPG, PNG up to 5MB",
    },
    {
      icon: CreditCard,
      label: "Aadhar Card",
      description: "Upload Aadhar document",
      type: "aadharCard",
      ref: aadharInputRef,
      accept: ".pdf,.jpg,.jpeg,.png",
      uploadHint: "PDF, PNG, JPG up to 10MB",
    },
    {
      icon: FileText,
      label: "PAN Card",
      description: "Upload PAN document",
      type: "panCard",
      ref: panInputRef,
      accept: ".pdf,.jpg,.jpeg,.png",
      uploadHint: "PDF, PNG, JPG up to 10MB",
    },
    {
      icon: MapPin,
      label: "Proof of Address",
      description: "Upload address proof document",
      type: "proofOfAddress",
      ref: proofOfAddressInputRef,
      accept: ".pdf,.jpg,.jpeg,.png",
      uploadHint: "Utility Bill, Bank Statement, Rent Agreement (PDF, PNG, JPG up to 10MB)",
    },
  ] as const // Use 'as const' for type safety

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
            // Populate new status fields
            aadharCardStatus: data.user.aadharCardStatus,
            panCardStatus: data.user.panCardStatus,
            photographStatus: data.user.photographStatus,
            proofOfAddressStatus: data.user.proofOfAddressStatus,
          })
          // Clear any previously staged files when modal opens
          setStagedFiles({
            aadharCard: null,
            panCard: null,
            photograph: null,
            proofOfAddress: null,
          })
        } catch (error) {
          console.error("Failed to fetch initial profile data:", error)
        }
      }
      fetchInitialProfileData()
    }
  }, [isOpen])

  // Cleanup for object URLs when component unmounts or staged files are replaced/removed
  useEffect(() => {
    return () => {
      Object.values(stagedFiles).forEach((stagedFile) => {
        if (stagedFile && stagedFile.previewUrl) {
          URL.revokeObjectURL(stagedFile.previewUrl)
        }
      })
    }
  }, [stagedFiles]) // Re-run cleanup if stagedFiles object reference changes

  const calculateProgress = () => {
    let completed = 0
    const total = profileFieldsConfig.length

    profileFieldsConfig.forEach((field) => {
      if ("key" in field) {
        // Text fields
        if (field.key === "emailVerified") {
          if (profileData.emailVerified) completed++
        } else if (profileData[field.key as keyof ProfileData]?.toString().trim()) {
          completed++
        }
      } else if ("type" in field) {
        // Document fields - NOW CHECK STATUS
        const statusKey = `${field.type}Status` as keyof ProfileData
        if (profileData[statusKey] === "verified") {
          completed++
        }
      }
    })
    return Math.round((completed / total) * 100)
  }

  const handleEmailVerification = async () => {
    if (!profileData.email.trim()) {
      return
    }

    setIsVerifyingEmail(true)

    try {
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

  const handleFileUpload = (type: "aadharCard" | "panCard" | "photograph" | "proofOfAddress", file: File | null) => {
    if (!file) return

    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "❌ File Size Too Large",
        description: `File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please upload a file smaller than 1MB.`,
      })
      return
    }

    // Revoke previous URL if exists for this type
    if (stagedFiles[type]?.previewUrl) {
      URL.revokeObjectURL(stagedFiles[type]?.previewUrl!)
    }

    const previewUrl = URL.createObjectURL(file)
    setStagedFiles((prev) => ({
      ...prev,
      [type]: { file, previewUrl },
    }))
  }

  const handleRemoveStagedFile = (type: "aadharCard" | "panCard" | "photograph" | "proofOfAddress") => {
    if (stagedFiles[type]?.previewUrl) {
      URL.revokeObjectURL(stagedFiles[type]?.previewUrl!)
    }
    setStagedFiles((prev) => ({ ...prev, [type]: null }))
    // Clear the file input value as well
    const ref = profileFieldsConfig.find((f) => "type" in f && f.type === type)?.ref
    if (ref?.current) {
      ref.current.value = ""
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    let currentProfileData = { ...profileData } // Use a mutable copy

    // Update text fields first
    await updateProfileCompletion("fullName", currentProfileData.fullName)
    await updateProfileCompletion("mobileNo", currentProfileData.mobileNumber)
    await updateProfileCompletion("email", currentProfileData.email)
    await updateProfileCompletion("businessName", currentProfileData.businessName)

    // Upload staged documents
    for (const type of ["aadharCard", "panCard", "photograph", "proofOfAddress"] as const) {
      const stagedFileEntry = stagedFiles[type]
      if (stagedFileEntry && stagedFileEntry.file) {
        setUploadingStates((prev) => ({ ...prev, [type]: true }))
        try {
          const formData = new FormData()
          formData.append("file", stagedFileEntry.file)
          formData.append("documentType", type)

          const result = await uploadDocument(formData) // This action updates the User model directly
          if (result.success) {
            currentProfileData = { ...currentProfileData, [`${type}Url`]: result.fileUrl }
            setStagedFiles((prev) => ({ ...prev, [type]: null })) // Clear staged file after successful upload
            URL.revokeObjectURL(stagedFileEntry.previewUrl) // Revoke the temporary URL
          } else {
            console.error(`Upload of ${type} failed:`, result.message)
            // Optionally, keep the staged file and show an error to the user
          }
        } catch (error) {
          console.error(`Upload error for ${type}:`, error)
        } finally {
          setUploadingStates((prev) => ({ ...prev, [type]: false }))
        }
      }
    }

    // After all uploads and text updates, update the local profileData state
    setProfileData(currentProfileData)

    setIsSaving(false)
    if (onUpdate) onUpdate() // Notify parent to re-fetch dashboard data if needed
    onClose()
  }

  const progress = calculateProgress()

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
              {
                profileFieldsConfig.filter((f) => {
                  if ("key" in f) {
                    if (f.key === "emailVerified") return !profileData.emailVerified
                    return !profileData[f.key as keyof ProfileData]?.toString().trim()
                  } else if ("type" in f) {
                    return !(profileData[`${f.type}Url` as keyof ProfileData]?.toString().trim() || stagedFiles[f.type])
                  }
                  return false
                }).length
              }{" "}
              fields remaining
            </p>
          </div>

          {/* Progress Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profileFieldsConfig.map((field, index) => {
              const Icon = field.icon
              let isCompleted = false
              if ("key" in field) {
                isCompleted =
                  field.key === "emailVerified"
                    ? profileData.emailVerified
                    : !!profileData[field.key as keyof ProfileData]?.toString().trim()
              } else if ("type" in field) {
                isCompleted =
                  !!profileData[`${field.type}Url` as keyof ProfileData]?.toString().trim() || !!stagedFiles[field.type]
              }

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isCompleted ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
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
              {profileFieldsConfig
                .filter((f) => "type" in f)
                .map((field) => (
                  <div key={field.type} className="space-y-2">
                    <Label>{field.label}</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => field.ref.current?.click()}
                    >
                      <input
                        ref={field.ref}
                        type="file"
                        accept={field.accept}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && file.size > 1024 * 1024) {
                            toast({
                              variant: "destructive",
                              title: "❌ File Size Too Large",
                              description: `File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please upload a file smaller than 1MB.`,
                            })
                            return
                          }
                          handleFileUpload(field.type, file)
                        }}
                        className="hidden"
                        disabled={uploadingStates[field.type]}
                      />
                      {stagedFiles[field.type] ? (
                        // Staged file exists (not yet uploaded to Cloudinary)
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {stagedFiles[field.type]?.file?.name}
                          </span>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="link"
                              className="p-0 h-auto text-primary text-xs"
                              onClick={() => window.open(stagedFiles[field.type]?.previewUrl!, "_blank")}
                            >
                              <Eye className="h-3 w-3 mr-1" /> Preview
                            </Button>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-red-600 text-xs"
                              onClick={() => handleRemoveStagedFile(field.type)}
                            >
                              <XCircle className="h-3 w-3 mr-1" /> Remove
                            </Button>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-blue-600 text-xs"
                              onClick={() => field.ref.current?.click()}
                            >
                              <Upload className="h-3 w-3 mr-1" /> Re-upload
                            </Button>
                          </div>
                        </div>
                      ) : profileData[`${field.type}Url` as keyof ProfileData] ? (
                        // Already uploaded to Cloudinary - now check status
                        (() => {
                          const docStatus = profileData[`${field.type}Status` as keyof ProfileData]
                          let statusText = ""
                          let statusColorClass = ""
                          let statusIcon = null

                          switch (docStatus) {
                            case "verified":
                              statusText = "Verified"
                              statusColorClass = "text-green-600"
                              statusIcon = <Check className="h-5 w-5" />
                              break
                            case "rejected":
                              statusText = "Rejected"
                              statusColorClass = "text-red-600"
                              statusIcon = <XCircle className="h-5 w-5" />
                              break
                            case "uploaded":
                            case "pending": // If URL exists but status is still pending/uploaded
                            default:
                              statusText = "Uploaded (Pending Review)"
                              statusColorClass = "text-amber-600"
                              statusIcon = <Eye className="h-5 w-5" /> // Or a clock icon
                              break
                          }

                          return (
                            <div className={`flex flex-col items-center justify-center gap-2 ${statusColorClass}`}>
                              {statusIcon}
                              <span className="text-sm font-medium">{statusText}</span>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary text-xs"
                                onClick={() =>
                                  window.open(profileData[`${field.type}Url` as keyof ProfileData]!, "_blank")
                                }
                              >
                                <Eye className="h-3 w-3 mr-1" /> View
                              </Button>
                              {docStatus === "rejected" && (
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-blue-600 text-xs"
                                  onClick={() => field.ref.current?.click()}
                                >
                                  <Upload className="h-3 w-3 mr-1" /> Re-upload
                                </Button>
                              )}
                            </div>
                          )
                        })()
                      ) : (
                        // No file staged or uploaded yet
                        <div className="space-y-2">
                          <field.icon className="h-8 w-8 text-gray-400 mx-auto" />
                          <div className="text-sm text-gray-600">
                            <span className="text-primary">
                              {uploadingStates[field.type] ? "Uploading..." : "Click to upload"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{field.uploadHint}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
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
