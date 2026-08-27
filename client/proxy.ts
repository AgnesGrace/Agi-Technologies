import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { dashboardCoursesPath, normalizeUserRole } from "@/lib/user-role"

type SessionClaims = {
  metadata?: {
    userRole?: string
  }
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  const isLearnerRoute = pathname.startsWith("/user")
  const isInstructorRoute = pathname.startsWith("/instructor")

  const isProtectedRoute = isLearnerRoute || isInstructorRoute

  const { sessionClaims, userId } = await auth()

  if (isProtectedRoute && !userId) {
    const signInUrl = new URL("/signin", req.url)

    signInUrl.searchParams.set(
      "redirect_url",
      `${pathname}${req.nextUrl.search}`
    )

    return NextResponse.redirect(signInUrl)
  }

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const loggedInUserRole = normalizeUserRole(
    (sessionClaims as SessionClaims | null)?.metadata?.userRole
  )

  if (!loggedInUserRole) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (isLearnerRoute && loggedInUserRole !== "learner") {
    return NextResponse.redirect(
      new URL(dashboardCoursesPath(loggedInUserRole), req.url)
    )
  }

  if (
    isInstructorRoute &&
    loggedInUserRole !== "instructor" &&
    loggedInUserRole !== "admin"
  ) {
    return NextResponse.redirect(new URL("/user/courses", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
