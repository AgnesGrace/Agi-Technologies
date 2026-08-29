-- Lecture assets: S3-ready keys + Pdf type. videoUrl -> videoKey.

ALTER TYPE "LectureType" ADD VALUE IF NOT EXISTS 'Pdf';

ALTER TABLE "Lecture" ADD COLUMN IF NOT EXISTS "videoKey" TEXT;
ALTER TABLE "Lecture" ADD COLUMN IF NOT EXISTS "pdfKey" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lecture'
      AND column_name = 'videoUrl'
  ) THEN
    EXECUTE 'UPDATE "Lecture" SET "videoKey" = "videoUrl" WHERE "videoKey" IS NULL AND "videoUrl" IS NOT NULL';
    ALTER TABLE "Lecture" DROP COLUMN "videoUrl";
  END IF;
END $$;

ALTER TABLE "Lecture" ALTER COLUMN "type" SET DEFAULT 'Text';

CREATE INDEX IF NOT EXISTS "Section_courseId_order_idx" ON "Section"("courseId", "order");
CREATE INDEX IF NOT EXISTS "Lecture_sectionId_order_idx" ON "Lecture"("sectionId", "order");
