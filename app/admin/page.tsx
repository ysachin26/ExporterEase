"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getDashboardData, rejectUserDocument, rejectRegistrationDocument } from "@/app/actions"

export default function AdminPage() {
  const [userData, setUserData] = useState<any>(null)
  const [selectedDocType, setSelectedDocType] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [stepId, setStepId] = useState("")
  const [documentName, setDocumentName] = useState("")
  
  const { toast } = useToast()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const data = await getDashboardData()
      setUserData(data)
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    }
  }

  const handleRejectProfileDocument = async () => {
    if (!selectedDocType || !rejectionReason) {
      toast({
        title: "Missing Fields",
        description: "Please select document type and provide rejection reason",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await rejectUserDocument({
        userId: userData.user.id,
        documentType: selectedDocType,
        rejectionReason
      })

      if (result.success) {
        toast({
          title: "Document Rejected",
          description: "Document rejected successfully"
        })
        setSelectedDocType("")
        setRejectionReason("")
        await fetchUserData()
      } else {
        toast({
          title: "Rejection Failed",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject document",
        variant: "destructive"
      })
    }
  }

  const handleRejectRegistrationDocument = async () => {
    if (!stepId || !documentName || !rejectionReason) {
      toast({
        title: "Missing Fields", 
        description: "Please fill all fields",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await rejectRegistrationDocument({
        stepId: parseInt(stepId),
        documentName,
        rejectionReason
      })

      if (result.success) {
        toast({
          title: "Registration Document Rejected",
          description: "Registration document rejected successfully"
        })
        setStepId("")
        setDocumentName("")
        setRejectionReason("")
        await fetchUserData()
      } else {
        toast({
          title: "Rejection Failed",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject registration document",
        variant: "destructive"
      })
    }
  }

  if (!userData) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <p>Loading user data...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel - Document Management</h1>
      
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Name:</strong> {userData.user.fullName}
            </div>
            <div>
              <strong>Business:</strong> {userData.user.businessName}
            </div>
            <div>
              <strong>Mobile:</strong> {userData.user.mobileNo}
            </div>
            <div>
              <strong>Email:</strong> {userData.user.email}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Document Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Aadhaar Card:</strong> {userData.user.aadharCardStatus || "pending"}
            </div>
            <div>
              <strong>PAN Card:</strong> {userData.user.panCardStatus || "pending"}
            </div>
            <div>
              <strong>Photograph:</strong> {userData.user.photographStatus || "pending"}
            </div>
            <div>
              <strong>Proof of Address:</strong> {userData.user.proofOfAddressStatus || "pending"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reject Profile Document */}
      <Card>
        <CardHeader>
          <CardTitle>Reject Profile Document</CardTitle>
          <CardDescription>
            Reject a user's profile document (Aadhaar, PAN, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aadharCard">Aadhaar Card</SelectItem>
                <SelectItem value="panCard">PAN Card</SelectItem>
                <SelectItem value="photograph">Photograph</SelectItem>
                <SelectItem value="proofOfAddress">Proof of Address</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Rejection Reason</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
            />
          </div>
          
          <Button onClick={handleRejectProfileDocument}>
            Reject Profile Document
          </Button>
        </CardContent>
      </Card>

      {/* Reject Registration Document */}
      <Card>
        <CardHeader>
          <CardTitle>Reject Registration Document</CardTitle>
          <CardDescription>
            Reject a document from registration services (GST, IEC, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Step ID</Label>
            <Select value={stepId} onValueChange={setStepId}>
              <SelectTrigger>
                <SelectValue placeholder="Select registration step" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">GST Registration (Step 2)</SelectItem>
                <SelectItem value="3">IEC Code (Step 3)</SelectItem>
                <SelectItem value="4">DSC Registration (Step 4)</SelectItem>
                <SelectItem value="5">ICEGATE Registration (Step 5)</SelectItem>
                <SelectItem value="6">AD Code (Step 6)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Document Name</Label>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., rentAgreement, authorizationLetter"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Rejection Reason</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
            />
          </div>
          
          <Button onClick={handleRejectRegistrationDocument}>
            Reject Registration Document
          </Button>
        </CardContent>
      </Card>

      {/* Registration Steps Status */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Steps Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {userData.registrationSteps.map((step: any) => (
              <div key={step.id} className="flex justify-between items-center p-2 border rounded">
                <span><strong>{step.name}:</strong> {step.status}</span>
                <span>Documents: {step.documents?.length || 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
