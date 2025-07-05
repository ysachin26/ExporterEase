"use server"

import { connectDB } from "@/lib/db"
import User from "@/models/User"
import Dashboard from "@/models/Dashboard"
import PurchasedService from "@/models/PurchasedService"
import Document, { DocumentType, DocumentStatus, DocumentCategory } from "@/models/Document"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import { v2 as cloudinary } from "cloudinary"
import { redirect } from "next/navigation"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// This is a placeholder for a real OTP service.
// In a production environment, you would integrate with an SMS gateway (e.g., Twilio, MSG91).
const otpStore: Record<string, string> = {} // Stores OTPs by mobile number

export async function generateOtp(mobileNo: string) {
  // Simulate OTP generation
  const otp = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit OTP
  otpStore[mobileNo] = otp
  console.log(`Generated OTP for ${mobileNo}: ${otp}`) // For demonstration purposes
  return { success: true, message: "OTP sent to your mobile number." }
}

export async function verifyOtp(mobileNo: string, otp: string) {
  if ("123456" === otp) {
    delete otpStore[mobileNo] // OTP consumed
    return { success: true, message: "OTP verified successfully." }
  }
  return { success: false, message: "Invalid OTP." }
}

export async function signup(prevState: any, formData: FormData) {
  await connectDB()

  const fullName = formData.get("fullName") as string
  const mobileNo = formData.get("mobileNo") as string
  const businessType = formData.get("businessType") as "Proprietorship" | "Partnership" | "LLP" | "PVT LTD" | "Other"
  const otherBusinessType = formData.get("otherBusinessType") as string | undefined
  const businessName = formData.get("businessName") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const otp = formData.get("otp") as string

  if (!fullName || !mobileNo || !businessType || !businessName || !password || !confirmPassword || !otp) {
    return { success: false, message: "All fields are required." }
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match." }
  }

  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long." }
  }

  // Verify OTP
  const otpVerificationResult = await verifyOtp(mobileNo, otp)
  if (!otpVerificationResult.success) {
    return otpVerificationResult
  }

  try {
    const existingUser = await User.findOne({ mobileNo })
    if (existingUser) {
      return { success: false, message: "Mobile number already registered." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user with all required fields
    const newUser = new User({
      fullName,
      mobileNo,
      businessType,
      otherBusinessType: businessType === "Other" ? otherBusinessType : undefined,
      businessName,
      password: hashedPassword,
      isMobileVerified: true, // Mark as verified after OTP success
      // Initialize profile completion fields with empty URLs
      email: "",
      emailVerified: false,
      aadharCardUrl: "",
      panCardUrl: "",
      photographUrl: "",
      proofOfAddressUrl: "",
    })

    await newUser.save()

    // Create initial dashboard data for the new user
    await createInitialDashboard(newUser._id as mongoose.Types.ObjectId, fullName)

    return { success: true, message: "Registration successful! You can now log in." }
  } catch (error: any) {
    console.error("Signup error:", error)
    return { success: false, message: `Registration failed: ${error.message}` }
  }
}

export async function login(prevState: any, formData: FormData) {
  await connectDB()

  const mobileNo = formData.get("mobileNo") as string
  const password = formData.get("password") as string

  if (!mobileNo || !password) {
    return { success: false, message: "Mobile number and password are required." }
  }

  try {
    const user = await User.findOne({ mobileNo })
    if (!user) {
      return { success: false, message: "Invalid mobile number or password." }
    }

    // Check if password exists to prevent bcrypt error
    if (!user.password) {
      console.error(`User ${user._id} found but has no password. Data inconsistency.`)
      return { success: false, message: "Invalid mobile number or password." }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return { success: false, message: "Invalid mobile number or password." }
    }

    // Update login tracking
    user.updateLastLogin()
    user.status = user.status === 'pending_verification' ? 'active' : user.status
    await user.save()

    console.log(`✅ User ${user.fullName} logged in successfully`)

    // In a real application, you would set up a session or JWT here.
    // For this demo, we'll just return a success message.
    return {
      success: true,
      message: "Login successful!",
      redirect: "/dashboard",
      user: {
        id: (user._id as mongoose.Types.ObjectId).toString(),
        fullName: user.fullName,
        mobileNo: user.mobileNo,
        businessName: user.businessName,
        status: user.status,
        profileCompletion: user.calculateProfileCompletion(),
      },
    }
  } catch (error: any) {
    console.error("❌ Login error:", error)
    return { success: false, message: `Login failed: ${error.message}` }
  }
}

// Logout action
export async function logout() {
  try {
    // In a real application, you would:
    // 1. Clear session/JWT tokens
    // 2. Invalidate server-side sessions
    // 3. Clear any cached user data
    
    console.log("🔓 User logged out successfully")
    
    // For this demo, we'll just redirect to home page
    redirect("/")
  } catch (error) {
    console.error("❌ Logout error:", error)
    // Still redirect even if there's an error
    redirect("/")
  }
}

// Create initial dashboard data for new user
async function createInitialDashboard(userId: mongoose.Types.ObjectId, fullName: string) {
  const dashboard = new Dashboard({
    userId,
    hasStartedRegistration: true,
    // registrationSteps will be initialized by the pre('save') hook in Dashboard model
    profileCompletion: {}, // Initialize as empty object, percentage calculated dynamically
  })

  // Explicitly mark the "Registration" step as completed
  const registrationStep = dashboard.registrationSteps.find((step: any) => step.id === 1)
  if (registrationStep) {
    registrationStep.status = "completed"
    registrationStep.completedAt = new Date()
  }

  // Add welcome notification
  dashboard.addNotification(
    "Welcome to GoFarmlyConnect!",
    `Hi ${fullName}! Complete your profile to unlock all features.`,
    "info",
  )

  await dashboard.save()
}

// Helper to calculate profile completion percentage from User model
const calculateProfileCompletionPercentage = (user: any) => {
  let completedFields = 0
  const totalFields = 10 // Updated total

  if (user.fullName && user.fullName.trim() !== "") completedFields++
  if (user.mobileNo && user.mobileNo.trim() !== "") completedFields++
  if (user.email && user.email.trim() !== "") completedFields++
  if (user.emailVerified) completedFields++
  if (user.businessType && user.businessType.trim() !== "") completedFields++
  if (user.businessName && user.businessName.trim() !== "") completedFields++
  if (user.aadharCardUrl && user.aadharCardUrl.trim() !== "") completedFields++
  if (user.panCardUrl && user.panCardUrl.trim() !== "") completedFields++
  if (user.photographUrl && user.photographUrl.trim() !== "") completedFields++
  if (user.proofOfAddressUrl && user.proofOfAddressUrl.trim() !== "") completedFields++

  return Math.round((completedFields / totalFields) * 100)
}

// Get dashboard data for a user
export async function getDashboardData() {
  await connectDB()

  let user = await User.findOne().sort({ createdAt: -1 }).lean()

  if (!user) {
    // Create a demo user if none exists
    const newUser = new User({
      fullName: "Vinayak Maurya",
      mobileNo: "+919876543210",
      businessType: "Proprietorship",
      businessName: "Maurya Exports",
      password: await bcrypt.hash("demo123", 10),
      isMobileVerified: true,
      email: "vinayak@example.com",
      emailVerified: false,
      aadharCardUrl: "",
      panCardUrl: "",
      photographUrl: "",
      proofOfAddressUrl: "",
    })
    await newUser.save()
    user = newUser.toObject() as any
  }

  if (!user) {
    return {
      user: null,
      dashboard: null,
      hasStartedRegistration: false,
      profileCompletion: 0,
      registrationSteps: [],
      overallProgress: 0,
      notifications: [],
      unreadNotificationCount: 0,
      isProfileComplete: false,
      error: "User not found",
    }
  }

  let dashboard = await Dashboard.findOne({ userId: user._id }).lean()

  if (!dashboard) {
    await createInitialDashboard(user._id as mongoose.Types.ObjectId, user.fullName)
    dashboard = await Dashboard.findOne({ userId: user._id }).lean()
  }

  if (!dashboard) {
    return {
      user: user,
      dashboard: null,
      hasStartedRegistration: false,
      profileCompletion: calculateProfileCompletionPercentage(user),
      registrationSteps: [],
      overallProgress: 0,
      notifications: [],
      unreadNotificationCount: 0,
      isProfileComplete: calculateProfileCompletionPercentage(user) === 100,
      error: "Dashboard not found",
    }
  }

  // Calculate overall progress dynamically
  const completedStepsCount = (dashboard as any).registrationSteps.filter(
    (step: any) => step.status === "completed",
  ).length
  const overallProgress =
    (dashboard as any).registrationSteps.length > 0
      ? Math.round((completedStepsCount / (dashboard as any).registrationSteps.length) * 100)
      : 0

  // Calculate profile completion percentage dynamically
  const profileCompletionPercentage = calculateProfileCompletionPercentage(user)

  const transformedRegistrationSteps = (dashboard as any).registrationSteps.map((step: any) => ({
    id: step.id,
    name: step.name,
    status: step.status,
    icon: step.icon,
    completedAt: step.completedAt ? step.completedAt.toISOString() : null,
    documents: step.documents
      ? step.documents.map((doc: any) => ({
          name: doc.name,
          uploadedAt: doc.uploadedAt ? doc.uploadedAt.toISOString() : null,
          status: doc.status,
          url: doc.url, // Include URL
        }))
      : [],
    details: step.details || {}, // Include the new details field
  }))

  const transformedNotifications = (dashboard as any).notifications.map((notif: any) => ({
    id: notif._id.toString(),
    title: notif.title,
    message: notif.message,
    type: notif.type,
    read: notif.read,
    createdAt: notif.createdAt.toISOString(),
  }))

  const unreadNotificationCount = transformedNotifications.filter((notif: any) => !notif.read).length

  return {
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      businessName: user.businessName,
      businessType: user.businessType,
      mobileNo: user.mobileNo,
      email: user.email,
      emailVerified: user.emailVerified,
      aadharCardUrl: user.aadharCardUrl,
      panCardUrl: user.panCardUrl,
      photographUrl: user.photographUrl,
      proofOfAddressUrl: user.proofOfAddressUrl,
      // Include all registration document URLs from User model
      authorizationLetterUrl: user.authorizationLetterUrl || "",
      partnershipDeedUrl: user.partnershipDeedUrl || "",
      llpAgreementUrl: user.llpAgreementUrl || "",
      certificateOfIncorporationUrl: user.certificateOfIncorporationUrl || "",
      moaAoaUrl: user.moaAoaUrl || "",
      cancelledChequeUrl: user.cancelledChequeUrl || "",
      iecCertificate: user.iecCertificate || "",
      dscCertificate: user.dscCertificate || "",
      gstCertificate: user.gstCertificate || "",
      rentAgreementUrl: user.rentAgreementUrl || "",
      electricityBillUrl: user.electricityBillUrl || "",
      nocUrl: user.nocUrl || "",
      propertyProofUrl: user.propertyProofUrl || "",
      electricityBillOwnedUrl: user.electricityBillOwnedUrl || "",
      otherProofUrl: user.otherProofUrl || "",
      adCodeLetterFromBankUrl: user.adCodeLetterFromBankUrl || "",
      bankDocumentUrl: user.bankDocumentUrl || "",
    },
    dashboard: {
      _id: dashboard._id.toString(),
      hasStartedRegistration: dashboard.hasStartedRegistration,
      registrationSteps: transformedRegistrationSteps,
      notifications: transformedNotifications,
    },
    hasStartedRegistration: (dashboard as any).hasStartedRegistration,
    profileCompletion: profileCompletionPercentage, // Dynamically calculated
    registrationSteps: transformedRegistrationSteps,
    overallProgress: overallProgress, // Dynamically calculated
    notifications: transformedNotifications,
    unreadNotificationCount: unreadNotificationCount,
    isProfileComplete: profileCompletionPercentage === 100,
  }
}

// Helper function to determine file type and get appropriate Cloudinary upload options
function getCloudinaryUploadOptions(file: File, documentType: string, userId: string) {
  const fileExtension = file.name.split(".").pop()?.toLowerCase()
  const isPdf = fileExtension === "pdf"

  // Base configuration
  const baseConfig = {
    folder: `gofarmlyconnect_documents/${userId}`,
    public_id: `${documentType}_${Date.now()}`,
  }

  // For PDFs, use raw resource type
  if (isPdf) {
    return {
      ...baseConfig,
      resource_type: "raw" as const,
      format: "pdf",
    }
  }

  // For images, use image resource type (default)
  return {
    ...baseConfig,
    resource_type: "image" as const,
  }
}

// Helper function to get the corresponding User model field name for a document type
function getUserDocumentFieldName(documentType: string): string | null {
  const documentFieldMap: Record<string, string> = {
    // Profile documents
    aadharCard: "aadharCardUrl",
    panCard: "panCardUrl",
    photograph: "photographUrl",
    proofOfAddress: "proofOfAddressUrl",

    // Registration certificates
    gstCertificate: "gstCertificate",
    iecCertificate: "iecCertificate",
    dscCertificate: "dscCertificate",
    icegateCertificate: "icegateCertificate",
    adcodeCertificate: "adcodeCertificate",

    // GST Registration Documents
    rentAgreement: "rentAgreementUrl",
    electricityBill: "electricityBillUrl",
    noc: "nocUrl",
    propertyProof: "propertyProofUrl",
    electricityBillOwned: "electricityBillOwnedUrl",
    otherProof: "otherProofUrl",

    // Business Entity Documents (SHARED ACROSS REGISTRATIONS)
    authorizationLetter: "authorizationLetterUrl", // Used in GST, IEC, DSC, ICEGATE, AD Code
    partnershipDeed: "partnershipDeedUrl", // Used in GST, IEC
    llpAgreement: "llpAgreementUrl", // Used in IEC
    certificateOfIncorporation: "certificateOfIncorporationUrl", // Used in GST, IEC
    moaAoa: "moaAoaUrl", // Used in GST, IEC

    // Bank Documents (SHARED ACROSS REGISTRATIONS)
    cancelledCheque: "cancelledChequeUrl", // Used in GST, IEC, AD Code
    bankDocument: "bankDocumentUrl", // Used in ICEGATE and other registrations

    // AD Code Specific Documents
    adCodeLetterFromBank: "adCodeLetterFromBankUrl",
  }

  return documentFieldMap[documentType] || null
}

// Define profile document types that should NOT be stored in dashboard.registrationSteps.documents
const PROFILE_DOCUMENT_TYPES = ["aadharCard", "panCard", "photograph", "proofOfAddress"]

// New function to handle file uploads and save URLs
export async function uploadDocument(formData: FormData) {
  await connectDB()

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return { success: false, message: "User not found" }

  const file = formData.get("file") as File
  const documentType = formData.get("documentType") as string // e.g., "aadharCard", "panCard", "rentAgreement"
  const stepId = formData.get("stepId") ? Number.parseInt(formData.get("stepId") as string) : undefined // Optional for registration documents

  if (!file) {
    return { success: false, message: "No file provided." }
  }

  if (!documentType) {
    return { success: false, message: "Document type not specified." }
  }

  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get appropriate upload options based on file type
    const uploadOptions = getCloudinaryUploadOptions(
      file,
      documentType,
      (user._id as mongoose.Types.ObjectId).toString(),
    )

    // Upload to Cloudinary with appropriate resource type
    const uploadResult = (await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) return reject(error)
          resolve(result)
        })
        .end(buffer)
    })) as any

    const fileUrl = uploadResult.secure_url

    // Always update User model if a corresponding field exists
    const userFieldName = getUserDocumentFieldName(documentType)
    if (userFieldName) {
      ;(user as any)[userFieldName] = fileUrl
      await user.save()
      console.log(`✅ Document ${documentType} saved to User model field: ${userFieldName}`)
    }

    // Only update Dashboard model if it's a registration-specific document AND stepId is provided
    // Profile documents (aadharCard, panCard, photograph, proofOfAddress) should NOT be stored in dashboard.registrationSteps.documents
    if (stepId && !PROFILE_DOCUMENT_TYPES.includes(documentType)) {
      const dashboard = await Dashboard.findOne({ userId: user._id })
      if (!dashboard) return { success: false, message: "Dashboard not found" }

      const step = dashboard.registrationSteps.find((s: any) => s.id === stepId)
      if (!step) return { success: false, message: "Registration step not found" }

      // Find or create the document entry within the step
      const docEntry = step.documents.find((d: any) => d.name === documentType)
      if (docEntry) {
        docEntry.url = fileUrl
        docEntry.uploadedAt = new Date()
        docEntry.status = "uploaded" // Set status to uploaded upon successful upload
      } else {
        step.documents.push({
          name: documentType,
          url: fileUrl,
          uploadedAt: new Date(),
          status: "uploaded", // Set status to uploaded upon successful upload
        })
      }
      await dashboard.save()
      console.log(`✅ Document ${documentType} saved to Dashboard step ${stepId} documents.`)
    } else if (stepId && PROFILE_DOCUMENT_TYPES.includes(documentType)) {
      console.log(
        `ℹ️ Profile document ${documentType} not saved to Dashboard step ${stepId} documents (already in User model).`,
      )
    }

    // No need to update dashboard.profileCompletion.completionPercentage here, it's calculated dynamically on fetch
    // The user's profile data is updated, which will affect the dynamic calculation.

    return {
      success: true,
      fileUrl: fileUrl,
      completionPercentage: calculateProfileCompletionPercentage(user), // Still return for client-side immediate update
    }
  } catch (error: any) {
    console.error("File upload error:", error)
    return { success: false, message: `Upload failed: ${error.message}` }
  }
}

// NEW SERVER ACTION: Update registration step details (text inputs)
export async function updateRegistrationDetails(stepId: number, details: Record<string, any>) {
  await connectDB()

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return { success: false, message: "User not found" }

  const dashboard = await Dashboard.findOne({ userId: user._id })
  if (!dashboard) return { success: false, message: "Dashboard not found" }

  const step = dashboard.registrationSteps.find((s: any) => s.id === stepId)
  if (!step) return { success: false, message: "Registration step not found" }

  // Update the details object for the specific step
  step.details = { ...step.details, ...details }

  // --- NEW LOGIC TO ADD PRE-FILLED DOCUMENTS TO REGISTRATION STEP DOCUMENTS ---
  const userDocUrls: Record<string, string | undefined> = {
    // Profile documents (always relevant for progress calculation)
    panCard: user.panCardUrl,
    aadharCard: user.aadharCardUrl,
    photograph: user.photographUrl,
    proofOfAddress: user.proofOfAddressUrl,

    // Shared business entity documents
    authorizationLetter: user.authorizationLetterUrl,
    partnershipDeed: user.partnershipDeedUrl,
    llpAgreement: user.llpAgreementUrl,
    certificateOfIncorporation: user.certificateOfIncorporationUrl,
    moaAoa: user.moaAoaUrl,

    // Shared bank documents
    cancelledCheque: user.cancelledChequeUrl,
    bankDocument: user.bankDocumentUrl, // Used in ICEGATE

    // Registration-specific certificates/documents
    iecCertificate: user.iecCertificate,
    gstCertificate: user.gstCertificate,
    dscCertificate: user.dscCertificate,
    adCodeLetterFromBank: user.adCodeLetterFromBankUrl,

    // GST Premise documents
    rentAgreement: user.rentAgreementUrl,
    electricityBill: user.electricityBillUrl,
    noc: user.nocUrl,
    propertyProof: user.propertyProofUrl,
    electricityBillOwned: user.electricityBillOwnedUrl,
    otherProof: user.otherProofUrl,
  }

  // Define which documents are relevant for each step
  const relevantDocsForStep: Record<number, string[]> = {
    2: [
      // GST Registration
      "panCard",
      "aadharCard",
      "photograph",
      "proofOfAddress",
      "authorizationLetter",
      "partnershipDeed",
      "llpAgreement",
      "certificateOfIncorporation",
      "moaAoa",
      "cancelledCheque",
      "rentAgreement",
      "electricityBill",
      "noc",
      "propertyProof",
      "electricityBillOwned",
      "otherProof",
    ],
    3: [
      // IEC Code
      "panCard",
      "aadharCard",
      "photograph",
      "proofOfAddress",
      "authorizationLetter",
      "partnershipDeed",
      "llpAgreement",
      "certificateOfIncorporation",
      "moaAoa",
      "cancelledCheque",
    ],
    4: [
      // DSC Registration
      "panCard",
      "aadharCard",
      "photograph",
      "proofOfAddress",
      "authorizationLetter",
    ],
    5: [
      // ICEGATE Registration
      "panCard",
      "aadharCard",
      "photograph",
      "proofOfAddress",
      "iecCertificate",
      "dscCertificate",
      "authorizationLetter",
      "bankDocument",
    ],
    6: [
      // AD Code
      "panCard",
      "aadharCard",
      "photograph",
      "proofOfAddress",
      "iecCertificate",
      "dscCertificate",
      "adCodeLetterFromBank",
      "authorizationLetter",
      "cancelledCheque",
    ],
  }

  const currentStepRelevantDocs = relevantDocsForStep[stepId] || []

  for (const docName of currentStepRelevantDocs) {
    // Skip adding profile documents to step.documents
    if (PROFILE_DOCUMENT_TYPES.includes(docName)) {
      console.log(`ℹ️ Skipping adding profile document '${docName}' to step ${stepId} documents.`)
      continue
    }

    const userDocUrl = userDocUrls[docName]
    const existingDocInStep = step.documents.find((d: any) => d.name === docName)

    if (userDocUrl && !existingDocInStep) {
      // If user has the URL and it's not already in the step's documents, add it
      step.documents.push({
        name: docName,
        url: userDocUrl,
        uploadedAt: new Date(),
        status: "uploaded", // Mark as uploaded since it's coming from user profile
      })
      console.log(`Added pre-filled document '${docName}' to step ${stepId} documents.`)
    } else if (
      userDocUrl &&
      existingDocInStep &&
      existingDocInStep.url !== userDocUrl &&
      existingDocInStep.status !== "rejected"
    ) {
      // If user has a new URL for an existing document in step, update it (unless it was rejected)
      existingDocInStep.url = userDocUrl
      existingDocInStep.uploadedAt = new Date()
      existingDocInStep.status = "uploaded"
      console.log(`Updated pre-filled document '${docName}' in step ${stepId} documents.`)
    }
  }
  // --- END NEW LOGIC ---

  await dashboard.save()

  return { success: true, message: "Registration details updated successfully." }
}

// Update profile completion fields in the User model
export async function updateProfileCompletion(field: string, value: boolean | string) {
  await connectDB()

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return { success: false, message: "User not found" }

  if (typeof value === "boolean") {
    ;(user as any)[field] = value
  } else if (typeof value === "string") {
    ;(user as any)[field] = value
  }

  await user.save()

  // No need to update dashboard.profileCompletion.completionPercentage here, it's calculated dynamically on fetch
  // The user's profile data is updated, which will affect the dynamic calculation.

  return {
    success: true,
    completionPercentage: calculateProfileCompletionPercentage(user), // Still return for client-side immediate update
  }
}

// Update registration step status
export async function updateRegistrationStep(stepId: number, status: string) {
  await connectDB()

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return { success: false, message: "User not found" }

  const dashboard = await Dashboard.findOne({ userId: user._id })
  if (!dashboard) return { success: false, message: "Dashboard not found" }

  const step = dashboard.registrationSteps.find((s: any) => s.id === stepId)
  if (!step) return { success: false, message: "Step not found" }

  const oldStatus = step.status
  step.status = status

  if (status === "completed" && oldStatus !== "completed") {
    step.completedAt = new Date()
    dashboard.addNotification("Step Completed!", `${step.name} has been completed successfully.`, "success")
  }

  // No need to call dashboard.calculateOverallProgress() here, it's calculated dynamically on fetch
  await dashboard.save()

  // Re-fetch dashboard data to get the latest dynamically calculated overall progress
  const updatedDashboard = await Dashboard.findOne({ userId: user._id }).lean()
  const updatedOverallProgress = updatedDashboard
    ? ((updatedDashboard as any).registrationSteps.filter((s: any) => s.status === "completed").length /
        (updatedDashboard as any).registrationSteps.length) *
      100
    : 0

  return {
    success: true,
    overallProgress: Math.round(updatedOverallProgress), // Return the dynamically calculated value
  }
}

// Add notification
export async function addNotification(title: string, message: string, type = "info") {
  await connectDB()

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return { success: false, message: "User not found" }

  const dashboard = await Dashboard.findOne({ userId: user._id })
  if (!dashboard) return { success: false, message: "Dashboard not found" }

  const notification = dashboard.addNotification(title, message, type)
  await dashboard.save()

  const plainNotification = {
    id: notification._id.toString(),
    title: notification.title,
    message: notification.message,
    type: notification.type,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
  }

  return { success: true, notification: plainNotification }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  await connectDB()

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return { success: false, message: "User not found" }

  const dashboard = await Dashboard.findOne({ userId: user._id })
  if (!dashboard) return { success: false, message: "Dashboard not found" }

  const notification = dashboard.notifications.id(notificationId)
  if (!notification) return { success: false, message: "Notification not found" }

  notification.read = true
  await dashboard.save()

  return { success: true, message: "Notification marked as read" }
}

// Email verification function
export async function verifyEmail(email: string) {
  await connectDB()

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return { success: false, message: "User not found" }

  try {
    // Update user's email and mark as verified
    user.email = email
    user.emailVerified = true
    await user.save()

    // No need to update dashboard.profileCompletion.completionPercentage here, it's calculated dynamically on fetch
    // The user's profile data is updated, which will affect the dynamic calculation.

    // Add notification for email verification
    const dashboard = await Dashboard.findOne({ userId: user._id })
    if (dashboard) {
      dashboard.addNotification("Email Verified!", `Your email ${email} has been successfully verified.`, "success")
      await dashboard.save()
    }

    return {
      success: true,
      message: "Email verified successfully!",
      completionPercentage: calculateProfileCompletionPercentage(user), // Still return for client-side immediate update
    }
  } catch (error: any) {
    console.error("Email verification error:", error)
    return { success: false, message: `Email verification failed: ${error.message}` }
  }
}

// NEW SERVER ACTION: Centralized function to submit registration applications
export async function submitRegistrationApplication({
  stepId,
  details,
  filesToUpload,
  userId,
  dashboardId,
  registrationType,
  registrationName,
}: {
  stepId: number
  details: Record<string, any>
  filesToUpload: { docType: string; file: File }[]
  userId: string
  dashboardId: string
  registrationType: string
  registrationName: string
}) {
  await connectDB()

  try {
    // 1. Update registration details (text inputs)
    const updateDetailsResult = await updateRegistrationDetails(stepId, details)
    if (!updateDetailsResult.success) {
      return { success: false, message: `Failed to save details: ${updateDetailsResult.message}` }
    }

    // 2. Upload documents
    let allUploadsSuccessful = true
    for (const docInfo of filesToUpload) {
      const formData = new FormData()
      formData.append("file", docInfo.file)
      formData.append("documentType", docInfo.docType)
      formData.append("stepId", stepId.toString()) // Pass stepId to uploadDocument

      try {
        const result = await uploadDocument(formData)
        if (!result.success) {
          allUploadsSuccessful = false
          console.error(`Upload failed for ${docInfo.docType}:`, result.message)
          // Continue processing other documents even if one fails
        }
      } catch (error) {
        allUploadsSuccessful = false
        console.error(`Upload error for ${docInfo.docType}:`, error)
        // Continue processing other documents even if one fails
      }
    }

    if (!allUploadsSuccessful) {
      // If some uploads failed, we might still want to proceed with marking as in-progress
      // but inform the user. For now, we'll return failure.
      return { success: false, message: "Some documents failed to upload. Please check and re-upload if necessary." }
    }

    // 3. Create PurchasedService entry
    const newPurchasedService = new PurchasedService({
      userId: new mongoose.Types.ObjectId(userId),
      dashboardId: new mongoose.Types.ObjectId(dashboardId),
      registrationType,
      registrationName,
      purchasedPrice: 1000, // Default price as requested
      purchasedAt: new Date(),
    })
    await newPurchasedService.save()
    console.log(`✅ Purchased service recorded: ${registrationType} for user ${userId}`)

    // 4. Update registration step status to "in-progress"
    const updateStepResult = await updateRegistrationStep(stepId, "in-progress")
    if (!updateStepResult.success) {
      return { success: false, message: `Failed to update step status: ${updateStepResult.message}` }
    }

    return { success: true, message: `${registrationType} application submitted successfully!` }
  } catch (error: any) {
    console.error(`Error submitting ${registrationType} application:`, error)
    return { success: false, message: `Application submission failed: ${error.message}` }
  }
}
