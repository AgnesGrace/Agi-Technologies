"use client"

import { Button } from "@/components/ui/button"
import { useGetEnrolledCoursesQuery } from "@/state/api"
import Header from "@/components/app-ui/agi-dashboard-ui/header"
import CourseCard from "@/components/app-ui/course-card"
import { Pagination } from "@/components/app-ui/pagination"
import { EmptyCourseComponent } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function UserCoursesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const { data, isLoading, isFetching } = useGetEnrolledCoursesQuery({
    page,
    limit: 12,
  })

  const courses = data?.courses ?? []
  const pagination = data?.pagination

  if (isLoading) return <Spinner />

  return (
    <>
      <Header title="My Courses" />

      {courses.length === 0 ? (
        <EmptyCourseComponent description="You have not enrolled in any courses yet.">
          <Link href="/courses">
            <Button>Browse courses</Button>
          </Link>
        </EmptyCourseComponent>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => router.push(`/learn/${course.id}`)}
              />
            ))}
          </div>

          <div className="mt-8">
            <Pagination
              page={pagination?.currentPage ?? page}
              totalPages={pagination?.totalPages ?? 1}
              isLoading={isFetching}
              onPageChange={(nextPage) =>
                router.push(`/user/courses?page=${nextPage}`)
              }
            />
          </div>
        </>
      )}
    </>
  )
}
