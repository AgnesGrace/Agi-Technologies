-- Phase 2: store money as integer cents + add list/filter indexes.
-- Safe to re-run: only converts float dollar columns; skips if already integer cents.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Course'
      AND column_name = 'price'
      AND data_type IN ('double precision', 'real', 'numeric')
  ) THEN
    ALTER TABLE "Course" ALTER COLUMN "price" DROP DEFAULT;
    ALTER TABLE "Course"
      ALTER COLUMN "price" TYPE INTEGER
      USING ROUND("price" * 100)::integer;
    ALTER TABLE "Course" ALTER COLUMN "price" SET DEFAULT 0;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Transaction'
      AND column_name = 'amount'
      AND data_type IN ('double precision', 'real', 'numeric')
  ) THEN
    ALTER TABLE "Transaction"
      ALTER COLUMN "amount" TYPE INTEGER
      USING ROUND("amount" * 100)::integer;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Course_category_idx" ON "Course"("category");
CREATE INDEX IF NOT EXISTS "Course_instructorId_status_idx"
  ON "Course"("instructorId", "status");
CREATE INDEX IF NOT EXISTS "Enrollment_userId_idx" ON "Enrollment"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");
