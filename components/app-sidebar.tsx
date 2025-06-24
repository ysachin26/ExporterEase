"use client"

import { useEffect, useState } from "react" // Import useEffect and useState
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
import { Button } from "@/components/ui/button"
import { ProfileCompletionModal } from "./profile-completion-modal"
import { getDashboardData } from "@/app/actions" // Import getDashboardData

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Documents",
    url: "/dashboard/documents",
    icon: FileText,
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
  {
    title: "Logout",
    url: "/logout",
    icon: LogOut,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0) // State for dynamic profile completion

  const fetchProfileCompletion = async () => {
    try {
      const data = await getDashboardData()
      setProfileCompletion(data.profileCompletion)
    } catch (error) {
      console.error("Failed to fetch profile completion for sidebar:", error)
      // Optionally set an error state or default value
    }
  }

  useEffect(() => {
    fetchProfileCompletion()
  }, []) // Fetch on mount

  const openProfileModal = () => {
    setIsProfileModalOpen(true)
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

      {/* My Profile Button */}
      <div className="px-4 pb-3">
        <Button
          variant="ghost"
          className="w-full justify-start h-10 px-3 text-left font-normal hover:bg-gray-100"
          onClick={openProfileModal}
        >
          <User className="h-4 w-4 mr-3" />
          <span>My Profile</span>
        </Button>
      </div>

      {/* Profile Completion Section */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={openProfileModal}
              className="text-xs font-medium text-gray-600 hover:text-primary cursor-pointer transition-colors"
            >
              Complete your profile
            </button>
            <span className="text-xs text-gray-500">{profileCompletion}%</span>
          </div>
          <Progress
            value={profileCompletion}
            className="h-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={openProfileModal}
          />
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
