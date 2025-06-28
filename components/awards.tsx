"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

export default function Awards() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const awards = [
    {
      title: "Digital India Award 2022",
      image: "/placeholder.svg?height=120&width=120",
      year: "2022",
    },
    {
      title: "TIOL 2022 Awards",
      image: "/placeholder.svg?height=120&width=120",
      year: "2022",
    },
    {
      title: "Postage Stamp",
      image: "/placeholder.svg?height=120&width=120",
      year: "2021",
      featured: true,
    },
    {
      title: "Skoch Digital Inclusion Awards",
      image: "/placeholder.svg?height=120&width=120",
      year: "2011",
    },
    {
      title: "Excellence in Government",
      image: "/placeholder.svg?height=120&width=120",
      year: "2020",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, awards.length - 3))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, awards.length - 3)) % Math.max(1, awards.length - 3))
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">Awards & Recognitions</h2>
          <Button variant="outline" className="text-orange-500 border-orange-500 hover:bg-orange-50">
            View All
          </Button>
        </div>

        <div className="relative">
          <div className="flex items-center justify-center space-x-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full border-slate-300 hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl">
              {awards.slice(currentSlide, currentSlide + 4).map((award, index) => (
                <div
                  key={index}
                  className={`group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 text-center border ${
                    award.featured ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-100"
                  }`}
                >
                  <div className="mb-4">
                    <Image
                      src={award.image || "/placeholder.svg"}
                      alt={award.title}
                      width={120}
                      height={120}
                      className="mx-auto group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                    {award.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{award.year}</p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full border-slate-300 hover:bg-slate-100"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
