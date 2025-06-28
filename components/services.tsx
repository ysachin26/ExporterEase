"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReceiptText, FileText, Fingerprint, Globe, Banknote, ArrowRight, CheckCircle } from "lucide-react"

export default function Services() {
  const [activeService, setActiveService] = useState(0)

  const services = [
    {
      icon: ReceiptText,
      title: "GST Filing",
      description: "Simplify your Goods and Services Tax (GST) compliance with easy online filing.",
      features: ["Automated GST Returns", "Input Tax Credit Management", "Reconciliation Tools", "Audit Support"],
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      icon: FileText,
      title: "IEC Registration",
      description: "Obtain your Import Export Code (IEC) quickly and hassle-free for international trade.",
      features: ["New IEC Application", "IEC Modification", "IEC Renewal", "Consultation Services"],
      color: "from-teal-500 to-emerald-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
    },
    {
      icon: Fingerprint,
      title: "DSC Procurement",
      description: "Secure your Digital Signature Certificate (DSC) for online document authentication.",
      features: ["Class 3 DSC", "Organization DSC", "Individual DSC", "Renewal Services"],
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      icon: Globe,
      title: "ICEGATE Services",
      description: "Seamlessly interact with ICEGATE for customs clearance and trade-related services.",
      features: ["Bill of Entry Filing", "Shipping Bill Processing", "Duty Payment", "Status Tracking"],
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      icon: Banknote,
      title: "AD Code Registration",
      description: "Register your Authorized Dealer (AD) Code for smooth export transactions.",
      features: ["AD Code Registration", "Bank Linkage", "Export Incentives", "Compliance Checks"],
      color: "from-purple-500 to-fuchsia-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      icon: FileText,
      title: "Other Document Filing",
      description: "Comprehensive support for various other import-export related document filings.",
      features: ["RCMC Application", "MEIS/SEIS Claims", "EPCG License", "Advance Authorization"],
      color: "from-orange-500 to-yellow-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-emerald-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-emerald-200/30 to-teal-200/30 rounded-full animate-float blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full animate-float-delayed blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Our Services
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-6 animate-fadeInUp">
            Comprehensive Import Export Solutions
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed animate-fadeInUp animation-delay-200">
            Everything you need to streamline your international trade operations and ensure compliance
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <div
                key={index}
                className={`group cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fadeInUp`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setActiveService(index)}
              >
                <div
                  className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-emerald-200 relative overflow-hidden ${activeService === index ? "ring-2 ring-emerald-400 ring-opacity-50" : ""}`}
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className={`w-8 h-8 ${service.textColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full bg-gradient-to-r ${service.color} hover:shadow-lg transform hover:scale-105 transition-all duration-300 group`}
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${service.color} opacity-10 blur-xl`}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Ready to Streamline Your Trade Operations?</h3>
              <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
                Join thousands of importers and exporters who have digitized their operations with GoFarmlyConnect
              </p>
              <Button className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300">
                Get Started Today
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
