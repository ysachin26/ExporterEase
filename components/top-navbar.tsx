"use client"

import { Bell, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা", flag: "🇮🇳" },
]

export function TopNavbar() {
  return (
    <header className="flex h-16 items-center justify-end border-b bg-white px-6">
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs">3</Badge>
        </Button>

        {/* Static User Name */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">VM</span>
          </div>
          <span className="text-sm font-medium text-gray-700">Vinayak Maurya</span>
        </div>

        {/* Language Selector - Rightmost */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-3">
              <span className="text-sm">🇺🇸</span>
              <span className="text-sm font-medium">English</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {languages.map((language) => (
              <DropdownMenuItem key={language.code} className="flex items-center gap-3 cursor-pointer">
                <span className="text-base">{language.flag}</span>
                <span className="text-sm">{language.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
