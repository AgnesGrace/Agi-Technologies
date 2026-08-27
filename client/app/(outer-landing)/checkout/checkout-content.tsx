"use client"

import WizzardStepper from "@/components/app-ui/wizzard-stepper"
import { Spinner } from "@/components/ui/spinner"
import useCheckoutStripe from "@/hooks/use-checkout-stripe"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import CheckoutDetails from "./(components)/checkout-details"
import Payment from "./(components)/payment"
import CheckoutComplete from "./(components)/checkout-complete"

export default function CheckoutContent() {
  const { isLoaded } = useUser()
  const { currentStage } = useCheckoutStripe()
  const searchParams = useSearchParams()

  const slug = searchParams.get("slug")

  if (!isLoaded) return <Spinner />

  const renderStage = () => {
    switch (currentStage) {
      case 1:
        return <CheckoutDetails />
      case 2:
        return <Payment />
      case 3:
        return <CheckoutComplete />
      default:
        return "checkout-details"
    }
  }

  return (
    <div className="flex flex-col">
      {slug && <WizzardStepper currentStage={currentStage} />}
      <div
        className={cn("flex h-screen flex-1 flex-col items-center", {
          "h-100": !slug,
        })}
      >
        {slug && <h1 className="mb-4 text-2xl font-bold">Checkout</h1>}
        {renderStage()}
      </div>
    </div>
  )
}
