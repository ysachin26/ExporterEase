"use client"

import { CheckCircle, Zap, Shield, Users, TrendingUp, Clock } from "lucide-react"
import Image from "next/image"

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Processing",
      description: "Process documents and applications in minutes, not hours or days",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Your data is protected with enterprise-level encryption",
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "24/7 customer support from agricultural experts",
    },
    {
      icon: TrendingUp,
      title: "Proven Results",
      description: "Average 40% increase in productivity for our users",
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce paperwork time by up to 80% with automation",
    },
    {
      icon: CheckCircle,
      title: "100% Compliance",
      description: "Stay compliant with all regulatory requirements",
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full animate-float blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-teal-400/10 to-emerald-400/10 rounded-full animate-float-delayed blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fadeInLeft">
            <div className="inline-block mb-4">
              <span className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium border border-emerald-400/30">
                Why Choose GoFarmlyConnect
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Built for Modern{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Farmers
              </span>
            </h2>

            <p className="text-emerald-100 text-lg leading-relaxed mb-8">
              We understand the unique challenges farmers face. That's why we've built a platform that combines
              cutting-edge technology with deep agricultural expertise.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div
                    key={index}
                    className="flex items-start space-x-4 group animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-emerald-200 text-sm">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-fadeInRight">
            <div className="relative">
              <Image
                src="/images/digital-agriculture.png"
                alt="Digital agriculture technology"
                width={500}
                height={400}
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent rounded-2xl"></div>

              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl animate-float">
                <div className="text-2xl font-bold text-emerald-600">99.9%</div>
                <div className="text-gray-600 text-sm">Uptime</div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl animate-float-delayed">
                <div className="text-2xl font-bold text-emerald-600">50K+</div>
                <div className="text-gray-600 text-sm">Happy Farmers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
