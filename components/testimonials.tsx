"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"
import Image from "next/image"

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Wheat Farmer",
      location: "Punjab",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "GoFarmlyConnect transformed my farming business completely. The document filing system saved me weeks of paperwork, and the market intelligence helped me get 25% better prices for my crops.",
    },
    {
      name: "Priya Sharma",
      role: "Organic Farmer",
      location: "Maharashtra",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "The crop management features are incredible. I can now predict yields accurately and plan my farming activities better. My productivity has increased by 40% since using GoFarmlyConnect.",
    },
    {
      name: "Mohammed Ali",
      role: "Cotton Farmer",
      location: "Gujarat",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "Getting loans was always a nightmare until I found GoFarmlyConnect. Now I can apply and get approved within hours. The financial services are a game-changer for small farmers like me.",
    },
    {
      name: "Sunita Devi",
      role: "Vegetable Farmer",
      location: "Uttar Pradesh",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "The mobile app is fantastic! I can manage everything from my phone - check weather, market prices, and even file documents. It's like having an agricultural expert in my pocket.",
    },
    {
      name: "Kiran Patel",
      role: "Dairy Farmer",
      location: "Rajasthan",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "Customer support is outstanding. Whenever I have questions, the team responds immediately with helpful solutions. They truly understand farming challenges.",
    },
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full animate-float blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full animate-float-delayed blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Success Stories
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-6 animate-fadeInUp">
            What Farmers Say About Us
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed animate-fadeInUp animation-delay-200">
            Join thousands of satisfied farmers who have transformed their agricultural operations with GoFarmlyConnect
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main Testimonial */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden animate-fadeInUp">
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="w-16 h-16 text-emerald-600" />
              </div>

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8 font-medium">
                  {testimonials[currentTestimonial].text}
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center space-x-4">
                  <Image
                    src={testimonials[currentTestimonial].image || "/placeholder.svg"}
                    alt={testimonials[currentTestimonial].name}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-emerald-100"
                  />
                  <div>
                    <div className="font-bold text-lg text-gray-800">{testimonials[currentTestimonial].name}</div>
                    <div className="text-emerald-600 font-medium">{testimonials[currentTestimonial].role}</div>
                    <div className="text-gray-500 text-sm">📍 {testimonials[currentTestimonial].location}</div>
                  </div>
                </div>
              </div>

              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 opacity-50"></div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 transform hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5 text-emerald-600" />
              </Button>

              {/* Dots */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? "bg-emerald-500 scale-125" : "bg-gray-300 hover:bg-emerald-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 transform hover:scale-110"
              >
                <ChevronRight className="w-5 h-5 text-emerald-600" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center group">
              <div className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                4.9/5
              </div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                50K+
              </div>
              <div className="text-gray-600 font-medium">Happy Farmers</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                98%
              </div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <div className="text-gray-600 font-medium">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
