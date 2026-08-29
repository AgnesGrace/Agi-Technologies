"use client"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import StripeProvider from "./stripe-provider"
import useCheckoutStripe from "@/hooks/use-checkout-stripe"
import useCurrentCourse from "@/hooks/use-current-course"
import { useClerk, useUser } from "@clerk/nextjs"
import CourseShowCard from "@/components/app-ui/course-show-card"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormEvent } from "react"
import { toast } from "sonner"
import { Transaction } from "@/state/api.types"
import {
  useCreateStripePaymentMutation,
  useSyncClerkUserMutation,
} from "@/state/api"

function Payment() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const stripe = useStripe()
  const stripeElements = useElements()
  const { redirectUserTo } = useCheckoutStripe()
  const { course, slug } = useCurrentCourse()
  const [syncClerkUser] = useSyncClerkUserMutation()

  const [createStripeTransaction] = useCreateStripePaymentMutation()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripeElements || !stripe) {
      toast.error("Sorry! Stripe service is currently not available")
      return
    }

    try {
      await syncClerkUser().unwrap()

      const paymentResult = await stripe.confirmPayment({
        elements: stripeElements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_STRIPE_REDIRECT_URL}?slug=${slug}`,
        },
        redirect: "if_required",
      })

      if (paymentResult.error) {
        toast.error(paymentResult.error.message || "Payment failed")
        return
      }

      if (paymentResult.paymentIntent?.status === "succeeded") {
        if (!user?.id) {
          toast.error("You must be signed in to complete checkout.")
          return
        }

        const transactionInfo: Partial<Transaction> = {
          transactionId: paymentResult.paymentIntent.id,
          courseSlug: slug,
        }

        await createStripeTransaction(transactionInfo).unwrap()

        redirectUserTo(3)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    }
  }

  const handleSignoutAndRedirect = async () => {
    await signOut()
    redirectUserTo(1)
  }

  if (!course) return
  return (
    <div>
      <div className="mb-6 gap-10 sm:flex">
        <div className="basis-1/2 rounded-lg">
          <CourseShowCard course={course} />
        </div>
        <div className="basis-1/2">
          <form className="space-y-4">
            <div>
              <p className="text-xl font-bold text-primary dark:text-blue-300">
                Kindly fill the details below to complete your purchase.
              </p>
              <div className="mt-6 flex w-full flex-col gap-2">
                <h2>Payment method</h2>
                <div className="border-white-100/5 flex flex-col rounded-lg border-[2px]">
                  <div className="bg-white-50/5 flex items-center gap-2 px-2 py-2">
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </div>
                  <div className="px-4 py-6">
                    <PaymentElement />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleSignoutAndRedirect}
              >
                Switch Account
              </Button>
              <Button
                onClick={handleSubmit}
                size="lg"
                form="payment-form"
                type="submit"
                className="cursor-pointer"

                disabled={!stripeElements || !stripe}
              >
                Pay
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function paymentMain() {
  return (
    <StripeProvider>
      <Payment />
    </StripeProvider>
  )
}
