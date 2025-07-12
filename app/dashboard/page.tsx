"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock, AlertCircle, FileText, TrendingUp, Bell, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ProfileCompletionModal } from "@/components/profile-completion-modal"
import { getDashboardData, markNotificationAsRead } from "@/app/actions"
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

// Map string icon names to Lucide React components (kept for Quick Stats)
const iconMap: { [key: string]: LucideIcon } = {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  Bell,
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
  adCodeLetterFromBankUrl: string
  bankDocumentUrl: string
}

interface RegistrationStep {
  id: number
  name: string
  status: string
  icon: string
  completedAt?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
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

  // Carousel state
  const [api, setApi] = useState<CarouselApi>()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }
    api.on("select", () => {
      setCurrentVideoIndex(api.selectedScrollSnap())
    })
  }, [api])

  const videos = [
    {
      title: "Getting Started",
      description: "Introduction to export business basics",
      duration: "5 min watch",
      src: "/public1/haifam-video.mp4",
      poster: "/public1/modern-farming.png",
      category: "Beginner Guides",
    },
    {
      title: "Complete Registration Guide",
      description: "Step-by-step registration process walkthrough",
      duration: "12 min watch",
      src: "/public1/haifam-video.mp4",
      poster: "/public1/modern-farming.png",
      featured: true,
      category: "Registration Steps",
    },
    {
      title: "Document Preparation",
      description: "Required documents and how to prepare them",
      duration: "8 min watch",
      src: "/public1/haifam-video.mp4",
      poster: "/public1/modern-farming.png",
      category: "Registration Steps",
    },
    {
      title: "Understanding Regulations",
      description: "Key export regulations and compliance",
      duration: "10 min watch",
      src: "/public1/haifam-video.mp4",
      poster: "/placeholder.svg?height=225&width=400",
      category: "Advanced Topics",
    },
    {
      title: "Shipping & Logistics",
      description: "Navigating international shipping",
      duration: "7 min watch",
      src: "/public1/haifam-video.mp4",
      poster: "/placeholder.svg?height=225&width=400",
      category: "Advanced Topics",
    },
  ]

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await getDashboardData()
      setDashboardData(data)

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

  const handleNotificationClick = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    fetchDashboardData()
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
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome, {user.fullName}</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              {user.businessName} • Track your export registration progress and manage your documents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs md:text-sm">
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
            {/* Overall Registration Progress Bar */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Overall Registration Progress</CardTitle>
                    <CardDescription>Your journey to becoming an export-ready business</CardDescription>
                  </div>
                  <Link href="/dashboard/progress">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100"
                    >
                      Track Your Progress
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Video Tutorial Section */}
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  📚 Learn How to Become an Exporter
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Watch our step-by-step tutorials to understand the export registration process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Carousel setApi={setApi} className="w-full max-w-4xl mx-auto">
                  <CarouselContent className="-ml-4">
                    {videos.map((video, index) => (
                      <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <div
                          className={cn(
                            "bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out",
                            index === currentVideoIndex
                              ? "scale-105 opacity-100 shadow-md border-teal-200"
                              : "scale-95 opacity-70 blur-[0.5px]",
                          )}
                        >
                          <div className="relative">
                            <video
                              className="w-full h-40 object-cover"
                              poster={video.poster}
                              muted
                              controls={index === currentVideoIndex}
                            >
                              <source src={video.src} type="video/mp4" />
                            </video>
                            {index !== currentVideoIndex && (
                              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                  <div className="w-0 h-0 border-l-4 border-l-gray-700 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900 mb-1">{video.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                            <span className="text-xs text-gray-500">{video.duration}</span>
                            {video.featured && (
                              <Badge variant="secondary" className="ml-2 bg-teal-100 text-teal-700">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10" />
                  <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10" />
                </Carousel>

                <div className="mt-6 text-center">
                  <Link href="/dashboard/tutorials">
                    <Button
                      variant="outline"
                      className="text-gray-700 border-gray-300 hover:bg-gray-100 bg-transparent"
                    >
                      View All Video Tutorials
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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
