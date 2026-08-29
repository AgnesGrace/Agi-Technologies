-- Per-lesson progress + continue-learning pointer on course Progress.

ALTER TABLE "Progress" ADD COLUMN IF NOT EXISTS "lastLectureId" INTEGER;

CREATE TABLE IF NOT EXISTS "LectureProgress" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "lectureId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LectureProgress_userId_lectureId_key"
  ON "LectureProgress"("userId", "lectureId");

CREATE INDEX IF NOT EXISTS "LectureProgress_userId_courseId_idx"
  ON "LectureProgress"("userId", "courseId");

CREATE INDEX IF NOT EXISTS "LectureProgress_lectureId_idx"
  ON "LectureProgress"("lectureId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LectureProgress_userId_fkey'
  ) THEN
    ALTER TABLE "LectureProgress"
      ADD CONSTRAINT "LectureProgress_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LectureProgress_lectureId_fkey'
  ) THEN
    ALTER TABLE "LectureProgress"
      ADD CONSTRAINT "LectureProgress_lectureId_fkey"
      FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LectureProgress_courseId_fkey'
  ) THEN
    ALTER TABLE "LectureProgress"
      ADD CONSTRAINT "LectureProgress_courseId_fkey"
      FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
