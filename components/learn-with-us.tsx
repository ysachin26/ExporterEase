"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Clock, Users } from "lucide-react"
import Image from "next/image"

export default function LearnWithUs() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const tutorials = [
    {
      title: "Farm Registration & Setup",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "5:30",
      views: "12.5K",
      category: "Getting Started",
    },
    {
      title: "Crop Management System",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "8:45",
      views: "8.2K",
      category: "Management",
    },
    {
      title: "Market Price Analytics",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "6:20",
      views: "15.1K",
      category: "Analytics",
    },
    {
      title: "Digital Payment Solutions",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "4:15",
      views: "9.8K",
      category: "Finance",
    },
    {
      title: "Supply Chain Tracking",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "7:30",
      views: "11.3K",
      category: "Logistics",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, tutorials.length - 2))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, tutorials.length - 2)) % Math.max(1, tutorials.length - 2))
  }

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-emerald-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full opacity-20 animate-float blur-xl"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20 animate-float-delayed blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full opacity-15 animate-pulse blur-lg"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          {/* Tag moved to top */}
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Learning Resources
            </span>
          </div>
          <div className="inline-block">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 bg-clip-text text-transparent mb-8 animate-fadeInUp hover:scale-105 transition-transform duration-500">
              Learn With GoFarmlyConnect
            </h2>
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transform scale-x-0 animate-scaleX animation-delay-500"></div>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed animate-fadeInUp animation-delay-300 hover:text-gray-800 transition-colors duration-300 mt-6">
            Master modern agricultural techniques and digital farming solutions with our comprehensive video tutorials
            and expert guidance
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center justify-center space-x-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 transform hover:scale-110 hover:shadow-xl bg-white/80 backdrop-blur-sm group"
            >
              <ChevronLeft className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
              {tutorials.slice(currentSlide, currentSlide + 3).map((tutorial, index) => (
                <div
                  key={index}
                  className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:scale-105 hover:-translate-y-2 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={tutorial.thumbnail || "/placeholder.svg"}
                      alt={tutorial.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-emerald-500 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl hover:bg-emerald-600">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {tutorial.category}
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{tutorial.duration}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors duration-300 mb-3 line-clamp-2">
                      {tutorial.title}
                    </h3>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{tutorial.views} views</span>
                      </div>
                      <div className="text-emerald-500 font-medium group-hover:text-emerald-600 transition-colors duration-300">
                        Watch Now →
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-xl"></div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 transform hover:scale-110 hover:shadow-xl bg-white/80 backdrop-blur-sm group"
            >
              <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
            </Button>
          </div>

          <div className="flex justify-center mt-12">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group">
              <span className="mr-2">View All Tutorials</span>
              <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
