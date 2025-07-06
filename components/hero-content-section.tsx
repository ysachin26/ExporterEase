import { Button } from "@/components/ui/button"
import { ArrowRight, Play, TrendingUp } from "lucide-react"
import Image from "next/image"

export default function HeroContentSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Animated Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-full animate-float blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-teal-100/20 to-emerald-100/20 rounded-full animate-float-delayed blur-xl"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-10 flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-8 animate-fadeInLeft">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-400/30">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 text-sm font-medium">Revolutionizing Agriculture</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-800 leading-tight">
                 Simplify Your{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                  Import Export
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Complete digital platform for import-export documentation, customs clearance, and trade compliance. Process your shipments 70% faster with our automated filing system.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl group">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>

              <Button
                variant="outline"
                className="border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-400 hover:text-emerald-900 px-8 py-4 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">50K+</div>
                <div className="text-gray-600 text-sm">Active Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">₹500Cr+</div>
                <div className="text-gray-600 text-sm">Trade Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">99.9%</div>
                <div className="text-gray-600 text-sm">Uptime</div>
              </div>
            </div>
          </div>

          <div className="relative animate-fadeInRight">
            <div className="relative">
              <Image
                src="/modern-farming.png"
                alt="Digital farming dashboard"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
