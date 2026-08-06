import CourseShowCard from "@/components/app-ui/course-show-card"
import SignInUser from "@/components/app-ui/sign-in"
import SignUpUser from "@/components/app-ui/sign-up"
import { EmptyCourseComponent } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import useCurrentCourse from "@/hooks/use-current-course"
import { useSearchParams } from "next/navigation"

export default function CheckoutDetails() {
  const { course, isLoading } = useCurrentCourse()
  const searchParams = useSearchParams()

  const displaySignup = searchParams.get("displaySignup") === "true"

  if (isLoading) return <Spinner />

  if (!course)
    return (
      <EmptyCourseComponent description="Course not found">
        <p>The requested course is currently not available</p>
      </EmptyCourseComponent>
    )
  return (
    <div className="mx-auto flex h-full flex-col gap-20 md:flex-row">
      <div className="gap-10 sm:flex">
        <CourseShowCard course={course} />
      </div>
      <div className="flex w-fit rounded-lg">
        {displaySignup ? <SignUpUser /> : <SignInUser />}
      </div>
    </div>
  )
}
