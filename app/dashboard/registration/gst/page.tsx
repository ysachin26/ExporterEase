"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  Eye,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { getDashboardData, submitRegistrationApplication } from "@/app/actions"
import { useRouter } from "next/navigation" // Import useRouter for navigation
import { useToast } from "@/hooks/use-toast"

interface DocumentUploadState {
  name: string
  file: File | null // This will represent the *uploaded* file, or null if not yet uploaded
  uploaded: boolean
  url?: string // To store the URL from DB
  status?: "pending" | "uploaded" | "verified" | "rejected" // Status from DB
  tempFile?: File | null // New: for temporary local storage
  tempUrl?: string
}

interface BankDetails {
  accountNumber: string
  bankName: string
  branchName: string
  ifscCode: string
  cancelledCheque: File | null // This will represent the *uploaded* file, or null if not yet uploaded
  cancelledChequeUrl?: string // To store the URL from DB
  cancelledChequeStatus?: "pending" | "uploaded" | "verified" | "rejected"
  tempCancelledCheque: File | null
  tempCancelledChequeUrl?: string
}

interface BusinessDocuments {
  authorizationLetter: File | null
  partnershipDeed: File | null
  llpAgreement: File | null // Added LLP Agreement to businessDocuments state
  certificateOfIncorporation: File | null
  moaAoa: File | null
  authorizationLetterUrl?: string
  partnershipDeedUrl?: string
  llpAgreementUrl?: string // Added LLP Agreement URL
  certificateOfIncorporationUrl?: string
  moaAoaUrl?: string
  authorizationLetterStatus?: "pending" | "uploaded" | "verified" | "rejected"
  partnershipDeedStatus?: "pending" | "uploaded" | "verified" | "rejected"
  llpAgreementStatus?: "pending" | "uploaded" | "verified" | "rejected" // Added LLP Agreement Status
  certificateOfIncorporationStatus?: "pending" | "uploaded" | "verified" | "rejected"
  moaAoaStatus?: "pending" | "uploaded" | "verified" | "rejected"
}

interface ProfileData {
  id: string // Add user ID
  dashboardId: string // Add dashboard ID
  fullName: string
  email: string
  mobile: string
  panCardUrl: string
  aadharCardUrl: string
  photographUrl: string
  proofOfAddressUrl: string
  businessType: string
  businessName: string
  // Shared documents from User model - ALL REGISTRATION DOCUMENTS
  authorizationLetterUrl: string
  partnershipDeedUrl: string
  llpAgreementUrl: string
  certificateOfIncorporationUrl: string
  moaAoaUrl: string
  cancelledChequeUrl: string
  // IEC Registration Documents
  iecCertificate: string
  // DSC Registration Documents
  dscCertificate: string
  // ICEGATE Registration Documents
  gstCertificate: string
  bankDocumentUrl: string
  // AD Code Registration Documents
  adCodeLetterFromBankUrl: string
  // GST Registration Documents (premise-specific)
  rentAgreementUrl: string
  electricityBillUrl: string
  nocUrl: string
  propertyProofUrl: string
  electricityBillOwnedUrl: string
  otherProofUrl: string
}

interface StagedFileEntry {
  file: File
  previewUrl: string
}

export default function GSTRegistration() {
  // Add a new state variable to track if the rejected toast has been shown
  const [hasShownRejectedToast, setHasShownRejectedToast] = useState(false)

  const [premiseType, setPremiseType] = useState<"rented" | "owned" | "other" | "">("")
  const [otherPremiseDescription, setOtherPremiseDescription] = useState("")
  const [profileData, setProfileData] = useState<ProfileData>({
    id: "",
    dashboardId: "",
    fullName: "",
    email: "",
    mobile: "",
    panCardUrl: "",
    aadharCardUrl: "",
    photographUrl: "",
    proofOfAddressUrl: "",
    businessType: "",
    businessName: "",
    authorizationLetterUrl: "",
    partnershipDeedUrl: "",
    llpAgreementUrl: "",
    certificateOfIncorporationUrl: "",
    moaAoaUrl: "",
    cancelledChequeUrl: "",
    iecCertificate: "",
    dscCertificate: "",
    gstCertificate: "",
    bankDocumentUrl: "",
    adCodeLetterFromBankUrl: "",
    rentAgreementUrl: "",
    electricityBillUrl: "",
    nocUrl: "",
    propertyProofUrl: "",
    electricityBillOwnedUrl: "",
    otherProofUrl: "",
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
    cancelledChequeUrl: "",
    cancelledChequeStatus: "pending",
    tempCancelledCheque: null,
    tempCancelledChequeUrl: "",
  })
  const [documents, setDocuments] = useState<Record<string, DocumentUploadState>>({})
  const [businessDocuments, setBusinessDocuments] = useState<BusinessDocuments>({
    authorizationLetter: null,
    partnershipDeed: null,
    llpAgreement: null, // Initialize
    certificateOfIncorporation: null,
    moaAoa: null,
    authorizationLetterUrl: "",
    partnershipDeedUrl: "",
    llpAgreementUrl: "", // Initialize
    certificateOfIncorporationUrl: "",
    moaAoaUrl: "",
    authorizationLetterStatus: "pending",
    partnershipDeedStatus: "pending",
    llpAgreementStatus: "pending", // Initialize
    certificateOfIncorporationStatus: "pending",
    moaAoaStatus: "pending",
  })
  const [businessType, setBusinessType] = useState<"individual" | "partnership" | "llp" | "pvt_ltd" | "">("")

  const [stagedFiles, setStagedFiles] = useState<Record<string, StagedFileEntry | null>>({
    rentAgreement: null,
    electricityBill: null,
    noc: null,
    propertyProof: null,
    electricityBillOwned: null,
    cancelledCheque: null,
    authorizationLetter: null,
    partnershipDeed: null,
    llpAgreement: null, // Added to stagedFiles
    certificateOfIncorporation: null,
    moaAoa: null,
    otherProof: null,
  })

  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({
    rentAgreement: false,
    electricityBill: false,
    noc: false,
    propertyProof: false,
    electricityBillOwned: false,
    cancelledCheque: false,
    authorizationLetter: false,
    partnershipDeed: false,
    llpAgreement: false, // Added to uploadingStates
    certificateOfIncorporation: false,
    moaAoa: false,
    otherProof: false,
  })

  const [isSaving, setIsSaving] = useState(false) // Declare isSaving state
  const [dashboardData, setDashboardData] = useState<any>(null) // Add dashboard data state

  // Refs for file inputs
  const rentAgreementRef = useRef<HTMLInputElement>(null)
  const electricityBillRef = useRef<HTMLInputElement>(null)
  const nocRef = useRef<HTMLInputElement>(null)
  const propertyProofRef = useRef<HTMLInputElement>(null)
  const electricityBillOwnedRef = useRef<HTMLInputElement>(null)
  const cancelledChequeRef = useRef<HTMLInputElement>(null)
  const authorizationLetterRef = useRef<HTMLInputElement>(null)
  const partnershipDeedRef = useRef<HTMLInputElement>(null)
  const llpAgreementRef = useRef<HTMLInputElement>(null) // Added ref for LLP Agreement
  const certificateOfIncorporationRef = useRef<HTMLInputElement>(null)
  const moaAoaRef = useRef<HTMLInputElement>(null)
  const otherProofRef = useRef<HTMLInputElement>(null)

  const router = useRouter() // Initialize router
  const { toast } = useToast()

  // Fetch profile data and registration documents on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await getDashboardData()

        if (!data.user || !data.dashboard) {
          console.error("Failed to fetch user or dashboard data:", data.error)
          // Optionally redirect or show a global error message
          return
        }

        setDashboardData(data) // Store dashboard data

        // Map business type from database to form values
        let mappedBusinessType: "individual" | "partnership" | "llp" | "pvt_ltd" = "individual"
        switch (data.user.businessType) {
          case "Proprietorship":
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
          id: data.user.id, // Set user ID
          dashboardId: data.dashboard._id, // Set dashboard ID
          fullName: data.user.fullName,
          email: data.user.email,
          mobile: data.user.mobileNo,
          panCardUrl: data.user.panCardUrl,
          aadharCardUrl: data.user.aadharCardUrl,
          photographUrl: data.user.photographUrl,
          proofOfAddressUrl: data.user.proofOfAddressUrl,
          businessType: data.user.businessType,
          businessName: data.user.businessName,
          // 🔥 ALL SHARED DOCUMENTS FROM USER MODEL
          authorizationLetterUrl: data.user.authorizationLetterUrl || "",
          partnershipDeedUrl: data.user.partnershipDeedUrl || "",
          llpAgreementUrl: data.user.llpAgreementUrl || "", // Ensure this is fetched
          certificateOfIncorporationUrl: data.user.certificateOfIncorporationUrl || "",
          moaAoaUrl: data.user.moaAoaUrl || "",
          cancelledChequeUrl: data.user.cancelledChequeUrl || "",
          // IEC Documents
          iecCertificate: data.user.iecCertificate || "",
          // DSC Documents
          dscCertificate: data.user.dscCertificate || "",
          // ICEGATE Documents
          gstCertificate: data.user.gstCertificate || "",
          bankDocumentUrl: data.user.bankDocumentUrl || "",
          adCodeLetterFromBankUrl: data.user.adCodeLetterFromBankUrl || "",
          // GST Premise Documents
          rentAgreementUrl: data.user.rentAgreementUrl || "",
          electricityBillUrl: data.user.electricityBillUrl || "",
          nocUrl: data.user.nocUrl || "",
          propertyProofUrl: data.user.propertyProofUrl || "",
          electricityBillOwnedUrl: data.user.electricityBillOwnedUrl || "",
          otherProofUrl: data.user.otherProofUrl || "",
        })

        // Pre-fill registration-specific documents and details from dashboard data
        const gstStep = data.registrationSteps.find((step: any) => step.id === 2) // Corrected stepId for GST
        const gstStepDocuments = gstStep?.documents || []
        const gstStepDetails = gstStep?.details || {} // Get stored details

        // Pre-fill text fields from dashboard details
        setBusinessDetails((prev) => ({
          ...prev,
          natureOfBusiness: gstStepDetails.natureOfBusiness || "",
          businessName: gstStepDetails.businessName || data.user.businessName || "", // Pre-fill from user business name if not in dashboard details
        }))
        setBankDetails((prev) => ({
          ...prev,
          accountNumber: gstStepDetails.accountNumber || "",
          bankName: gstStepDetails.bankName || "",
          branchName: gstStepDetails.branchName || "",
          ifscCode: gstStepDetails.ifscCode || "",
        }))
        setPremiseType(gstStepDetails.premiseType || "")
        setOtherPremiseDescription(gstStepDetails.otherPremiseDescription || "")

        // 🔥 PRE-FILL BUSINESS DOCUMENTS FROM USER MODEL (SHARED DOCUMENTS)
        setBusinessDocuments((prev) => ({
          ...prev,
          authorizationLetterUrl: data.user.authorizationLetterUrl || "",
          partnershipDeedUrl: data.user.partnershipDeedUrl || "",
          llpAgreementUrl: data.user.llpAgreementUrl || "", // Ensure this is fetched
          certificateOfIncorporationUrl: data.user.certificateOfIncorporationUrl || "",
          moaAoaUrl: data.user.moaAoaUrl || "",
          // Mark as uploaded if URL exists
          authorizationLetter: data.user.authorizationLetterUrl ? ({} as File) : null,
          partnershipDeed: data.user.partnershipDeedUrl ? ({} as File) : null,
          llpAgreement: data.user.llpAgreementUrl ? ({} as File) : null, // Pre-fill LLP Agreement file state
          certificateOfIncorporation: data.user.certificateOfIncorporationUrl ? ({} as File) : null,
          moaAoa: data.user.moaAoaUrl ? ({} as File) : null,
          authorizationLetterStatus: data.user.authorizationLetterUrl ? "uploaded" : "pending",
          partnershipDeedStatus: data.user.partnershipDeedUrl ? "uploaded" : "pending",
          llpAgreementStatus: data.user.llpAgreementUrl ? "uploaded" : "pending", // Pre-fill LLP Agreement status
          certificateOfIncorporationStatus: data.user.certificateOfIncorporationUrl ? "uploaded" : "pending",
          moaAoaStatus: data.user.moaAoaUrl ? "uploaded" : "pending",
        }))

        // 🔥 PRE-FILL BANK DETAILS FROM USER MODEL (SHARED DOCUMENTS)
        setBankDetails((prev) => ({
          ...prev,
          cancelledChequeUrl: data.user.cancelledChequeUrl || "",
          cancelledCheque: data.user.cancelledChequeUrl ? ({} as File) : null,
          cancelledChequeStatus: data.user.cancelledChequeUrl ? "uploaded" : "pending",
        }))

        const newDocumentsState: Record<string, DocumentUploadState> = {}

        // Helper to get document state, prioritizing profileData
        const getDocState = (docName: string, profileUrl: string | undefined) => {
          const dashboardDoc = gstStepDocuments.find((d: any) => d.name === docName)
          const finalUrl = profileUrl || dashboardDoc?.url
          const finalStatus = profileUrl ? "uploaded" : dashboardDoc?.status // If from profile, assume uploaded. Dashboard might have more specific status.
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

        // Premise documents
        newDocumentsState.rentAgreement = getDocState("rentAgreement", data.user.rentAgreementUrl)
        newDocumentsState.electricityBill = getDocState("electricityBill", data.user.electricityBillUrl)
        newDocumentsState.noc = getDocState("noc", data.user.nocUrl)
        newDocumentsState.propertyProof = getDocState("propertyProof", data.user.propertyProofUrl)
        newDocumentsState.electricityBillOwned = getDocState("electricityBillOwned", data.user.electricityBillOwnedUrl)
        newDocumentsState.otherProof = getDocState("otherProof", data.user.otherProofUrl)

        setDocuments(newDocumentsState)
      } catch (error) {
        console.error("Failed to fetch initial GST registration data:", error)
      }
    }
    fetchInitialData()
  }, [])

  // Cleanup for object URLs when component unmounts or staged files are replaced/removed
  useEffect(() => {
    return () => {
      Object.values(stagedFiles).forEach((stagedFile) => {
        if (stagedFile && stagedFile.previewUrl) {
          URL.revokeObjectURL(stagedFile.previewUrl)
        }
      })
    }
  }, [stagedFiles])

  // Modify getRegistrationStatus to only return the status, without calling toast
  const getRegistrationStatus = () => {
    const step = dashboardData?.registrationSteps?.find((s: any) => s.id === 2) // GST is step 2
    return step?.status || "not-started"
  }

  // Use useEffect to trigger the toast when the status changes to "rejected"
  useEffect(() => {
    const currentStatus = getRegistrationStatus()
    if (currentStatus === "rejected" && !hasShownRejectedToast) {
      toast({
        title: "Document Rejected",
        description: "One or more documents have been rejected. Please re-upload.",
        variant: "destructive",
      })
      setHasShownRejectedToast(true) // Mark that the toast has been shown
    } else if (currentStatus !== "rejected" && hasShownRejectedToast) {
      // Reset if status changes from rejected (e.g., user re-uploads and it goes to pending)
      setHasShownRejectedToast(false)
    }
  }, [dashboardData, hasShownRejectedToast, toast]) // Depend on dashboardData and hasShownRejectedToast

  const calculateProgress = () => {
    let completed = 0
    let total = 0

    // Basic details (from profileData)
    total += 7 // fullName, mobile, email, panCard, aadhaarCard, photograph, proofOfAddress
    if (profileData.fullName.trim()) completed++
    if (profileData.mobile.trim()) completed++
    if (profileData.email.trim()) completed++
    if (profileData.panCardUrl.trim()) completed++
    if (profileData.aadharCardUrl.trim()) completed++
    if (profileData.photographUrl.trim()) completed++
    if (profileData.proofOfAddressUrl.trim()) completed++

    // Business details
    if (businessType) {
      // Only count if business type is determined
      total += 2
      if (businessDetails.natureOfBusiness.trim()) completed++
      if (businessDetails.businessName.trim()) completed++
    }

    // Business entity documents (based on business type) - SKIP for individual/sole proprietorship
    if (businessType && businessType !== "individual") {
      total += 1 // Authorization letter (required for all non-individual types)
      if (
        (businessDocuments.authorizationLetterUrl && businessDocuments.authorizationLetterStatus !== "rejected") ||
        stagedFiles.authorizationLetter
      )
        completed++

      if (businessType === "partnership") {
        total += 1 // Partnership deed
        if (
          (businessDocuments.partnershipDeedUrl && businessDocuments.partnershipDeedStatus !== "rejected") ||
          stagedFiles.partnershipDeed
        )
          completed++
      } else if (businessType === "llp") {
        total += 1 // LLP agreement
        if (
          (businessDocuments.llpAgreementUrl && businessDocuments.llpAgreementStatus !== "rejected") ||
          stagedFiles.llpAgreement
        )
          completed++
      }

      if (businessType === "pvt_ltd") {
        total += 2 // Certificate of incorporation + MOA & AOA
        if (
          (businessDocuments.certificateOfIncorporationUrl &&
            businessDocuments.certificateOfIncorporationStatus !== "rejected") ||
          stagedFiles.certificateOfIncorporation
        )
          completed++
        if ((businessDocuments.moaAoaUrl && businessDocuments.moaAoaStatus !== "rejected") || stagedFiles.moaAoa)
          completed++
      }
    }

    // Premise documents (add to total based on type)
    if (premiseType === "rented") {
      total += 3
      if ((documents.rentAgreement?.url && documents.rentAgreement?.status !== "rejected") || stagedFiles.rentAgreement)
        completed++
      if (
        (documents.electricityBill?.url && documents.electricityBill?.status !== "rejected") ||
        stagedFiles.electricityBill
      )
        completed++
      if ((documents.noc?.url && documents.noc?.status !== "rejected") || stagedFiles.noc) completed++
    } else if (premiseType === "owned") {
      total += 2
      if ((documents.propertyProof?.url && documents.propertyProof?.status !== "rejected") || stagedFiles.propertyProof)
        completed++
      if (
        (documents.electricityBillOwned?.url && documents.electricityBillOwned?.status !== "rejected") ||
        stagedFiles.electricityBillOwned
      )
        completed++
    } else if (premiseType === "other") {
      total += 2 // For description and the 'other' document
      if (otherPremiseDescription.trim()) completed++
      if ((documents.otherProof?.url && documents.otherProof?.status !== "rejected") || stagedFiles.otherProof)
        completed++
    }

    return total === 0 ? 0 : Math.round((completed / total) * 100)
  }

  const handleStageFileUpload = (docKey: string, file: File | null) => {
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
    if (stagedFiles[docKey]?.previewUrl) {
      URL.revokeObjectURL(stagedFiles[docKey]?.previewUrl!)
    }

    const previewUrl = URL.createObjectURL(file)
    setStagedFiles((prev) => ({
      ...prev,
      [docKey]: { file, previewUrl },
    }))
  }

  const handleRemoveStagedFile = (docType: string, ref: React.RefObject<HTMLInputElement>) => {
    if (stagedFiles[docType]?.previewUrl) {
      URL.revokeObjectURL(stagedFiles[docType]?.previewUrl!)
    }
    setStagedFiles((prev) => ({ ...prev, [docType]: null }))
    if (ref.current) {
      ref.current.value = "" // Clear the file input
    }
  }

  const handleBankDocumentSelect = (file: File | null) => {
    if (!file) return

    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "❌ File Size Too Large",
        description: `File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please upload a file smaller than 1MB.`,
      })
      return
    }

    if (bankDetails.tempCancelledChequeUrl) {
      URL.revokeObjectURL(bankDetails.tempCancelledChequeUrl)
    }

    setBankDetails((prev) => ({
      ...prev,
      cancelledCheque: file,
      tempCancelledCheque: file,
      tempCancelledChequeUrl: URL.createObjectURL(file),
      cancelledChequeStatus: "pending",
    }))
  }

  const handleSubmit = async () => {
    if (progress < 100) {
      alert("Please complete all required fields and upload all necessary documents.")
      return
    }

    setIsSaving(true)

    // Store text input values in Dashboard model
    const detailsToSave: Record<string, any> = {
      natureOfBusiness: businessDetails.natureOfBusiness,
      businessName: businessDetails.businessName,
      premiseType: premiseType,
      accountNumber: bankDetails.accountNumber,
      bankName: bankDetails.bankName,
      branchName: bankDetails.branchName,
      ifscCode: bankDetails.ifscCode,
    }
    if (premiseType === "other") {
      detailsToSave.otherPremiseDescription = otherPremiseDescription
    }

    const filesToUpload: { type: string; file: File }[] = []

    // Collect files from `stagedFiles`
    for (const key in stagedFiles) {
      const stagedFileEntry = stagedFiles[key]
      if (stagedFileEntry && stagedFileEntry.file) {
        filesToUpload.push({ type: key, file: stagedFileEntry.file })
      }
    }

    // Bank cancelled cheque (still pushed if selected, but not required for progress)
    if (
      bankDetails.tempCancelledCheque &&
      (!bankDetails.cancelledChequeUrl || bankDetails.cancelledChequeStatus === "rejected")
    ) {
      filesToUpload.push({ type: "cancelledCheque", file: bankDetails.tempCancelledCheque })
    }

    const result = await submitRegistrationApplication({
      stepId: 2, // GST step ID
      details: detailsToSave,
      filesToUpload: filesToUpload.map((f) => ({ docType: f.type, file: f.file })), // Map to expected format
      userId: profileData.id,
      dashboardId: profileData.dashboardId,
      registrationType: "GST Registration",
      registrationName: profileData.businessName || profileData.fullName,
    })

    setIsSaving(false)

    if (result.success) {
      alert(result.message)
      router.push("/dashboard/progress") // Redirect to progress page
    } else {
      toast({
        title: "Submission failed",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const progress = calculateProgress()

  const getDocumentStatusDisplay = (status?: string) => {
    switch (status) {
      case "uploaded":
      case "pending":
        return (
          <div className="flex items-center gap-1 text-amber-600 text-xs">
            <Clock className="h-3 w-3" />
            <span>Pending Verification</span>
          </div>
        )
      case "verified":
        return (
          <div className="flex items-center gap-1 text-green-600 text-xs">
            <Check className="h-3 w-3" />
            <span>Verified</span>
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center gap-1 text-red-600 text-xs">
            <XCircle className="h-3 w-3" />
            <span>Rejected, Re-upload required</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock className="h-3 w-3" />
            <span>Not Uploaded</span>
          </div>
        )
    }
  }

  const getDocumentUploadComponent = (
    docKey: string,
    label: string,
    currentUrl: string | undefined,
    currentStatus: "pending" | "uploaded" | "verified" | "rejected" | undefined,
    inputRef: React.RefObject<HTMLInputElement>,
    handleUpload: (docType: string, file: File | null) => void,
    icon: React.ElementType,
    hint: string,
    accept: string,
  ) => {
    const stagedFile = stagedFiles[docKey]
    const isUploading = uploadingStates[docKey]

    const handleContainerClick = () => {
      inputRef.current?.click()
    }

    const handleButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent event bubbling
      inputRef.current?.click()
    }

    return (
      <div className="space-y-2">
        <Label>
          {label} <span className="text-red-500">*</span>
        </Label>
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer`}
          onClick={handleContainerClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file && file.size > 1024 * 1024) {
                toast({
                  title: "File size too large.",
                  description: "Please upload a file smaller than 1MB.",
                })
                return
              }
              handleStageFileUpload(docKey, file)
            }}
            className="hidden"
            id={docKey}
            disabled={isUploading}
          />
          {stagedFile ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium text-gray-700">{stagedFile.file.name}</span>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(stagedFile.previewUrl, "_blank")
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" /> Preview
                </Button>
                <Button
                  variant="link"
                  className="p-0 h-auto text-red-600 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveStagedFile(docKey, inputRef)
                  }}
                >
                  <XCircle className="h-3 w-3 mr-1" /> Remove
                </Button>
                <Button variant="link" className="p-0 h-auto text-blue-600 text-xs" onClick={handleButtonClick}>
                  <Upload className="h-3 w-3 mr-1" /> Re-upload
                </Button>
              </div>
            </div>
          ) : currentUrl ? (
            <div className="flex flex-col items-center justify-center gap-2">
              {currentStatus === "rejected" ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Check className="h-5 w-5 text-green-600" />
              )}
              <span
                className={`text-sm font-medium ${currentStatus === "rejected" ? "text-red-600" : "text-green-600"}`}
              >
                {currentStatus === "rejected" ? "Rejected" : "Uploaded"}
              </span>
              {/* 🔥 SHOW "SHARED FROM PREVIOUS REGISTRATION" MESSAGE */}
              <div className="flex items-center gap-1 text-blue-600 text-xs">
                <Check className="h-3 w-3" />
                <span>Shared from previous registration</span>
              </div>
              {currentUrl && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(currentUrl, "_blank")
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" /> View
                </Button>
              )}
              {currentStatus === "rejected" && (
                <Button variant="link" className="p-0 h-auto text-blue-600 text-xs mt-1" onClick={handleButtonClick}>
                  <Upload className="h-3 w-3 mr-1" /> Re-upload
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {icon && <icon className="h-8 w-8 text-gray-400 mx-auto" />}
              <div className="text-sm text-gray-600">
                <span className="text-primary">{isUploading ? "Uploading..." : "Click to upload"}</span>
              </div>
              <p className="text-xs text-gray-500">{hint}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  interface DocumentUploadSectionProps {
    docType: string
    label: string
    description: string
    required?: boolean
    currentDocState: {
      name: string
      file: File | null
      uploaded: boolean
      url?: string
      status?: "pending" | "uploaded" | "verified" | "rejected"
      tempFile?: File | null
      tempUrl?: string
    }
    onFileSelect: (file: File | null) => void
    colorClass: string
  }

  const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
    docType,
    label,
    description,
    required = false,
    currentDocState,
    onFileSelect,
    colorClass,
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null
      onFileSelect(file)
    }

    const handleContainerClick = () => {
      fileInputRef.current?.click()
    }

    const handleButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent event bubbling
      fileInputRef.current?.click()
    }

    return (
      <div className={`space-y-4 p-4 bg-${colorClass}-50 rounded-lg border border-${colorClass}-200`}>
        <h4 className={`font-medium text-${colorClass}-900`}>
          {label} {required && <span className="text-red-500">*</span>}
        </h4>
        <p className="text-sm text-gray-500">{description}</p>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={handleContainerClick}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {currentDocState.tempUrl ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium text-gray-700">{currentDocState.tempFile?.name}</span>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(currentDocState.tempUrl, "_blank")
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" /> Preview
                </Button>
                <Button
                  variant="link"
                  className="p-0 h-auto text-red-600 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFileSelect(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                >
                  <XCircle className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ) : currentDocState.url ? (
            <div className="flex flex-col items-center justify-center gap-2">
              {currentDocState.status === "rejected" ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Check className="h-5 w-5 text-green-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  currentDocState.status === "rejected" ? "text-red-600" : "text-green-600"
                }`}
              >
                {currentDocState.status === "rejected" ? "Rejected" : "Uploaded"}
              </span>
              {/* 🔥 SHOW "SHARED FROM PREVIOUS REGISTRATION" MESSAGE */}
              <div className="flex items-center gap-1 text-blue-600 text-xs">
                <Check className="h-3 w-3" />
                <span>Shared from previous registration</span>
              </div>
              {currentDocState.url && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(currentDocState.url, "_blank")
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" /> View
                </Button>
              )}
              {currentDocState.status === "rejected" && (
                <Button variant="link" className="p-0 h-auto text-blue-600 text-xs mt-1" onClick={handleButtonClick}>
                  <Upload className="h-3 w-3 mr-1" /> Re-upload
                </Button>
              )}
              {/* Removed the "Replace" button for pre-fetched/shared documents */}
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <div className="text-sm text-gray-600">
                <span className="text-primary">Click to upload</span>
              </div>
              <p className="text-xs text-gray-500">Supported formats: .pdf, .jpg, .jpeg, .png</p>
            </div>
          )}
        </div>
      </div>
    )
  }

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
                { key: "panCardUrl", label: "PAN Card", icon: FileText, completed: !!profileData.panCardUrl },
                {
                  key: "aadharCardUrl",
                  label: "Aadhaar Card",
                  icon: FileText,
                  completed: !!profileData.aadharCardUrl,
                },
                {
                  key: "photographUrl",
                  label: "Photograph",
                  icon: User,
                  completed: !!profileData.photographUrl,
                },
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

      {/* Business Entity Documents - Show based on business type - HIDE for individual/sole proprietorship */}
      {businessType && businessType !== "individual" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Business Entity Documents <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription>
              Upload required documents for{" "}
              {businessType === "partnership"
                ? "Partnership Firm"
                : businessType === "llp"
                  ? "LLP"
                  : "Private Limited Company"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Authorization Letter - Required for all non-individual types */}
            <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h4 className="font-medium text-indigo-900">📋 Authorization Documents:</h4>
              {getDocumentUploadComponent(
                "authorizationLetter",
                "Authorization Letter / Board Resolution",
                businessDocuments.authorizationLetterUrl,
                businessDocuments.authorizationLetterStatus,
                authorizationLetterRef,
                handleStageFileUpload,
                Shield,
                businessType === "partnership"
                  ? "Authorization from partners"
                  : businessType === "llp"
                    ? "Authorization from designated partners"
                    : "Board resolution from directors",
                ".pdf,.jpg,.jpeg,.png",
              )}
            </div>

            {/* Partnership Deed - Only for Partnership */}
            {businessType === "partnership" && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900">🤝 Partnership Documents:</h4>
                {getDocumentUploadComponent(
                  "partnershipDeed",
                  "Partnership Deed",
                  businessDocuments.partnershipDeedUrl,
                  businessDocuments.partnershipDeedStatus,
                  partnershipDeedRef,
                  handleStageFileUpload,
                  Users,
                  "Registered partnership deed",
                  ".pdf,.jpg,.jpeg,.png",
                )}
              </div>
            )}

            {/* LLP Agreement - Only for LLP */}
            {businessType === "llp" && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900">🤝 LLP Documents:</h4>
                {getDocumentUploadComponent(
                  "llpAgreement",
                  "LLP Agreement",
                  businessDocuments.llpAgreementUrl,
                  businessDocuments.llpAgreementStatus,
                  llpAgreementRef, // Use the new ref
                  handleStageFileUpload,
                  Users,
                  "Limited Liability Partnership agreement",
                  ".pdf,.jpg,.jpeg,.png",
                )}
              </div>
            )}

            {/* Company Documents - Only for Private Limited Company */}
            {businessType === "pvt_ltd" && (
              <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-medium text-emerald-900">🏢 Company Documents:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Certificate of Incorporation */}
                  {getDocumentUploadComponent(
                    "certificateOfIncorporation",
                    "Certificate of Incorporation",
                    businessDocuments.certificateOfIncorporationUrl,
                    businessDocuments.certificateOfIncorporationStatus,
                    certificateOfIncorporationRef,
                    handleStageFileUpload,
                    Award,
                    "Company incorporation certificate from ROC",
                    ".pdf,.jpg,.jpeg,.png",
                  )}

                  {/* MOA & AOA */}
                  {getDocumentUploadComponent(
                    "moaAoa",
                    "MOA & AOA",
                    businessDocuments.moaAoaUrl,
                    businessDocuments.moaAoaStatus,
                    moaAoaRef,
                    handleStageFileUpload,
                    FileText,
                    "Memorandum and Articles of Association documents",
                    ".pdf,.jpg,.jpeg,.png",
                  )}
                </div>
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
            <RadioGroup
              value={premiseType}
              onValueChange={(value) => setPremiseType(value as "rented" | "owned" | "other")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rented" id="rented" />
                <Label htmlFor="rented">Rented Property</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owned" id="owned" />
                <Label htmlFor="owned">Owned Property</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          {premiseType === "rented" && (
            <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900">📌 Required for Rented Property:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getDocumentUploadComponent(
                  "rentAgreement",
                  "Rent/Lease Agreement (Registered)",
                  documents.rentAgreement?.url,
                  documents.rentAgreement?.status,
                  rentAgreementRef,
                  handleStageFileUpload,
                  Upload,
                  "",
                  ".pdf,.jpg,.jpeg,.png",
                )}
                {getDocumentUploadComponent(
                  "electricityBill",
                  "Electricity Bill (latest)",
                  documents.electricityBill?.url,
                  documents.electricityBill?.status,
                  electricityBillRef,
                  handleStageFileUpload,
                  Upload,
                  "",
                  ".pdf,.jpg,.jpeg,.png",
                )}
                {getDocumentUploadComponent(
                  "noc",
                  "NOC from Property Owner",
                  documents.noc?.url,
                  documents.noc?.status,
                  nocRef,
                  handleStageFileUpload,
                  Upload,
                  "",
                  ".pdf,.jpg,.jpeg,.png",
                )}
              </div>
            </div>
          )}

          {premiseType === "owned" && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900">📌 Required for Owned Property:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getDocumentUploadComponent(
                  "propertyProof",
                  "Index II / Sale Deed / Property Tax Receipt",
                  documents.propertyProof?.url,
                  documents.propertyProof?.status,
                  propertyProofRef,
                  handleStageFileUpload,
                  Upload,
                  "",
                  ".pdf,.jpg,.jpeg,.png",
                )}
                {getDocumentUploadComponent(
                  "electricityBillOwned",
                  "Electricity Bill (latest)",
                  documents.electricityBillOwned?.url,
                  documents.electricityBillOwned?.status,
                  electricityBillOwnedRef,
                  handleStageFileUpload,
                  Upload,
                  "",
                  ".pdf,.jpg,.jpeg,.png",
                )}
              </div>
            </div>
          )}

          {premiseType === "other" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">📌 Required for Other Property Type:</h4>
              <div className="space-y-2 mb-4">
                <Label htmlFor="otherPremiseDescription">
                  Specify Premise Type <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="otherPremiseDescription"
                  placeholder="e.g., Co-working space, Shared office, etc."
                  value={otherPremiseDescription}
                  onChange={(e) => setOtherPremiseDescription(e.target.value)}
                />
                <p className="text-xs text-gray-500">Please describe the type of premise</p>
              </div>
              {getDocumentUploadComponent(
                "otherProof",
                "Proof of Premise (e.g., Agreement, Letter)",
                documents.otherProof?.url,
                documents.otherProof?.status,
                otherProofRef,
                handleStageFileUpload,
                Upload,
                "Upload relevant document for your premise type",
                ".pdf,.jpg,.jpeg,.png",
              )}
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
              <Label>Cancelled Cheque, Bank Statement, or Passbook (Front Page)</Label>
              <p className="text-sm text-gray-600 mb-2">
                Upload a cancelled cheque, bank statement, or the front page of your passbook for account verification.
              </p>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => cancelledChequeRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleBankDocumentSelect(e.target.files?.[0] || null)}
                  className="hidden"
                  ref={cancelledChequeRef}
                />
                {bankDetails.tempCancelledChequeUrl ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{bankDetails.tempCancelledCheque?.name}</span>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(bankDetails.tempCancelledChequeUrl, "_blank")
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" /> Preview
                      </Button>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-red-600 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          setBankDetails((prev) => ({
                            ...prev,
                            cancelledCheque: null,
                            tempCancelledCheque: null,
                            tempCancelledChequeUrl: undefined,
                          }))
                          if (cancelledChequeRef.current) {
                            cancelledChequeRef.current.value = ""
                          }
                        }}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : bankDetails.cancelledChequeUrl ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    {bankDetails.cancelledChequeStatus === "rejected" ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        bankDetails.cancelledChequeStatus === "rejected" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {bankDetails.cancelledChequeStatus === "rejected" ? "Rejected" : "Uploaded"}
                    </span>
                    {/* 🔥 SHOW "SHARED FROM PREVIOUS REGISTRATION" MESSAGE */}
                    <div className="flex items-center gap-1 text-blue-600 text-xs">
                      <Check className="h-3 w-3" />
                      <span>Shared from previous registration</span>
                    </div>
                    {bankDetails.cancelledChequeUrl && (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(bankDetails.cancelledChequeUrl, "_blank")
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                    )}
                    {bankDetails.cancelledChequeStatus === "rejected" && (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600 text-xs mt-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          cancelledChequeRef.current?.click()
                        }}
                      >
                        <Upload className="h-3 w-3 mr-1" /> Re-upload
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <span className="text-primary">Click to upload</span>
                    </div>
                    <p className="text-xs text-gray-500">Supported formats: .pdf, .jpg, .jpeg, .png</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GST Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            GST Information
          </CardTitle>
          <CardDescription>Important information about Goods and Services Tax</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-900 mb-3">🧾 What is GST?</h4>
            <ul className="text-emerald-800 text-sm space-y-2">
              <li>• Goods and Services Tax is an indirect tax levied on the supply of goods and services</li>
              <li>• Replaced multiple indirect taxes in India (e.g., VAT, Service Tax, Excise Duty)</li>
              <li>• Aims to simplify the tax structure and reduce cascading effect of taxes</li>
              <li>• Mandatory for businesses exceeding a certain turnover threshold</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">📋 Benefits of GST Registration:</h4>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Legal recognition as a supplier of goods or services</li>
              <li>• Eligibility to collect GST from customers and claim Input Tax Credit (ITC)</li>
              <li>• Improves business credibility and expands market reach</li>
              <li>• Simplifies tax compliance with a single tax regime</li>
              <li>• Reduces overall tax burden for eligible businesses</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        {getRegistrationStatus() === "in-progress" ? (
          <Card className="w-full bg-amber-50 border-amber-200 text-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Application Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Your GST registration application has been submitted and is currently being processed. You can track the
                progress in the Progress section.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/registration">Save & Continue Later</Link>
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmit} disabled={progress < 100}>
              Submit GST Application ({progress}%)
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
