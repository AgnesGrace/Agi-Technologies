"use client"

import { useRef, useState } from "react"
import { LoaderCircle, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useCreateUploadPresignMutation } from "@/state/api"
import { MediaKind } from "@/state/api.types"

const ACCEPT: Record<MediaKind, string> = {
  video: "video/mp4,video/webm,video/quicktime",
  pdf: "application/pdf",
  cover: "image/jpeg,image/png,image/webp",
  image: "image/jpeg,image/png,image/webp",
}

const MAX_BYTES: Record<MediaKind, number> = {
  video: 2 * 1024 * 1024 * 1024,
  pdf: 50 * 1024 * 1024,
  cover: 5 * 1024 * 1024,
  image: 5 * 1024 * 1024,
}

const LABELS: Record<MediaKind, string> = {
  video: "Upload video",
  pdf: "Upload PDF",
  cover: "Upload cover",
  image: "Upload image",
}

interface MediaUploaderProps {
  courseId: number
  kind: MediaKind
  lectureId?: number
  disabled?: boolean
  onUploaded: (key: string) => Promise<void> | void
}

export function MediaUploader({
  courseId,
  kind,
  lectureId,
  disabled,
  onUploaded,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [presign] = useCreateUploadPresignMutation()
  const [progress, setProgress] = useState<number | null>(null)
  const busy = progress !== null

  const pickFile = () => inputRef.current?.click()

  const onFile = async (file: File | undefined) => {
    if (!file) return

    if (file.size > MAX_BYTES[kind]) {
      toast.error(`That ${kind} file is too large.`)
      return
    }

    setProgress(0)
    try {
      const { uploadUrl, key, headers } = await presign({
        courseId,
        kind,
        lectureId,
        contentType: file.type || ACCEPT[kind].split(",")[0]!,
        fileSize: file.size,
        fileName: file.name,
      }).unwrap()

      await putWithProgress(uploadUrl, file, headers["Content-Type"], setProgress)
      await onUploaded(key)
      toast.success(
        kind === "cover" ? "Cover uploaded." : `${kind.toUpperCase()} uploaded.`
      )
    } catch (error) {
      const apiMessage =
        error && typeof error === "object" && "data" in error
          ? String(
              (error as { data?: { message?: string } }).data?.message ?? ""
            )
          : ""
      const localMessage =
        error instanceof Error ? error.message : ""

      toast.error(
        apiMessage ||
          localMessage ||
          "Upload failed. Check S3 IAM PutObject permission and bucket CORS."
      )
    } finally {
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || busy}
        onClick={pickFile}
      >
        {busy ? (
          <LoaderCircle className="size-3.5 animate-spin" />
        ) : (
          <Upload className="size-3.5" />
        )}
        {busy
          ? `Uploading ${Math.round(progress ?? 0)}%`
          : LABELS[kind]}
      </Button>
      {busy && (
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
      )}
    </div>
  )
}

function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (pct: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.setRequestHeader("Content-Type", contentType)
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
        return
      }
      const body = xhr.responseText?.slice(0, 240) || ""
      if (xhr.status === 403) {
        reject(
          new Error(
            "S3 denied the upload (403). Attach s3:PutObject on this bucket to your IAM user, then retry."
          )
        )
        return
      }
      reject(
        new Error(
          `S3 upload failed (${xhr.status})${body ? `: ${body}` : ""}`
        )
      )
    }
    xhr.onerror = () =>
      reject(
        new Error(
          "Network/CORS error talking to S3. Add PUT+GET for http://localhost:3000 on the bucket CORS config."
        )
      )
    xhr.send(file)
  })
}
