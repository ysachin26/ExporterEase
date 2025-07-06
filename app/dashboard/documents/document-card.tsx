"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink, CheckCircle, Clock, AlertCircle, Copy } from "lucide-react"
import Link from "next/link"
import DocumentPreview from "./document-preview"
import { useToast } from "@/hooks/use-toast"

interface DocumentCardProps {
  title: string
  registrationNumber: string
  certificateUrl: string
  status: "verified" | "pending" | "uploaded" | "rejected"
  type: "gst" | "iec" | "dsc" | "icegate" | "adcode"
}

export default function DocumentCard({ title, registrationNumber, certificateUrl, status, type }: DocumentCardProps) {
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200"
      case "uploaded":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />
      case "uploaded":
        return <Clock className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "rejected":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const handleCopyRegistrationNumber = async () => {
    try {
      await navigator.clipboard.writeText(registrationNumber)
      toast({
        title: "Success",
        description: "Registration number copied to clipboard!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy registration number",
        variant: "destructive",
      })
    }
  }

  const hasDocument = certificateUrl && certificateUrl.trim() !== ""
  const hasRegistrationNumber = registrationNumber && registrationNumber.trim() !== ""

  // Only show card if there's a document or registration number
  if (!hasDocument && !hasRegistrationNumber) {
    return null
  }

  return (
    <Card className="relative hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Status Badge - positioned absolute in top right */}
      <div className="absolute top-2 right-2 z-10">
        <Badge className={`${getStatusColor(status)} flex items-center gap-1 border text-xs`}>
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      <CardContent className="p-4 text-center space-y-3">
        {/* 1. Document Preview Photo - Top */}
        {hasDocument ? (
          <DocumentPreview url={certificateUrl} title={title} />
        ) : (
          <div className="relative aspect-[4/3] w-full max-w-[180px] mx-auto">
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">No Document</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 2. Document Name - Below photo */}
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
        </div>
        
        {/* 3. Registration Number - Below name */}
        {hasRegistrationNumber ? (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Registration Number</p>
            <div className="bg-gray-50 px-3 py-2 rounded-md border">
              <p className="text-sm text-gray-900 font-mono font-semibold break-all">
                {registrationNumber}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-gray-500">No Registration Number</p>
          </div>
        )}
        
        {/* 4. Download Button - Bottom */}
        <div className="pt-2">
          {hasDocument ? (
            <Link 
              href={certificateUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Download Document
            </Link>
          ) : (
            <button 
              disabled
              className="w-full inline-flex items-center justify-center gap-2 bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              No Document Available
            </button>
          )}
          
          {/* Copy button for registration number */}
          {hasRegistrationNumber && (
            <button 
              onClick={handleCopyRegistrationNumber}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
              title="Copy registration number"
            >
              <Copy className="w-3 h-3" />
              Copy Number
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
