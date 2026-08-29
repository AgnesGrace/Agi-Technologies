"use client"

import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import { LoaderCircle } from "lucide-react"

import { createLessonBodyExtensions } from "@/components/app-ui/lesson-body/extensions"
import {
  collectLessonImageKeys,
  isEmptyLessonBody,
  parseLessonBody,
  withResolvedImageSrcs,
} from "@/lib/lesson-body"
import { useCreateDownloadPresignMutation } from "@/state/api"
import { cn } from "@/lib/utils"

interface LessonBodyViewerProps {
  courseId: number
  lectureId: number
  content: string | null | undefined
  className?: string
}

export function LessonBodyViewer({
  courseId,
  lectureId,
  content,
  className,
}: LessonBodyViewerProps) {
  const [presignDownload] = useCreateDownloadPresignMutation()
  const [ready, setReady] = useState(false)
  const parsed = parseLessonBody(content)

  const editor = useEditor({
    extensions: createLessonBodyExtensions({ editable: false }),
    content: parsed,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "lesson-body",
      },
    },
  })

  useEffect(() => {
    if (!editor) return

    let cancelled = false

    const hydrate = async () => {
      setReady(false)
      const doc = parseLessonBody(content)
      if (isEmptyLessonBody(doc)) {
        if (!cancelled) {
          editor.commands.clearContent(false)
          setReady(true)
        }
        return
      }

      const keys = collectLessonImageKeys(doc)
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
          } catch {
          }
        })
      )

      if (cancelled) return
      editor.commands.setContent(withResolvedImageSrcs(doc, urlByKey), {
        emitUpdate: false,
      })
      setReady(true)
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [editor, content, courseId, lectureId, presignDownload])

  if (isEmptyLessonBody(parsed)) {
    return null
  }

  if (!editor) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <LoaderCircle className="size-4 animate-spin" />
        Loading lesson…
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center gap-2 bg-background/60 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Loading lesson…
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
