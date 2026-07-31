"use client"
import { SignIn, useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"

export default function SignInUser() {
  const searchParams = useSearchParams()
  const { user } = useUser()
  const isCheckOutPage = searchParams.get("showSignUp") !== null
  const courseSlug = searchParams.get("slug")

  const signUpUrl = isCheckOutPage
    ? `/checkout?stage=1&slug=${courseSlug}&displaySignup=true`
    : "/signup"

  const getSignInRedirectUrl = () => {
    if (isCheckOutPage) {
      return `/checkout?stage=2&slug=${courseSlug}`
    }

    const userRole = user?.publicMetadata?.userRole as string
    if (userRole === "teacher") {
      return "/teacher/courses"
    } else {
      return "/user/courses"
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
