import { Spinner } from "@/components/ui/spinner"
import { Suspense } from "react"
import CheckoutContent from "./checkout-content"

export default function CheckoutStripe() {
  return (
    <Suspense fallback={<Spinner />}>
      <CheckoutContent />
    </Suspense>
  )
}
