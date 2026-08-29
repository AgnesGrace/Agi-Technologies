import db from '../db/db.js';
import {
  CoursePublishReadiness,
  CoursePublishSnapshot,
  evaluateCoursePublishReadiness,
} from '../domain/course-publish-readiness.js';

/**
 * Loads the fields needed to decide if a course may go live.
 * Keeps Prisma details out of the pure readiness evaluator.
 */
export const loadCoursePublishSnapshot = async (
  courseId: number,
): Promise<CoursePublishSnapshot | null> => {
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
      description: true,
      category: true,
      price: true,
      image: true,
      _count: {
        select: {
          sections: true,
        },
      },
    },
  });

  if (!course) return null;

  const lectureCount = await db.lecture.count({
    where: { section: { courseId } },
  });

  return {
    title: course.title,
    description: course.description,
    category: course.category,
    priceCents: course.price,
    coverImageKey: course.image,
    sectionCount: course._count.sections,
    lectureCount,
  };
};

export const getCoursePublishReadiness = async (
  courseId: number,
): Promise<CoursePublishReadiness | null> => {
  const snapshot = await loadCoursePublishSnapshot(courseId);
  if (!snapshot) return null;
  return evaluateCoursePublishReadiness(snapshot);
};

/**
 * Builds a snapshot from the in-flight PATCH body merged with the current row,
 * so publish validation uses the values about to be saved.
 */
export const buildPublishSnapshotFromDraft = ({
  current,
  nextTitle,
  nextDescription,
  nextCategory,
  nextPriceCents,
  nextCoverImageKey,
  sectionCount,
  lectureCount,
}: {
  current: {
    title: string;
    description: string | null;
    category: string;
    price: number;
    image?: string | null;
  };
  nextTitle: string;
  nextDescription: string | null | undefined;
  nextCategory: string;
  nextPriceCents: number;
  nextCoverImageKey?: string | null;
  sectionCount: number;
  lectureCount: number;
}): CoursePublishSnapshot => ({
  title: nextTitle,
  description:
    nextDescription !== undefined ? nextDescription : current.description,
  category: nextCategory,
  priceCents: nextPriceCents,
  coverImageKey:
    nextCoverImageKey !== undefined ? nextCoverImageKey : current.image,
  sectionCount,
  lectureCount,
});
