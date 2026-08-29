import { nanoid } from 'nanoid';
import db from '../../../db/db.js';
import {
  CourseLevel,
  CourseStatus,
  LectureType,
} from '../../../generated/prisma/client.js';
import {
  PLACEHOLDER_COURSE_CATEGORY,
  PLACEHOLDER_COURSE_TITLE,
} from '../../../domain/course-publish-readiness.js';

export const DEFAULT_COURSE_TITLE = PLACEHOLDER_COURSE_TITLE;
export const DEFAULT_COURSE_CATEGORY = PLACEHOLDER_COURSE_CATEGORY;
export const DEFAULT_SECTION_TITLE = 'Untitled Section';
export const DEFAULT_LECTURE_TITLE = 'Untitled Lecture';
export const DRAFT_SLUG_PREFIX = 'draft_';

export const COURSE_LEVELS: readonly string[] = [
  CourseLevel.Beginner,
  CourseLevel.Intermediate,
  CourseLevel.Advanced,
];

export const COURSE_STATUSES: readonly string[] = [
  CourseStatus.Draft,
  CourseStatus.Published,
];

export const LECTURE_TYPES: readonly string[] = [
  LectureType.Video,
  LectureType.Text,
  LectureType.Quiz,
  LectureType.Pdf,
];

export type ReorderBody = {
  orderedIds?: number[];
};

export type LectureBody = {
  title?: string;
  type?: string;
  content?: string | null;
  videoKey?: string | null;
  pdfKey?: string | null;
};

export type UpdateCourseMetadataBody = {
  title?: string;
  description?: string | null;
  category?: string;
  image?: string | null;
  price?: number;
  level?: string;
  status?: string;
};

const slugifyTitle = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, 60)
    .replace(/-+$/, '');

export const buildUniqueCourseSlug = async (title: string): Promise<string> => {
  const base = slugifyTitle(title) || 'course';
  const taken = await db.course.findUnique({
    where: { slug: base },
    select: { id: true },
  });
  return taken ? `${base}-${nanoid(6).toLowerCase()}` : base;
};
