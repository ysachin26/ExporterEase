"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getDashboardData, uploadDocument, updateProfileCompletion, verifyEmail } from "@/app/actions"
import { useLanguage } from "@/contexts/LanguageContext"
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Check, 
  Upload, 
  Eye, 
  XCircle, 
  Clock,
  AlertTriangle
} from "lucide-react"

interface UserData {
  id: string
  fullName: string
  email: string
  emailVerified: boolean
  mobileNo: string
  businessName: string
  businessType: string
  aadharCardUrl: string
  panCardUrl: string
  photographUrl: string
  proofOfAddressUrl: string
  aadharCardStatus: "pending" | "uploaded" | "verified" | "rejected"
  panCardStatus: "pending" | "uploaded" | "verified" | "rejected"
  photographStatus: "pending" | "uploaded" | "verified" | "rejected"
  proofOfAddressStatus: "pending" | "uploaded" | "verified" | "rejected"
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailInput, setEmailInput] = useState("")
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [notifications, setNotifications] = useState<any[]>([])
  
  const aadharRef = useRef<HTMLInputElement>(null)
  const panRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const data = await getDashboardData()
      if (data.user) {
        setUserData({
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          emailVerified: data.user.emailVerified,
          mobileNo: data.user.mobileNo,
          businessName: data.user.businessName,
          businessType: data.user.businessType,
          aadharCardUrl: data.user.aadharCardUrl,
          panCardUrl: data.user.panCardUrl,
          photographUrl: data.user.photographUrl,
          proofOfAddressUrl: data.user.proofOfAddressUrl,
          aadharCardStatus: data.user.aadharCardStatus || "pending",
          panCardStatus: data.user.panCardStatus || "pending",
          photographStatus: data.user.photographStatus || "pending",
          proofOfAddressStatus: data.user.proofOfAddressStatus || "pending"
        })
        setEmailInput(data.user.email)
        setProfileCompletion(data.profileCompletion)
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUpload = async (documentType: string, file: File) => {
    setUploading(prev => ({ ...prev, [documentType]: true }))
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", documentType)
      
      const result = await uploadDocument(formData)
      
      if (result.success) {
        toast({
          title: "Upload Successful",
          description: "Document uploaded successfully",
        })
        await fetchUserData() // Refresh data
      } else {
        toast({
          title: "Upload Failed",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading",
        variant: "destructive"
      })
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }))
    }
  }

  const handleEmailVerification = async () => {
    if (!emailInput.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive"
      })
      return
    }
    
    try {
      const result = await verifyEmail(emailInput)
      if (result.success) {
        toast({
          title: "Email Verified",
          description: result.message,
        })
        await fetchUserData()
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify email",
        variant: "destructive"
      })
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Verified</Badge>
      case "uploaded":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Upload className="h-3 w-3 mr-1" />Not Uploaded</Badge>
    }
  }

  const getUploadComponent = (docType: string, label: string, url: string, status: string, ref: React.RefObject<HTMLInputElement>) => {
    const isUploading = uploading[docType]
    const needsReupload = status === "rejected"
    
    return (
      <div className="space-y-2">
        <Label>{label} <span className="text-red-500">*</span></Label>
        <div className="flex items-center gap-2">
          {getStatusDisplay(status)}
          {needsReupload && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Re-upload Required
            </Badge>
          )}
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
          <input
            ref={ref}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                if (file.size > 1024 * 1024) {
                  toast({
                    title: "File Too Large",
                    description: "Please upload a file smaller than 1MB",
                    variant: "destructive"
                  })
                  return
                }
                handleDocumentUpload(docType, file)
              }
            }}
            className="hidden"
            disabled={isUploading}
          />
          
          {url && !needsReupload ? (
            <div className="flex flex-col items-center gap-2">
              <Check className="h-8 w-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">Uploaded</span>
              <div className="flex gap-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => window.open(url, "_blank")}
                >
                  <Eye className="h-3 w-3 mr-1" />View
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => ref.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-3 w-3 mr-1" />Replace
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <Button
                variant="ghost"
                onClick={() => ref.current?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? "Uploading..." : needsReupload ? "Re-upload Document" : "Upload Document"}
              </Button>
              <p className="text-xs text-gray-500">Supported: PDF, JPG, PNG (max 1MB)</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-red-500">Failed to load profile data</p>
      </div>
    )
  }

  // Check for rejected documents in both notifications and status
  const hasRejectedDocuments = [
    userData.aadharCardStatus,
    userData.panCardStatus, 
    userData.photographStatus,
    userData.proofOfAddressStatus
  ].some(status => status === "rejected")
  
  const rejectedNotifications = notifications.filter(n => 
    n.type === "error" && n.message.toLowerCase().includes("rejected")
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      {/* Rejected Document Notifications */}
      {rejectedNotifications.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Documents Require Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rejectedNotifications.map(notification => (
              <div key={notification.id} className="text-red-700 text-sm p-2 bg-red-100 rounded border-l-4 border-red-400">
                <strong>{notification.title}</strong>: {notification.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Profile Completion */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-900">Profile Completion</h3>
            <span className="text-blue-600 font-bold">{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-3" />
          <p className="text-blue-700 text-sm mt-2">
            {profileCompletion === 100 
              ? "Your profile is complete!" 
              : "Complete your profile by uploading and verifying all required documents"}
          </p>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userData.photographUrl} alt={userData.fullName} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
                {userData.fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{userData.fullName}</h3>
              <p className="text-gray-600">{userData.businessName}</p>
              <p className="text-sm text-gray-500">{userData.businessType}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex gap-2">
                <Input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email address"
                  type="email"
                />
                <Button
                  onClick={handleEmailVerification}
                  disabled={userData.emailVerified}
                  size="sm"
                >
                  {userData.emailVerified ? <Check className="h-4 w-4" /> : "Verify"}
                </Button>
              </div>
              {userData.emailVerified && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Check className="h-3 w-3" />
                  <span>Email verified</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input value={userData.mobileNo} disabled className="bg-gray-50" />
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Check className="h-3 w-3" />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-600" />
            Required Documents
          </CardTitle>
          <CardDescription>
            Upload and verify all required documents to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getUploadComponent(
              "photograph",
              "Photograph",
              userData.photographUrl,
              userData.photographStatus,
              photoRef
            )}
            {getUploadComponent(
              "aadharCard",
              "Aadhaar Card",
              userData.aadharCardUrl,
              userData.aadharCardStatus,
              aadharRef
            )}
            {getUploadComponent(
              "panCard",
              "PAN Card",
              userData.panCardUrl,
              userData.panCardStatus,
              panRef
            )}
            {getUploadComponent(
              "proofOfAddress",
              "Proof of Address",
              userData.proofOfAddressUrl,
              userData.proofOfAddressStatus,
              addressRef
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
