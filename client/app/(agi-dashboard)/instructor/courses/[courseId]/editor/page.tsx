"use client"

import { use } from "react"

import { CourseEditorShell } from "@/components/app-ui/course-editor/course-editor-shell"

export default function InstructorCourseEditorPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId: rawId } = use(params)
  const courseId = Number.parseInt(rawId, 10)

  if (!Number.isInteger(courseId) || courseId < 1) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Invalid course id.
      </div>
    )
  }

  return <CourseEditorShell courseId={courseId} />
}
