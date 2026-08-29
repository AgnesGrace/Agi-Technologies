import db from '../../../db/db.js';

export const recountCourseProgress = async (userId: string, courseId: number) => {
  const [totalLectures, completedLectures] = await Promise.all([
    db.lecture.count({
      where: { section: { courseId } },
    }),
    db.lectureProgress.count({
      where: {
        userId,
        courseId,
        isCompleted: true,
      },
    }),
  ]);

  const overallProgress =
    totalLectures === 0
      ? 0
      : Math.round((completedLectures / totalLectures) * 1000) / 10;

  const isCompleted =
    totalLectures > 0 && completedLectures >= totalLectures;

  return db.progress.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: {
      userId,
      courseId,
      overallProgress,
      isCompleted,
    },
    update: {
      overallProgress,
      isCompleted,
    },
  });
};

export const buildProgressPayload = async (userId: string, courseId: number) => {
  const [progress, completed] = await Promise.all([
    db.progress.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: {
        overallProgress: true,
        isCompleted: true,
        lastLectureId: true,
      },
    }),
    db.lectureProgress.findMany({
      where: { userId, courseId, isCompleted: true },
      select: { lectureId: true },
    }),
  ]);

  return {
    overallProgress: progress?.overallProgress ?? 0,
    isCompleted: progress?.isCompleted ?? false,
    lastLectureId: progress?.lastLectureId ?? null,
    completedLectureIds: completed.map((row) => row.lectureId),
  };
};
