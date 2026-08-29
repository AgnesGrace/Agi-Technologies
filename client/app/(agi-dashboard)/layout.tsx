"use client"
import DashboardNavbar from "@/components/app-ui/agi-dashboard-ui/dashboard-navbar"
import AgiSidebar from "@/components/app-ui/agi-dashboard-ui/agi-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { useEnsureDbUser } from "@/hooks/use-ensure-db-user"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  const { isLoaded } = useUser()
  useEnsureDbUser()
  const pathname = usePathname()
  const isCourseEditor = pathname.includes("/editor")
  const isCoursePlayer = pathname.startsWith("/learn")
  const isImmersive = isCourseEditor || isCoursePlayer

  if (!isLoaded) return <Spinner />
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen">
        {!isImmersive && <AgiSidebar />}
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardNavbar />
          <div
            className={cn(
              "min-h-0 flex-1 grow transition-all duration-300 ease-in-out",
              isImmersive ? "overflow-hidden p-0" : "overflow-y-auto p-4"
            )}
          >
            <main className={cn(!isImmersive && "min-h-screen")}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
