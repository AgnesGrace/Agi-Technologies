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
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { redirect } from "next/dist/server/api-utils"
import { useRouter } from "next/navigation"

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
  const { user } = useUser()
  const router = useRouter()
  const userRole =
    user?.publicMetadata?.userRole === "teacher" ? "teacher" : "student"
  const [createStripeTransactionIntent] =
    useCreateStripeTransactionIntentMutation()

  useEffect(() => {
    if (!course) return
    const getPaymentIntent = async () => {
      try {
        if (!user) return
        const result = await createStripeTransactionIntent({
          amount: course?.price ?? 0,
          courseSlug: course.slug,
          userId: user?.id,
        }).unwrap()

        setClientSecret(result.clientSecret)
      } catch (error: any) {
        toast.error(error?.data.message)
        if (userRole === "teacher") {
          router.push("/teacher/courses")
        } else {
          router.push("/user/courses")
        }
      }
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
