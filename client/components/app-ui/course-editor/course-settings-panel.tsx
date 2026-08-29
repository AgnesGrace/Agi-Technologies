"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"

import { MediaUploader } from "@/components/app-ui/media-uploader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPrice } from "@/lib/utils"
import { useUpdateCourseMetadataMutation } from "@/state/api"
import { CourseEditor, CourseLevel } from "@/state/api.types"

import type { EditorPanelHandle } from "./editor-panel-handle"

const LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"]

interface CourseSettingsPanelProps {
  course: CourseEditor
  onDirtyChange: (dirty: boolean) => void
  onSaving: () => void
  onSaved: () => void
  onError: () => void
}

export const CourseSettingsPanel = forwardRef<
  EditorPanelHandle,
  CourseSettingsPanelProps
>(function CourseSettingsPanel(
  { course, onDirtyChange, onSaving, onSaved, onError },
  ref
) {
  const [updateCourse] = useUpdateCourseMetadataMutation()
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description ?? "")
  const [category, setCategory] = useState(course.category)
  const [level, setLevel] = useState<CourseLevel>(course.level)
  const [priceDollars, setPriceDollars] = useState(
    (course.price / 100).toFixed(2)
  )

  const serverDescription = course.description ?? ""
  const serverPriceLabel = (course.price / 100).toFixed(2)

  const isDirty =
    title !== course.title ||
    description !== serverDescription ||
    category !== course.category ||
    level !== course.level ||
    priceDollars !== serverPriceLabel

  useEffect(() => {
    setTitle(course.title)
    setDescription(course.description ?? "")
    setCategory(course.category)
    setLevel(course.level)
    setPriceDollars((course.price / 100).toFixed(2))
  }, [
    course.id,
    course.title,
    course.description,
    course.category,
    course.level,
    course.price,
  ])

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  useImperativeHandle(
    ref,
    () => ({
      isDirty: () => isDirty,
      save: async () => {
        const trimmedTitle = title.trim()
        const trimmedCategory = category.trim()
        if (!trimmedTitle || !trimmedCategory) return false

        const dollars = Number.parseFloat(priceDollars)
        if (!Number.isFinite(dollars) || dollars < 0) return false
        const cents = Math.round(dollars * 100)

        onSaving()
        try {
          await updateCourse({
            courseId: course.id,
            data: {
              title: trimmedTitle,
              description: description.length > 0 ? description : null,
              category: trimmedCategory,
              level,
              price: cents,
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
      description,
      category,
      level,
      priceDollars,
      course.id,
      updateCourse,
      onSaving,
      onSaved,
      onError,
    ]
  )

  return (
    <div className="mx-auto max-w-xl px-6 py-8 sm:px-10">
      <h2 className="font-display text-2xl tracking-tight">Course settings</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Metadata only. Click Save draft when ready — Publish is what makes the
        course visible in the catalog.
      </p>

      <div className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="course-title">Title</Label>
          <Input
            id="course-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-description">Description</Label>
          <Textarea
            id="course-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-28"
            placeholder="What will students be able to build?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-category">Category</Label>
          <Input
            id="course-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Level</Label>
          <Select
            value={level}
            onValueChange={(value) => {
              if (!value) return
              setLevel(value as CourseLevel)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-price">Price (USD)</Label>
          <Input
            id="course-price"
            inputMode="decimal"
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Stored as cents. Preview:{" "}
            {formatPrice(
              Number.isFinite(Number.parseFloat(priceDollars))
                ? Math.round(Number.parseFloat(priceDollars) * 100)
                : course.price
            )}{" "}
            · use 0 for free.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-border p-5">
          <p className="text-sm font-medium">Cover image</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {course.image
              ? `Stored key: ${course.image}`
              : "JPEG, PNG, or WebP. Uploads go to S3; the key is saved on this course."}
          </p>
          {(course.imageUrl ||
            course.image?.startsWith("http") ||
            course.image?.startsWith("/")) && (
            <div className="relative mt-3 aspect-video overflow-hidden rounded-lg border border-border">
              {/* Preview uses signed imageUrl from the API */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.imageUrl || course.image || ""}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <MediaUploader
            courseId={course.id}
            kind="cover"
            onUploaded={async (key) => {
              await updateCourse({
                courseId: course.id,
                data: { image: key },
              }).unwrap()
            }}
          />
        </div>
      </div>
    </div>
  )
})
