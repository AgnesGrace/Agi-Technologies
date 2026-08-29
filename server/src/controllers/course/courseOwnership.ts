import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import db from '../../db/db.js';
import { ensureClerkUserInDb } from '../../services/ensure-clerk-user.js';

type OwnedCourse = {
  id: number;
  instructorId: string;
  status: 'Draft' | 'Published';
  title: string;
  description: string | null;
  category: string;
  price: number;
  slug: string;
  image: string | null;
  _count: { enrollments: number };
};

export const requireInstructorUser = async (
  req: Request,
  res: Response,
): Promise<{ userId: string } | null> => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({
      status: 'fail',
      message: 'Unauthorized',
    });
    return null;
  }

  let user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    try {
      const ensured = await ensureClerkUserInDb(userId);
      user = { id: ensured.id, role: ensured.role };
    } catch {
      res.status(404).json({
        status: 'fail',
        message: 'Account not found. Sync your profile and try again.',
      });
      return null;
    }
  }

  if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
    try {
      const refreshed = await ensureClerkUserInDb(userId, {
        forceRefresh: true,
      });
      user = { id: refreshed.id, role: refreshed.role };
    } catch {}
  }

  if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
    res.status(403).json({
      status: 'fail',
      message:
        'Only instructors can manage courses. Set publicMetadata.userRole to "instructor" in Clerk, then try again.',
    });
    return null;
  }

  return { userId };
};

export const requireOwnedCourse = async (
  courseId: number,
  userId: string,
  res: Response,
): Promise<OwnedCourse | null> => {
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      instructorId: true,
      status: true,
      title: true,
      description: true,
      category: true,
      price: true,
      slug: true,
      image: true,
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    res.status(404).json({
      status: 'fail',
      message: 'Course not found.',
    });
    return null;
  }

  if (course.instructorId !== userId) {
    const actor = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (actor?.role !== 'ADMIN') {
      res.status(403).json({
        status: 'fail',
        message: 'You can only manage your own courses.',
      });
      return null;
    }
  }

  return course;
};

export const parsePositiveInt = (value: string | undefined): number | null => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
};

export const normalizeOptionalText = (
  value: unknown,
): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const normalizeRequiredText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
