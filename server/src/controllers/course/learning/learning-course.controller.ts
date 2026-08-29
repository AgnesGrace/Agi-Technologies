import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import db from '../../../db/db.js';
import { logger } from '../../../utils/logger.js';
import { parsePositiveInt } from '../courseOwnership.js';
import { attachCourseCoverImageUrl } from '../../../services/course-cover-image-url.js';
import {
  assertLearnerAccess,
  learningCourseSelect,
  redactLearnerQuizAnswers,
} from './learning-access.js';
import { buildProgressPayload } from './learning-progress.js';

export const getLearningCourse = async (
  req: Request<{ courseId: string }, {}, {}, { lectureId?: string }>,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    const courseId = parsePositiveInt(req.params.courseId);
    if (!courseId) {
      res.status(400).json({
        status: 'fail',
        message: 'A valid course id is required.',
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

    const lectureId = parsePositiveInt(req.query.lectureId);

    if (lectureId && !access.isInstructorPreview) {
      const lecture = await db.lecture.findFirst({
        where: {
          id: lectureId,
          section: { courseId },
        },
        select: { id: true },
      });

      if (lecture) {
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
      }
    } else if (!access.isInstructorPreview) {
      await db.progress.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: {
          userId,
          courseId,
          overallProgress: 0,
          isCompleted: false,
        },
        update: {},
      });
    }

    const [course, progress] = await Promise.all([
      db.course.findUnique({
        where: { id: courseId },
        select: learningCourseSelect,
      }),
      access.isInstructorPreview
        ? Promise.resolve({
            overallProgress: 0,
            isCompleted: false,
            lastLectureId: null as number | null,
            completedLectureIds: [] as number[],
          })
        : buildProgressPayload(userId, courseId),
    ]);

    if (!course) {
      res.status(404).json({ status: 'fail', message: 'Course not found.' });
      return;
    }

    const withCover = await attachCourseCoverImageUrl(course);
    const payloadCourse = access.isInstructorPreview
      ? withCover
      : redactLearnerQuizAnswers(withCover);

    res.status(200).json({
      status: 'success',
      data: {
        course: payloadCourse,
        progress,
        isInstructorPreview: access.isInstructorPreview,
      },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error loading learning course',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to load this course for learning.',
    });
  }
};

