"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Show, UserButton, useUser } from "@clerk/nextjs"
import { Bell, Menu, PanelLeft } from "lucide-react"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

interface IDashboardNavbar {
  isUserCoursePage?: boolean
}
export default function DashboardNavbar({
  isUserCoursePage,
}: IDashboardNavbar) {
  const pathname = usePathname()

  const { user, isLoaded } = useUser()
  const isMobile = useIsMobile()

  const isCoursePage = pathname.startsWith("/user/courses")
  const loggedInUserRole = user?.publicMetadata?.userRole as
    "learner" | "teacher"

  if (!isLoaded) return <Spinner />

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm dark:bg-gray-950">
      <div className="flex items-center gap-4">
        {isMobile && <SidebarTrigger />}

        {isCoursePage && (
          <div className="hidden md:block">
            <Input placeholder="Search courses..." className="w-72" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />

          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <div className="flex items-center gap-3 rounded-lg px-2 py-1">
          <Show when="signed-in">
            <span>Welcome back, {user?.firstName} !</span>
            <UserButton
              userProfileMode="navigation"
              userProfileUrl={
                loggedInUserRole === "learner"
                  ? "/user/profile"
                  : "/teacher/profile"
              }
            />
          </Show>
        </div>
      </div>
    </header>
  )
}
