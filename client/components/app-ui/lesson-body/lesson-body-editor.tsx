"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"

import { createLessonBodyExtensions } from "@/components/app-ui/lesson-body/extensions"
import { LessonBodyBubbleMenu } from "@/components/app-ui/lesson-body/lesson-body-bubble-menu"
import { LessonBodyToolbar } from "@/components/app-ui/lesson-body/lesson-body-toolbar"
import {
  collectLessonImageKeys,
  parseLessonBody,
  persistLessonBody,
  withResolvedImageSrcs,
} from "@/lib/lesson-body"
import {
  useCreateDownloadPresignMutation,
  useCreateUploadPresignMutation,
} from "@/state/api"
import { cn } from "@/lib/utils"

interface LessonBodyEditorProps {
  courseId: number
  lectureId: number
  initialContent: string | null | undefined
  onChange: (serialized: string | null) => void
  className?: string
}

export function LessonBodyEditor({
  courseId,
  lectureId,
  initialContent,
  onChange,
  className,
}: LessonBodyEditorProps) {
  const [presignUpload] = useCreateUploadPresignMutation()
  const [presignDownload] = useCreateDownloadPresignMutation()
  const [uploadingImage, setUploadingImage] = useState(false)
  const [booting, setBooting] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialContentRef = useRef(initialContent)
  const onChangeRef = useRef(onChange)
  const lastEmittedRef = useRef<string | null | undefined>(undefined)
  onChangeRef.current = onChange

  const editor = useEditor({
    extensions: createLessonBodyExtensions({ editable: true }),
    content: parseLessonBody(null),
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: "lesson-body lesson-body--editable focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      const next = persistLessonBody(current.getJSON())
      if (next === lastEmittedRef.current) return
      lastEmittedRef.current = next
      onChangeRef.current(next)
    },
  })

  useEffect(() => {
    if (!editor) return

    let cancelled = false

    const boot = async () => {
      setBooting(true)
      const parsed = parseLessonBody(initialContentRef.current)
      const keys = collectLessonImageKeys(parsed)
      const urlByKey: Record<string, string> = {}

      await Promise.all(
        keys.map(async (key) => {
          try {
            const result = await presignDownload({
              courseId,
              kind: "image",
              key,
              lectureId,
            }).unwrap()
            urlByKey[key] = result.downloadUrl
          } catch {}
        })
      )

      if (cancelled) return

      editor.commands.setContent(withResolvedImageSrcs(parsed, urlByKey), {
        emitUpdate: false,
      })
      setBooting(false)
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [editor, courseId, lectureId, presignDownload])

  const insertImage = () => fileInputRef.current?.click()

  const onImageFile = async (file: File | undefined) => {
    if (!file || !editor) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images must be 5 MB or smaller.")
      return
    }

    setUploadingImage(true)
    try {
      const contentType = file.type || "image/jpeg"
      const { uploadUrl, key, headers } = await presignUpload({
        courseId,
        lectureId,
        kind: "image",
        contentType,
        fileSize: file.size,
        fileName: file.name,
      }).unwrap()

      await putObject(uploadUrl, file, headers["Content-Type"])

      const { downloadUrl } = await presignDownload({
        courseId,
        lectureId,
        kind: "image",
        key,
      }).unwrap()

      editor
        .chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: { src: downloadUrl, key },
        })
        .run()
      toast.success("Image added.")
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? String(
              (error as { data?: { message?: string } }).data?.message ?? ""
            )
          : ""
      toast.error(message || "Image upload failed.")
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (!editor) {
    return (
      <div
        className={cn(
          "flex min-h-56 items-center justify-center rounded-xl border border-border text-sm text-muted-foreground",
          className
        )}
      >
        <LoaderCircle className="mr-2 size-4 animate-spin" />
        Loading editor…
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-background",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void onImageFile(e.target.files?.[0])}
      />
      <LessonBodyToolbar
        editor={editor}
        uploadingImage={uploadingImage}
        onInsertImage={insertImage}
      />
      <LessonBodyBubbleMenu editor={editor} />
      <div className="relative">
        {booting && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 text-sm text-muted-foreground">
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Loading lesson…
          </div>
        )}
        <EditorContent editor={editor} className="px-4 py-3" />
      </div>
    </div>
  )
}

function putObject(url: string, file: File, contentType: string) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.setRequestHeader("Content-Type", contentType)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      reject(new Error(`S3 upload failed (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error("Network error uploading image."))
    xhr.send(file)
  })
}
