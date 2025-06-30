"use server"

import { connectDB } from "@/lib/db"
import User from "@/models/User"
import Dashboard from "@/models/Dashboard"
import bcrypt from "bcryptjs"
import type mongoose from "mongoose"
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
  const businessType = formData.get("businessType") as "Propatorship" | "Partnership" | "LLP" | "PVT LTD" | "Other"
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
    await createInitialDashboard(newUser._id, fullName)

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

    // In a real application, you would set up a session or JWT here.
    // For this demo, we'll just return a success message.
    return {
      success: true,
      message: "Login successful!",
      redirect: "/dashboard",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        mobileNo: user.mobileNo,
        businessName: user.businessName,
      },
    }
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, message: `Login failed: ${error.message}` }
  }
}

// Logout action
export async function logout() {
  // In a real application with sessions/JWT, you would:
  // - Clear server-side session
  // - Invalidate JWT tokens
  // - Clear cookies

  // For now, we'll just redirect to home page
  redirect("/")
}

// Create initial dashboard data for new user
async function createInitialDashboard(userId: mongoose.Types.ObjectId, fullName: string) {
  const initialSteps = [
    { id: 1, name: "Registration", status: "completed", icon: "CheckCircle" },
    { id: 2, name: "Document Upload", status: "pending", icon: "Clock" },
    { id: 3, name: "GST Registration", status: "pending", icon: "AlertCircle" },
    { id: 4, name: "IEC Code", status: "pending", icon: "AlertCircle" },
    { id: 5, name: "AD Code", status: "pending", icon: "AlertCircle" },
  ]

  const dashboard = new Dashboard({
    userId,
    hasStartedRegistration: true,
    registrationSteps: initialSteps,
    profileCompletion: {
      completionPercentage: 0,
    },
  })

  // Calculate initial progress
  dashboard.calculateOverallProgress()

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
      businessType: "Propatorship",
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
    user = newUser.toObject()
  }

  let dashboard = await Dashboard.findOne({ userId: user._id }).lean()

  if (!dashboard) {
    await createInitialDashboard(user._id, user.fullName)
    dashboard = await Dashboard.findOne({ userId: user._id }).lean()
  }

  const completedStepsCount = dashboard.registrationSteps.filter((step: any) => step.status === "completed").length
  const overallProgress =
    dashboard.registrationSteps.length > 0
      ? Math.round((completedStepsCount / dashboard.registrationSteps.length) * 100)
      : 0

  const profileCompletionPercentage = calculateProfileCompletionPercentage(user)

  const transformedRegistrationSteps = dashboard.registrationSteps.map((step: any) => ({
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
  }))

  const transformedNotifications = dashboard.notifications.map((notif: any) => ({
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
    },
    hasStartedRegistration: dashboard.hasStartedRegistration,
    profileCompletion: profileCompletionPercentage,
    registrationSteps: transformedRegistrationSteps,
    overallProgress: overallProgress,
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
    const uploadOptions = getCloudinaryUploadOptions(file, documentType, user._id.toString())

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

    if (stepId) {
      // This is a registration-specific document
      const dashboard = await Dashboard.findOne({ userId: user._id })
      if (!dashboard) return { success: false, message: "Dashboard not found" }

      const step = dashboard.registrationSteps.find((s) => s.id === stepId)
      if (!step) return { success: false, message: "Registration step not found" }

      // Find or create the document entry within the step
      const docEntry = step.documents.find((d) => d.name === documentType)
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
    } else {
      // This is a profile document
      switch (documentType) {
        case "aadharCard":
          user.aadharCardUrl = fileUrl
          break
        case "panCard":
          user.panCardUrl = fileUrl
          break
        case "photograph":
          user.photographUrl = fileUrl
          break
        case "proofOfAddress":
          user.proofOfAddressUrl = fileUrl
          break
        default:
          return { success: false, message: "Invalid profile document type" }
      }
      await user.save()
    }

    // Update dashboard completion percentage for profile documents
    const dashboard = await Dashboard.findOne({ userId: user._id })
    if (dashboard) {
      dashboard.profileCompletion.completionPercentage = calculateProfileCompletionPercentage(user)
      await dashboard.save()
    }

    return {
      success: true,
      fileUrl: fileUrl,
      completionPercentage: calculateProfileCompletionPercentage(user),
    }
  } catch (error: any) {
    console.error("File upload error:", error)
    return { success: false, message: `Upload failed: ${error.message}` }
  }
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

  const dashboard = await Dashboard.findOne({ userId: user._id })
  if (dashboard) {
    dashboard.profileCompletion.completionPercentage = calculateProfileCompletionPercentage(user)
    await dashboard.save()
  }

  return {
    success: true,
    completionPercentage: calculateProfileCompletionPercentage(user),
  }
}

// Update registration step status
export async function updateRegistrationStep(stepId: number, status: string) {
  await connectDB()

  const user = await User.findOne().sort({ createdAt: -1 })
  if (!user) return { success: false, message: "User not found" }

  const dashboard = await Dashboard.findOne({ userId: user._id })
  if (!dashboard) return { success: false, message: "Dashboard not found" }

  const step = dashboard.registrationSteps.find((s) => s.id === stepId)
  if (!step) return { success: false, message: "Step not found" }

  const oldStatus = step.status
  step.status = status

  if (status === "completed" && oldStatus !== "completed") {
    step.completedAt = new Date()
    dashboard.addNotification("Step Completed!", `${step.name} has been completed successfully.`, "success")
  }

  dashboard.calculateOverallProgress()
  await dashboard.save()

  return {
    success: true,
    overallProgress: dashboard.overallProgress,
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

    // Update dashboard completion percentage
    const dashboard = await Dashboard.findOne({ userId: user._id })
    if (dashboard) {
      dashboard.profileCompletion.completionPercentage = calculateProfileCompletionPercentage(user)

      // Add notification for email verification
      dashboard.addNotification("Email Verified!", `Your email ${email} has been successfully verified.`, "success")

      await dashboard.save()
    }

    return {
      success: true,
      message: "Email verified successfully!",
      completionPercentage: calculateProfileCompletionPercentage(user),
    }
  } catch (error: any) {
    console.error("Email verification error:", error)
    return { success: false, message: `Email verification failed: ${error.message}` }
  }
}
