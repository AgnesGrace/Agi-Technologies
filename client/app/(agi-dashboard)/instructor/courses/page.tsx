"use client"

import Header from "@/components/app-ui/agi-dashboard-ui/header"
import CourseCard from "@/components/app-ui/course-card"
import { Pagination } from "@/components/app-ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyCourseComponent } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import {
  useCreateCourseMutation,
  useGetInstructorCoursesQuery,
} from "@/state/api"
import { Plus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function InstructorCoursesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const { data, isLoading, isFetching } = useGetInstructorCoursesQuery({
    page,
    limit: 12,
  })
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation()

  const courses = data?.courses ?? []
  const pagination = data?.pagination

  const handleCreate = async () => {
    try {
      const result = await createCourse().unwrap()
      router.push(`/instructor/courses/${result.course.id}/editor`)
    } catch {
      //TODO
    }
  }

  if (isLoading) return <Spinner />

  return (
    <>
      <Header
        title="My Courses"
        className="font-display"
        headerEl={
          <Button onClick={handleCreate} disabled={isCreating}>
            <Plus className="size-4" />
            Create course
          </Button>
        }
      />

      <p className="-mt-2 mb-8 text-sm text-muted-foreground">
        Drafts stay private until you publish. Click a course to open the
        editor.
      </p>

      {courses.length === 0 ? (
        <EmptyCourseComponent description="You have not created any courses yet.">
          <p className="mb-4 text-sm text-muted-foreground">
            Start with an empty draft, then build sections and lessons.
          </p>
          <Button onClick={handleCreate} disabled={isCreating}>
            <Plus className="size-4" />
            Create your first course
          </Button>
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
                    router.push(`/instructor/courses/${course.id}/editor`)
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
