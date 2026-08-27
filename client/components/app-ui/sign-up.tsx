"use client"
import { SignUp, useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { dashboardCoursesPath, normalizeUserRole } from "@/lib/user-role"

export default function SignUpUser() {
  const searchParams = useSearchParams()
  const { user } = useUser()
  const isCheckOutPage = searchParams.get("displaySignup") !== null
  const courseSlug = searchParams.get("slug")

  const signInUrl = isCheckOutPage
    ? `/checkout?stage=1&slug=${courseSlug}&displaySignup=false`
    : "/signin"

  const getSignUpRedirectUrl = () => {
    if (isCheckOutPage) {
      return `/checkout?stage=2&slug=${courseSlug}&displaySignup=false`
    }

    const userRole = normalizeUserRole(
      user?.publicMetadata?.userRole as string | undefined
    )
    if (userRole === "instructor" || userRole === "admin") {
      return dashboardCoursesPath(userRole)
    } else if (userRole === "learner") {
      return "/user/courses"
    } else {
      toast.error(
        "You do not have enough permisions, please reach the site admin"
      )
      return "/"
    }
  }

  return (
    <SignUp
      signInUrl={signInUrl}
      forceRedirectUrl={getSignUpRedirectUrl()}
      routing="hash"
      afterSignOutUrl="/"
    />
  )
}
