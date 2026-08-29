"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  ClipboardList,
  CloudUpload,
  LoaderCircle,
  Save,
  Settings2,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  buildPublishSnapshotFromCourseEditor,
  evaluateCoursePublishReadiness,
} from "@/lib/course-publish-readiness"
import { cn } from "@/lib/utils"
import {
  useDeleteCourseMutation,
  useGetInstructorCourseQuery,
  useUpdateCourseMetadataMutation,
} from "@/state/api"
import { Lecture } from "@/state/api.types"

import { CourseOutlinePanel } from "./course-outline-panel"
import { LectureCanvas } from "./lecture-canvas"
import { CourseSettingsPanel } from "./course-settings-panel"
import { PublishChecklistPanel } from "./publish-checklist-panel"
import type { EditorPanelHandle } from "./editor-panel-handle"

type SaveState = "idle" | "saving" | "saved" | "error" | "dirty"

export function CourseEditorShell({ courseId }: { courseId: number }) {
  const router = useRouter()
  const {
    data: course,
    isLoading,
    isError,
  } = useGetInstructorCourseQuery(courseId)
  const [updateCourse, { isLoading: isPublishing }] =
    useUpdateCourseMetadataMutation()
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation()

  const [selectedLectureId, setSelectedLectureId] = useState<number | null>(
    null
  )
  const [showSettings, setShowSettings] = useState(false)
  const [showPublishChecklist, setShowPublishChecklist] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [isDirty, setIsDirty] = useState(false)
  const panelRef = useRef<EditorPanelHandle>(null)

  const publishReadiness = useMemo(() => {
    if (!course) return null
    return evaluateCoursePublishReadiness(
      buildPublishSnapshotFromCourseEditor(course)
    )
  }, [course])

  const lectures = useMemo(() => {
    return (course?.sections ?? []).flatMap((section) =>
      (section.lectures ?? []).map((lecture) => ({
        ...lecture,
        sectionId: section.id,
      }))
    )
  }, [course?.sections])

  useEffect(() => {
    if (!course) return
    if (selectedLectureId == null) {
      const first = course.sections[0]?.lectures?.[0]
      if (first) setSelectedLectureId(first.id)
      return
    }
    const stillExists = lectures.some((l) => l.id === selectedLectureId)
    if (!stillExists) {
      setSelectedLectureId(lectures[0]?.id ?? null)
    }
  }, [course, lectures, selectedLectureId])

  const selectedLecture: Lecture | null = useMemo(() => {
    if (selectedLectureId == null) return null
    return lectures.find((l) => l.id === selectedLectureId) ?? null
  }, [lectures, selectedLectureId])

  const handleDirtyChange = useCallback((dirty: boolean) => {
    setIsDirty((prev) => (prev === dirty ? prev : dirty))
    setSaveState((prev) => {
      if (dirty) return prev === "dirty" ? prev : "dirty"
      if (prev === "saving" || prev === "error") return prev
      return prev === "saved" ? "saved" : prev === "idle" ? prev : "idle"
    })
  }, [])

  const confirmLeaveUnsaved = () => {
    if (!isDirty) return true
    return window.confirm(
      "You have unsaved changes. Leave without saving this draft?"
    )
  }

  const handleSaveDraft = useCallback(async () => {
    const panel = panelRef.current
    if (!panel) return false
    if (!panel.isDirty()) {
      toast.message("Nothing to save")
      return true
    }
    const ok = await panel.save()
    if (ok) toast.success("Draft saved")
    return ok
  }, [])

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "s"
      ) {
        return
      }
      event.preventDefault()
      void handleSaveDraft()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleSaveDraft])

  const handlePublish = async () => {
    if (!course || !publishReadiness) return

    if (isDirty) {
      const saveFirst = window.confirm(
        "You have unsaved edits. Save draft before changing publish status?"
      )
      if (saveFirst) {
        const saved = await handleSaveDraft()
        if (!saved) return
      } else {
        return
      }
    }

    const goingLive = course.status !== "Published"
    if (goingLive) {
      if (!publishReadiness.canPublish) {
        setShowSettings(false)
        setShowPublishChecklist(true)
        toast.error(
          `Finish the publish checklist first (${publishReadiness.unmetLabels.join(", ")}).`
        )
        return
      }

      const ok = window.confirm(
        "Publish this course? Students will see it in the catalog."
      )
      if (!ok) return
    }

    try {
      await updateCourse({
        courseId,
        data: {
          status: goingLive ? "Published" : "Draft",
        },
      }).unwrap()
      setShowPublishChecklist(false)
      toast.success(
        goingLive ? "Course published." : "Course moved back to draft."
      )
    } catch {
      /* toast from baseQuery */
    }
  }

  const handleDelete = async () => {
    if (!course) return
    const ok = window.confirm(
      `Delete “${course.title}”? This cannot be undone.`
    )
    if (!ok) return
    try {
      await deleteCourse(courseId).unwrap()
      router.push("/instructor/courses")
    } catch {
      /* handled */
    }
  }

  const selectLecture = (id: number) => {
    if (id === selectedLectureId && !showSettings && !showPublishChecklist) {
      return
    }
    if (!confirmLeaveUnsaved()) return
    setSelectedLectureId(id)
    setShowSettings(false)
    setShowPublishChecklist(false)
  }

  const toggleSettings = () => {
    if (!confirmLeaveUnsaved()) return
    setShowPublishChecklist(false)
    setShowSettings((v) => !v)
  }

  const togglePublishChecklist = () => {
    if (!confirmLeaveUnsaved()) return
    setShowSettings(false)
    setShowPublishChecklist((v) => !v)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-xl">Course not found</p>
        <Link
          href="/instructor/courses"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to courses
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/instructor/courses"
          className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to courses"
          onClick={(e) => {
            if (!confirmLeaveUnsaved()) e.preventDefault()
          }}
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-lg tracking-tight sm:text-xl">
              {course.title}
            </h1>
            <Badge variant="secondary">{course.status}</Badge>
            {course.status === "Draft" && publishReadiness && (
              <Badge
                variant={publishReadiness.canPublish ? "default" : "outline"}
              >
                {
                  publishReadiness.requirements.filter((item) => item.isMet)
                    .length
                }
                /{publishReadiness.requirements.length} publish-ready
              </Badge>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveState === "saving" && (
              <>
                <LoaderCircle className="size-3 animate-spin" />
                Saving draft…
              </>
            )}
            {saveState === "saved" && !isDirty && (
              <>
                <Check className="size-3 text-primary" />
                Draft saved
              </>
            )}
            {saveState === "dirty" && (
              <span className="text-amber-700 dark:text-amber-400">
                Unsaved changes
              </span>
            )}
            {saveState === "idle" &&
              "Save draft when ready · Publish to go live"}
            {saveState === "error" && (
              <span className="text-destructive">Save failed — retry</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant={showPublishChecklist ? "secondary" : "outline"}
            size="sm"
            onClick={togglePublishChecklist}
          >
            <ClipboardList className="size-4" />
            <span className="hidden sm:inline">Checklist</span>
          </Button>

          <Button
            type="button"
            variant={showSettings ? "secondary" : "outline"}
            size="sm"
            onClick={toggleSettings}
          >
            <Settings2 className="size-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void handleSaveDraft()}
            disabled={saveState === "saving" || !isDirty}
          >
            <Save className="size-4" />
            Save draft
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => void handlePublish()}
            disabled={isPublishing}
          >
            {course.status === "Published" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <CourseOutlinePanel
          courseId={courseId}
          sections={course.sections}
          selectedLectureId={selectedLectureId}
          onSelectLecture={selectLecture}
        />

        <div className="min-w-0 flex-1 overflow-y-auto">
          {showPublishChecklist && publishReadiness ? (
            <div className="mx-auto max-w-lg px-6 py-8 sm:px-10">
              <PublishChecklistPanel readiness={publishReadiness} />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPublishChecklist(false)
                    setShowSettings(true)
                  }}
                >
                  Open settings
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    isPublishing ||
                    (course.status === "Draft" && !publishReadiness.canPublish)
                  }
                  onClick={() => void handlePublish()}
                >
                  {course.status === "Published" ? "Unpublish" : "Publish"}
                </Button>
              </div>
            </div>
          ) : showSettings ? (
            <CourseSettingsPanel
              ref={panelRef}
              course={course}
              onDirtyChange={handleDirtyChange}
              onSaving={() => setSaveState("saving")}
              onSaved={() => {
                setIsDirty(false)
                setSaveState("saved")
                window.setTimeout(() => {
                  setSaveState((prev) => (prev === "saved" ? "idle" : prev))
                }, 1600)
              }}
              onError={() => setSaveState("error")}
            />
          ) : selectedLecture ? (
            <LectureCanvas
              ref={panelRef}
              courseId={courseId}
              lecture={selectedLecture}
              onDirtyChange={handleDirtyChange}
              onSaving={() => setSaveState("saving")}
              onSaved={() => {
                setIsDirty(false)
                setSaveState("saved")
                window.setTimeout(() => {
                  setSaveState((prev) => (prev === "saved" ? "idle" : prev))
                }, 1600)
              }}
              onError={() => setSaveState("error")}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
              <CloudUpload className="size-10 text-muted-foreground/50" />
              <p className="font-display text-xl tracking-tight">
                Add your first lesson
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Create a section in the outline, then add a lecture. Use Save
                draft for content — finish the checklist before Publish.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
