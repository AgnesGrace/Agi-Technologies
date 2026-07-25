import { formatPrice } from "@/lib/utils"
import { Course } from "@/state/api.types"
import Image from "next/image"

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
  return (
    <div
      onClick={onClick}
      className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-md border bg-white transition-all duration-200 hover:shadow-md dark:bg-neutral-950 ${
        isSelected
          ? "border-primary ring-1 ring-blue-300 dark:border-blue-500"
          : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden border-b border-neutral-100 bg-neutral-100 dark:border-neutral-900 dark:bg-neutral-900">
        <Image
          src={course.image || "/placeholder-course.png"}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-102"
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
        />
        <span className="text-4xs absolute bottom-2 left-2 rounded bg-neutral-900/80 px-1.5 py-0.5 font-bold tracking-wider text-white uppercase">
          {course.level}
        </span>
      </div>

      <div className="flex grow flex-col justify-between p-2">
        <div>
          <h3 className="mt-0.5 text-sm font-bold text-gray-700 group-hover:text-primary dark:text-neutral-100">
            {course.title}
          </h3>
          <p className="text-2xs mt-1 line-clamp-2 text-gray-600 dark:text-gray-400">
            {course.description}
          </p>
        </div>

        <div className="mt-3 border-t border-neutral-50 pt-2 dark:border-neutral-900/50">
          <p className="text-2xs font-medium text-gray-400 dark:text-neutral-500">
            By {course.instructor?.name || "Anonymous Instructor"}
          </p>
          <div className="mt-1.5 flex items-baseline justify-between pt-2 pb-7">
            <span className="text-base font-black text-neutral-900 dark:text-white">
              {formatPrice(course.price)}
            </span>
            <span className="text-3xs rounded bg-neutral-50 p-1 font-medium text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
              {course.enrollments?.length || 0} students
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
