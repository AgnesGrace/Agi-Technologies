import {
  isLessonQuiz,
  parseLessonQuiz,
  persistLessonQuiz,
} from './lesson-quiz.js';

export function normalizeLessonContent(
  value: unknown,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as {
        type?: unknown;
        content?: unknown;
        kind?: unknown;
      };

      if (parsed?.type === 'doc' && Array.isArray(parsed.content)) {
        return JSON.stringify(parsed);
      }

      if (isLessonQuiz(parsed)) {
        return persistLessonQuiz(parsed);
      }
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

export function contentLooksLikeQuiz(raw: string | null | undefined): boolean {
  return parseLessonQuiz(raw) != null;
}
