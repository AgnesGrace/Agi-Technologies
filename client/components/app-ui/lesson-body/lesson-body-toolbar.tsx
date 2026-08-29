"use client"

import type { Editor } from "@tiptap/react"
import type { ReactNode } from "react"
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pencil,
  Quote,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LessonBodyToolbarProps {
  editor: Editor
  uploadingImage?: boolean
  onInsertImage: () => void
}

export function LessonBodyToolbar({
  editor,
  uploadingImage,
  onInsertImage,
}: LessonBodyToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
      <ToolButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-3.5" />
      </ToolButton>
      <ToolButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-3.5" />
      </ToolButton>
      <ToolButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-3.5" />
      </ToolButton>
      <ToolButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-3.5" />
      </ToolButton>
      <ToolButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-3.5" />
      </ToolButton>
      <ToolButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-3.5" />
      </ToolButton>
      <ToolButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-3.5" />
      </ToolButton>
      <ToolButton
        label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 className="size-3.5" />
      </ToolButton>
      <ToolButton
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
      </ToolButton>
      <ToolButton
        label="Insert image"
        disabled={uploadingImage}
        onClick={onInsertImage}
      >
        <ImageIcon className="size-3.5" />
      </ToolButton>
      <ToolButton
        label="Insert sketch"
        onClick={() => editor.chain().focus().insertSketch().run()}
      >
        <Pencil className="size-3.5" />
      </ToolButton>
    </div>
  )
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
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
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "size-8 px-0",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </Button>
  )
}
