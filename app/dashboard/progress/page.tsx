"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getDashboardData, updateRegistrationStep } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Globe,
  Key,
  Truck,
  Code,
  UserPlus,
  Bell,
  Mail,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"

// Map icon names to Lucide React components
const iconMap: { [key: string]: React.ElementType } = {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Globe,
  Key,
  Truck,
  Code,
  UserPlus,
  Bell,
  Mail,
  Upload,
}

interface RegistrationStep {
  id: number
  name: string
  status: "pending" | "in-progress" | "completed" | "rejected"
  icon: string
  completedAt?: string | null
}

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
}

interface DashboardData {
  user: {
    id: string
    fullName: string
    businessName: string
    businessType: string
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
  hasStartedRegistration: boolean
  profileCompletion: number
  registrationSteps: RegistrationStep[]
  overallProgress: number
  notifications: Notification[]
  unreadNotificationCount: number
  isProfileComplete: boolean
}

export default function ProgressPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData()
        if (data) {
          setDashboardData(data as DashboardData)
        } else {
          setError("Failed to fetch dashboard data.")
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("An error occurred while fetching data.")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const handleUpdateStepStatus = async (stepId: number, status: string) => {
    setLoading(true)
    try {
      const result = await updateRegistrationStep(stepId, status)
      if (result.success) {
        const updatedData = await getDashboardData() // Re-fetch to get latest state
        if (updatedData) {
          setDashboardData(updatedData as DashboardData)
        }
      } else {
        setError(result.message || "An unknown error occurred")
      }
    } catch (err: any) {
      setError(`Failed to update step: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <p>Loading progress...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(10vh-100px)]">
        <p>No dashboard data available.</p>
      </div>
    )
  }

  const { registrationSteps, overallProgress, notifications } = dashboardData

  const nextPendingStep = registrationSteps.find((step) => step.status === "pending" || step.status === "in-progress")

  // Define the mapping from step name to route
  const stepRoutes: { [key: string]: string } = {
    Registration: "/dashboard/profile", // Assuming registration is tied to profile completion
    "GST Registration": "/dashboard/registration/gst",
    "IEC Code": "/dashboard/registration/iec",
    "DSC Registration": "/dashboard/registration/dsc",
    "ICEGATE Registration": "/dashboard/registration/icegate",
    "AD Code": "/dashboard/registration/adcode",
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Registration Progress</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Complete all the steps below to become an export-ready business
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={overallProgress} className="flex-1" />
            <span className="text-lg font-semibold">{overallProgress}%</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="journey" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="journey">Registration Journey</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notifications">Notifications ({notifications.filter((n) => !n.read).length})</TabsTrigger>
          <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
        </TabsList>
        <TabsContent value="journey" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Registration Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {registrationSteps.map((step) => {
                  const IconComponent = iconMap[step.icon] || AlertCircle
                  const isCompleted = step.status === "completed"
                  const isInProgress = step.status === "in-progress"
                  const isPending = step.status === "pending"
                  const isRejected = step.status === "rejected"

                  return (
                    <div key={step.id}>
                      {isRejected ? (
                        <Link href={stepRoutes[step.name] || "#"}>
                          <div
                            className={cn(
                              "flex flex-col items-center p-4 rounded-lg border transition-all duration-200 cursor-pointer",
                              "border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-700"
                            )}
                          >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300">
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <p className="font-medium text-center">{step.name}</p>
                            <p className="text-sm text-red-600 dark:text-red-300">
                              Rejected - Click to re-upload
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <Link href={stepRoutes[step.name] || "#"}>
                          <div
                            className={cn(
                              "flex flex-col items-center p-4 rounded-lg border transition-all duration-200",
                              isCompleted && "border-green-500 bg-green-50",
                              isInProgress && "border-blue-500 bg-blue-50",
                              isPending && "border-gray-200 bg-gray-50 hover:border-gray-300",
                              "dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600",
                              isCompleted && "dark:bg-green-950 dark:border-green-700",
                              isInProgress && "dark:bg-blue-950 dark:border-blue-700",
                            )}
                          >
                            <div
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                                isCompleted && "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300",
                                isInProgress && "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300",
                                isPending && "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
                              )}
                            >
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <p className="font-medium text-center">{step.name}</p>
                            <p
                              className={cn(
                                "text-sm",
                                isCompleted && "text-green-600 dark:text-green-300",
                                isInProgress && "text-blue-600 dark:text-blue-300",
                                isPending && "text-gray-500 dark:text-gray-400",
                              )}
                            >
                              {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-8">
                {registrationSteps
                  .filter((step) => step.completedAt)
                  .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
                  .map((step, index) => (
                    <div key={step.id} className="mb-6 flex items-start">
                      <div className="absolute left-0 flex h-full flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        {index < registrationSteps.filter((s) => s.completedAt).length - 1 && (
                          <div className="h-full w-px bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold">{step.name} Completed</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {step.completedAt ? format(new Date(step.completedAt), "PPP") : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                {notifications.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="font-semibold mb-4">Notifications</h3>
                    {notifications
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((notification) => {
                        const NotificationIcon =
                          iconMap[
                            notification.type === "success"
                              ? "CheckCircle"
                              : notification.type === "error"
                                ? "AlertCircle"
                                : "Bell"
                          ] || Bell
                        return (
                          <div key={notification.id} className="mb-4 flex items-start">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              <NotificationIcon className="h-4 w-4" />
                            </div>
                            <div className="ml-4 flex-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {format(new Date(notification.createdAt), "PPP p")}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </>
                )}
                {registrationSteps.filter((step) => step.completedAt).length === 0 && notifications.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">No activity yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No notifications yet.</p>
              ) : (
                <div className="space-y-4">
                  {notifications
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((notification) => {
                      const NotificationIcon =
                        iconMap[
                          notification.type === "success"
                            ? "CheckCircle"
                            : notification.type === "error"
                              ? "AlertCircle"
                              : "Bell"
                        ] || Bell
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "flex items-start p-4 rounded-lg border",
                            !notification.read
                              ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-700"
                              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                          )}
                        >
                          <div className="mr-3">
                            <NotificationIcon
                              className={cn(
                                "h-5 w-5",
                                notification.type === "success" && "text-green-500",
                                notification.type === "warning" && "text-yellow-500",
                                notification.type === "error" && "text-red-500",
                                notification.type === "info" && "text-blue-500",
                              )}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{notification.title}</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {format(new Date(notification.createdAt), "PPP p")}
                            </p>
                          </div>
                          {/* Add a button to mark as read if needed */}
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="next-steps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              {nextPendingStep ? (
                <div className="space-y-4">
                  <p className="text-lg">
                    Your next step is: <span className="font-semibold">{nextPendingStep.name}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    To continue your registration journey, please proceed with the "{nextPendingStep.name}" process.
                  </p>
                  <Link href={stepRoutes[nextPendingStep.name] || "#"}>
                    <Button className="mt-4">Go to {nextPendingStep.name}</Button>
                  </Link>
                  {/* Example of manually marking a step as complete for testing */}
                  {/* <Button
                    onClick={() => handleUpdateStepStatus(nextPendingStep.id, "completed")}
                    className="mt-4 ml-2"
                    variant="outline"
                  >
                    Mark as Completed (Dev Only)
                  </Button> */}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">All steps completed!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Congratulations! You have completed all the necessary registration steps.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    You are now an export-ready business with GoFarmlyConnect.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
