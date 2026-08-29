import type { JSONContent } from "@tiptap/core"

export type LessonBodyDoc = JSONContent

export const EMPTY_LESSON_BODY: LessonBodyDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
}

export function isLessonBodyStorageKey(value: string): boolean {
  return value.startsWith("courses/") && !value.includes("://")
}

export function parseLessonBody(
  raw: string | null | undefined
): LessonBodyDoc {
  if (!raw?.trim()) return structuredClone(EMPTY_LESSON_BODY)

  try {
    const parsed = JSON.parse(raw) as JSONContent
    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      return parsed
    }
  } catch {
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: raw }],
      },
    ],
  }
}

function walkNodes(
  node: JSONContent,
  visit: (node: JSONContent) => void
): void {
  visit(node)
  node.content?.forEach((child) => walkNodes(child, visit))
}

export function collectLessonImageKeys(doc: LessonBodyDoc): string[] {
  const keys = new Set<string>()
  walkNodes(doc, (node) => {
    if (node.type !== "image") return
    const key =
      (typeof node.attrs?.key === "string" && node.attrs.key) ||
      (typeof node.attrs?.src === "string" &&
      isLessonBodyStorageKey(node.attrs.src)
        ? node.attrs.src
        : null)
    if (key) keys.add(key)
  })
  return [...keys]
}

export function withResolvedImageSrcs(
  doc: LessonBodyDoc,
  urlByKey: Record<string, string>
): LessonBodyDoc {
  const next = structuredClone(doc)
  walkNodes(next, (node) => {
    if (node.type !== "image" || !node.attrs) return
    const key =
      (typeof node.attrs.key === "string" && node.attrs.key) ||
      (typeof node.attrs.src === "string" &&
      isLessonBodyStorageKey(node.attrs.src)
        ? node.attrs.src
        : null)
    if (!key) return
    const url = urlByKey[key]
    if (!url) return
    node.attrs.key = key
    node.attrs.src = url
  })
  return next
}

export function persistLessonBody(doc: LessonBodyDoc): string | null {
  const next = structuredClone(doc)
  walkNodes(next, (node) => {
    if (node.type !== "image" || !node.attrs) return
    const key =
      (typeof node.attrs.key === "string" && node.attrs.key) ||
      (typeof node.attrs.src === "string" &&
      isLessonBodyStorageKey(node.attrs.src)
        ? node.attrs.src
        : null)
    if (!key) return
    node.attrs.key = key
    node.attrs.src = key
  })

  if (isEmptyLessonBody(next)) return null
  return JSON.stringify(next)
}

export function isEmptyLessonBody(doc: LessonBodyDoc): boolean {
  const blocks = doc.content
  if (!blocks?.length) return true
  if (blocks.length > 1) return false

  const only = blocks[0]
  if (!only) return true
  if (only.type === "image" || only.type === "sketch") return false
  if (only.type === "codeBlock") {
    return !only.content?.some(
      (child) => child.type === "text" && Boolean(child.text?.trim())
    )
  }
  if (only.type !== "paragraph") return false
  if (!only.content?.length) return true
  return !only.content.some(
    (child) =>
      (child.type === "text" && Boolean(child.text?.trim())) ||
      child.type === "hardBreak"
  )
}
