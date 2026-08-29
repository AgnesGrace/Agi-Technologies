"use client"

import { nanoid } from "nanoid"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  isQuizAuthorReady,
  type LessonQuiz,
  type QuizQuestion,
} from "@/lib/lesson-quiz"
import { cn } from "@/lib/utils"

interface QuizBuilderProps {
  value: LessonQuiz
  onChange: (quiz: LessonQuiz) => void
}

export function QuizBuilder({ value, onChange }: QuizBuilderProps) {
  const update = (next: LessonQuiz) => onChange(next)

  const setPassPercent = (raw: string) => {
    const n = Number.parseInt(raw, 10)
    update({
      ...value,
      passPercent: Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0,
    })
  }

  const addQuestion = () => {
    const optionA = `opt_${nanoid(6)}`
    const optionB = `opt_${nanoid(6)}`
    const question: QuizQuestion = {
      id: `q_${nanoid(8)}`,
      prompt: "",
      options: [
        { id: optionA, text: "" },
        { id: optionB, text: "" },
      ],
      correctOptionId: optionA,
      explanation: null,
    }
    update({ ...value, questions: [...value.questions, question] })
  }

  const removeQuestion = (questionId: string) => {
    if (value.questions.length <= 1) return
    update({
      ...value,
      questions: value.questions.filter((q) => q.id !== questionId),
    })
  }

  const patchQuestion = (
    questionId: string,
    patch: Partial<QuizQuestion>
  ) => {
    update({
      ...value,
      questions: value.questions.map((q) =>
        q.id === questionId ? { ...q, ...patch } : q
      ),
    })
  }

  const addOption = (questionId: string) => {
    const question = value.questions.find((q) => q.id === questionId)
    if (!question || question.options.length >= 6) return
    patchQuestion(questionId, {
      options: [...question.options, { id: `opt_${nanoid(6)}`, text: "" }],
    })
  }

  const removeOption = (questionId: string, optionId: string) => {
    const question = value.questions.find((q) => q.id === questionId)
    if (!question || question.options.length <= 2) return
    const options = question.options.filter((opt) => opt.id !== optionId)
    patchQuestion(questionId, {
      options,
      correctOptionId:
        question.correctOptionId === optionId
          ? (options[0]?.id ?? "")
          : question.correctOptionId,
    })
  }

  const ready = isQuizAuthorReady(value)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border p-4">
        <div className="min-w-[10rem]">
          <Label htmlFor="pass-percent" className="text-sm font-medium">
            Pass score (%)
          </Label>
          <Input
            id="pass-percent"
            type="number"
            min={0}
            max={100}
            value={value.passPercent}
            onChange={(e) => setPassPercent(e.target.value)}
            className="mt-2"
          />
        </div>
        <p className="max-w-sm text-xs text-muted-foreground">
          Students must reach this score to auto-complete the lesson. Answers
          stay on the server — learners only see them after submitting.
        </p>
        <p
          className={cn(
            "text-xs font-medium",
            ready ? "text-primary" : "text-muted-foreground"
          )}
        >
          {ready
            ? `${value.questions.length} question${value.questions.length === 1 ? "" : "s"} ready`
            : "Fill every prompt, option, and correct answer"}
        </p>
      </div>

      {value.questions.map((question, index) => (
        <div
          key={question.id}
          className="space-y-4 rounded-xl border border-border p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <Label className="text-sm font-medium">
              Question {index + 1}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={value.questions.length <= 1}
              onClick={() => removeQuestion(question.id)}
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          </div>

          <Textarea
            value={question.prompt}
            onChange={(e) =>
              patchQuestion(question.id, { prompt: e.target.value })
            }
            placeholder="Ask a clear question…"
            className="min-h-20"
          />

          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Options — select the correct one
            </p>
            {question.options.map((option, optionIndex) => (
              <div key={option.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctOptionId === option.id}
                  onChange={() =>
                    patchQuestion(question.id, {
                      correctOptionId: option.id,
                    })
                  }
                  className="size-4 accent-[var(--primary)]"
                  aria-label={`Mark option ${optionIndex + 1} correct`}
                />
                <Input
                  value={option.text}
                  onChange={(e) =>
                    patchQuestion(question.id, {
                      options: question.options.map((opt) =>
                        opt.id === option.id
                          ? { ...opt, text: e.target.value }
                          : opt
                      ),
                    })
                  }
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={question.options.length <= 2}
                  onClick={() => removeOption(question.id, option.id)}
                  aria-label="Remove option"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={question.options.length >= 6}
              onClick={() => addOption(question.id)}
            >
              <Plus className="size-3.5" />
              Add option
            </Button>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Explanation (optional)
            </Label>
            <Textarea
              value={question.explanation ?? ""}
              onChange={(e) =>
                patchQuestion(question.id, {
                  explanation: e.target.value || null,
                })
              }
              placeholder="Shown after the student submits…"
              className="mt-2 min-h-16"
            />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addQuestion}>
        <Plus className="size-3.5" />
        Add question
      </Button>
    </div>
  )
}
