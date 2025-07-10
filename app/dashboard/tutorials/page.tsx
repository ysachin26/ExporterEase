"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function VideoTutorialsPage() {
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
    {
      title: "Market Research",
      description: "Identifying target markets for your products",
      duration: "9 min watch",
      src: "/public1/haifam-video.mp4",
      poster: "/placeholder.svg?height=225&width=400",
      category: "Business Growth",
    },
    {
      title: "Export Finance",
      description: "Understanding payment terms and financing options",
      duration: "11 min watch",
      src: "/public1/haifam-video.mp4",
      poster: "/placeholder.svg?height=225&width=400",
      category: "Business Growth",
    },
    {
      title: "Customs Procedures",
      description: "Navigating customs clearance efficiently",
      duration: "6 min watch",
      src: "/public1/haifam-video.mp4",
      poster: "/placeholder.svg?height=225&width=400",
      category: "Operational Guides",
    },
  ]

  // Group videos by category
  const groupedVideos = videos.reduce(
    (acc, video) => {
      const category = video.category || "General Tutorials" // Default category if not specified
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(video)
      return acc
    },
    {} as Record<string, typeof videos>,
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Video Tutorials</h1>
          <p className="text-gray-600 mt-1">Explore our full library of guides to master the export process.</p>
        </div>
      </div>

      {Object.entries(groupedVideos).map(([category, videosInCategory]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videosInCategory.map((video, index) => (
              <Card
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <video className="w-full h-40 object-cover" poster={video.poster} controls>
                    <source src={video.src} type="video/mp4" />
                  </video>
                  {video.featured && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                  <span className="text-xs text-gray-500">{video.duration}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
