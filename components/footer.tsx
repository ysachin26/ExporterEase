import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, FileText, Shield, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-400/5 rounded-full animate-float"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-teal-400/5 rounded-full animate-float-delayed"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div className="md:col-span-1 animate-fadeInUp">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌾</span>
              </div>
              <div className="text-3xl font-bold text-emerald-400 transform hover:scale-105 transition-transform duration-300">
                GoFarmlyConnect
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Empowering farmers with cutting-edge digital solutions for modern agriculture. Join the farming revolution
              today.
            </p>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Serving farmers across India</span>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4 animate-fadeInUp animation-delay-200">
            <h3 className="font-bold text-emerald-400 text-lg mb-6">Legal</h3>
            <Link
              href="#"
              className="flex items-center space-x-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 p-3 rounded-xl group transform hover:scale-105 hover:shadow-lg"
            >
              <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">Terms & Conditions</span>
            </Link>
            <Link
              href="#"
              className="flex items-center space-x-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 p-3 rounded-xl group transform hover:scale-105 hover:shadow-lg"
            >
              <Shield className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">Privacy Policy</span>
            </Link>
          </div>

          {/* Contact Us */}
          <div className="space-y-4 animate-fadeInUp animation-delay-400">
            <h3 className="font-bold text-emerald-400 text-lg mb-6">Contact Us</h3>
            <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 p-3 rounded-xl hover:bg-white/5 group transform hover:scale-105">
              <Phone className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              <span>1800-3010-1000</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 p-3 rounded-xl hover:bg-white/5 group transform hover:scale-105">
              <Mail className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              <span>help@gofarmlyconnect.com</span>
            </div>
          </div>

          {/* Follow Us */}
          <div className="space-y-4 animate-fadeInUp animation-delay-600">
            <h3 className="font-bold text-emerald-400 text-lg mb-6">Follow Us</h3>
            <div className="flex flex-col space-y-3">
              <Link
                href="#"
                className="flex items-center space-x-3 text-gray-400 hover:text-blue-400 transition-all duration-300 p-3 rounded-xl hover:bg-white/5 group transform hover:scale-105 hover:shadow-lg"
              >
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">Facebook</span>
              </Link>
              <Link
                href="#"
                className="flex items-center space-x-3 text-gray-400 hover:text-blue-400 transition-all duration-300 p-3 rounded-xl hover:bg-white/5 group transform hover:scale-105 hover:shadow-lg"
              >
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">Twitter</span>
              </Link>
              <Link
                href="#"
                className="flex items-center space-x-3 text-gray-400 hover:text-pink-400 transition-all duration-300 p-3 rounded-xl hover:bg-white/5 group transform hover:scale-105 hover:shadow-lg"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">Instagram</span>
              </Link>
              <Link
                href="#"
                className="flex items-center space-x-3 text-gray-400 hover:text-blue-600 transition-all duration-300 p-3 rounded-xl hover:bg-white/5 group transform hover:scale-105 hover:shadow-lg"
              >
                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm animate-fadeInUp">
              © 2025 GoFarmlyConnect - Transforming Agriculture Through Technology. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400 animate-fadeInUp animation-delay-200">
              <span>Made with ❤️ for Farmers</span>
              <span>|</span>
              <span>🇮🇳 Proudly Indian</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
