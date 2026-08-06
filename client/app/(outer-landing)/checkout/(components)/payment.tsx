import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import StripeProvider from "./stripe-provider"
import useCheckoutStripe from "@/hooks/use-checkout-stripe"
import useCurrentCourse from "@/hooks/use-current-course"
import { useUser } from "@clerk/nextjs"
import CourseShowCard from "@/components/app-ui/course-show-card"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

function Payment() {
  const { user } = useUser()
  const stripe = useStripe()
  const stripeElements = useElements()
  const { redirectUserTo } = useCheckoutStripe()
  const { course, slug } = useCurrentCourse()

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
              <p className="text-xl font-bold text-primary">
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
          </form>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" size="lg">
          Switch Account
        </Button>
        <Button
          size="lg"
          form="payment-form"
          type="submit"
          className="cursor-pointer"

          disabled={!stripeElements || !stripe}
        >
          Pay
        </Button>
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
