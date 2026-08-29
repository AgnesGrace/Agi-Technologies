import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"

import { Sketch } from "@/components/app-ui/lesson-body/sketch-extension"

export function createLessonBodyExtensions(options?: {
  placeholder?: string
  editable?: boolean
}) {
  const editable = options?.editable !== false

  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      codeBlock: {
        HTMLAttributes: {
          class: "lesson-body__code",
        },
      },
    }),
    Image.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          key: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-key"),
            renderHTML: (attributes) => {
              if (!attributes.key) return {}
              return { "data-key": attributes.key }
            },
          },
        }
      },
    }).configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: "lesson-body__image",
      },
    }),
    Sketch,
    Link.configure({
      openOnClick: !editable,
      autolink: true,
      HTMLAttributes: {
        class: "lesson-body__link",
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
    ...(editable
      ? [
          Placeholder.configure({
            placeholder:
              options?.placeholder ??
              "Write the lesson — headings, code, images, sketches…",
          }),
        ]
      : []),
  ]
}
