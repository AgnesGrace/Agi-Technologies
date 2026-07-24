"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { Course } from "@/state/api.types"
import CourseCard from "./course-card"

interface ICourseListProps {
  courses: Course[]
}

export default function CoursesList({ courses }: ICourseListProps) {
  const router = useRouter()

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Featured Courses
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Hand-picked courses recommended for you.
          </p>
        </div>

        <button
          onClick={() => router.push("/search-courses")}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
        >
          View all
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {courses.slice(0, 4).map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
            }}
            viewport={{ once: true }}
          >
            <CourseCard
              course={course}
              onClick={() => router.push(`/search-courses/${course.id}`)}
            />
          </motion.div>
        ))}
      </div>
    </>
  )
}
