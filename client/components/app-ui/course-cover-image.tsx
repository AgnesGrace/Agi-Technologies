"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const PLACEHOLDER_COVER = "/placeholder-course.svg"

interface CourseCoverImageProps {
  /** Stored key or legacy URL from the DB. */
  image?: string | null
  /** Browser-ready signed/public URL from the API. */
  imageUrl?: string | null
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

/**
 * Renders a course cover. Prefer `imageUrl` (signed). Fall back to legacy
 * absolute/relative `image`, then the local placeholder.
 * Signed S3 URLs use `unoptimized` so Next doesn't cache expired query strings.
 */
export function CourseCoverImage({
  image,
  imageUrl,
  alt,
  fill = false,
  width,
  height,
  className,
  priority,
}: CourseCoverImageProps) {
  const resolved = pickCoverSrc(imageUrl, image)
  const [src, setSrc] = useState(resolved)

  useEffect(() => {
    setSrc(pickCoverSrc(imageUrl, image))
  }, [imageUrl, image])

  const isSignedOrRemote = src.startsWith("http")

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        unoptimized={isSignedOrRemote}
        className={cn("object-cover", className)}
        onError={() => setSrc(PLACEHOLDER_COVER)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 640}
      height={height ?? 360}
      priority={priority}
      unoptimized={isSignedOrRemote}
      className={cn("object-cover", className)}
      onError={() => setSrc(PLACEHOLDER_COVER)}
    />
  )
}

function isLegacyBrowserUrl(value?: string | null) {
  if (!value) return false
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  )
}

function pickCoverSrc(imageUrl?: string | null, image?: string | null) {
  if (imageUrl?.trim()) return imageUrl.trim()
  if (isLegacyBrowserUrl(image)) return image!.trim()
  return PLACEHOLDER_COVER
}
