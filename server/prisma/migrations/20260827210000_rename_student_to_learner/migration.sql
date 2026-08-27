-- Align UserRole with the Prisma schema (STUDENT -> LEARNER).
-- Required after renaming the enum in application code without updating Neon.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'UserRole'
      AND e.enumlabel = 'STUDENT'
  ) THEN
    ALTER TYPE "UserRole" RENAME VALUE 'STUDENT' TO 'LEARNER';
  END IF;
END $$;
