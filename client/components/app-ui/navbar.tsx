"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Projects", href: "/projects" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/20 bg-white/70 backdrop-blur-xl dark:bg-black/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white"
        >
          AgiTech
        </Link>

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

        <div className="hidden md:block">
          <Link
            href="/signup"
            className="rounded-full bg-black px-8 py-4 text-sm font-medium text-white transition hover:opacity-90 dark:bg-primary"
          >
            Sign Up
          </Link>
        </div>

        <button
          className="cursor-pointer md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-neutral-200 bg-white px-6 py-5 md:hidden dark:border-neutral-800 dark:bg-black">
          <div className="flex flex-col gap-4">
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
