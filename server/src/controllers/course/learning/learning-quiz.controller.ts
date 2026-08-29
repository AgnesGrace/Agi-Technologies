import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import db from '../../../db/db.js';
import { logger } from '../../../utils/logger.js';
import { parsePositiveInt } from '../courseOwnership.js';
import {
  gradeLessonQuiz,
  parseLessonQuiz,
  type QuizAnswers,
} from '../../../domain/lesson-quiz.js';
import { LectureType } from '../../../generated/prisma/client.js';
import { assertLearnerAccess } from './learning-access.js';
import {
  buildProgressPayload,
  recountCourseProgress,
} from './learning-progress.js';

export const submitLectureQuiz = async (
  req: Request<
    { courseId: string; lectureId: string },
    {},
    { answers?: QuizAnswers }
  >,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    const courseId = parsePositiveInt(req.params.courseId);
    const lectureId = parsePositiveInt(req.params.lectureId);
    if (!courseId || !lectureId) {
      res.status(400).json({
        status: 'fail',
        message: 'Valid course and lecture ids are required.',
      });
      return;
    }

    const access = await assertLearnerAccess(userId, courseId);
    if (!access.ok) {
      res.status(access.status).json({
        status: 'fail',
        message: access.message,
      });
      return;
    }

    const lecture = await db.lecture.findFirst({
      where: {
        id: lectureId,
        section: { courseId },
      },
      select: { id: true, type: true, content: true },
    });

    if (!lecture) {
      res.status(404).json({
        status: 'fail',
        message: 'Lecture not found in this course.',
      });
      return;
    }

    if (lecture.type !== LectureType.Quiz) {
      res.status(400).json({
        status: 'fail',
        message: 'This lesson is not a quiz.',
      });
      return;
    }

    const quiz = parseLessonQuiz(lecture.content);
    if (!quiz || quiz.questions.length === 0) {
      res.status(400).json({
        status: 'fail',
        message: 'This quiz has no questions yet.',
      });
      return;
    }

    const answers =
      req.body?.answers && typeof req.body.answers === 'object'
        ? req.body.answers
        : {};

    const grade = gradeLessonQuiz(quiz, answers);

    let progress = null;
    if (grade.passed && !access.isInstructorPreview) {
      await db.lectureProgress.upsert({
        where: { userId_lectureId: { userId, lectureId } },
        create: {
          userId,
          lectureId,
          courseId,
          isCompleted: true,
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      await db.progress.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: {
          userId,
          courseId,
          lastLectureId: lectureId,
          overallProgress: 0,
          isCompleted: false,
        },
        update: { lastLectureId: lectureId },
      });

      await recountCourseProgress(userId, courseId);
      progress = await buildProgressPayload(userId, courseId);
    }

    res.status(200).json({
      status: 'success',
      data: {
        grade,
        progress,
      },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error submitting lecture quiz',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to grade this quiz.',
    });
  }
};
