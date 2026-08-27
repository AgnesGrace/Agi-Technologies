"use client"
import { SignIn, useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { dashboardCoursesPath, normalizeUserRole } from "@/lib/user-role"

export default function SignInUser() {
  const searchParams = useSearchParams()
  const { user } = useUser()
  const isCheckOutPage = searchParams.get("displaySignup") !== null
  const courseSlug = searchParams.get("slug")

  const signUpUrl = isCheckOutPage
    ? `/checkout?stage=1&slug=${courseSlug}&displaySignup=true`
    : "/signup"

  const getSignInRedirectUrl = () => {
    if (isCheckOutPage) {
      return `/checkout?stage=2&slug=${courseSlug}&displaySignup=true`
    }

    const userRole = normalizeUserRole(
      user?.publicMetadata?.userRole as string | undefined
    )
    if (userRole === "instructor" || userRole === "admin") {
      return dashboardCoursesPath(userRole)
    } else if (userRole === "learner") {
      return "/user/courses"
    } else {
      return "/"
    }
  }

  return (
    <SignIn
      appearance={{
        elements: {},
      }}
      signUpUrl={signUpUrl}
      forceRedirectUrl={getSignInRedirectUrl()}
      routing="hash"
      afterSignOutUrl="/"
    />
  )
}
