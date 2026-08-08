"use client"

import CourseCard from "@/components/app-ui/course-card"
import { Button } from "@/components/ui/button"
import { EmptyCourseComponent } from "@/components/ui/empty"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingCourseSpinner } from "@/components/ui/spinner"
import { useGetCoursesQuery } from "@/state/api"
import { Course } from "@/state/api.types"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import SelectedCourse from "./selected-course"

export default function CourseSearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const slug = searchParams.get("slug")

  const { data: results, isLoading, isError } = useGetCoursesQuery({})
  const courses = results?.courses ?? []

  const selectedCourse = useMemo(() => {
    if (!courses.length) return null

    if (slug) {
      return (
        courses.find((course: Course) => course.slug === slug) ?? courses[0]
      )
    }

    return courses[0]
  }, [slug, courses])

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <LoadingCourseSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Button onClick={() => router.back()}>Back</Button>
      </div>
    )
  }

  if (!courses.length) {
    return (
      <EmptyCourseComponent description="No course found" title="Ooops!">
        <p>Please check back later</p>
      </EmptyCourseComponent>
    )
  }

  const handleSelectedCourse = (course: Course) => {
    router.push(`?slug=${course.slug}`, { scroll: false })
  }

  const handleEnrollCourse = (courseSlug: string) => {
    router.push(`/checkout?stage=1&slug=${courseSlug}&displaySignup=false`)
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Search courses
        </h1>

        <div className="mt-4">
          <Field>
            <Input placeholder="Search courses..." />
          </Field>
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        {selectedCourse && (
          <motion.aside
            key={selectedCourse.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.1,
            }}
            className="lg:sticky lg:top-6"
          >
            <SelectedCourse
              course={selectedCourse}
              handleEnrollCourse={handleEnrollCourse}
            />
          </motion.aside>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.2,
          }}
          className="grid grid-cols-1 gap-6 xl:grid-cols-2"
        >
          {courses.map((course: Course) => (
            <CourseCard
              key={course.id}
              isSelected={selectedCourse?.slug === course.slug}
              course={course}
              onClick={() => handleSelectedCourse(course)}
            />
          ))}
        </motion.section>
      </div>
    </motion.main>
  )
}
