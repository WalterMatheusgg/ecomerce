
-- DropIndex if exists
DROP INDEX IF EXISTS "Category_name_key";

-- Create partial unique index ignoring soft-deleted rows
CREATE UNIQUE INDEX "Category_name_active_key"
ON "Category" ("name")
WHERE "deletedAt" IS NULL;
