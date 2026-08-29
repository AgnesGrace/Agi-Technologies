import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import db from '../../../db/db.js';
import { logger } from '../../../utils/logger.js';
import { parsePositiveInt } from '../courseOwnership.js';
import { assertLearnerAccess } from './learning-access.js';
import {
  buildProgressPayload,
  recountCourseProgress,
} from './learning-progress.js';

export const markLectureComplete = async (
  req: Request<{ courseId: string; lectureId: string }>,
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

    if (access.isInstructorPreview) {
      res.status(403).json({
        status: 'fail',
        message: 'Progress is only tracked for enrolled learners.',
      });
      return;
    }

    const lecture = await db.lecture.findFirst({
      where: {
        id: lectureId,
        section: { courseId },
      },
      select: { id: true },
    });

    if (!lecture) {
      res.status(404).json({
        status: 'fail',
        message: 'Lecture not found in this course.',
      });
      return;
    }

    await db.lectureProgress.upsert({
      where: {
        userId_lectureId: { userId, lectureId },
      },
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
    const progress = await buildProgressPayload(userId, courseId);

    res.status(200).json({
      status: 'success',
      message: 'Lesson marked complete.',
      data: { progress },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error marking lecture complete',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to update lesson progress.',
    });
  }
};

export const markLectureIncomplete = async (
  req: Request<{ courseId: string; lectureId: string }>,
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

    if (access.isInstructorPreview) {
      res.status(403).json({
        status: 'fail',
        message: 'Progress is only tracked for enrolled learners.',
      });
      return;
    }

    await db.lectureProgress.deleteMany({
      where: { userId, lectureId, courseId },
    });

    await recountCourseProgress(userId, courseId);
    const progress = await buildProgressPayload(userId, courseId);

    res.status(200).json({
      status: 'success',
      message: 'Lesson marked incomplete.',
      data: { progress },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error marking lecture incomplete',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to update lesson progress.',
    });
  }
};

