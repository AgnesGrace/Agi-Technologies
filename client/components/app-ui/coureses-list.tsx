"use client"

import { motion } from "framer-motion"

import { useRouter } from "next/navigation"

import { Course } from "@/state/api.types"
import CourseCard from "./course-card"

interface ICourseListProps {
  courses: Course[]
}

export default function CoursesList({ courses }: ICourseListProps) {
  const router = useRouter()

  return (
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
            onClick={() =>
              router.push(`/courses/search-courses?slug=${course.slug}`)
            }
          />
        </motion.div>
      ))}
    </div>
  )
}
