"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react"
import { FileType2, Film } from "lucide-react"
import { nanoid } from "nanoid"

import { LessonBodyEditor } from "@/components/app-ui/lesson-body/lesson-body-editor"
import { QuizBuilder } from "@/components/app-ui/course-editor/quiz-builder"
import { MediaUploader } from "@/components/app-ui/media-uploader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { persistLessonBody, parseLessonBody } from "@/lib/lesson-body"
import {
  createEmptyQuiz,
  parseLessonQuiz,
  persistLessonQuiz,
  sameQuizContent,
} from "@/lib/lesson-quiz"
import { cn } from "@/lib/utils"
import { useUpdateLectureMutation } from "@/state/api"
import { Lecture, LectureType } from "@/state/api.types"

import type { EditorPanelHandle } from "./editor-panel-handle"

const LECTURE_TYPES: LectureType[] = ["Text", "Video", "Pdf", "Quiz"]

interface LectureCanvasProps {
  courseId: number
  lecture: Lecture
  onDirtyChange: (dirty: boolean) => void
  onSaving: () => void
  onSaved: () => void
  onError: () => void
}

function sameLessonContent(
  local: string | null,
  server: string | null | undefined
) {
  return (
    persistLessonBody(parseLessonBody(local)) ===
    persistLessonBody(parseLessonBody(server))
  )
}

function freshQuizContent() {
  return persistLessonQuiz(
    createEmptyQuiz({
      questionId: `q_${nanoid(8)}`,
      optionA: `opt_${nanoid(6)}`,
      optionB: `opt_${nanoid(6)}`,
    })
  )
}

export const LectureCanvas = forwardRef<EditorPanelHandle, LectureCanvasProps>(
  function LectureCanvas(
    { courseId, lecture, onDirtyChange, onSaving, onSaved, onError },
    ref
  ) {
    const [updateLecture] = useUpdateLectureMutation()
    const [title, setTitle] = useState(lecture.title)
    const [content, setContent] = useState<string | null>(
      lecture.content ?? null
    )
    const [type, setType] = useState<LectureType>(lecture.type)

    const serverTitle = lecture.title
    const serverType = lecture.type
    const isQuiz = type === "Quiz"

    const isDirty =
      title !== serverTitle ||
      type !== serverType ||
      (isQuiz
        ? !sameQuizContent(content, lecture.content)
        : !sameLessonContent(content, lecture.content))

    useEffect(() => {
      setTitle(lecture.title)
      setContent(lecture.content ?? null)
      setType(lecture.type)
    }, [lecture.id, lecture.title, lecture.content, lecture.type])

    useEffect(() => {
      onDirtyChange(isDirty)
    }, [isDirty, onDirtyChange])

    useImperativeHandle(
      ref,
      () => ({
        isDirty: () => isDirty,
        save: async () => {
          const trimmed = title.trim()
          if (!trimmed) return false

          onSaving()
          try {
            await updateLecture({
              lectureId: lecture.id,
              courseId,
              data: {
                title: trimmed,
                content,
                type,
              },
            }).unwrap()
            onSaved()
            return true
          } catch {
            onError()
            return false
          }
        },
      }),
      [
        isDirty,
        title,
        content,
        type,
        lecture.id,
        courseId,
        updateLecture,
        onSaving,
        onSaved,
        onError,
      ]
    )

    const selectType = (next: LectureType) => {
      if (next === type) return
      setType(next)
      if (next === "Quiz") {
        const existing = parseLessonQuiz(content)
        setContent(existing ? persistLessonQuiz(existing) : freshQuizContent())
      } else if (type === "Quiz") {
        setContent(null)
      }
    }

    const quizValue = useMemo(() => {
      const parsed = parseLessonQuiz(content)
      if (parsed) return parsed
      return createEmptyQuiz({
        questionId: `q_${nanoid(8)}`,
        optionA: `opt_${nanoid(6)}`,
        optionB: `opt_${nanoid(6)}`,
      })
    }, [content])

    return (
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
        <Label htmlFor="lecture-title" className="sr-only">
          Lesson title
        </Label>
        <Input
          id="lecture-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-display h-auto border-0 bg-transparent px-0 text-3xl tracking-tight shadow-none focus-visible:ring-0 md:text-4xl"
          placeholder="Lesson title"
        />

        <div className="mt-6 flex flex-wrap gap-2">
          {LECTURE_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => selectType(option)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                type === option
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Edits stay local until you click Save draft. Publish is separate and
          makes the course visible to students.
        </p>

        <div className="mt-10 space-y-8">
          {isQuiz ? (
            <section>
              <Label className="text-sm font-medium">Quiz</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Multiple-choice questions. Students submit answers in the
                player; a passing score marks the lesson complete.
              </p>
              <div className="mt-3">
                <QuizBuilder
                  value={quizValue}
                  onChange={(next) => setContent(persistLessonQuiz(next))}
                />
              </div>
            </section>
          ) : (
            <>
              <section>
                <Label className="text-sm font-medium">Lesson body</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Headings, lists, code, images, and sketches. Students see the
                  same layout in the player.
                </p>
                <LessonBodyEditor
                  key={lecture.id}
                  courseId={courseId}
                  lectureId={lecture.id}
                  initialContent={lecture.content}
                  onChange={setContent}
                  className="mt-3"
                />
              </section>

              <section className="rounded-xl border border-dashed border-border p-5">
                <div className="flex items-start gap-3">
                  <Film className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Video</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lecture.videoKey
                        ? `Attached: ${lecture.videoKey}`
                        : "Optional lesson video. Uploads go to S3 immediately."}
                    </p>
                    <MediaUploader
                      courseId={courseId}
                      lectureId={lecture.id}
                      kind="video"
                      onUploaded={async (key) => {
                        await updateLecture({
                          lectureId: lecture.id,
                          courseId,
                          data: { videoKey: key },
                        }).unwrap()
                      }}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-dashed border-border p-5">
                <div className="flex items-start gap-3">
                  <FileType2 className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">PDF / worksheet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lecture.pdfKey
                        ? `Attached: ${lecture.pdfKey}`
                        : "Optional PDF. Saved on the lecture when upload finishes."}
                    </p>
                    <MediaUploader
                      courseId={courseId}
                      lectureId={lecture.id}
                      kind="pdf"
                      onUploaded={async (key) => {
                        await updateLecture({
                          lectureId: lecture.id,
                          courseId,
                          data: { pdfKey: key },
                        }).unwrap()
                      }}
                    />
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    )
  }
)
