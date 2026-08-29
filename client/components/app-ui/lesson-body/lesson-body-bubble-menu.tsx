"use client"

import type { ReactNode } from "react"
import type { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import type { EditorState } from "@tiptap/pm/state"
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Strikethrough,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const BUBBLE_OPTIONS = { placement: "top" as const, offset: 8 }

function shouldShowLessonBubble({
  editor,
  state,
}: {
  editor: Editor
  state: EditorState
}) {
  const { selection } = state
  if (selection.empty) return false
  if (editor.isActive("sketch") || editor.isActive("image")) return false
  if (editor.isActive("codeBlock")) return false
  return true
}

interface LessonBodyBubbleMenuProps {
  editor: Editor
}

export function LessonBodyBubbleMenu({ editor }: LessonBodyBubbleMenuProps) {
  return (
    <BubbleMenu
      editor={editor}
      options={BUBBLE_OPTIONS}
      shouldShow={shouldShowLessonBubble}
      className="z-50 flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-md"
    >
      <BubbleButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-3.5" />
      </BubbleButton>
      <BubbleButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-3.5" />
      </BubbleButton>
      <BubbleButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-3.5" />
      </BubbleButton>
      <BubbleButton
        label="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="size-3.5" />
      </BubbleButton>
      <BubbleButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-3.5" />
      </BubbleButton>
      <BubbleButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-3.5" />
      </BubbleButton>
      <BubbleButton
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const previous = editor.getAttributes("link").href as
            | string
            | undefined
          const url = window.prompt("Link URL", previous ?? "https://")
          if (url === null) return
          const trimmed = url.trim()
          if (!trimmed) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            return
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: trimmed })
            .run()
        }}
      >
        <Link2 className="size-3.5" />
      </BubbleButton>
    </BubbleMenu>
  )
}

function BubbleButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "size-8 px-0 text-popover-foreground",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </Button>
  )
}
