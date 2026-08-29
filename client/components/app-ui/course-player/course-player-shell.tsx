"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  PanelLeft,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  useGetLearningCourseQuery,
  useMarkLectureCompleteMutation,
  useMarkLectureIncompleteMutation,
} from "@/state/api"
import { Lecture } from "@/state/api.types"
import { dashboardCoursesPath, normalizeUserRole } from "@/lib/user-role"
import { useUser } from "@clerk/nextjs"

import { PlayerLesson } from "./player-lesson"
import { PlayerOutline } from "./player-outline"

const AUTOPLAY_STORAGE_KEY = "agi-learn-autoplay-next"

export function CoursePlayerShell({ courseId }: { courseId: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const role = normalizeUserRole(
    user?.publicMetadata?.userRole as string | undefined
  )
  const backHref = role ? dashboardCoursesPath(role) : "/user/courses"

  const lectureFromUrl = Number.parseInt(
    searchParams.get("lectureId") ?? "",
    10
  )
  const [selectedLectureId, setSelectedLectureId] = useState<number | null>(
    Number.isFinite(lectureFromUrl) ? lectureFromUrl : null
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [autoPlayNext, setAutoPlayNext] = useState(false)

  useEffect(() => {
    try {
      setAutoPlayNext(localStorage.getItem(AUTOPLAY_STORAGE_KEY) === "1")
    } catch {
      /* private mode */
    }
  }, [])

  const persistAutoPlay = (value: boolean) => {
    setAutoPlayNext(value)
    try {
      localStorage.setItem(AUTOPLAY_STORAGE_KEY, value ? "1" : "0")
    } catch {
      /* ignore */
    }
  }

  const { data, isLoading, isError, isFetching } = useGetLearningCourseQuery({
    courseId,
    lectureId: selectedLectureId ?? undefined,
  })

  const [markComplete, { isLoading: completing }] =
    useMarkLectureCompleteMutation()
  const [markIncomplete, { isLoading: incompleting }] =
    useMarkLectureIncompleteMutation()

  const lectures = useMemo(() => {
    return (data?.course.sections ?? []).flatMap((section) =>
      (section.lectures ?? []).map((lecture) => lecture)
    )
  }, [data?.course.sections])

  const completedSet = useMemo(
    () => new Set(data?.progress.completedLectureIds ?? []),
    [data?.progress.completedLectureIds]
  )

  useEffect(() => {
    if (!data || lectures.length === 0) return

    if (
      selectedLectureId != null &&
      lectures.some((l) => l.id === selectedLectureId)
    ) {
      return
    }

    const resumeId =
      data.progress.lastLectureId &&
      lectures.some((l) => l.id === data.progress.lastLectureId)
        ? data.progress.lastLectureId
        : lectures[0]!.id

    setSelectedLectureId(resumeId)
  }, [data, lectures, selectedLectureId])

  useEffect(() => {
    if (selectedLectureId == null) return
    const current = searchParams.get("lectureId")
    if (current === String(selectedLectureId)) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("lectureId", String(selectedLectureId))
    router.replace(`/learn/${courseId}?${params.toString()}`, { scroll: false })
  }, [selectedLectureId, courseId, router, searchParams])

  const selectedLecture: Lecture | null = useMemo(() => {
    if (selectedLectureId == null) return null
    return lectures.find((l) => l.id === selectedLectureId) ?? null
  }, [lectures, selectedLectureId])

  const currentIndex = useMemo(() => {
    if (selectedLectureId == null) return -1
    return lectures.findIndex((l) => l.id === selectedLectureId)
  }, [lectures, selectedLectureId])

  const nextLecture =
    currentIndex >= 0 ? (lectures[currentIndex + 1] ?? null) : null

  const selectLecture = (id: number) => {
    setSelectedLectureId(id)
  }

  const goRelative = (delta: number) => {
    const next = lectures[currentIndex + delta]
    if (next) setSelectedLectureId(next.id)
  }

  const ensureComplete = useCallback(
    async (lectureId: number) => {
      if (data?.isInstructorPreview) return
      if (completedSet.has(lectureId)) return
      try {
        await markComplete({ courseId, lectureId }).unwrap()
      } catch {
        /* toast from api */
      }
    },
    [completedSet, courseId, data?.isInstructorPreview, markComplete]
  )

  const handleVideoComplete = useCallback(
    async ({ advance }: { advance: boolean }) => {
      if (selectedLectureId == null) return
      await ensureComplete(selectedLectureId)
      if (advance && nextLecture) {
        setSelectedLectureId(nextLecture.id)
      }
    },
    [ensureComplete, nextLecture, selectedLectureId]
  )

  const toggleComplete = async () => {
    if (!selectedLecture || data?.isInstructorPreview) return
    const done = completedSet.has(selectedLecture.id)
    try {
      if (done) {
        await markIncomplete({
          courseId,
          lectureId: selectedLecture.id,
        }).unwrap()
      } else {
        await markComplete({
          courseId,
          lectureId: selectedLecture.id,
        }).unwrap()
        const next = lectures[currentIndex + 1]
        if (next) setSelectedLectureId(next.id)
      }
    } catch {
      /* toast from api */
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-xl">Unable to open this course</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          You may need to enroll first, or the course may no longer be
          available.
        </p>
        <Link
          href={backHref}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to courses
        </Link>
      </div>
    )
  }

  const { course, progress, isInstructorPreview } = data
  const isDone = selectedLecture != null && completedSet.has(selectedLecture.id)

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href={backHref}
          className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to courses"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <Button
          type="button"
          variant={sidebarOpen ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-pressed={sidebarOpen}
          aria-label={
            sidebarOpen ? "Hide course content" : "Show course content"
          }
        >
          <PanelLeft className="size-4" />
          <span className="hidden sm:inline">Contents</span>
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-lg tracking-tight sm:text-xl">
              {course.title}
            </h1>
            {isInstructorPreview && <Badge variant="secondary">Preview</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {Math.round(progress.overallProgress)}% complete
            {isFetching ? " · syncing…" : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label className="mr-1 hidden items-center gap-2 sm:flex">
            <Switch
              size="sm"
              checked={autoPlayNext}
              onCheckedChange={(checked) => persistAutoPlay(Boolean(checked))}
              aria-label="Autoplay next lesson when video ends"
            />
            <Label className="cursor-pointer text-xs font-normal text-muted-foreground">
              Autoplay next
            </Label>
          </label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentIndex <= 0}
            onClick={() => goRelative(-1)}
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentIndex < 0 || currentIndex >= lectures.length - 1}
            onClick={() => goRelative(1)}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={
              !selectedLecture ||
              isInstructorPreview ||
              completing ||
              incompleting
            }
            onClick={() => void toggleComplete()}
          >
            {isDone ? (
              <>
                <CheckCircle2 className="size-4" />
                Completed
              </>
            ) : (
              <>
                <Circle className="size-4" />
                Mark complete
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-end gap-2 border-b border-border px-4 py-2 sm:hidden">
        <Switch
          size="sm"
          checked={autoPlayNext}
          onCheckedChange={(checked) => persistAutoPlay(Boolean(checked))}
          aria-label="Autoplay next lesson when video ends"
        />
        <span className="text-xs text-muted-foreground">Autoplay next</span>
      </div>

      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${Math.min(100, Math.max(0, progress.overallProgress))}%`,
          }}
        />
      </div>

      <div className="flex min-h-0 flex-1">
        {sidebarOpen && (
          <PlayerOutline
            sections={course.sections}
            selectedLectureId={selectedLectureId}
            completedLectureIds={completedSet}
            onSelectLecture={selectLecture}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <div className="relative min-w-0 flex-1 overflow-y-auto">
          {!sidebarOpen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute top-4 left-4 z-10 shadow-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <PanelLeft className="size-4" />
              Contents
            </Button>
          )}
          {selectedLecture ? (
            <PlayerLesson
              courseId={courseId}
              lecture={selectedLecture}
              hasNext={Boolean(nextLecture)}
              nextTitle={nextLecture?.title ?? null}
              autoPlayNext={autoPlayNext}
              onVideoComplete={handleVideoComplete}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-sm text-muted-foreground">
              Select a lesson from the outline to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
