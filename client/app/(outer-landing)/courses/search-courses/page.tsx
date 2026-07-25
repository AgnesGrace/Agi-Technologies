"use client"
import { Button } from "@/components/ui/button"
import { EmptyCourseComponent } from "@/components/ui/empty"
import { LoadingCourseSpinner } from "@/components/ui/spinner"
import { useGetCoursesQuery } from "@/state/api"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { motion } from "framer-motion"
import CourseCard from "@/components/app-ui/course-card"
import { Course } from "@/state/api.types"
import SelectedCourse from "./selected-course"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function CourseSearch() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const slug = searchParams.get("slug")

  const { data: courses, isLoading, isError } = useGetCoursesQuery({})

  const selectedCourse = useMemo(() => {
    if (courses) {
      if (slug) {
        return courses.find((course) => course.slug === slug) || courses[0]
      } else {
        return courses[0]
      }
    }
    return null
  }, [slug, courses])

  if (isLoading) return <LoadingCourseSpinner />

  if (isError || !courses)
    return (
      <EmptyCourseComponent description="There are no courses corresponding to your search condition.">
        <Button onClick={() => router.back()}>Back</Button>
      </EmptyCourseComponent>
    )

  const handleSelectedCourse = (course: Course) => {
    router.push(`?slug=${course.slug}`)
  }

  const handleEnrollCourse = (courseId: number) => {
    router.push(`/checkout?stage=1&id=${courseId}&displaySignup=false`)
  }

  return (
    <section className="p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col text-foreground"
      >
        <div className="mx-auto mb-2 w-1/2">
          <Field orientation="horizontal">
            <Input
              type="search"
              placeholder="Search Courses..."
              className="p-4"
            />
            <Button>Search</Button>
          </Field>
        </div>
        <div className="flex flex-col gap-16 pt-2 pb-8 md:flex-row">
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.2,
              }}
              className="grid basis-[28%] auto-rows-fr grid-cols-1"
            >
              <SelectedCourse
                course={selectedCourse}
                handleEnrollCourse={handleEnrollCourse}
              />
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.5,
            }}
            className="grid basis-[70%] auto-rows-fr grid-cols-1 gap-6 xl:grid-cols-2"
          >
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                isSelected={selectedCourse?.slug === course.slug}
                course={course}
                onClick={() => handleSelectedCourse(course)}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
