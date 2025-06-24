"use client"

import { ArrowRight, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const registrations = [
  {
    id: "gst",
    title: "GST Registration",
    description: "Goods and Services Tax registration for businesses",
    status: "Not Started",
    required: true,
    href: "/dashboard/registration/gst",
  },
  {
    id: "iec",
    title: "IEC Registration",
    description: "Import Export Code for international trade",
    status: "Not Started",
    required: true,
    href: "/dashboard/registration/iec",
  },
  {
    id: "dsc",
    title: "DSC Registration",
    description: "Digital Signature Certificate for online transactions",
    status: "Not Started",
    required: true,
    href: "/dashboard/registration/dsc",
  },
  {
    id: "icegate",
    title: "ICE Gate Registration",
    description: "Indian Customs EDI Gateway for customs clearance",
    status: "Not Started",
    required: true,
    href: "/dashboard/registration/icegate",
  },
  {
    id: "adcode",
    title: "AD Code Registration",
    description: "Authorized Dealer Code for foreign exchange transactions",
    status: "Not Started",
    required: true,
    href: "/dashboard/registration/adcode",
  },
]

export default function Registration() {
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
        {registrations.map((registration) => (
          <Card key={registration.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{registration.title}</CardTitle>
                  <CardDescription className="mt-1">{registration.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  {registration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Not started yet</span>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                  <Link href={registration.href}>
                    Start Application
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
