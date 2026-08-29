import { Request, Response } from 'express';
import db from '../../../db/db.js';
import {
  CourseLevel,
  CourseStatus,
} from '../../../generated/prisma/client.js';
import { logger } from '../../../utils/logger.js';
import {
  evaluateCoursePublishReadiness,
  formatPublishBlockedMessage,
} from '../../../domain/course-publish-readiness.js';
import {
  buildPublishSnapshotFromDraft,
  getCoursePublishReadiness,
} from '../../../services/course-publish-readiness-service.js';
import { attachCourseCoverImageUrl } from '../../../services/course-cover-image-url.js';
import { courseEditorSelect } from '../courseSelect.js';
import {
  normalizeOptionalText,
  normalizeRequiredText,
  parsePositiveInt,
  requireInstructorUser,
  requireOwnedCourse,
} from '../courseOwnership.js';
import {
  COURSE_LEVELS,
  COURSE_STATUSES,
  DRAFT_SLUG_PREFIX,
  buildUniqueCourseSlug,
  type UpdateCourseMetadataBody,
} from './authoring-shared.js';

export const updateCourseMetadata = async (
  req: Request<{ courseId: string }, {}, UpdateCourseMetadataBody>,
  res: Response,
): Promise<void> => {
  try {
    const auth = await requireInstructorUser(req, res);
    if (!auth) return;

    const courseId = parsePositiveInt(req.params.courseId);
    if (!courseId) {
      res.status(400).json({
        status: 'fail',
        message: 'A valid course id is required.',
      });
      return;
    }

    const course = await requireOwnedCourse(courseId, auth.userId, res);
    if (!course) return;

    const body = req.body ?? {};

    if (body.title !== undefined && !normalizeRequiredText(body.title)) {
      res.status(400).json({
        status: 'fail',
        message: 'Title cannot be empty.',
      });
      return;
    }

    if (body.category !== undefined && !normalizeRequiredText(body.category)) {
      res.status(400).json({
        status: 'fail',
        message: 'Category cannot be empty.',
      });
      return;
    }

    if (
      body.price !== undefined &&
      (!Number.isInteger(body.price) || body.price < 0)
    ) {
      res.status(400).json({
        status: 'fail',
        message: 'Price must be a whole number of cents (0 or more).',
      });
      return;
    }

    if (body.level !== undefined && !COURSE_LEVELS.includes(body.level)) {
      res.status(400).json({
        status: 'fail',
        message: `Level must be one of ${COURSE_LEVELS.join(', ')}.`,
      });
      return;
    }

    if (body.status !== undefined && !COURSE_STATUSES.includes(body.status)) {
      res.status(400).json({
        status: 'fail',
        message: `Status must be one of ${COURSE_STATUSES.join(', ')}.`,
      });
      return;
    }

    const nextTitle = normalizeRequiredText(body.title) ?? course.title;
    const nextCategory =
      normalizeRequiredText(body.category) ?? course.category;
    const nextPrice = body.price ?? course.price;
    const nextStatus =
      (body.status as CourseStatus | undefined) ?? course.status;
    const nextDescription =
      body.description !== undefined
        ? normalizeOptionalText(body.description)
        : course.description;

    if (
      course.status === 'Published' &&
      nextStatus === 'Draft' &&
      course._count.enrollments > 0
    ) {
      res.status(409).json({
        status: 'fail',
        message:
          'This course already has enrolled students and cannot be moved back to draft.',
      });
      return;
    }

    if (nextStatus === 'Published') {
      const [sectionCount, lectureCount] = await Promise.all([
        db.section.count({ where: { courseId: course.id } }),
        db.lecture.count({ where: { section: { courseId: course.id } } }),
      ]);

      const readiness = evaluateCoursePublishReadiness(
        buildPublishSnapshotFromDraft({
          current: course,
          nextTitle,
          nextDescription,
          nextCategory,
          nextPriceCents: nextPrice,
          sectionCount,
          lectureCount,
          ...(body.image !== undefined
            ? {
                nextCoverImageKey:
                  normalizeOptionalText(body.image) ?? null,
              }
            : {}),
        }),
      );

      if (!readiness.canPublish) {
        res.status(422).json({
          status: 'fail',
          message: formatPublishBlockedMessage(readiness),
          data: { publishReadiness: readiness },
        });
        return;
      }
    }

    const nextSlug =
      nextStatus === 'Published' && course.slug.startsWith(DRAFT_SLUG_PREFIX)
        ? await buildUniqueCourseSlug(nextTitle)
        : undefined;

    const updated = await db.course.update({
      where: { id: course.id },
      data: {
        ...(body.title !== undefined ? { title: nextTitle } : {}),
        ...(body.category !== undefined ? { category: nextCategory } : {}),
        ...(body.price !== undefined ? { price: nextPrice } : {}),
        ...(body.description !== undefined
          ? { description: normalizeOptionalText(body.description) ?? null }
          : {}),
        ...(body.image !== undefined
          ? { image: normalizeOptionalText(body.image) ?? null }
          : {}),
        ...(body.level !== undefined
          ? { level: body.level as CourseLevel }
          : {}),
        ...(body.status !== undefined ? { status: nextStatus } : {}),
        ...(nextSlug ? { slug: nextSlug } : {}),
      },
      select: courseEditorSelect,
    });

    res.status(200).json({
      status: 'success',
      message: 'Course updated successfully.',
      data: { course: await attachCourseCoverImageUrl(updated) },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error updating course metadata',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to update course. Please try again later.',
    });
  }
};

export const deleteCourse = async (
  req: Request<{ courseId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const auth = await requireInstructorUser(req, res);
    if (!auth) return;

    const courseId = parsePositiveInt(req.params.courseId);
    if (!courseId) {
      res.status(400).json({
        status: 'fail',
        message: 'A valid course id is required.',
      });
      return;
    }

    const course = await requireOwnedCourse(courseId, auth.userId, res);
    if (!course) return;

    if (course._count.enrollments > 0) {
      res.status(409).json({
        status: 'fail',
        message:
          'This course has enrolled students and cannot be deleted. Unpublish it or contact support for refunds first.',
      });
      return;
    }

    await db.course.delete({
      where: { id: course.id },
    });

    res.status(200).json({
      status: 'success',
      message: 'Course deleted successfully.',
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error deleting course',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to delete course. Please try again later.',
    });
  }
};

export const getInstructorCourseById = async (
  req: Request<{ courseId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const auth = await requireInstructorUser(req, res);
    if (!auth) return;

    const courseId = parsePositiveInt(req.params.courseId);
    if (!courseId) {
      res.status(400).json({
        status: 'fail',
        message: 'A valid course id is required.',
      });
      return;
    }

    const owned = await requireOwnedCourse(courseId, auth.userId, res);
    if (!owned) return;

    const course = await db.course.findUniqueOrThrow({
      where: { id: courseId },
      select: courseEditorSelect,
    });

    res.status(200).json({
      status: 'success',
      data: { course: await attachCourseCoverImageUrl(course) },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error loading instructor course',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to load course. Please try again later.',
    });
  }
};

export const getInstructorCoursePublishReadiness = async (
  req: Request<{ courseId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const auth = await requireInstructorUser(req, res);
    if (!auth) return;

    const courseId = parsePositiveInt(req.params.courseId);
    if (!courseId) {
      res.status(400).json({
        status: 'fail',
        message: 'A valid course id is required.',
      });
      return;
    }

    const owned = await requireOwnedCourse(courseId, auth.userId, res);
    if (!owned) return;

    const publishReadiness = await getCoursePublishReadiness(courseId);
    if (!publishReadiness) {
      res.status(404).json({
        status: 'fail',
        message: 'Course not found.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { publishReadiness },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error loading publish readiness',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to load publish checklist.',
    });
  }
};
