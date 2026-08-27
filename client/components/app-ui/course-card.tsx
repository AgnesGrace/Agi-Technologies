"use client"

import Image from "next/image"
import { Users, Star, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { formatPrice } from "@/lib/utils"
import { Course } from "@/state/api.types"

interface ICourseCardProps {
  course: Course
  isSelected?: boolean
  onClick: () => void
}

export default function CourseCard({
  course,
  isSelected = false,
  onClick,
}: ICourseCardProps) {
  const isEnrolled = course.isEnrolled === true

  return (
    <div className="h-full max-w-120 rounded-[22px] bg-white p-0 dark:bg-neutral-950">
      <article
        onClick={onClick}
        className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-[20px] bg-white ring-1 ring-gray-200 dark:bg-neutral-950 ${
          isSelected && "ring-2 ring-primary"
        }`}
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={course.image || "/placeholder-course.png"}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          <Badge className="absolute top-3 left-3 font-bold">
            {course.level}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center gap-2 text-sm text-yellow-500">
            <Star className="h-4 w-4 fill-yellow-500" />
            <span>4.9</span>

            <span className="text-muted-foreground">(1.2k Reviews)</span>
          </div>

          <h3 className="line-clamp-2 text-xl font-bold transition-colors group-hover:text-primary">
            {course.title}
          </h3>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {course.description}
          </p>

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{course?._count.enrollments ?? 0} students</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>12 Hours</span>
            </div>

            <p>
              By{" "}
              <span className="font-medium text-foreground">
                {course.instructor?.name || "Anonymous Instructor"}
              </span>
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between pt-8">
            <span className="text-3xl font-black">
              {formatPrice(course.price)}
            </span>

            <Badge variant="secondary">
              {isEnrolled ? "Enrolled" : "Enroll Now"}
            </Badge>
          </div>
        </div>
      </article>
    </div>
  )
}
