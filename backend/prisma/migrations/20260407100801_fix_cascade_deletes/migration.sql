-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_actorId_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activity_project_fk";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activity_task_fk";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "time_logs" DROP CONSTRAINT "time_logs_userId_fkey";

-- AddForeignKey
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
