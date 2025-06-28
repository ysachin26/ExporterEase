"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

export default function FAQ() {
  const [openFAQ, setOpenFAQ] = useState(0)

  const faqs = [
    {
      question: "How do I register my farm on GoFarmlyConnect?",
      answer:
        "Registration is simple and free. Click on 'Get Started', fill in your basic farm details, upload required documents, and verify your mobile number. Our team will review and activate your account within 24 hours.",
    },
    {
      question: "What documents can I file through the platform?",
      answer:
        "You can file all major agricultural documents including crop insurance applications, subsidy forms, loan applications, land records, soil health cards, and compliance certificates. Our system supports over 50+ document types.",
    },
    {
      question: "Is my data secure on GoFarmlyConnect?",
      answer:
        "Absolutely. We use bank-grade encryption and follow strict data protection protocols. Your information is stored securely and never shared with third parties without your consent. We're also compliant with all government data protection regulations.",
    },
    {
      question: "How accurate are the crop yield predictions?",
      answer:
        "Our AI-powered predictions have an accuracy rate of 85-90%. We use satellite imagery, weather data, soil conditions, and historical patterns to provide reliable forecasts. However, predictions should be used as guidance alongside your farming expertise.",
    },
    {
      question: "Can I access GoFarmlyConnect offline?",
      answer:
        "Yes, our mobile app has offline capabilities. You can view your data, fill forms, and access tutorials without internet. Once you're back online, all changes sync automatically to the cloud.",
    },
    {
      question: "What are the costs involved?",
      answer:
        "Basic features are completely free for all farmers. Premium features like advanced analytics, priority support, and additional storage are available through affordable subscription plans starting at ₹99/month.",
    },
    {
      question: "How do I get technical support?",
      answer:
        "We offer 24/7 support through multiple channels - phone (1800-3010-1000), email, live chat, and WhatsApp. Our agricultural experts are always ready to help you with any technical or farming-related queries.",
    },
    {
      question: "Can I integrate GoFarmlyConnect with other farming tools?",
      answer:
        "Yes, GoFarmlyConnect integrates with popular farming equipment, weather stations, and financial services. We have APIs available for custom integrations and partnerships with major agricultural technology providers.",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full animate-float blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-teal-200/20 to-emerald-200/20 rounded-full animate-float-delayed blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Got Questions?
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent mb-6 animate-fadeInUp">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed animate-fadeInUp animation-delay-200">
            Find answers to common questions about GoFarmlyConnect's features, pricing, and how to get started
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 group"
                  onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800 group-hover:text-emerald-600 transition-colors duration-200">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                      openFAQ === index ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>

                <div
                  className={`${
                    openFAQ === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  } overflow-hidden transition-all duration-300`}
                >
                  <div className="px-8 pb-6">
                    <div className="pl-14">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
                  Can't find the answer you're looking for? Our support team is here to help you 24/7
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-emerald-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300">
                    Contact Support
                  </button>
                  <button className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300">
                    Schedule a Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
