"use client"

import { useEffect, useState } from "react"
import {
  Globe,
  LayoutDashboard,
  User,
  FileText,
  ClipboardList,
  TrendingUp,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { ProfileCompletionModal } from "./profile-completion-modal"
import { getDashboardData, logout } from "@/app/actions"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Registration",
    url: "/dashboard/registration",
    icon: ClipboardList,
  },
  {
    title: "Progress Tracker",
    url: "/dashboard/progress",
    icon: TrendingUp,
  },
  {
    title: "My Document",
    url: "/dashboard/documents",
    icon: FileText,
  },
  {
    title: "Help & Support",
    url: "/dashboard/support",
    icon: HelpCircle,
  },
]

const footerItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)

  const fetchProfileCompletion = async () => {
    try {
      const data = await getDashboardData()
      setProfileCompletion(data.profileCompletion)
    } catch (error) {
      console.error("Failed to fetch profile completion for sidebar:", error)
    }
  }

  useEffect(() => {
    fetchProfileCompletion()
  }, [])

  const openProfileModal = () => {
    setIsProfileModalOpen(true)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback: redirect to home page
      window.location.href = "/"
    }
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">GOFARMLYCONNECT</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Combined Profile Section */}
      <div className="px-4 pb-4">
        <div
          className="w-full p-3 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={openProfileModal}
        >
          <div className="flex items-center gap-3 mb-3">
            <User className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">My Profile</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Complete your profile</span>
              <span className="text-xs text-gray-500">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
          </div>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button onClick={handleLogout} className="w-full flex items-center">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <ProfileCompletionModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdate={fetchProfileCompletion}
      />
    </Sidebar>
  )
}
