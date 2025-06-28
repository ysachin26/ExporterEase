"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, AlertCircle, Clock, BarChart3, TrendingUp, Calendar, FileText } from "lucide-react"

// Helper component for progress card
const ProgressCard = ({ title, current, total, color = "primary" }: any) => {
  const percentage = Math.round((current / total) * 100)
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>
              {current} of {total} completed
            </span>
            <span className="text-primary font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

// Helper component for milestone cards
const MilestoneCard = ({ milestone }: any) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "FAILED":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500 text-white">Completed</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>
      case "FAILED":
        return <Badge className="bg-red-500 text-white">Failed</Badge>
      default:
        return <Badge className="bg-slate-400 text-white">Not Started</Badge>
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{milestone.title}</CardTitle>
          {getStatusBadge(milestone.status)}
        </div>
        <CardDescription>{milestone.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getStatusIcon(milestone.status)}
            <span className="text-sm text-slate-600">
              {milestone.status === "COMPLETED"
                ? `Completed on ${new Date(milestone.completedDate).toLocaleDateString()}`
                : milestone.status === "IN_PROGRESS"
                  ? "In progress"
                  : milestone.status === "FAILED"
                    ? "Failed"
                    : "Not started"}
            </span>
          </div>
          {milestone.nextAction && (
            <Button asChild variant="outline" className="text-primary">
              <Link href={milestone.actionUrl}>
                {milestone.nextAction}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProgressTracker() {
  const [view, setView] = useState("overview")

  // Mock data - replace with actual API calls
  const progress = {
    progressPercentage: 65,
    registrationSteps: [
      { name: "Profile Setup", status: "COMPLETED", isCompleted: true, isActive: false },
      { name: "Document Upload", status: "COMPLETED", isCompleted: true, isActive: false },
      { name: "GST Registration", status: "IN_PROGRESS", isCompleted: false, isActive: true },
      { name: "IEC Registration", status: "PENDING", isCompleted: false, isActive: false },
      { name: "Final Verification", status: "PENDING", isCompleted: false, isActive: false },
    ],
    nextStep: "Complete GST Registration",
  }

  const documents = [
    { id: 1, name: "PAN Card", status: "VERIFIED" },
    { id: 2, name: "Aadhaar Card", status: "VERIFIED" },
    { id: 3, name: "Bank Statement", status: "PENDING" },
    { id: 4, name: "Address Proof", status: "VERIFIED" },
    { id: 5, name: "Business Certificate", status: "PENDING" },
  ]

  const registrations = [
    {
      type: "GST",
      status: "IN_PROGRESS",
      applicationDate: "2024-01-15",
      completionDate: null,
    },
    {
      type: "IEC",
      status: "NOT_STARTED",
      applicationDate: null,
      completionDate: null,
    },
    {
      type: "AD_CODE",
      status: "NOT_STARTED",
      applicationDate: null,
      completionDate: null,
    },
  ]

  // Calculate stats from data
  const totalDocuments = documents.length
  const verifiedDocuments = documents.filter((doc) => doc.status === "VERIFIED").length

  const completedRegistrations = registrations.filter((reg) => reg.status === "COMPLETED").length
  const totalRegistrations = registrations.length

  // Prepare milestones for visualization
  const milestones = [
    {
      title: "GST Registration",
      description: "Register your business for Goods and Services Tax",
      status: registrations.find((r) => r.type === "GST")?.status || "NOT_STARTED",
      completedDate: registrations.find((r) => r.type === "GST")?.completionDate,
      nextAction: registrations.find((r) => r.type === "GST")?.status !== "COMPLETED" ? "Continue" : null,
      actionUrl: "/dashboard/registration/gst",
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "IEC Registration",
      description: "Obtain Import Export Code for international trade",
      status: registrations.find((r) => r.type === "IEC")?.status || "NOT_STARTED",
      completedDate: registrations.find((r) => r.type === "IEC")?.completionDate,
      nextAction: registrations.find((r) => r.type === "IEC")?.status !== "COMPLETED" ? "Continue" : null,
      actionUrl: "/dashboard/registration/iec",
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
    },
    {
      title: "AD Code Registration",
      description: "Register for Authorized Dealer Code for forex transactions",
      status: registrations.find((r) => r.type === "AD_CODE")?.status || "NOT_STARTED",
      completedDate: registrations.find((r) => r.type === "AD_CODE")?.completionDate,
      nextAction: registrations.find((r) => r.type === "AD_CODE")?.status !== "COMPLETED" ? "Continue" : null,
      actionUrl: "/dashboard/registration/adcode",
      icon: <Calendar className="h-8 w-8 text-purple-500" />,
    },
    {
      title: "Document Verification",
      description: "Upload and verify essential business documents",
      status: totalDocuments > 0 ? (verifiedDocuments === totalDocuments ? "COMPLETED" : "IN_PROGRESS") : "NOT_STARTED",
      completedDate: verifiedDocuments === totalDocuments ? new Date().toISOString() : null,
      nextAction: verifiedDocuments !== totalDocuments ? "Upload Documents" : null,
      actionUrl: "/dashboard/documents",
      icon: <FileText className="h-8 w-8 text-orange-500" />,
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-2">Progress Tracker</h1>
      <p className="text-gray-600 mb-6">Track and visualize your export business registration progress</p>

      <Tabs defaultValue={view} onValueChange={setView} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <ProgressCard
              title="Overall Registration Progress"
              current={progress.progressPercentage}
              total={100}
              color="primary"
            />
            <ProgressCard title="Documents Uploaded" current={verifiedDocuments} total={totalDocuments} color="blue" />
            <ProgressCard
              title="Registrations Completed"
              current={completedRegistrations}
              total={totalRegistrations}
              color="green"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registration Journey</CardTitle>
              <CardDescription>Your journey towards becoming export-ready</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                  {progress.registrationSteps.map((step: any, index: number) => (
                    <div key={index} className="relative pl-10 pb-6">
                      <div
                        className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center ${
                          step.isCompleted
                            ? "bg-green-100 text-green-600"
                            : step.isActive
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {step.isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium">{step.name}</h3>
                      <p className="text-gray-600 mt-1">
                        {step.status === "COMPLETED"
                          ? "Completed"
                          : step.status === "IN_PROGRESS"
                            ? "In Progress"
                            : "Pending"}
                      </p>
                    </div>
                  ))}
                </div>

                {progress.nextStep && progress.nextStep !== "All steps completed" && (
                  <div className="flex justify-end">
                    <Button className="bg-primary hover:bg-primary/90">
                      Continue Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {milestones.map((milestone, index) => (
              <MilestoneCard key={index} milestone={milestone} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration Timeline</CardTitle>
              <CardDescription>Chronological view of your registration progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* Timeline events */}
                <div className="space-y-8">
                  {/* Account Creation */}
                  <div className="relative pl-16">
                    <div className="absolute left-0 top-1 w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium">Account Created</h3>
                    <p className="text-gray-600 text-sm mt-1">Started your export journey with GoFarmlyConnect</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Document Uploads */}
                  {documents && documents.length > 0 && (
                    <div className="relative pl-16">
                      <div className="absolute left-0 top-1 w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Documents Uploaded</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Uploaded {documents.length} essential document{documents.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  {/* Registration Events */}
                  {registrations &&
                    registrations
                      .filter((reg: any) => reg.status !== "NOT_STARTED")
                      .map((reg: any, index: number) => (
                        <div key={index} className="relative pl-16">
                          <div
                            className={`absolute left-0 top-1 w-14 h-14 rounded-full flex items-center justify-center ${
                              reg.status === "COMPLETED"
                                ? "bg-green-100 text-green-600"
                                : reg.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {reg.status === "COMPLETED" ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : reg.status === "IN_PROGRESS" ? (
                              <Clock className="h-6 w-6" />
                            ) : (
                              <AlertCircle className="h-6 w-6" />
                            )}
                          </div>
                          <h3 className="text-lg font-medium">
                            {reg.type === "GST"
                              ? "GST Registration"
                              : reg.type === "IEC"
                                ? "IEC Registration"
                                : reg.type === "AD_CODE"
                                  ? "AD Code Registration"
                                  : reg.type}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {reg.status === "COMPLETED"
                              ? "Successfully completed registration"
                              : reg.status === "IN_PROGRESS"
                                ? "Registration in progress"
                                : "Registration attempt failed"}
                          </p>
                          <p className="text-gray-400 text-xs mt-2">
                            {reg.applicationDate
                              ? new Date(reg.applicationDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : new Date().toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                          </p>
                        </div>
                      ))}

                  {/* Next Step */}
                  {progress && progress.nextStep && progress.nextStep !== "All steps completed" && (
                    <div className="relative pl-16 opacity-50">
                      <div className="absolute left-0 top-1 w-14 h-14 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                        <ArrowRight className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Next: {progress.nextStep}</h3>
                      <p className="text-gray-600 text-sm mt-1">Your next step in the export registration journey</p>
                      <p className="text-gray-400 text-xs mt-2">Upcoming</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
