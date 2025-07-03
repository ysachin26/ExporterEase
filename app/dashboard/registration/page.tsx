"use client"

import { ArrowRight, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getDashboardData } from "@/app/actions"

interface RegistrationStep {
  id: number
  name: string
  status: string
  icon: string
  completedAt: string | null
  documents: Array<{
    name: string
    uploadedAt: string | null
    status: string
    url: string
  }>
  details: Record<string, any>
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
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    read: boolean
    createdAt: string
  }>
  unreadNotificationCount: number
  isProfileComplete: boolean
}

const registrations = [
  {
    id: "gst",
    stepId: 2,
    title: "GST Registration",
    description: "Goods and Services Tax registration for businesses",
    required: true,
    href: "/dashboard/registration/gst",
  },
  {
    id: "iec",
    stepId: 3,
    title: "IEC Registration",
    description: "Import Export Code for international trade",
    required: true,
    href: "/dashboard/registration/iec",
  },
  {
    id: "dsc",
    stepId: 4,
    title: "DSC Registration",
    description: "Digital Signature Certificate for online transactions",
    required: true,
    href: "/dashboard/registration/dsc",
  },
  {
    id: "icegate",
    stepId: 5,
    title: "ICE Gate Registration",
    description: "Indian Customs EDI Gateway for customs clearance",
    required: true,
    href: "/dashboard/registration/icegate",
  },
  {
    id: "adcode",
    stepId: 6,
    title: "AD Code Registration",
    description: "Authorized Dealer Code for foreign exchange transactions",
    required: true,
    href: "/dashboard/registration/adcode",
  },
]

export default function Registration() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const getRegistrationStatus = (stepId: number) => {
    const step = dashboardData?.registrationSteps?.find((s) => s.id === stepId)
    let status = "Not Started"
    let statusText = "Not started yet"
    let badgeVariant: "default" | "secondary" | "destructive" | "outline" | null | undefined = "secondary"
    let badgeColorClass = "bg-gray-100 text-gray-600"

    if (step) {
      switch (step.status) {
        case "in-progress": // Fixed: using hyphen instead of underscore
          status = "In Progress"
          statusText = "Application in progress"
          badgeVariant = "default"
          badgeColorClass = "bg-blue-100 text-blue-700"
          break
        case "completed":
          status = "Completed"
          statusText = "Application completed"
          badgeVariant = "default"
          badgeColorClass = "bg-green-100 text-green-700"
          break
        case "pending":
          status = "Pending Review"
          statusText = "Awaiting document verification"
          badgeVariant = "default"
          badgeColorClass = "bg-yellow-100 text-yellow-700"
          break
        case "rejected":
          status = "Rejected"
          statusText = "Application rejected"
          badgeVariant = "destructive"
          badgeColorClass = "bg-red-100 text-red-700"
          break
        case "pending":
        default:
          status = "Not Started"
          statusText = "Not started yet"
          badgeVariant = "secondary"
          badgeColorClass = "bg-gray-100 text-gray-600"
          break
      }
    }
    return { status, statusText, badgeVariant, badgeColorClass }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registration Applications</h1>
            <p className="text-gray-600 mt-1">Manage and track all your export-related registration applications</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registration Applications</h1>
          <p className="text-gray-600 mt-1">Manage and track all your export-related registration applications</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Required Registrations to Become an Exporter</h3>
              <p className="text-blue-700 text-sm mt-1">
                Complete all 5 registrations below to become export-ready. Start with any registration that suits your
                business needs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {registrations.map((registration) => {
          const { status, statusText, badgeVariant, badgeColorClass } = getRegistrationStatus(registration.stepId)
          return (
            <Card key={registration.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{registration.title}</CardTitle>
                    <CardDescription className="mt-1">{registration.description}</CardDescription>
                  </div>
                  <Badge variant={badgeVariant} className={badgeColorClass}>
                    {status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{statusText}</span>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent" asChild>
                    <Link href={registration.href}>
                      {status === "Completed"
                        ? "View Application"
                        : status === "In Progress"
                          ? "View Application"
                          : "Start Application"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
