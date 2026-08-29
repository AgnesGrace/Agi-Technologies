"use client"

import CourseCard from "@/components/app-ui/course-card"
import { Pagination } from "@/components/app-ui/pagination"
import { Button } from "@/components/ui/button"
import { EmptyCourseComponent } from "@/components/ui/empty"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingCourseSpinner } from "@/components/ui/spinner"
import { useGetCourseQuery, useGetCoursesQuery } from "@/state/api"
import { Course } from "@/state/api.types"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import SelectedCourse from "./selected-course"

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 400

export default function CourseSearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const selectedSlug = searchParams.get("slug")
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1)
  const searchTerm = searchParams.get("search") ?? ""

  const [searchInput, setSearchInput] = useState(searchTerm)

  useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextSearchTerm = searchInput.trim()
      if (nextSearchTerm === searchTerm) return

      const params = new URLSearchParams(searchParams.toString())
      if (nextSearchTerm) {
        params.set("search", nextSearchTerm)
      } else {
        params.delete("search")
      }
      params.set("page", "1")
      router.replace(`/courses/search-courses?${params.toString()}`, {
        scroll: false,
      })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [searchInput, searchTerm, router, searchParams])

  const {
    data: courseResults,
    isLoading,
    isError,
    isFetching,
  } = useGetCoursesQuery({
    search: searchTerm || undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  })
  const { data: selectedCourseBySlug } = useGetCourseQuery(selectedSlug ?? "", {
    skip: !selectedSlug,
  })

  const courses = courseResults?.courses ?? []
  const pagination = courseResults?.pagination

  const selectedCourse = useMemo(() => {
    if (selectedSlug) {
      return (
        courses.find((course: Course) => course.slug === selectedSlug) ??
        selectedCourseBySlug ??
        null
      )
    }

    return courses[0] ?? null
  }, [selectedSlug, courses, selectedCourseBySlug])

  const updateSearchParams = (updates: { page?: number; slug?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    if (updates.page !== undefined) params.set("page", String(updates.page))
    if (updates.slug) params.set("slug", updates.slug)
    router.push(`/courses/search-courses?${params.toString()}`, {
      scroll: false,
    })
  }

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

  const handleSelectCourse = (course: Course) => {
    updateSearchParams({ slug: course.slug })
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
            <Input
              placeholder="Search courses..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </Field>
        </div>
      </div>

      {courses.length === 0 ? (
        <EmptyCourseComponent description="No course found" title="Ooops!">
          <p>Try a different search or check back later.</p>
        </EmptyCourseComponent>
      ) : (
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
                onClick={() => handleSelectCourse(course)}
              />
            ))}
          </motion.section>
        </div>
      )}

      {(pagination?.totalPages ?? 0) > 1 && (
        <div className="mt-10">
          <Pagination
            page={pagination?.currentPage ?? currentPage}
            totalPages={pagination?.totalPages ?? 1}
            isLoading={isFetching}
            onPageChange={(nextPage) => updateSearchParams({ page: nextPage })}
          />
        </div>
      )}
    </motion.main>
  )
}
