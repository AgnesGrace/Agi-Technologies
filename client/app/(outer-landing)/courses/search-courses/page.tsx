import { LoadingCourseSpinner } from "@/components/ui/spinner"
import { Suspense } from "react"
import CourseSearchContent from "./course-search-content"

export default function CourseSearch() {
  return (
    <Suspense fallback={<LoadingCourseSpinner />}>
      <CourseSearchContent />
    </Suspense>
  )
}
