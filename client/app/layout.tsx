import { Geist_Mono, Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import StoreProvider from "@/state/redux"
import { Toaster } from "sonner"
import { ClerkProvider } from "@clerk/nextjs"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
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
