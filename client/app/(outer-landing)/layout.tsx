import Footer from "@/components/app-ui/footer"
import Navbar from "@/components/app-ui/navbar"
import { ReactNode } from "react"

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
