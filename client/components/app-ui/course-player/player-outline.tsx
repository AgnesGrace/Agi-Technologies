"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  FileText,
  FileType2,
  Film,
  HelpCircle,
  PanelLeftClose,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Lecture, LectureType, Section } from "@/state/api.types"

const typeIcon: Record<LectureType, typeof FileText> = {
  Text: FileText,
  Video: Film,
  Pdf: FileType2,
  Quiz: HelpCircle,
}

interface PlayerOutlineProps {
  sections: Section[]
  selectedLectureId: number | null
  completedLectureIds: Set<number>
  onSelectLecture: (lectureId: number) => void
  onClose: () => void
}

export function PlayerOutline({
  sections,
  selectedLectureId,
  completedLectureIds,
  onSelectLecture,
  onClose,
}: PlayerOutlineProps) {
  const ownerSectionId = useMemo(() => {
    if (selectedLectureId == null) return null
    return (
      sections.find((section) =>
        (section.lectures ?? []).some(
          (lecture) => lecture.id === selectedLectureId
        )
      )?.id ?? null
    )
  }, [sections, selectedLectureId])

  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(() => new Set())

  // Keep the active lesson's section expanded.
  useEffect(() => {
    if (ownerSectionId == null) return
    setCollapsedIds((prev) => {
      if (!prev.has(ownerSectionId)) return prev
      const next = new Set(prev)
      next.delete(ownerSectionId)
      return next
    })
  }, [ownerSectionId])

  const toggleSection = (sectionId: number) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  const expandAll = () => setCollapsedIds(new Set())
  const collapseAll = () =>
    setCollapsedIds(new Set(sections.map((section) => section.id)))

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-muted/20 lg:w-80">
      <div className="flex items-start justify-between gap-2 border-b border-border px-3 py-3">
        <div className="min-w-0">
          <p className="font-display text-sm tracking-tight">Course content</p>
          <p className="text-[11px] text-muted-foreground">
            {completedLectureIds.size} completed
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Hide course content"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      {sections.length > 0 && (
        <div className="flex gap-1 border-b border-border px-3 py-1.5">
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={expandAll}
          >
            Expand all
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={collapseAll}
          >
            Collapse all
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {sections.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            This course has no lessons yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {sections.map((section) => {
              const collapsed = collapsedIds.has(section.id)
              const lectureCount = section.lectures?.length ?? 0
              const doneCount = (section.lectures ?? []).filter((lecture) =>
                completedLectureIds.has(lecture.id)
              ).length

              return (
                <li key={section.id} className="rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={!collapsed}
                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-2 text-left hover:bg-muted"
                  >
                    {collapsed ? (
                      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {section.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      {doneCount}/{lectureCount}
                    </span>
                  </button>

                  {!collapsed && (
                    <ul className="mb-2 ml-2 space-y-0.5 border-l border-border pl-2">
                      {(section.lectures ?? []).map((lecture: Lecture) => {
                        const Icon = typeIcon[lecture.type] ?? FileText
                        const selected = lecture.id === selectedLectureId
                        const done = completedLectureIds.has(lecture.id)
                        return (
                          <li key={lecture.id}>
                            <button
                              type="button"
                              onClick={() => onSelectLecture(lecture.id)}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                                selected
                                  ? "bg-primary/10 font-medium text-primary"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              {done ? (
                                <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                              ) : (
                                <Circle className="size-3.5 shrink-0 opacity-40" />
                              )}
                              <Icon className="size-3.5 shrink-0 opacity-70" />
                              <span className="truncate">{lecture.title}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
