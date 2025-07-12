"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown, Users, Headphones, Play, Info, Globe } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)

  const navItems = [
    { name: "About Us", href: "#about", icon: Info, hasDropdown: true },
    { name: "Services", href: "#services", icon: Users, hasDropdown: true },
    { name: "Video Tutorial", href: "#tutorials", icon: Play, hasDropdown: true },
    { name: "Support", href: "#support", icon: Headphones, hasDropdown: true },
  ]

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी" },
    { code: "te", name: "తెలుగు" },
    { code: "bn", name: "বাংলা" },
    { code: "ta", name: "தமிழ்" },
    { code: "mr", name: "मराठी" },
  ]

  return (
    <nav className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900 shadow-2xl sticky top-0 z-50 backdrop-blur-sm border-b border-emerald-700/30 overflow-x-hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 max-w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg">
              <span className="text-white font-bold text-lg">🌾</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-all duration-500 transform group-hover:scale-105 truncate">
              GoFarmlyConnect
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className="flex items-center space-x-2 px-4 py-2 text-white hover:text-emerald-300 hover:bg-white/10 rounded-xl transition-all duration-300 group transform hover:scale-105 hover:shadow-lg"
                  >
                    <IconComponent className="w-4 h-4 group-hover:scale-125 transition-transform duration-300" />
                    <span className="font-medium">{item.name}</span>
                    {item.hasDropdown && (
                      <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                    )}
                  </Link>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              )
            })}
          </div>

          {/* Desktop Login Button and Language Selector */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0 min-w-fit">
            <Link href="/login" passHref>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2 rounded-xl font-medium transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Login / Register
            </Button>
            </Link>

            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                className="text-white hover:text-emerald-300 hover:bg-white/10 rounded-xl transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">ENG</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${isLanguageOpen ? "rotate-180" : ""}`}
                />
              </Button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-slideDown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 flex items-center space-x-2"
                      onClick={() => setIsLanguageOpen(false)}
                    >
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Elements */}
          <div className="flex lg:hidden items-center space-x-3">
            {/* Language Selector for Mobile */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-emerald-300 hover:bg-white/10 rounded-xl transition-all duration-300 flex items-center space-x-1 transform hover:scale-105"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs">ENG</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${isLanguageOpen ? "rotate-180" : ""}`}
                />
              </Button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-slideDown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className="w-full text-left px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 flex items-center space-x-2 text-sm"
                      onClick={() => setIsLanguageOpen(false)}
                    >
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-emerald-300 hover:bg-white/10 rounded-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-emerald-800/95 backdrop-blur-sm border-t border-emerald-700 rounded-b-xl animate-slideDown">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 text-white hover:text-emerald-300 hover:bg-white/10 transition-all duration-300 py-3 px-4 rounded-xl group transform hover:scale-105"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Login Button in Mobile Menu */}
              <div className="pt-4 border-t border-emerald-700">
                <Link href="/login" passHref>
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login / Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
