"use client"

import Link from "next/link"
import { GraduationCap, Menu, Settings, X } from "lucide-react"
import { useState } from "react"
import { ModeToggle } from "../ui/mode-toggle"
import { Show, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "../ui/button"
import { BrandMark } from "@/components/app-ui/brand-mark"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  dashboardCoursesPath,
  dashboardProfilePath,
  normalizeUserRole,
} from "@/lib/user-role"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoaded } = useUser()
  const isMobile = useIsMobile()
  const router = useRouter()

  const loggedInUserRole = normalizeUserRole(
    user?.publicMetadata?.userRole as string | undefined
  )

  const links = [
    { name: "Home", href: "/" },
    { name: "Paths", href: "#paths" },
    { name: "Courses", href: "/courses" },
    { name: "About", href: "/" },
    { name: "Contact", href: "#footer" },
  ]

  const handleProfileNavigation = () => {
    if (!isLoaded) return

    if (!loggedInUserRole) {
      toast.warning("Your do not have enough permisssion.", {
        description:
          "Please finish setting up your account before accessing your profile.",
      })

      return
    }

    router.push(dashboardProfilePath(loggedInUserRole))
  }
  const handleCoursesNavigation = () => {
    if (!isLoaded) return

    if (!loggedInUserRole) {
      toast.warning("You do not have enough permissions.", {
        description:
          "Please start a course to access your personalized learning corner.",
      })

      return
    }

    router.push(dashboardCoursesPath(loggedInUserRole))
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/20 bg-white/70 px-8 backdrop-blur-xl dark:bg-black/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <BrandMark />
          <ModeToggle />
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-md font-medium text-neutral-600 transition-colors hover:text-black dark:text-neutral-300 dark:hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-center gap-4">
          <div>
            <Show when="signed-in">
              <UserButton showName={!isMobile}>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Profile"
                    labelIcon={<Settings className="h-4 w-4" />}
                    onClick={handleProfileNavigation}
                  />

                  <UserButton.Action
                    label="My Learning"
                    labelIcon={<GraduationCap className="h-4 w-4" />}
                    onClick={handleCoursesNavigation}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </Show>
            <Show when="signed-out">
              <Link
                href="/signin"
                className="cursor-pointer px-4 text-sm font-medium sm:h-12 sm:px-5 sm:text-base"
              >
                Sign in
              </Link>
              <Link href="/signup">
                <Button className="h-10 cursor-pointer rounded-full bg-primary px-4 text-sm font-medium text-white sm:h-12 sm:px-5 sm:text-base">
                  Sign up
                </Button>
              </Link>
            </Show>
          </div>

          <button
            className="cursor-pointer text-white md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-[oklch(0.16_0.03_250)] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-6">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-white/85 transition hover:text-white"
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/courses"
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-lg bg-white px-5 py-2.5 text-center text-[oklch(0.18_0.03_250)]"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
