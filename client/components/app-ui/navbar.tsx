"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { ModeToggle } from "../ui/mode-toggle"
import { Show, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "../ui/button"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  console.log(user, "nav")
  const loggedInUserRole = user?.publicMetadata?.userRole as
    "learner" | "teacher" | undefined
  console.log(loggedInUserRole)
  const links = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Projects", href: "/projects" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/20 bg-white/70 px-4 backdrop-blur-xl dark:bg-black/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white"
          >
            AgiTech
          </Link>
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
              <UserButton
                showName={true}
                userProfileMode="navigation"
                userProfileUrl={
                  loggedInUserRole === "learner"
                    ? "/user/profile"
                    : "/teacher/profile"
                }
              />
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
            className="cursor-pointer md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-neutral-200 bg-white px-6 py-5 md:hidden dark:border-neutral-800 dark:bg-black">
          <div className="flex flex-col gap-8">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-neutral-700 transition hover:text-black dark:text-neutral-300 dark:hover:text-white"
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/signup"
              className="mt-3 rounded-full bg-black px-5 py-2 text-center text-white dark:bg-white dark:text-black"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
