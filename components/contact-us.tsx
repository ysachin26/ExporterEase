import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"

export default function ContactUs() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-800 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-400/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-teal-400/10 rounded-full animate-float-delayed"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium border border-emerald-400/30">
              Get In Touch
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeInUp">Contact Us</h2>
          <p className="text-emerald-100 max-w-3xl mx-auto text-lg leading-relaxed animate-fadeInUp animation-delay-200">
            Ready to transform your farming operations? Get in touch with our agricultural experts for personalized
            guidance
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-8 animate-fadeInLeft">
            <div>
              <h3 className="text-2xl font-bold mb-8 text-emerald-300">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group">
                  <div className="bg-emerald-500/20 p-4 rounded-2xl group-hover:bg-emerald-500/30 transition-all duration-300 transform group-hover:scale-110 border border-emerald-400/30">
                    <Phone className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-emerald-300">24x7 Helpdesk</p>
                    <p className="text-emerald-100">1800-3010-1000 (Toll Free)</p>
                    <p className="text-emerald-200 text-sm">Available round the clock</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="bg-emerald-500/20 p-4 rounded-2xl group-hover:bg-emerald-500/30 transition-all duration-300 transform group-hover:scale-110 border border-emerald-400/30">
                    <Mail className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-emerald-300">Email Support</p>
                    <p className="text-emerald-100">help@gofarmlyconnect.com</p>
                    <p className="text-emerald-200 text-sm">Response within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="bg-emerald-500/20 p-4 rounded-2xl group-hover:bg-emerald-500/30 transition-all duration-300 transform group-hover:scale-110 border border-emerald-400/30">
                    <MessageCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-emerald-300">WhatsApp Support</p>
                    <p className="text-emerald-100">+91 98765 43210</p>
                    <p className="text-emerald-200 text-sm">Quick assistance via chat</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="bg-emerald-500/20 p-4 rounded-2xl group-hover:bg-emerald-500/30 transition-all duration-300 transform group-hover:scale-110 border border-emerald-400/30">
                    <MapPin className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-emerald-300">Head Office</p>
                    <p className="text-emerald-100">
                      GoFarmlyConnect Technologies Pvt Ltd
                      <br />
                      Agricultural Innovation Hub
                      <br />
                      Sector 62, Noida - 201309
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="bg-emerald-500/20 p-4 rounded-2xl group-hover:bg-emerald-500/30 transition-all duration-300 transform group-hover:scale-110 border border-emerald-400/30">
                    <Clock className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-emerald-300">Support Hours</p>
                    <p className="text-emerald-100">24/7 Available</p>
                    <p className="text-emerald-200 text-sm">Always here when you need us</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20 shadow-2xl animate-fadeInRight">
            <h3 className="text-2xl font-bold mb-8 text-emerald-300">Send us a Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-emerald-300 text-sm font-medium mb-2">First Name</label>
                  <Input
                    placeholder="Enter your first name"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-emerald-400 transition-all duration-300 hover:shadow-lg rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-emerald-300 text-sm font-medium mb-2">Last Name</label>
                  <Input
                    placeholder="Enter your last name"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-emerald-400 transition-all duration-300 hover:shadow-lg rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-emerald-300 text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-emerald-400 transition-all duration-300 hover:shadow-lg rounded-xl"
                />
              </div>

              <div>
                <label className="block text-emerald-300 text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-emerald-400 transition-all duration-300 hover:shadow-lg rounded-xl"
                />
              </div>

              <div>
                <label className="block text-emerald-300 text-sm font-medium mb-2">Subject</label>
                <Input
                  placeholder="What can we help you with?"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-emerald-400 transition-all duration-300 hover:shadow-lg rounded-xl"
                />
              </div>

              <div>
                <label className="block text-emerald-300 text-sm font-medium mb-2">Message</label>
                <Textarea
                  placeholder="Tell us more about your requirements..."
                  rows={5}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-emerald-400 transition-all duration-300 hover:shadow-lg resize-none rounded-xl"
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
