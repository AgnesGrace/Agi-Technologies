import { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      {children}
    </main>
  )
}
