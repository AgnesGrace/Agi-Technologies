"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ExternalLink,
  FileType2,
  Film,
  LoaderCircle,
  Play,
  RotateCcw,
  SkipForward,
} from "lucide-react"

import { LessonBodyViewer } from "@/components/app-ui/lesson-body/lesson-body-viewer"
import { QuizPlayer } from "@/components/app-ui/course-player/quiz-player"
import { Button } from "@/components/ui/button"
import { isEmptyLessonBody, parseLessonBody } from "@/lib/lesson-body"
import { parsePublicLessonQuiz } from "@/lib/lesson-quiz"
import { useCreateDownloadPresignMutation } from "@/state/api"
import { Lecture } from "@/state/api.types"

interface PlayerLessonProps {
  courseId: number
  lecture: Lecture
  hasNext: boolean
  nextTitle?: string | null
  autoPlayNext: boolean
  onVideoComplete: (opts: { advance: boolean }) => void
}

export function PlayerLesson({
  courseId,
  lecture,
  hasNext,
  nextTitle,
  autoPlayNext,
  onVideoComplete,
}: PlayerLessonProps) {
  const [presignDownload] = useCreateDownloadPresignMutation()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [showEndCard, setShowEndCard] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const advanceFiredRef = useRef(false)

  useEffect(() => {
    setVideoUrl(null)
    setPdfUrl(null)
    setVideoError(null)
    setPdfError(null)
    setShowEndCard(false)
    setCountdown(null)
    advanceFiredRef.current = false

    let cancelled = false

    const load = async () => {
      if (lecture.videoKey) {
        setVideoLoading(true)
        try {
          const result = await presignDownload({
            courseId,
            lectureId: lecture.id,
            kind: "video",
          }).unwrap()
          if (!cancelled) setVideoUrl(result.downloadUrl)
        } catch {
          if (!cancelled) {
            setVideoError("Unable to load video. Try refreshing the page.")
          }
        } finally {
          if (!cancelled) setVideoLoading(false)
        }
      }

      if (lecture.pdfKey) {
        setPdfLoading(true)
        try {
          const result = await presignDownload({
            courseId,
            lectureId: lecture.id,
            kind: "pdf",
          }).unwrap()
          if (!cancelled) setPdfUrl(result.downloadUrl)
        } catch {
          if (!cancelled) {
            setPdfError("Unable to load PDF. Try refreshing the page.")
          }
        } finally {
          if (!cancelled) setPdfLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [
    courseId,
    lecture.id,
    lecture.videoKey,
    lecture.pdfKey,
    presignDownload,
  ])

  const goNext = useCallback(() => {
    if (advanceFiredRef.current) return
    advanceFiredRef.current = true
    setCountdown(null)
    setShowEndCard(false)
    onVideoComplete({ advance: true })
  }, [onVideoComplete])

  const stayHere = useCallback(() => {
    setCountdown(null)
    setShowEndCard(true)
    onVideoComplete({ advance: false })
  }, [onVideoComplete])

  const handleEnded = () => {
    setShowEndCard(true)
    stayHere()
    if (autoPlayNext && hasNext) {
      setCountdown(5)
    }
  }

  // Countdown → auto advance
  useEffect(() => {
    if (countdown == null) return
    if (countdown <= 0) {
      goNext()
      return
    }
    const timer = window.setTimeout(() => {
      setCountdown((c) => (c == null ? null : c - 1))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, goNext])

  const replay = () => {
    setShowEndCard(false)
    setCountdown(null)
    advanceFiredRef.current = false
    const el = videoRef.current
    if (!el) return
    el.currentTime = 0
    void el.play()
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {lecture.type}
      </p>
      <h1 className="font-display mt-2 text-3xl tracking-tight md:text-4xl">
        {lecture.title}
      </h1>

      <div className="mt-10 space-y-8">
        {lecture.type === "Quiz" ? (
          <QuizPlayer
            courseId={courseId}
            lectureId={lecture.id}
            content={lecture.content}
            onPassed={() => onVideoComplete({ advance: false })}
          />
        ) : (
          <>
            {(lecture.type === "Video" || lecture.videoKey) && (
          <section className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
            {!lecture.videoKey ? (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
                <Film className="size-8 opacity-40" />
                <p>No video attached to this lesson yet.</p>
              </div>
            ) : videoLoading ? (
              <div className="flex aspect-video items-center justify-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading video…
              </div>
            ) : videoError ? (
              <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-destructive">
                {videoError}
              </div>
            ) : videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  key={videoUrl}
                  controls
                  playsInline
                  className="aspect-video w-full bg-black"
                  src={videoUrl}
                  onEnded={handleEnded}
                >
                  Your browser does not support video playback.
                </video>

                {showEndCard && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/75 px-6 text-center text-white backdrop-blur-[2px]">
                    <p className="font-display text-xl tracking-tight">
                      Lesson finished
                    </p>
                    {hasNext && countdown != null ? (
                      <p className="max-w-sm text-sm text-white/80">
                        Next up in {countdown}s
                        {nextTitle ? (
                          <>
                            : <span className="text-white">{nextTitle}</span>
                          </>
                        ) : null}
                      </p>
                    ) : hasNext ? (
                      <p className="max-w-sm text-sm text-white/80">
                        Ready for the next lesson
                        {nextTitle ? (
                          <>
                            : <span className="text-white">{nextTitle}</span>
                          </>
                        ) : null}
                      </p>
                    ) : (
                      <p className="text-sm text-white/80">
                        You’ve reached the end of this course outline.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={replay}
                      >
                        <RotateCcw className="size-3.5" />
                        Replay
                      </Button>
                      {hasNext && countdown != null && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                          onClick={() => {
                            setCountdown(null)
                            setShowEndCard(true)
                          }}
                        >
                          Cancel autoplay
                        </Button>
                      )}
                      {hasNext && (
                        <Button type="button" size="sm" onClick={goNext}>
                          <SkipForward className="size-3.5" />
                          {countdown != null ? "Play now" : "Next lesson"}
                        </Button>
                      )}
                      {!hasNext && (
                        <Button type="button" size="sm" onClick={stayHere}>
                          <Play className="size-3.5" />
                          Done
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </section>
        )}

        {lecture.content &&
        !parsePublicLessonQuiz(lecture.content) &&
        !isEmptyLessonBody(parseLessonBody(lecture.content)) ? (
          <section>
            <LessonBodyViewer
              courseId={courseId}
              lectureId={lecture.id}
              content={lecture.content}
            />
          </section>
        ) : !lecture.videoKey ? (
          <p className="text-sm text-muted-foreground">
            This lesson has no written content yet.
          </p>
        ) : null}

        {(lecture.type === "Pdf" || lecture.pdfKey) && (
          <section className="rounded-xl border border-dashed border-border p-5">
            <div className="flex items-start gap-3">
              <FileType2 className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Worksheet / PDF</p>
                {!lecture.pdfKey ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    No PDF attached yet.
                  </p>
                ) : pdfLoading ? (
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Preparing secure link…
                  </p>
                ) : pdfError ? (
                  <p className="mt-2 text-sm text-destructive">{pdfError}</p>
                ) : pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <ExternalLink className="size-3.5" />
                    Open PDF
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        )}
          </>
        )}
      </div>
    </article>
  )
}
