import Footer from "@/components/app-ui/footer"
import Navbar from "@/components/app-ui/navbar"
import { ReactNode } from "react"

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
