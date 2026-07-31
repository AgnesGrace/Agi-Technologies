import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  const isLearnerRoute = pathname.startsWith("/user")
  const isTeacherRoute = pathname.startsWith("/teacher")

  const isProtectedRoute =
    pathname.startsWith("/user") || pathname.startsWith("/teacher")

  const { sessionClaims, userId } = await auth()

  if (isProtectedRoute && !userId) {
    const signInUrl = new URL("/signin", req.url)
    signInUrl.searchParams.set("redirect_url", pathname)

    return NextResponse.redirect(signInUrl)
  }

  const loggedinUserRole =
    (sessionClaims?.metadata as { userRole: "teacher" | "learner" })
      ?.userRole || "learner"

  if (isLearnerRoute) {
    if (loggedinUserRole !== "learner") {
      const url = new URL("/teacher/courses", req.url)
      return NextResponse.redirect(url)
    }
  }

  if (isTeacherRoute) {
    console.log(loggedinUserRole)
    if (loggedinUserRole !== "teacher") {
      const url = new URL("/user/courses", req.url)
      return NextResponse.redirect(url)
    }
  }
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
