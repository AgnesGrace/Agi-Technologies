export const QUIZ_KIND = "quiz" as const
export const QUIZ_VERSION = 1 as const
export const DEFAULT_PASS_PERCENT = 70

export type QuizOption = {
  id: string
  text: string
}

export type QuizQuestion = {
  id: string
  prompt: string
  options: QuizOption[]
  correctOptionId: string
  explanation?: string | null
}

export type LessonQuiz = {
  kind: typeof QUIZ_KIND
  version: typeof QUIZ_VERSION
  passPercent: number
  questions: QuizQuestion[]
}

export type PublicQuizQuestion = {
  id: string
  prompt: string
  options: QuizOption[]
}

export type PublicLessonQuiz = {
  kind: typeof QUIZ_KIND
  version: typeof QUIZ_VERSION
  passPercent: number
  questions: PublicQuizQuestion[]
}

export type QuizAnswers = Record<string, string>

export type QuizQuestionResult = {
  questionId: string
  selectedOptionId: string | null
  correctOptionId: string
  isCorrect: boolean
  explanation: string | null
}

export type QuizGradeResult = {
  total: number
  correct: number
  percent: number
  passed: boolean
  results: QuizQuestionResult[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isLessonQuiz(value: unknown): value is LessonQuiz {
  if (!isRecord(value)) return false
  if (value.kind !== QUIZ_KIND) return false
  if (value.version !== QUIZ_VERSION) return false
  if (typeof value.passPercent !== "number") return false
  if (!Array.isArray(value.questions) || value.questions.length === 0) {
    return false
  }
  return value.questions.every(
    (q) =>
      isRecord(q) &&
      typeof q.id === "string" &&
      typeof q.prompt === "string" &&
      typeof q.correctOptionId === "string" &&
      Array.isArray(q.options)
  )
}

export function isPublicLessonQuiz(value: unknown): value is PublicLessonQuiz {
  if (!isRecord(value)) return false
  if (value.kind !== QUIZ_KIND) return false
  if (!Array.isArray(value.questions)) return false
  return true
}

export function parseLessonQuiz(
  raw: string | null | undefined
): LessonQuiz | null {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!isLessonQuiz(parsed)) return null
    return sanitizeQuiz(parsed)
  } catch {
    return null
  }
}

export function parsePublicLessonQuiz(
  raw: string | null | undefined
): PublicLessonQuiz | null {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!isPublicLessonQuiz(parsed)) return null
    return {
      kind: QUIZ_KIND,
      version: QUIZ_VERSION,
      passPercent:
        typeof parsed.passPercent === "number"
          ? parsed.passPercent
          : DEFAULT_PASS_PERCENT,
      questions: parsed.questions.map((q) => {
        const row = q as PublicQuizQuestion
        return {
          id: row.id,
          prompt: row.prompt ?? "",
          options: Array.isArray(row.options) ? row.options : [],
        }
      }),
    }
  } catch {
    return null
  }
}

export function createEmptyQuiz(ids?: {
  questionId: string
  optionA: string
  optionB: string
}): LessonQuiz {
  const questionId = ids?.questionId ?? "q_new"
  const a = ids?.optionA ?? "opt_a"
  const b = ids?.optionB ?? "opt_b"
  return {
    kind: QUIZ_KIND,
    version: QUIZ_VERSION,
    passPercent: DEFAULT_PASS_PERCENT,
    questions: [
      {
        id: questionId,
        prompt: "",
        options: [
          { id: a, text: "" },
          { id: b, text: "" },
        ],
        correctOptionId: a,
        explanation: null,
      },
    ],
  }
}

function sanitizeQuiz(quiz: LessonQuiz): LessonQuiz {
  const passPercent = Math.min(
    100,
    Math.max(0, Math.round(quiz.passPercent) || DEFAULT_PASS_PERCENT)
  )

  const questions = quiz.questions
    .filter((q) => isRecord(q) && typeof q.id === "string")
    .map((q) => {
      const options = Array.isArray(q.options)
        ? q.options
            .filter(
              (opt) =>
                isRecord(opt) &&
                typeof opt.id === "string" &&
                typeof opt.text === "string"
            )
            .map((opt) => ({
              id: String(opt.id),
              text: String(opt.text),
            }))
        : []

      const correctOptionId =
        typeof q.correctOptionId === "string" &&
        options.some((opt) => opt.id === q.correctOptionId)
          ? q.correctOptionId
          : (options[0]?.id ?? "")

      return {
        id: q.id,
        prompt: typeof q.prompt === "string" ? q.prompt : "",
        options,
        correctOptionId,
        explanation:
          typeof q.explanation === "string" ? q.explanation : null,
      }
    })

  return {
    kind: QUIZ_KIND,
    version: QUIZ_VERSION,
    passPercent,
    questions,
  }
}

export function persistLessonQuiz(quiz: LessonQuiz): string | null {
  const cleaned = sanitizeQuiz(quiz)
  if (cleaned.questions.length === 0) return null
  return JSON.stringify(cleaned)
}

export function isQuizAuthorReady(quiz: LessonQuiz): boolean {
  if (quiz.questions.length === 0) return false
  return quiz.questions.every((q) => {
    if (!q.prompt.trim()) return false
    if (q.options.length < 2) return false
    if (!q.options.every((opt) => opt.text.trim())) return false
    return q.options.some((opt) => opt.id === q.correctOptionId)
  })
}

export function sameQuizContent(
  local: string | null,
  server: string | null | undefined
) {
  return persistLessonQuiz(parseLessonQuiz(local) ?? createEmptyQuiz()) ===
    persistLessonQuiz(parseLessonQuiz(server) ?? createEmptyQuiz())
}
