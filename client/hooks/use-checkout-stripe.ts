import { useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect } from "react"

export default function useCheckoutStripe() {
  const { isLoaded, isSignedIn } = useUser()

  const router = useRouter()
  const searchParams = useSearchParams()

  const slug = searchParams.get("slug") ?? ""
  const currentStage = parseInt(searchParams.get("stage") ?? "1", 10)

  const redirectUserTo = useCallback(
    (stage: number) => {
      const newStage = Math.min(Math.max(stage, 1), 3)
      const displaySignup = isSignedIn ? "true" : "false"

      router.push(
        `/checkout?stage=${newStage}&slug=${slug}&displaySignup=${displaySignup}`
      )
    },
    [slug, isSignedIn, router]
  )

  useEffect(() => {
    if (isLoaded && !isSignedIn && currentStage > 1) {
      redirectUserTo(1)
    }
  }, [isLoaded, isSignedIn, currentStage, redirectUserTo])

  return { redirectUserTo, currentStage }
}
