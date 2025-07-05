"use client"

import { useState, useEffect } from "react"
import { Bell, ChevronDown, User, Settings, LogOut, Phone, Mail, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDashboardData, markNotificationAsRead, logout } from "@/app/actions"
import Link from "next/link"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা", flag: "🇮🇳" },
]

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

interface UserData {
  fullName: string
  email: string
  mobileNo: string
  businessName: string
  businessType: string
  photographUrl?: string
}

function UserProfileDropdown() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getDashboardData()
        setUserData({
          fullName: data.user.fullName,
          email: data.user.email,
          mobileNo: data.user.mobileNo,
          businessName: data.user.businessName,
          businessType: data.user.businessType,
          photographUrl: data.user.photographUrl,
        })
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading || !userData) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-auto">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userData.photographUrl} alt={userData.fullName} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
              {getInitials(userData.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900">{userData.fullName}</span>
            <span className="text-xs text-gray-500">{userData.businessName}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {/* User Info Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={userData.photographUrl} alt={userData.fullName} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
                {getInitials(userData.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{userData.fullName}</h3>
              <p className="text-sm text-gray-600">{userData.businessName}</p>
              <div className="flex items-center gap-1 mt-1">
                <Building className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{userData.businessType}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Mail className="h-3 w-3" />
              <span>{userData.email || 'No email added'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone className="h-3 w-3" />
              <span>{userData.mobileNo}</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />
        
        <div className="py-1">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TopNavbar() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getDashboardData()
        setNotifications(data.notifications || [])
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const unreadCount = notifications.filter(notif => !notif.read).length

  return (
    <header className="flex h-16 items-center justify-end border-b bg-white px-6">
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 cursor-pointer border-b ${
                    notification.read ? "opacity-60" : "bg-blue-50"
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        notification.read ? "bg-gray-400" : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <UserProfileDropdown />

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
