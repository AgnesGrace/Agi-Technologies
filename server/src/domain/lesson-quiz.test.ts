import { describe, expect, it } from 'vitest';
import {
  createEmptyQuiz,
  gradeLessonQuiz,
  isQuizAuthorReady,
  parseLessonQuiz,
  persistLessonQuiz,
  stripQuizAnswersFromContent,
} from './lesson-quiz.js';

describe('lesson-quiz', () => {
  it('grades single-choice answers', () => {
    const quiz = createEmptyQuiz();
    quiz.questions[0]!.prompt = '2 + 2?';
    quiz.questions[0]!.options = [
      { id: 'a', text: '3' },
      { id: 'b', text: '4' },
    ];
    quiz.questions[0]!.correctOptionId = 'b';
    quiz.passPercent = 100;

    const result = gradeLessonQuiz(quiz, { [quiz.questions[0]!.id]: 'b' });
    expect(result.passed).toBe(true);
    expect(result.percent).toBe(100);
  });

  it('strips answers for learners', () => {
    const quiz = createEmptyQuiz();
    quiz.questions[0]!.prompt = 'Q';
    quiz.questions[0]!.options = [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ];
    quiz.questions[0]!.correctOptionId = 'a';
    const raw = persistLessonQuiz(quiz)!;
    const stripped = stripQuizAnswersFromContent(raw)!;
    const parsed = JSON.parse(stripped) as {
      questions: Array<{ correctOptionId?: string }>;
    };
    expect(parsed.questions[0]?.correctOptionId).toBeUndefined();
    expect(parseLessonQuiz(stripped)).toBeNull();
  });

  it('requires complete authoring fields', () => {
    const quiz = createEmptyQuiz();
    expect(isQuizAuthorReady(quiz)).toBe(false);
    quiz.questions[0]!.prompt = 'Ready?';
    quiz.questions[0]!.options = [
      { id: 'a', text: 'Yes' },
      { id: 'b', text: 'No' },
    ];
    quiz.questions[0]!.correctOptionId = 'a';
    expect(isQuizAuthorReady(quiz)).toBe(true);
  });
});
