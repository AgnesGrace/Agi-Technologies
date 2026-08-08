"use client"
import { SignUp, useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"

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
      return `/checkout?stage=2&slug=${courseSlug}displaySignup=false`
    }

    const userRole = user?.publicMetadata?.userRole as string
    if (userRole === "teacher") {
      return "/teacher/courses"
    } else {
      return "/user/courses"
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
