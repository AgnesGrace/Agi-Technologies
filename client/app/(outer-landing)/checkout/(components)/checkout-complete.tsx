"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import useCurrentCourse from "@/hooks/use-current-course"

export default function CheckoutComplete() {
  const { course } = useCurrentCourse()

  return (
    <div className="flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
      <CheckCircle2 className="h-16 w-16 text-primary" />
      <h2 className="text-2xl font-bold">You are enrolled</h2>
      <p className="text-muted-foreground">
        {course
          ? `${course.title} is now in your learning dashboard.`
          : "Your payment succeeded and the course is unlocked."}
      </p>
      <div className="flex gap-3">
        <Link href="/user/courses">
          <Button>Go to my courses</Button>
        </Link>
        <Link href="/user/billing">
          <Button variant="outline">View receipt</Button>
        </Link>
      </div>
    </div>
  )
}
