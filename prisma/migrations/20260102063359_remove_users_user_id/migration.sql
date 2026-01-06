/*
  Warnings:

  - You are about to drop the column `usersUser_id` on the `exam_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `usersUser_id` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `usersUser_id` on the `questions` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `exams` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `exam_assignments` DROP FOREIGN KEY `exam_assignments_usersUser_id_fkey`;

-- DropForeignKey
ALTER TABLE `exams` DROP FOREIGN KEY `exams_usersUser_id_fkey`;

-- DropForeignKey
ALTER TABLE `questions` DROP FOREIGN KEY `questions_usersUser_id_fkey`;

-- DropIndex
DROP INDEX `exam_assignments_usersUser_id_fkey` ON `exam_assignments`;

-- DropIndex
DROP INDEX `exams_usersUser_id_fkey` ON `exams`;

-- DropIndex
DROP INDEX `questions_usersUser_id_fkey` ON `questions`;

-- AlterTable
ALTER TABLE `exam_assignments` DROP COLUMN `usersUser_id`;

-- AlterTable
ALTER TABLE `exams` DROP COLUMN `usersUser_id`,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `updated_by` INTEGER NULL;

-- AlterTable
ALTER TABLE `questions` DROP COLUMN `usersUser_id`,
    ADD COLUMN `updated_by` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_assignments` ADD CONSTRAINT `exam_assignments_assigned_by_fkey` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
