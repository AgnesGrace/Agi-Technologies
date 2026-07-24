"use client"

import { motion } from "framer-motion"
import { COURSE_CATEGORIES } from "@/data/courses"
import CoursesList from "@/components/app-ui/coureses-list"
import CourseListSkeleton from "@/components/skeletons/course-list-skeleton"

import { useGetCoursesQuery } from "@/state/api"

export default function Courses() {
  const { data: courses, isLoading, isError } = useGetCoursesQuery({})

  console.log(isLoading, isError)

  if (isLoading) return <CourseListSkeleton />

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mb-12">
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
          Learn from industry professionals through practical projects,
          structured lessons, and real-world experience.
        </motion.p>
      </div>
      <div className="mb-12 flex flex-wrap gap-3">
        {COURSE_CATEGORIES.map((category) => (
          <button
            key={category}
            className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-medium transition-all hover:border-primary hover:bg-primary hover:text-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            {category}
          </button>
        ))}
      </div>

      {courses && courses.length > 0 && <CoursesList courses={courses} />}
      {isError && (
        <p className="text-red-900">
          Something went wrong, check back later for list of courses!
        </p>
      )}
    </motion.section>
  )
}
