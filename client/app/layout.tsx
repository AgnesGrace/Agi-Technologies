import type { Metadata } from "next"
import { Geist_Mono, Plus_Jakarta_Sans, Syne } from "next/font/google"
import { cn } from "@/lib/utils"
import StoreProvider from "@/state/redux"
import { Toaster } from "sonner"
import { ClerkProvider } from "@clerk/nextjs"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "AgiTech",
    template: "%s · AgiTech",
  },
  description:
    "AgiTech: structured tech courses, career paths, and hire-ready skills.",
  applicationName: "AgiTech",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        plusJakarta.variable,
        syne.variable,
        fontMono.variable
      )}
    >
      <body>
        <ThemeProvider>
          <ClerkProvider>
            <StoreProvider>
              {children}
              <Toaster richColors position="top-right" closeButton />
            </StoreProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
