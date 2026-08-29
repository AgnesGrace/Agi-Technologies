import { Request, Response } from 'express';
import db from '../../../db/db.js';
import { logger } from '../../../utils/logger.js';
import { sectionSelect } from '../courseSelect.js';
import {
  normalizeOptionalText,
  normalizeRequiredText,
  parsePositiveInt,
  requireInstructorUser,
  requireOwnedCourse,
} from '../courseOwnership.js';
import {
  DEFAULT_SECTION_TITLE,
  type ReorderBody,
} from './authoring-shared.js';

export const createSection = async (
  req: Request<
    { courseId: string },
    {},
    { title?: string; description?: string | null }
  >,
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

    const last = await db.section.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const section = await db.section.create({
      data: {
        courseId,
        title: normalizeRequiredText(req.body?.title) ?? DEFAULT_SECTION_TITLE,
        description: normalizeOptionalText(req.body?.description) ?? null,
        order: (last?.order ?? -1) + 1,
      },
      select: sectionSelect,
    });

    res.status(201).json({
      status: 'success',
      message: 'Section created.',
      data: { section },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error creating section',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to create section.',
    });
  }
};

export const updateSection = async (
  req: Request<
    { sectionId: string },
    {},
    { title?: string; description?: string | null }
  >,
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

    const existing = await db.section.findUnique({
      where: { id: sectionId },
      select: { id: true, courseId: true },
    });

    if (!existing) {
      res.status(404).json({
        status: 'fail',
        message: 'Section not found.',
      });
      return;
    }

    const course = await requireOwnedCourse(
      existing.courseId,
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

    const section = await db.section.update({
      where: { id: sectionId },
      data: {
        ...(req.body?.title !== undefined
          ? { title: normalizeRequiredText(req.body.title)! }
          : {}),
        ...(req.body?.description !== undefined
          ? { description: normalizeOptionalText(req.body.description) ?? null }
          : {}),
      },
      select: sectionSelect,
    });

    res.status(200).json({
      status: 'success',
      message: 'Section updated.',
      data: { section },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error updating section',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to update section.',
    });
  }
};

export const deleteSection = async (
  req: Request<{ sectionId: string }>,
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

    const existing = await db.section.findUnique({
      where: { id: sectionId },
      select: { id: true, courseId: true },
    });

    if (!existing) {
      res.status(404).json({
        status: 'fail',
        message: 'Section not found.',
      });
      return;
    }

    const course = await requireOwnedCourse(
      existing.courseId,
      auth.userId,
      res,
    );
    if (!course) return;

    await db.section.delete({ where: { id: sectionId } });

    res.status(200).json({
      status: 'success',
      message: 'Section deleted.',
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error deleting section',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to delete section.',
    });
  }
};

export const reorderSections = async (
  req: Request<{ courseId: string }, {}, ReorderBody>,
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

    const orderedIds = req.body?.orderedIds;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({
        status: 'fail',
        message: 'orderedIds must be a non-empty array of section ids.',
      });
      return;
    }

    const existing = await db.section.findMany({
      where: { courseId },
      select: { id: true },
    });

    const existingIds = new Set(existing.map((section) => section.id));
    if (
      orderedIds.length !== existingIds.size ||
      orderedIds.some((id) => !existingIds.has(id))
    ) {
      res.status(400).json({
        status: 'fail',
        message:
          'orderedIds must include every section in this course exactly once.',
      });
      return;
    }

    await db.$transaction(
      orderedIds.map((id, order) =>
        db.section.update({
          where: { id },
          data: { order },
        }),
      ),
    );

    const sections = await db.section.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: sectionSelect,
    });

    res.status(200).json({
      status: 'success',
      message: 'Sections reordered.',
      data: { sections },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error reordering sections',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to reorder sections.',
    });
  }
};
