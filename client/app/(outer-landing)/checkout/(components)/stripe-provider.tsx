"use client"
import { Spinner } from "@/components/ui/spinner"
import { Elements } from "@stripe/react-stripe-js"
import useCurrentCourse from "@/hooks/use-current-course"
import { useCreateStripeTransactionIntentMutation } from "@/state/api"
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js"
import { ReactNode, useEffect, useState } from "react"

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe public key must be provided")
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

const appearance: Appearance = {
  theme: "stripe",
  variables: {},
}

export default function StripeProvider({ children }: { children: ReactNode }) {
  const [clientSecret, setClientSecret] = useState<string | "">("")

  const { course } = useCurrentCourse()

  const [createStripeTransactionIntent] =
    useCreateStripeTransactionIntentMutation()

  useEffect(() => {
    if (!course) return
    const getPaymentIntent = async () => {
      const result = await createStripeTransactionIntent({
        amount: course?.price ?? 0,
      }).unwrap()
      setClientSecret(result.clientSecret)
    }
    getPaymentIntent()
  }, [createStripeTransactionIntent, course])

  const elementOptions: StripeElementsOptions = {
    clientSecret,
    appearance,
  }

  if (!clientSecret) return <Spinner />

  return (
    <Elements stripe={stripePromise} options={elementOptions}>
      {children}
    </Elements>
  )
}
