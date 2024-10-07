-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Todo', 'Progress', 'Done');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Minor', 'Low', 'Moderate', 'Important', 'Critical');

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'Minor',
    "status" "Status" NOT NULL DEFAULT 'Todo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);
