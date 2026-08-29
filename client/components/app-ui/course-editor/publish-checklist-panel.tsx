"use client"

import { CheckCircle2, Circle } from "lucide-react"

import { cn } from "@/lib/utils"
import type { CoursePublishReadiness } from "@/lib/course-publish-readiness"

interface PublishChecklistPanelProps {
  readiness: CoursePublishReadiness
  className?: string
}

export function PublishChecklistPanel({
  readiness,
  className,
}: PublishChecklistPanelProps) {
  const metCount = readiness.requirements.filter((item) => item.isMet).length
  const total = readiness.requirements.length

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-base tracking-tight">
          Publish checklist
        </h2>
        <p className="text-xs text-muted-foreground tabular-nums">
          {metCount}/{total} ready
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {readiness.canPublish
          ? "All set — students can find this course once you publish."
          : "Finish the items below before publishing."}
      </p>

      <ul className="mt-4 space-y-2.5">
        {readiness.requirements.map((requirement) => (
          <li key={requirement.id} className="flex gap-2.5">
            {requirement.isMet ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            ) : (
              <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
            )}
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm",
                  requirement.isMet
                    ? "text-foreground"
                    : "font-medium text-foreground"
                )}
              >
                {requirement.label}
              </p>
              {!requirement.isMet && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {requirement.helpText}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
