import SignInUser from "@/components/app-ui/sign-in"
import { Spinner } from "@/components/ui/spinner"
import { Suspense } from "react"

export default function page() {
  return (
    <Suspense fallback={<Spinner />}>
      <SignInUser />
    </Suspense>
  )
}
