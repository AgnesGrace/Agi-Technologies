"use client"

import { useCallback, useEffect, useRef } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { getSnapshot, Tldraw, type TLEditorSnapshot, type Editor } from "tldraw"
import "tldraw/tldraw.css"

const SAVE_DEBOUNCE_MS = 400

function parseSnapshot(raw: unknown): TLEditorSnapshot | undefined {
  if (typeof raw !== "string" || !raw) return undefined
  try {
    const parsed = JSON.parse(raw) as TLEditorSnapshot
    if (parsed && typeof parsed === "object" && "document" in parsed) {
      return parsed
    }
  } catch {
  }
  return undefined
}

export function SketchNodeView({
  node,
  updateAttributes,
  editor,
  selected,
  deleteNode,
}: NodeViewProps) {
  const editable = editor.isEditable
  const initialSnapshotRef = useRef(parseSnapshot(node.attrs.snapshot))
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string | null>(
    typeof node.attrs.snapshot === "string" ? node.attrs.snapshot : null
  )

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const persist = useCallback(
    (tldrawEditor: Editor) => {
      if (!editable) return
      const next = JSON.stringify(getSnapshot(tldrawEditor.store))
      if (next === lastSavedRef.current) return
      lastSavedRef.current = next
      updateAttributes({ snapshot: next })
    },
    [editable, updateAttributes]
  )

  const onMount = useCallback(
    (tldrawEditor: Editor) => {
      tldrawEditor.updateInstanceState({ isReadonly: !editable })

      if (!editable) {
        tldrawEditor.setCurrentTool("hand")
        return
      }

      const unlisten = tldrawEditor.store.listen(
        () => {
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
          saveTimerRef.current = setTimeout(() => {
            persist(tldrawEditor)
          }, SAVE_DEBOUNCE_MS)
        },
        { source: "user", scope: "document" }
      )

      return () => {
        unlisten()
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current)
          persist(tldrawEditor)
        }
      }
    },
    [editable, persist]
  )

  return (
    <NodeViewWrapper
      className={
        selected
          ? "lesson-body__sketch lesson-body__sketch--selected"
          : "lesson-body__sketch"
      }
      data-drag-handle
    >
      <div className="lesson-body__sketch-chrome" contentEditable={false}>
        <span className="lesson-body__sketch-label">Sketch</span>
        {editable && (
          <button
            type="button"
            className="lesson-body__sketch-remove"
            onClick={deleteNode}
          >
            Remove
          </button>
        )}
      </div>
      <div className="lesson-body__sketch-canvas" contentEditable={false}>
        <Tldraw
          snapshot={initialSnapshotRef.current}
          hideUi={!editable}
          onMount={onMount}
        />
      </div>
    </NodeViewWrapper>
  )
}
