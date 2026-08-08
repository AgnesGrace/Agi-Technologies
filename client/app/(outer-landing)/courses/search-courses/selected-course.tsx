import SectionsAccordion from "@/components/app-ui/sections-accordion"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { Course } from "@/state/api.types"
import { BookOpen, GraduationCap, Layers3 } from "lucide-react"

interface ISelectedCourseProps {
  course: Course
  handleEnrollCourse: (courseSlug: string) => void
}

export default function SelectedCourse({
  course,
  handleEnrollCourse,
}: ISelectedCourseProps) {
  const sectionCount = course.sections?.length ?? 0

  const lectureCount =
    course.sections?.reduce(
      (acc, section) => acc + section.lectures.length,
      0
    ) ?? 0

  return (
    <aside className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="p-6">
        <div className="mb-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <BookOpen className="h-4 w-4" />
            Course overview
          </div>

          <h2 className="text-xl leading-tight font-semibold tracking-tight">
            {course.title}
          </h2>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {course.description}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium">
            <Layers3 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {sectionCount} {sectionCount === 1 ? "Section" : "Sections"}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium">
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {lectureCount} {lectureCount === 1 ? "Lecture" : "Lectures"}
            </span>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Course curriculum</p>

          <div className="max-h-72 overflow-y-auto pr-2">
            <SectionsAccordion sections={course.sections ?? []} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t bg-muted/20 px-6 py-5">
        <div>
          <p className="text-xs text-muted-foreground">Course price</p>
          <p className="text-xl font-semibold tracking-tight">
            {formatPrice(course.price)}
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => handleEnrollCourse(course.slug)}
          className="min-w-32"
        >
          Enroll now
        </Button>
      </div>
    </aside>
  )
}
