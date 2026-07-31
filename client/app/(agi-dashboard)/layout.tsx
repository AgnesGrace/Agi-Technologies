"use client"
import DashboardNavbar from "@/components/app-ui/agi-dashboard-ui/dashboard-navbar"
import AgiSidebar from "@/components/app-ui/agi-dashboard-ui/agi-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { useUser } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { ReactNode, useState } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  const [courseSlug, setCourseSlug] = useState<string | null>(null)
  const { user, isLoaded } = useUser()
  const pathname = usePathname()

  if (!isLoaded) return <Spinner />
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen">
        <AgiSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardNavbar />
          <div className="min-h-screen flex-1 grow overflow-y-auto p-4 transition-all duration-500 ease-in-out">
            <main>{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
