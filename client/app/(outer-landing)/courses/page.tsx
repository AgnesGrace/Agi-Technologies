"use client"

import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"

import { COURSE_CATEGORIES } from "@/data/courses"
import CoursesList from "@/components/app-ui/coureses-list"
import CourseListSkeleton from "@/components/skeletons/course-list-skeleton"
import { Pagination } from "@/components/app-ui/pagination"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useGetCoursesQuery } from "@/state/api"
import { ArrowRight } from "lucide-react"

const PAGE_SIZE = 12

export default function Courses() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const category = searchParams.get("category") || undefined

  const {
    data: results,
    isLoading,
    isError,
    isFetching,
  } = useGetCoursesQuery({
    page,
    limit: PAGE_SIZE,
    category,
  })

  const courses = results?.courses ?? []
  const pagination = results?.pagination

  const updateSearchParams = ({
    page,
    category,
  }: {
    page?: number
    category?: string | null
  }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (page !== undefined) {
      params.set("page", String(page))
    }

    if (category !== undefined) {
      if (category) {
        params.set("category", category)
      } else {
        params.delete("category")
      }

      params.set("page", "1")
    }

    router.push(`/courses?${params.toString()}`, {
      scroll: false,
    })
  }

  const handlePageChange = (nextPage: number) => {
    if (
      nextPage < 1 ||
      nextPage > (pagination?.totalPages ?? 1) ||
      isFetching
    ) {
      return
    }

    updateSearchParams({
      page: nextPage,
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleCategoryChange = (selectedCategory: string) => {
    updateSearchParams({
      category: selectedCategory === "all" ? null : selectedCategory,
    })
  }

  if (isLoading) {
    return <CourseListSkeleton />
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-blue-400"
      >
        Learn • Build • Grow
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-neutral-900 md:text-5xl dark:text-white"
      >
        Discover courses that move your career forward.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-400"
      >
        Learn from industry professionals through practical projects, structured
        lessons, and real-world experience.
      </motion.p>
      <div className="mt-8 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Featured Courses
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Hand-picked courses recommended for you.
          </p>
        </div>
        {isError && (
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm text-red-600 dark:text-red-400">
              Something went wrong while loading courses. Please try again
              later.
            </p>
          </div>
        )}
        {!isError && (
          <button
            onClick={() => router.push("/courses/search-courses")}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            View all
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {!isError && (
        <>
          <div className="mb-12 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                Courses
              </p>

              <p className="text-sm text-neutral-500">
                Browse courses by category
              </p>
            </div>

            <Select
              value={category ?? "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>

                {COURSE_CATEGORIES.map((courseCategory) => (
                  <SelectItem key={courseCategory} value={courseCategory}>
                    {courseCategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {courses.length > 0 && (
            <>
              <CoursesList courses={courses} />

              <Pagination
                page={pagination?.currentPage ?? page}
                totalPages={pagination?.totalPages ?? 1}
                isLoading={isFetching}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </motion.section>
  )
}
