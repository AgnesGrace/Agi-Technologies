"use client"

import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"

import { SketchNodeView } from "@/components/app-ui/lesson-body/sketch-node-view"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    sketch: {
      insertSketch: () => ReturnType
    }
  }
}

export const Sketch = Node.create({
  name: "sketch",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      snapshot: {
        default: null,
        rendered: false,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="sketch"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "sketch",
        class: "lesson-body__sketch",
      }),
    ]
  },

  addCommands() {
    return {
      insertSketch:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { snapshot: null },
          }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(SketchNodeView)
  },
})
