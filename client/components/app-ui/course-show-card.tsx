import { Course } from "@/state/api.types"
import { CourseCoverImage } from "@/components/app-ui/course-cover-image"
import { formatPrice } from "@/lib/utils"

export default function CourseShowCard({ course }: { course: Course }) {
  return (
    <div className="space-y-10 sm:max-w-[80vw] md:max-w-[35vw]">
      <div className="flex w-full flex-col gap-5 rounded-lg bg-gray-800 px-10 py-8">
        <div className="bg-white-50 relative mb-2 aspect-video overflow-hidden rounded-md">
          <CourseCoverImage
            image={course.image}
            imageUrl={course.imageUrl}
            alt={course.title}
            fill
          />
        </div>
        <div>
          <h3 className="mb-2 text-3xl font-bold text-white">{course.title}</h3>
          <p className="text-md mb-4 text-gray-400">
            {course.instructor?.name}
          </p>
          <p className="text-sm text-gray-400">{course.description}</p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-5 rounded-lg bg-gray-700 px-10 py-8 text-white">
        <h3 className="mb-4 text-xl">Price</h3>
        <div className="mb-4 flex justify-between">
          <span>{course.title}</span>
          <span>{formatPrice(course.price)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-500 pt-4">
          <span>Total</span>
          <span>{formatPrice(course.price)}</span>
        </div>
      </div>
    </div>
  )
}
