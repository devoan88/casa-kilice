-- ContentSubmission replaces MuseContent; User gains Muse profile fields.

CREATE TABLE "ContentSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ContentSubmission_userId_idx" ON "ContentSubmission"("userId");

INSERT INTO "ContentSubmission" ("id", "userId", "fileUrl", "type", "status", "pointsAwarded", "createdAt", "updatedAt")
SELECT
    "id",
    "userId",
    "storageKey",
    CASE WHEN lower("type") = 'video' THEN 'Video' ELSE 'Photo' END,
    CASE WHEN lower("status") = 'approved' THEN 'Approved' ELSE 'Pending' END,
    0,
    "createdAt",
    "updatedAt"
FROM "MuseContent";

DROP TABLE "MuseContent";

ALTER TABLE "User" ADD COLUMN "instagramHandle" TEXT;
ALTER TABLE "User" ADD COLUMN "tiktokHandle" TEXT;
ALTER TABLE "User" ADD COLUMN "followerCountRange" TEXT;
ALTER TABLE "User" ADD COLUMN "isMuse" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "User" DROP COLUMN "socialHandle";
