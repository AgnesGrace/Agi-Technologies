"use client"

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
  type DragStart,
} from "@hello-pangea/dnd"
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Film,
  FileType2,
  GripVertical,
  HelpCircle,
  Plus,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  useCreateLectureMutation,
  useCreateSectionMutation,
  useDeleteLectureMutation,
  useDeleteSectionMutation,
  useMoveLectureMutation,
  useReorderSectionsMutation,
  useUpdateSectionMutation,
} from "@/state/api"
import { LectureType, Section } from "@/state/api.types"

const typeIcon: Record<LectureType, typeof FileText> = {
  Text: FileText,
  Video: Film,
  Pdf: FileType2,
  Quiz: HelpCircle,
}

const sectionDroppableId = (sectionId: number) => `section-${sectionId}`
const parseSectionDroppableId = (droppableId: string) => {
  const match = /^section-(\d+)$/.exec(droppableId)
  return match ? Number.parseInt(match[1]!, 10) : null
}

interface CourseOutlinePanelProps {
  courseId: number
  sections: Section[]
  selectedLectureId: number | null
  onSelectLecture: (lectureId: number) => void
}

export function CourseOutlinePanel({
  courseId,
  sections,
  selectedLectureId,
  onSelectLecture,
}: CourseOutlinePanelProps) {
  const [createSection, { isLoading: creatingSection }] =
    useCreateSectionMutation()
  const [createLecture, { isLoading: creatingLecture }] =
    useCreateLectureMutation()
  const [updateSection] = useUpdateSectionMutation()
  const [deleteSection] = useDeleteSectionMutation()
  const [deleteLecture] = useDeleteLectureMutation()
  const [reorderSections] = useReorderSectionsMutation()
  const [moveLecture] = useMoveLectureMutation()

  const [localSections, setLocalSections] = useState(sections)
  const [renamingSectionId, setRenamingSectionId] = useState<number | null>(
    null
  )
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(() => new Set())
  const [draggingLecture, setDraggingLecture] = useState(false)

  useEffect(() => {
    setLocalSections(sections)
  }, [sections])

  // Keep the section that owns the selected lecture expanded.
  useEffect(() => {
    if (selectedLectureId == null) return
    const owner = sections.find((section) =>
      (section.lectures ?? []).some(
        (lecture) => lecture.id === selectedLectureId
      )
    )
    if (!owner) return
    setCollapsedIds((prev) => {
      if (!prev.has(owner.id)) return prev
      const next = new Set(prev)
      next.delete(owner.id)
      return next
    })
  }, [selectedLectureId, sections])

  const sectionIdsKey = useMemo(
    () => sections.map((s) => s.id).join(","),
    [sections]
  )

  // New sections start expanded.
  useEffect(() => {
    setCollapsedIds((prev) => {
      const known = new Set(sections.map((s) => s.id))
      let changed = false
      const next = new Set<number>()
      for (const id of prev) {
        if (known.has(id)) next.add(id)
        else changed = true
      }
      return changed ? next : prev
    })
  }, [sectionIdsKey, sections])

  const toggleCollapsed = (sectionId: number) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  const onDragStart = (start: DragStart) => {
    setDraggingLecture(start.type === "LECTURE")
    if (start.type !== "LECTURE") return
    const sourceSectionId = parseSectionDroppableId(start.source.droppableId)
    if (!sourceSectionId) return
    // Keep the source section expanded so its Draggables stay mounted.
    setCollapsedIds((prev) => {
      if (!prev.has(sourceSectionId)) return prev
      const next = new Set(prev)
      next.delete(sourceSectionId)
      return next
    })
  }

  const onDragEnd = async (result: DropResult) => {
    setDraggingLecture(false)
    const { destination, source, type, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    if (type === "SECTION") {
      const next = Array.from(localSections)
      const [removed] = next.splice(source.index, 1)
      if (!removed) return
      next.splice(destination.index, 0, removed)
      setLocalSections(next)
      try {
        await reorderSections({
          courseId,
          orderedIds: next.map((section) => section.id),
        }).unwrap()
      } catch {
        setLocalSections(sections)
      }
      return
    }

    if (type !== "LECTURE") return

    const fromSectionId = parseSectionDroppableId(source.droppableId)
    const toSectionId = parseSectionDroppableId(destination.droppableId)
    const lectureId = Number.parseInt(draggableId.replace(/^lecture-/, ""), 10)
    if (!fromSectionId || !toSectionId || !Number.isFinite(lectureId)) return

    const nextSections = localSections.map((section) => ({
      ...section,
      lectures: [...(section.lectures ?? [])],
    }))

    const fromSection = nextSections.find((s) => s.id === fromSectionId)
    const toSection = nextSections.find((s) => s.id === toSectionId)
    if (!fromSection || !toSection) return

    const [moved] = fromSection.lectures!.splice(source.index, 1)
    if (!moved || moved.id !== lectureId) {
      setLocalSections(sections)
      return
    }

    toSection.lectures!.splice(destination.index, 0, moved)
    setLocalSections(nextSections)

    // Expand drop target so the instructor sees where it landed.
    setCollapsedIds((prev) => {
      if (!prev.has(toSectionId)) return prev
      const next = new Set(prev)
      next.delete(toSectionId)
      return next
    })

    try {
      await moveLecture({
        lectureId,
        courseId,
        targetSectionId: toSectionId,
        targetIndex: destination.index,
      }).unwrap()
    } catch {
      setLocalSections(sections)
    }
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-muted/20 lg:w-80">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="font-display text-sm tracking-tight">Outline</p>
          <p className="text-[11px] text-muted-foreground">
            Drag to reorder · click chevron to collapse
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={creatingSection}
          onClick={() => createSection({ courseId })}
        >
          <Plus className="size-3.5" />
          Section
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {localSections.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            No sections yet. Add one to start building lessons.
          </p>
        ) : (
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <Droppable droppableId="course-sections" type="SECTION">
              {(sectionsDropProvided, sectionsDropSnapshot) => (
                <ul
                  ref={sectionsDropProvided.innerRef}
                  {...sectionsDropProvided.droppableProps}
                  className={cn(
                    "space-y-2 rounded-lg p-0.5 transition-colors",
                    sectionsDropSnapshot.isDraggingOver && "bg-primary/5"
                  )}
                >
                  {localSections.map((section, sectionIndex) => {
                    const collapsed = collapsedIds.has(section.id)
                    const lectureCount = section.lectures?.length ?? 0

                    return (
                      <Draggable
                        key={section.id}
                        draggableId={`section-${section.id}`}
                        index={sectionIndex}
                      >
                        {(sectionDragProvided, sectionDragSnapshot) => (
                          <li
                            ref={sectionDragProvided.innerRef}
                            {...sectionDragProvided.draggableProps}
                            className={cn(
                              "rounded-xl border border-transparent bg-background/60",
                              sectionDragSnapshot.isDragging &&
                                "border-border shadow-md ring-1 ring-border"
                            )}
                          >
                            <div className="group flex items-center gap-0.5 px-1.5 py-1.5">
                              <button
                                type="button"
                                className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
                                aria-label="Drag section"
                                {...sectionDragProvided.dragHandleProps}
                              >
                                <GripVertical className="size-3.5" />
                              </button>

                              <button
                                type="button"
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-expanded={!collapsed}
                                aria-label={
                                  collapsed
                                    ? "Expand section"
                                    : "Collapse section"
                                }
                                onClick={() => toggleCollapsed(section.id)}
                              >
                                {collapsed ? (
                                  <ChevronRight className="size-3.5" />
                                ) : (
                                  <ChevronDown className="size-3.5" />
                                )}
                              </button>

                              {renamingSectionId === section.id ? (
                                <Input
                                  autoFocus
                                  defaultValue={section.title}
                                  className="h-8 flex-1 text-sm"
                                  onBlur={async (e) => {
                                    const title = e.target.value.trim()
                                    setRenamingSectionId(null)
                                    if (title && title !== section.title) {
                                      await updateSection({
                                        sectionId: section.id,
                                        courseId,
                                        data: { title },
                                      })
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      ;(e.target as HTMLInputElement).blur()
                                    }
                                    if (e.key === "Escape") {
                                      setRenamingSectionId(null)
                                    }
                                  }}
                                />
                              ) : (
                                <button
                                  type="button"
                                  className="min-w-0 flex-1 truncate text-left text-sm font-medium"
                                  onDoubleClick={() =>
                                    setRenamingSectionId(section.id)
                                  }
                                  title="Double-click to rename"
                                >
                                  {section.title}
                                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                    ({lectureCount})
                                  </span>
                                </button>
                              )}

                              <button
                                type="button"
                                className="rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-destructive"
                                aria-label="Delete section"
                                onClick={async () => {
                                  if (
                                    !window.confirm(
                                      `Delete section “${section.title}” and its lectures?`
                                    )
                                  ) {
                                    return
                                  }
                                  await deleteSection({
                                    sectionId: section.id,
                                    courseId,
                                  })
                                }}
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            {(!collapsed || draggingLecture) && (
                              <Droppable
                                droppableId={sectionDroppableId(section.id)}
                                type="LECTURE"
                              >
                                {(
                                  lecturesDropProvided,
                                  lecturesDropSnapshot
                                ) => (
                                  <ul
                                    ref={lecturesDropProvided.innerRef}
                                    {...lecturesDropProvided.droppableProps}
                                    className={cn(
                                      "mx-2 mb-2 ml-6 min-h-8 space-y-0.5 rounded-lg border border-transparent pl-1 transition-colors",
                                      lecturesDropSnapshot.isDraggingOver &&
                                        "border-dashed border-primary/40 bg-primary/5",
                                      collapsed &&
                                        draggingLecture &&
                                        "border-dashed border-border px-2 py-3"
                                    )}
                                  >
                                    {collapsed && draggingLecture ? (
                                      <li className="px-2 text-center text-[11px] text-muted-foreground">
                                        Drop to move into “{section.title}”
                                      </li>
                                    ) : (
                                      (section.lectures ?? []).map(
                                        (lecture, lectureIndex) => {
                                          const Icon =
                                            typeIcon[lecture.type] ?? FileText
                                          const selected =
                                            lecture.id === selectedLectureId
                                          return (
                                            <Draggable
                                              key={lecture.id}
                                              draggableId={`lecture-${lecture.id}`}
                                              index={lectureIndex}
                                            >
                                              {(
                                                lectureDragProvided,
                                                lectureDragSnapshot
                                              ) => (
                                                <li
                                                  ref={
                                                    lectureDragProvided.innerRef
                                                  }
                                                  {...lectureDragProvided.draggableProps}
                                                  className={cn(
                                                    "group/lecture flex items-center gap-0.5 rounded-md",
                                                    lectureDragSnapshot.isDragging &&
                                                      "bg-background shadow-md ring-1 ring-border"
                                                  )}
                                                >
                                                  <button
                                                    type="button"
                                                    className="cursor-grab touch-none rounded p-1 text-muted-foreground opacity-60 group-hover/lecture:opacity-100 hover:bg-muted hover:text-foreground hover:opacity-100 active:cursor-grabbing"
                                                    aria-label="Drag lecture"
                                                    {...lectureDragProvided.dragHandleProps}
                                                  >
                                                    <GripVertical className="size-3" />
                                                  </button>

                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      onSelectLecture(
                                                        lecture.id
                                                      )
                                                    }
                                                    className={cn(
                                                      "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                                                      selected
                                                        ? "bg-primary/10 font-medium text-primary"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    )}
                                                  >
                                                    <Icon className="size-3.5 shrink-0 opacity-70" />
                                                    <span className="truncate">
                                                      {lecture.title}
                                                    </span>
                                                  </button>

                                                  <button
                                                    type="button"
                                                    className="rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover/lecture:opacity-100 hover:bg-muted hover:text-destructive"
                                                    aria-label="Delete lecture"
                                                    onClick={async () => {
                                                      if (
                                                        !window.confirm(
                                                          `Delete lecture “${lecture.title}”?`
                                                        )
                                                      ) {
                                                        return
                                                      }
                                                      await deleteLecture({
                                                        lectureId: lecture.id,
                                                        courseId,
                                                      })
                                                    }}
                                                  >
                                                    <Trash2 className="size-3" />
                                                  </button>
                                                </li>
                                              )}
                                            </Draggable>
                                          )
                                        }
                                      )
                                    )}
                                    {lecturesDropProvided.placeholder}
                                  </ul>
                                )}
                              </Droppable>
                            )}

                            {!collapsed && (
                              <div className="mb-2 ml-8">
                                <Button
                                  type="button"
                                  size="xs"
                                  variant="ghost"
                                  disabled={creatingLecture}
                                  className="text-muted-foreground"
                                  onClick={async () => {
                                    const result = await createLecture({
                                      sectionId: section.id,
                                      courseId,
                                      type: "Text",
                                    }).unwrap()
                                    onSelectLecture(result.lecture.id)
                                  }}
                                >
                                  <Plus className="size-3" />
                                  Lecture
                                </Button>
                              </div>
                            )}
                          </li>
                        )}
                      </Draggable>
                    )
                  })}
                  {sectionsDropProvided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </aside>
  )
}
