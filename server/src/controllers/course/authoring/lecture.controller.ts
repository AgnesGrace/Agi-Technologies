import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import db from '../../../db/db.js';
import { LectureType } from '../../../generated/prisma/client.js';
import { logger } from '../../../utils/logger.js';
import { normalizeLessonContent } from '../../../domain/lesson-content.js';
import {
  courseEditorSelect,
  lectureSelect,
} from '../courseSelect.js';
import {
  normalizeOptionalText,
  normalizeRequiredText,
  parsePositiveInt,
  requireInstructorUser,
  requireOwnedCourse,
} from '../courseOwnership.js';
import {
  DEFAULT_LECTURE_TITLE,
  LECTURE_TYPES,
  type LectureBody,
  type ReorderBody,
} from './authoring-shared.js';

export const createLecture = async (
  req: Request<{ sectionId: string }, {}, LectureBody>,
  res: Response,
): Promise<void> => {
  try {
    const auth = await requireInstructorUser(req, res);
    if (!auth) return;

    const sectionId = parsePositiveInt(req.params.sectionId);
    if (!sectionId) {
      res.status(400).json({
        status: 'fail',
        message: 'A valid section id is required.',
      });
      return;
    }

    const section = await db.section.findUnique({
      where: { id: sectionId },
      select: { id: true, courseId: true },
    });

    if (!section) {
      res.status(404).json({
        status: 'fail',
        message: 'Section not found.',
      });
      return;
    }

    const course = await requireOwnedCourse(section.courseId, auth.userId, res);
    if (!course) return;

    const type = req.body?.type ?? LectureType.Text;
    if (!LECTURE_TYPES.includes(type)) {
      res.status(400).json({
        status: 'fail',
        message: `Type must be one of ${LECTURE_TYPES.join(', ')}.`,
      });
      return;
    }

    const last = await db.lecture.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const lecture = await db.lecture.create({
      data: {
        sectionId,
        slug: `lec_${nanoid(8)}`,
        title: normalizeRequiredText(req.body?.title) ?? DEFAULT_LECTURE_TITLE,
        type: type as LectureType,
        content: normalizeLessonContent(req.body?.content) ?? null,
        videoKey: normalizeOptionalText(req.body?.videoKey) ?? null,
        pdfKey: normalizeOptionalText(req.body?.pdfKey) ?? null,
        order: (last?.order ?? -1) + 1,
      },
      select: lectureSelect,
    });

    res.status(201).json({
      status: 'success',
      message: 'Lecture created.',
      data: { lecture },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error creating lecture',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to create lecture.',
    });
  }
};

export const updateLecture = async (
  req: Request<{ lectureId: string }, {}, LectureBody>,
  res: Response,
): Promise<void> => {
  try {
    const auth = await requireInstructorUser(req, res);
    if (!auth) return;

    const lectureId = parsePositiveInt(req.params.lectureId);
    if (!lectureId) {
      res.status(400).json({
        status: 'fail',
        message: 'A valid lecture id is required.',
      });
      return;
    }

    const existing = await db.lecture.findUnique({
      where: { id: lectureId },
      select: {
        id: true,
        section: { select: { courseId: true } },
      },
    });

    if (!existing) {
      res.status(404).json({
        status: 'fail',
        message: 'Lecture not found.',
      });
      return;
    }

    const course = await requireOwnedCourse(
      existing.section.courseId,
      auth.userId,
      res,
    );
    if (!course) return;

    if (
      req.body?.title !== undefined &&
      !normalizeRequiredText(req.body.title)
    ) {
      res.status(400).json({
        status: 'fail',
        message: 'Title cannot be empty.',
      });
      return;
    }

    if (
      req.body?.type !== undefined &&
      !LECTURE_TYPES.includes(req.body.type)
    ) {
      res.status(400).json({
        status: 'fail',
        message: `Type must be one of ${LECTURE_TYPES.join(', ')}.`,
      });
      return;
    }

    const lecture = await db.lecture.update({
      where: { id: lectureId },
      data: {
        ...(req.body?.title !== undefined
          ? { title: normalizeRequiredText(req.body.title)! }
          : {}),
        ...(req.body?.type !== undefined
          ? { type: req.body.type as LectureType }
          : {}),
        ...(req.body?.content !== undefined
          ? { content: normalizeLessonContent(req.body.content) ?? null }
          : {}),
        ...(req.body?.videoKey !== undefined
          ? { videoKey: normalizeOptionalText(req.body.videoKey) ?? null }
          : {}),
        ...(req.body?.pdfKey !== undefined
          ? { pdfKey: normalizeOptionalText(req.body.pdfKey) ?? null }
          : {}),
      },
      select: lectureSelect,
    });

    res.status(200).json({
      status: 'success',
      message: 'Lecture updated.',
      data: { lecture },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error updating lecture',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to update lecture.',
    });
  }
};

export const deleteLecture = async (
  req: Request<{ lectureId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const auth = await requireInstructorUser(req, res);
    if (!auth) return;

    const lectureId = parsePositiveInt(req.params.lectureId);
    if (!lectureId) {
      res.status(400).json({
        status: 'fail',
        message: 'A valid lecture id is required.',
      });
      return;
    }

    const existing = await db.lecture.findUnique({
      where: { id: lectureId },
      select: {
        id: true,
        section: { select: { courseId: true } },
      },
    });

    if (!existing) {
      res.status(404).json({
        status: 'fail',
        message: 'Lecture not found.',
      });
      return;
    }

    const course = await requireOwnedCourse(
      existing.section.courseId,
      auth.userId,
      res,
    );
    if (!course) return;

    await db.lecture.delete({ where: { id: lectureId } });

    res.status(200).json({
      status: 'success',
      message: 'Lecture deleted.',
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error deleting lecture',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to delete lecture.',
    });
  }
};

export const reorderLectures = async (
  req: Request<{ sectionId: string }, {}, ReorderBody>,
  res: Response,
): Promise<void> => {
  try {
    const auth = await requireInstructorUser(req, res);
    if (!auth) return;

    const sectionId = parsePositiveInt(req.params.sectionId);
    if (!sectionId) {
      res.status(400).json({
        status: 'fail',
        message: 'A valid section id is required.',
      });
      return;
    }

    const section = await db.section.findUnique({
      where: { id: sectionId },
      select: { id: true, courseId: true },
    });

    if (!section) {
      res.status(404).json({
        status: 'fail',
        message: 'Section not found.',
      });
      return;
    }

    const course = await requireOwnedCourse(section.courseId, auth.userId, res);
    if (!course) return;

    const orderedIds = req.body?.orderedIds;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({
        status: 'fail',
        message: 'orderedIds must be a non-empty array of lecture ids.',
      });
      return;
    }

    const existing = await db.lecture.findMany({
      where: { sectionId },
      select: { id: true },
    });

    const existingIds = new Set(existing.map((lecture) => lecture.id));
    if (
      orderedIds.length !== existingIds.size ||
      orderedIds.some((id) => !existingIds.has(id))
    ) {
      res.status(400).json({
        status: 'fail',
        message:
          'orderedIds must include every lecture in this section exactly once.',
      });
      return;
    }

    await db.$transaction(
      orderedIds.map((id, order) =>
        db.lecture.update({
          where: { id },
          data: { order },
        }),
      ),
    );

    const lectures = await db.lecture.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
      select: lectureSelect,
    });

    res.status(200).json({
      status: 'success',
      message: 'Lectures reordered.',
      data: { lectures },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error reordering lectures',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to reorder lectures.',
    });
  }
};

type MoveLectureBody = {
  targetSectionId?: number;
  targetIndex?: number;
};

export const moveLecture = async (
  req: Request<{ lectureId: string }, {}, MoveLectureBody>,
  res: Response,
): Promise<void> => {
  try {
    const auth = await requireInstructorUser(req, res);
    if (!auth) return;

    const lectureId = parsePositiveInt(req.params.lectureId);
    if (!lectureId) {
      res.status(400).json({
        status: 'fail',
        message: 'A valid lecture id is required.',
      });
      return;
    }

    const targetSectionId = parsePositiveInt(
      req.body?.targetSectionId != null
        ? String(req.body.targetSectionId)
        : undefined,
    );
    const targetIndex =
      typeof req.body?.targetIndex === 'number'
        ? req.body.targetIndex
        : Number.parseInt(String(req.body?.targetIndex), 10);

    if (
      !targetSectionId ||
      !Number.isInteger(targetIndex) ||
      targetIndex < 0
    ) {
      res.status(400).json({
        status: 'fail',
        message: 'targetSectionId and a non-negative targetIndex are required.',
      });
      return;
    }

    const lecture = await db.lecture.findUnique({
      where: { id: lectureId },
      select: {
        id: true,
        sectionId: true,
        section: { select: { courseId: true } },
      },
    });

    if (!lecture) {
      res.status(404).json({
        status: 'fail',
        message: 'Lecture not found.',
      });
      return;
    }

    const course = await requireOwnedCourse(
      lecture.section.courseId,
      auth.userId,
      res,
    );
    if (!course) return;

    const targetSection = await db.section.findUnique({
      where: { id: targetSectionId },
      select: { id: true, courseId: true },
    });

    if (!targetSection || targetSection.courseId !== lecture.section.courseId) {
      res.status(400).json({
        status: 'fail',
        message: 'Target section must belong to the same course.',
      });
      return;
    }

    const sourceSectionId = lecture.sectionId;

    await db.$transaction(async (tx) => {
      if (sourceSectionId === targetSectionId) {
        const lectures = await tx.lecture.findMany({
          where: { sectionId: sourceSectionId },
          orderBy: { order: 'asc' },
          select: { id: true },
        });

        const without = lectures.filter((item) => item.id !== lectureId);
        const clampedIndex = Math.min(targetIndex, without.length);
        without.splice(clampedIndex, 0, { id: lectureId });

        await Promise.all(
          without.map((item, order) =>
            tx.lecture.update({
              where: { id: item.id },
              data: { order },
            }),
          ),
        );
        return;
      }

      const [sourceLectures, targetLectures] = await Promise.all([
        tx.lecture.findMany({
          where: { sectionId: sourceSectionId },
          orderBy: { order: 'asc' },
          select: { id: true },
        }),
        tx.lecture.findMany({
          where: { sectionId: targetSectionId },
          orderBy: { order: 'asc' },
          select: { id: true },
        }),
      ]);

      const nextSource = sourceLectures.filter((item) => item.id !== lectureId);
      const nextTarget = targetLectures.filter((item) => item.id !== lectureId);
      const clampedIndex = Math.min(targetIndex, nextTarget.length);
      nextTarget.splice(clampedIndex, 0, { id: lectureId });

      await Promise.all([
        ...nextSource.map((item, order) =>
          tx.lecture.update({
            where: { id: item.id },
            data: { order },
          }),
        ),
        ...nextTarget.map((item, order) =>
          tx.lecture.update({
            where: { id: item.id },
            data: {
              sectionId: targetSectionId,
              order,
            },
          }),
        ),
      ]);
    });

    const courseEditor = await db.course.findUnique({
      where: { id: lecture.section.courseId },
      select: courseEditorSelect,
    });

    res.status(200).json({
      status: 'success',
      message: 'Lecture moved.',
      data: { course: courseEditor },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error moving lecture',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to move lecture.',
    });
  }
};
