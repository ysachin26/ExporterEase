"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock, AlertCircle, FileText, TrendingUp, Bell, type LucideIcon, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ProfileCompletionModal } from "@/components/profile-completion-modal"
import { getDashboardData, markNotificationAsRead, updateRegistrationStep } from "@/app/actions"
import Link from "next/link"

// Map string icon names to Lucide React components
const iconMap: { [key: string]: LucideIcon } = {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  XCircle, // Add XCircle for rejected status
}

interface UserData {
  id: string
  fullName: string
  businessName: string
  businessType: "Proprietorship" | "Partnership" | "LLP" | "PVT LTD" | "Other"
  mobileNo: string
  email: string
  emailVerified: boolean
  aadharCardUrl: string
  panCardUrl: string
  photographUrl: string
  proofOfAddressUrl: string
  authorizationLetterUrl: string
  partnershipDeedUrl: string
  llpAgreementUrl: string
  certificateOfIncorporationUrl: string
  moaAoaUrl: string
  cancelledChequeUrl: string
  iecCertificate: string
  dscCertificate: string
  gstCertificate: string
  rentAgreementUrl: string
  electricityBillUrl: string
  nocUrl: string
  propertyProofUrl: string
  electricityBillOwnedUrl: string
  otherProofUrl: string
  adCodeLetterFromBankUrl: string
  bankDocumentUrl: string
}

interface RegistrationStep {
  id: number
  name: string
  status: string
  icon: string
  completedAt?: string // Changed to string for ISO date
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string // Changed to string for ISO date
}

interface DashboardData {
  user: UserData
  hasStartedRegistration: boolean
  profileCompletion: number
  registrationSteps: RegistrationStep[]
  overallProgress: number
  notifications: Notification[]
  isProfileComplete: boolean
}

export default function Dashboard() {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMounted, setHasMounted] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await getDashboardData()
      setDashboardData(data)

      // Show profile completion modal on first load if profile is incomplete
      if (data && data.profileCompletion < 100 && hasMounted) {
        const hasShownModal = localStorage.getItem("profileModalShown")
        if (!hasShownModal) {
          setShowProfileModal(true)
          localStorage.setItem("profileModalShown", "true")
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setHasMounted(true)
    fetchDashboardData()
  }, [])

  const getRegistrationPagePath = (stepId: number) => {
    switch (stepId) {
      case 2:
        return "/dashboard/registration/gst"
      case 3:
        return "/dashboard/registration/iec"
      case 4:
        return "/dashboard/registration/dsc"
      case 5:
        return "/dashboard/registration/icegate"
      case 6:
        return "/dashboard/registration/adcode"
      default:
        return "/dashboard/registration" // Fallback or general registration page
    }
  }

  const handleStepAction = async (stepId: number, currentStatus: string) => {
    if (currentStatus === "pending") {
      await updateRegistrationStep(stepId, "in-progress")
      fetchDashboardData() // Refresh data
    }
    // For rejected status, we will redirect to the specific registration page
    // The Link component below handles this directly.
  }

  const handleNotificationClick = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    fetchDashboardData() // Refresh data
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-600 border-green-200"
      case "in-progress":
        return "bg-teal-100 text-teal-600 border-teal-200"
      case "rejected": // New color for rejected status
        return "bg-red-100 text-red-600 border-red-200"
      default:
        return "bg-gray-100 text-gray-400 border-gray-200"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-teal-50 border-teal-200"
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchDashboardData}>Try Again</Button>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6 text-gray-600 text-center">
        <p>No dashboard data available.</p>
      </div>
    )
  }

  const {
    user,
    hasStartedRegistration,
    profileCompletion,
    registrationSteps,
    overallProgress,
    notifications,
    isProfileComplete,
  } = dashboardData

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.fullName}</h1>
            <p className="text-gray-600 mt-1">
              {user.businessName} • Track your export registration progress and manage your documents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {user.mobileNo}
            </Badge>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {!isProfileComplete && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h3 className="font-medium text-yellow-900">Complete Your Profile</h3>
                    <p className="text-sm text-yellow-700">
                      Complete your profile to unlock all features ({profileCompletion}% done)
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowProfileModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Complete Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile</p>
                  <p className="text-2xl font-bold text-gray-900">{profileCompletion}%</p>
                </div>
                <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Steps</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {registrationSteps.filter((s) => s.status === "completed").length}/{registrationSteps.length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications.filter((n) => !n.read).length}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Bell className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!hasStartedRegistration ? (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started with GoFarmlyConnect</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Begin your export registration journey. Complete all required registrations to become export-ready.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Your Registration Process
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Registration Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Progress</CardTitle>
                <CardDescription>Complete all the steps below to become an export-ready business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
                  {registrationSteps.map((step) => {
                    const Icon = iconMap[step.icon] || AlertCircle
                    const isRejected = step.status === "rejected"
                    const isCompleted = step.status === "completed"
                    const isPending = step.status === "pending"

                    return (
                      <div key={step.id} className="text-center">
                        <Link href={getRegistrationPagePath(step.id)}>
                          <button
                            onClick={() => handleStepAction(step.id, step.status)}
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${getStatusColor(step.status)} hover:opacity-80`}
                          >
                            <Icon className="h-6 w-6" />
                          </button>
                        </Link>
                        <div className="text-xs font-medium text-gray-900">{step.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{step.status.replace("-", " ")}</div>
                        {step.completedAt && isCompleted && (
                          <div className="text-xs text-green-600 mt-1">
                            {new Date(step.completedAt).toLocaleDateString()}
                          </div>
                        )}
                        {isRejected && (
                          <Link href={getRegistrationPagePath(step.id)}>
                            <Button variant="link" size="sm" className="text-red-600 text-xs h-auto p-0 mt-1">
                              Review & Re-upload
                            </Button>
                          </Link>
                        )}
                        {isPending && (
                          <Link href={getRegistrationPagePath(step.id)}>
                            <Button variant="link" size="sm" className="text-teal-600 text-xs h-auto p-0 mt-1">
                              Start / Continue
                            </Button>
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Completion Status */}
              {overallProgress === 100 ? (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900">All Steps Completed!</h3>
                        <p className="text-sm text-green-700">
                          Congratulations! You've completed all the export registration steps.
                        </p>
                      </div>
                    </div>
                    <Button className="mt-4 bg-green-600 hover:bg-green-700">View Your Certificates</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-teal-200 bg-teal-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-teal-600" />
                      <div>
                        <h3 className="font-semibold text-teal-900">Registration In Progress</h3>
                        <p className="text-sm text-teal-700">
                          {registrationSteps.filter((s) => s.status === "pending").length} steps remaining to complete
                          your export registration.
                        </p>
                      </div>
                    </div>
                    <Button className="mt-4 bg-teal-600 hover:bg-teal-700">Continue Registration</Button>
                  </CardContent>
                </Card>
              )}

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Notifications
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {notifications.filter((n) => !n.read).length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${getNotificationColor(notification.type)} ${notification.read ? "opacity-60" : ""}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${notification.read ? "bg-gray-400" : "bg-teal-500"}`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No notifications yet</p>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <Button variant="link" className="mt-3 p-0 h-auto text-teal-600">
                      View all notifications
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdate={fetchDashboardData}
      />
    </>
  )
}
