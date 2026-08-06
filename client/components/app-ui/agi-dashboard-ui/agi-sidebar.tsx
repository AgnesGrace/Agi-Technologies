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
  BanknoteArrowUp,
  BookOpen,
  ChartNoAxesCombined,
  LogOut,
  PanelLeft,
  ReceiptText,
  Route,
  Settings,
  User,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navLinks = {
  teacher: [
    { href: "/teacher/courses", icon: BookOpen, label: "Courses" },
    { href: "/teacher/profile", icon: User, label: "My Profile" },
    { href: "/teacher/settings", icon: Settings, label: "Settings" },
    { href: "/teacher/billing", icon: BanknoteArrowUp, label: "billing" },
    { href: "/user/stats", icon: ChartNoAxesCombined, label: "Stats" },
  ],
  learner: [
    { href: "/user/courses", icon: BookOpen, label: "Courses" },
    { href: "/user/my-path", icon: Route, label: "My Path" },
    { href: "/user/profile", icon: User, label: "My Profile" },
    { href: "/user/settings", icon: Settings, label: "Settings" },
    { href: "/user/billing", icon: ReceiptText, label: "Billing" },
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
    (user.publicMetadata.userRole as "learner" | "teacher") || "learner"

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
              <div className="mt-6 flex h-10 w-full justify-between pl-4 group-data-[collapsible=icon]:mt-6 group-data-[collapsible=icon]:justify-center">
                <Link
                  href="/"
                  className="cursor-pointer text-lg font-extrabold"
                >
                  Agi
                </Link>

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
