import SectionsAccordion from "@/components/app-ui/sections-accordion"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { Course } from "@/state/api.types"
import { BookOpen, GraduationCap } from "lucide-react"

interface ISelectedCourseProps {
  course: Course
  handleEnrollCourse: (courseId: number) => void
}

export default function SelectedCourse({
  course,
  handleEnrollCourse,
}: ISelectedCourseProps) {
  const lectureCount =
    course.sections?.reduce(
      (acc, section) => acc + section.lectures.length,
      0
    ) || 0
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-t-primary px-4 py-8">
      <div className="flex-1">
        <div>
          <h3 className="mb-2 text-2xl text-foreground">{course.title}</h3>
        </div>
        <div>
          <p className="mb-2 text-[1rem] text-gray-800 dark:text-gray-300">
            {course.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>{course.sections?.length ?? 0} Sections</span>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>{lectureCount} Lectures</span>
            </div>
          </div>

          <div className="h-40 overflow-y-scroll">
            <SectionsAccordion sections={course.sections || []} />
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p>{formatPrice(course.price)}</p>
        <Button
          onClick={() => handleEnrollCourse(course.id)}
          className="cursor-pointer"
        >
          Enroll Now
        </Button>
      </div>
    </aside>
  )
}
