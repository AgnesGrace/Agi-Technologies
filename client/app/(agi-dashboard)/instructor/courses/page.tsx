"use client"

import Header from "@/components/app-ui/agi-dashboard-ui/header"
import CourseCard from "@/components/app-ui/course-card"
import { Pagination } from "@/components/app-ui/pagination"
import { Badge } from "@/components/ui/badge"
import { EmptyCourseComponent } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useGetInstructorCoursesQuery } from "@/state/api"
import { useRouter, useSearchParams } from "next/navigation"

export default function InstructorCoursesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const { data, isLoading, isFetching } = useGetInstructorCoursesQuery({
    page,
    limit: 12,
  })

  const courses = data?.courses ?? []
  const pagination = data?.pagination

  if (isLoading) return <Spinner />

  return (
    <>
      <Header
        title="My Courses"
        headerEl={
          <p className="text-sm text-muted-foreground">
            Drafts stay private until you publish them.
          </p>
        }
      />

      {courses.length === 0 ? (
        <EmptyCourseComponent description="You have not created any courses yet.">
          <p>
            Published courses appear in the public catalog. Drafts stay here.
          </p>
        </EmptyCourseComponent>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="relative">
                <Badge className="absolute top-4 right-4 z-10">
                  {course.status}
                </Badge>
                <CourseCard
                  course={course}
                  onClick={() =>
                    router.push(`/courses/search-courses?slug=${course.slug}`)
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Pagination
              page={pagination?.currentPage ?? page}
              totalPages={pagination?.totalPages ?? 1}
              isLoading={isFetching}
              onPageChange={(nextPage) =>
                router.push(`/instructor/courses?page=${nextPage}`)
              }
            />
          </div>
        </>
      )}
    </>
  )
}
