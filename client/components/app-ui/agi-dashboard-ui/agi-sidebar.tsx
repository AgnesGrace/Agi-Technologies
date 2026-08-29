"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useClerk, useUser } from "@clerk/nextjs"
import {
  BookOpen,
  ChartNoAxesCombined,
  CreditCard,
  LogOut,
  PanelLeft,
  Route,
  Settings,
  User,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { normalizeUserRole } from "@/lib/user-role"
import { BrandMark } from "@/components/app-ui/brand-mark"

const navLinks = {
  instructor: [
    { href: "/instructor/courses", icon: BookOpen, label: "Courses" },
    { href: "/instructor/profile", icon: User, label: "My Profile" },
    { href: "/instructor/settings", icon: Settings, label: "Settings" },
    { href: "/instructor/stats", icon: ChartNoAxesCombined, label: "Stats" },
    { href: "/instructor/billing", icon: CreditCard, label: "Billing" },
  ],
  admin: [
    { href: "/instructor/courses", icon: BookOpen, label: "Courses" },
    { href: "/instructor/profile", icon: User, label: "My Profile" },
    { href: "/instructor/settings", icon: Settings, label: "Settings" },
    { href: "/user/stats", icon: ChartNoAxesCombined, label: "Stats" },
  ],
  learner: [
    { href: "/user/courses", icon: BookOpen, label: "Courses" },
    { href: "/user/billing", icon: CreditCard, label: "Billing" },
    { href: "/user/my-path", icon: Route, label: "My Path" },
    { href: "/user/profile", icon: User, label: "My Profile" },
    { href: "/user/settings", icon: Settings, label: "Settings" },
    { href: "/user/stats", icon: ChartNoAxesCombined, label: "Stats" },
  ],
}

export default function AgiSidebar() {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()

  if (!isLoaded) return <Spinner />
  if (!user) return <p>User not found</p>

  const userRole =
    normalizeUserRole(user.publicMetadata.userRole as string) || "learner"

  const loggesInUserNavlink = navLinks[userRole]

  return (
    <Sidebar
      collapsible="icon"
      style={{ height: "100vh" }}
      className="border-none shadow-lg"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="mt-6 flex h-10 w-full items-center justify-between pl-4 group-data-[collapsible=icon]:mt-6 group-data-[collapsible=icon]:justify-center">
                <BrandMark
                  className="group-data-[collapsible=icon]:gap-0"
                  showWordmark
                />

                <PanelLeft
                  className="h-5 w-5 cursor-pointer group-data-[collapsible=icon]:hidden"
                  onClick={() => toggleSidebar()}
                />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="mt-6 gap-0">
          {loggesInUserNavlink.map((link) => {
            const isActiveLink = pathname.startsWith(link.href)
            return (
              <SidebarMenuItem
                key={link.href}
                className={cn(
                  isActiveLink && "bg-gray-300 dark:bg-gray-800",
                  "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-4"
                )}
              >
                <SidebarMenuButton
                  size="lg"
                  className="gap-4 p-8 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                >
                  <Link
                    href={link.href}
                    className="relative flex w-full items-center"
                  >
                    <link.icon className="text-primary dark:text-blue-500" />
                    <span className="text-md ml-4 font-medium group-data-[collapsible=icon]:hidden">
                      {link.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
                {isActiveLink && (
                  <div className="absolute top-0 right-0 h-full w-1 bg-sidebar-primary"></div>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
