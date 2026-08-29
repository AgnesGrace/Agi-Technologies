"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, LoaderCircle, RotateCcw, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  parsePublicLessonQuiz,
  type QuizAnswers,
} from "@/lib/lesson-quiz"
import { useSubmitLectureQuizMutation } from "@/state/api"
import type { QuizGradeResult } from "@/state/api.types"
import { cn } from "@/lib/utils"

interface QuizPlayerProps {
  courseId: number
  lectureId: number
  content: string | null | undefined
  onPassed?: () => void
}

export function QuizPlayer({
  courseId,
  lectureId,
  content,
  onPassed,
}: QuizPlayerProps) {
  const quiz = useMemo(() => parsePublicLessonQuiz(content), [content])
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [grade, setGrade] = useState<QuizGradeResult | null>(null)
  const [submitQuiz, { isLoading }] = useSubmitLectureQuizMutation()

  useEffect(() => {
    setAnswers({})
    setGrade(null)
  }, [lectureId, content])

  if (!quiz || quiz.questions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This quiz has no questions yet.
      </p>
    )
  }

  const allAnswered = quiz.questions.every((q) => Boolean(answers[q.id]))

  const submit = async () => {
    try {
      const result = await submitQuiz({
        courseId,
        lectureId,
        answers,
      }).unwrap()
      setGrade(result.grade)
      if (result.grade.passed) onPassed?.()
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? String(
              (error as { data?: { message?: string } }).data?.message ?? ""
            )
          : ""
      toast.error(message || "Unable to grade quiz.")
    }
  }

  const retry = () => {
    setAnswers({})
    setGrade(null)
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Pass score: {quiz.passPercent}% · {quiz.questions.length} question
        {quiz.questions.length === 1 ? "" : "s"}
      </div>

      {quiz.questions.map((question, index) => {
        const result = grade?.results.find(
          (row) => row.questionId === question.id
        )
        return (
          <fieldset key={question.id} className="space-y-3">
            <legend className="font-medium">
              {index + 1}. {question.prompt}
            </legend>
            <div className="space-y-2">
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id
                const showCorrect =
                  result != null && option.id === result.correctOptionId
                const showWrong =
                  result != null &&
                  selected &&
                  option.id !== result.correctOptionId

                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      selected && !grade && "border-primary bg-primary/5",
                      showCorrect && "border-emerald-600/50 bg-emerald-500/10",
                      showWrong && "border-destructive/50 bg-destructive/5",
                      grade && "cursor-default"
                    )}
                  >
                    <input
                      type="radio"
                      name={`quiz-${lectureId}-${question.id}`}
                      className="mt-0.5 size-4 accent-[var(--primary)]"
                      checked={selected}
                      disabled={grade != null || isLoading}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: option.id,
                        }))
                      }
                    />
                    <span className="flex-1">{option.text}</span>
                    {showCorrect && (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    )}
                    {showWrong && (
                      <XCircle className="size-4 text-destructive" />
                    )}
                  </label>
                )
              })}
            </div>
            {result?.explanation && (
              <p className="text-sm text-muted-foreground">
                {result.explanation}
              </p>
            )}
          </fieldset>
        )
      })}

      {grade ? (
        <div className="space-y-4 rounded-xl border border-border p-5">
          <p className="font-display text-xl tracking-tight">
            {grade.passed ? "Passed" : "Not quite"} — {grade.percent}%
          </p>
          <p className="text-sm text-muted-foreground">
            {grade.correct} of {grade.total} correct
            {grade.passed
              ? ". Lesson marked complete."
              : `. Need ${quiz.passPercent}% to pass.`}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={retry}>
              <RotateCcw className="size-3.5" />
              Try again
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          disabled={!allAnswered || isLoading}
          onClick={() => void submit()}
        >
          {isLoading ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : null}
          Submit quiz
        </Button>
      )}
    </div>
  )
}
