"use client"

import { CoursePlayerShell } from "@/components/app-ui/course-player/course-player-shell"
import { use } from "react"

export default function LearnCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId: raw } = use(params)
  const courseId = Number.parseInt(raw, 10)

  if (!Number.isFinite(courseId) || courseId < 1) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Invalid course.
      </div>
    )
  }

  return <CoursePlayerShell courseId={courseId} />
}
