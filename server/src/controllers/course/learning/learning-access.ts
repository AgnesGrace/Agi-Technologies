import db from '../../../db/db.js';
import { courseEditorSelect } from '../courseSelect.js';
import { stripQuizAnswersFromContent } from '../../../domain/lesson-quiz.js';
import { LectureType } from '../../../generated/prisma/client.js';

export const redactLearnerQuizAnswers = <
  T extends {
    sections: Array<{
      lectures: Array<{ type: string; content: string | null }>;
    }>;
  },
>(
  course: T,
): T => ({
  ...course,
  sections: course.sections.map((section) => ({
    ...section,
    lectures: section.lectures.map((lecture) => ({
      ...lecture,
      content:
        lecture.type === LectureType.Quiz
          ? stripQuizAnswersFromContent(lecture.content)
          : lecture.content,
    })),
  })),
});

export const learningCourseSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  category: true,
  image: true,
  level: true,
  status: true,
  instructorId: true,
  instructor: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  },
  sections: courseEditorSelect.sections,
} as const;

export const assertLearnerAccess = async (userId: string, courseId: number) => {
  const [enrollment, course] = await Promise.all([
    db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    }),
    db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        instructorId: true,
        status: true,
      },
    }),
  ]);

  if (!course) {
    return { ok: false as const, status: 404 as const, message: 'Course not found.' };
  }

  if (enrollment) {
    return { ok: true as const, course, isInstructorPreview: false };
  }

  const actor = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const canPreview =
    course.instructorId === userId || actor?.role === 'ADMIN';

  if (canPreview) {
    return { ok: true as const, course, isInstructorPreview: true };
  }

  return {
    ok: false as const,
    status: 403 as const,
    message: 'Enroll in this course to start learning.',
  };
};
