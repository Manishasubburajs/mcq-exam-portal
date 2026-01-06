/*
  Warnings:

  - You are about to drop the column `duration_minutes` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `subject_id` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `exam_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `examsExam_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `is_draft` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `answered_at` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `first_viewed_at` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `last_viewed_at` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `view_time_seconds` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `student_details` table. All the data in the column will be lost.
  - You are about to drop the column `school` on the `student_details` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `student_details` table. All the data in the column will be lost.
  - You are about to drop the column `current_question_id` on the `student_exam_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `last_activity` on the `student_exam_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `total_questions` on the `student_exam_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `topic_count` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[student_id,exam_id]` on the table `student_exam_attempts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assigned_marks` to the `exam_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assigned_negative` to the `exam_questions` table without a default value. This is not possible if the table is not empty.
  - Made the column `time_limit_minutes` on table `exams` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total_marks` on table `exams` required. This step will fail if there are existing NULL values in that column.
  - Made the column `question_count` on table `exams` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_active` on table `exams` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `exams` required. This step will fail if there are existing NULL values in that column.
  - Made the column `marks` on table `questions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `negative_marks` on table `questions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `difficulty` on table `questions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subject_id` on table `questions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `topic_id` on table `questions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `questions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `questions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_correct` on table `student_answers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `marks_awarded` on table `student_answers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `score` on table `student_exam_attempts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `correct_answers` on table `student_exam_attempts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `wrong_answers` on table `student_exam_attempts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unanswered` on table `student_exam_attempts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `student_exam_attempts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `exam_questions` DROP FOREIGN KEY `exam_questions_ibfk_1`;

-- DropForeignKey
ALTER TABLE `exam_questions` DROP FOREIGN KEY `exam_questions_ibfk_2`;

-- DropForeignKey
ALTER TABLE `exams` DROP FOREIGN KEY `exams_ibfk_1`;

-- DropForeignKey
ALTER TABLE `exams` DROP FOREIGN KEY `exams_ibfk_2`;

-- DropForeignKey
ALTER TABLE `questions` DROP FOREIGN KEY `questions_examsExam_id_fkey`;

-- DropForeignKey
ALTER TABLE `questions` DROP FOREIGN KEY `questions_ibfk_1`;

-- DropForeignKey
ALTER TABLE `questions` DROP FOREIGN KEY `questions_ibfk_2`;

-- DropForeignKey
ALTER TABLE `questions` DROP FOREIGN KEY `questions_ibfk_3`;

-- DropForeignKey
ALTER TABLE `student_answers` DROP FOREIGN KEY `student_answers_ibfk_1`;

-- DropForeignKey
ALTER TABLE `student_answers` DROP FOREIGN KEY `student_answers_ibfk_2`;

-- DropForeignKey
ALTER TABLE `student_details` DROP FOREIGN KEY `student_details_ibfk_1`;

-- DropForeignKey
ALTER TABLE `student_exam_attempts` DROP FOREIGN KEY `student_exam_attempts_ibfk_1`;

-- DropForeignKey
ALTER TABLE `student_exam_attempts` DROP FOREIGN KEY `student_exam_attempts_ibfk_2`;

-- DropForeignKey
ALTER TABLE `topics` DROP FOREIGN KEY `topics_subject_id_fkey`;

-- DropIndex
DROP INDEX `idx_exam_order` ON `exam_questions`;

-- DropIndex
DROP INDEX `question_id` ON `exam_questions`;

-- DropIndex
DROP INDEX `idx_active` ON `exams`;

-- DropIndex
DROP INDEX `idx_scheduled_time` ON `exams`;

-- DropIndex
DROP INDEX `subject_id` ON `exams`;

-- DropIndex
DROP INDEX `uq_subject_title` ON `exams`;

-- DropIndex
DROP INDEX `created_by` ON `questions`;

-- DropIndex
DROP INDEX `exam_id` ON `questions`;

-- DropIndex
DROP INDEX `idx_difficulty` ON `questions`;

-- DropIndex
DROP INDEX `questions_examsExam_id_fkey` ON `questions`;

-- DropIndex
DROP INDEX `idx_attempt_id` ON `student_answers`;

-- DropIndex
DROP INDEX `question_id` ON `student_answers`;

-- DropIndex
DROP INDEX `user_id` ON `student_details`;

-- DropIndex
DROP INDEX `exam_id` ON `student_exam_attempts`;

-- DropIndex
DROP INDEX `idx_start_time` ON `student_exam_attempts`;

-- DropIndex
DROP INDEX `idx_student_exam` ON `student_exam_attempts`;

-- DropIndex
DROP INDEX `subjects_subject_name_idx` ON `subjects`;

-- AlterTable
ALTER TABLE `exam_questions` ADD COLUMN `assigned_marks` DECIMAL(8, 4) NOT NULL,
    ADD COLUMN `assigned_negative` DECIMAL(8, 4) NOT NULL;

-- AlterTable
ALTER TABLE `exams` DROP COLUMN `duration_minutes`,
    DROP COLUMN `status`,
    DROP COLUMN `subject_id`,
    ADD COLUMN `allow_multiple_attempts` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `exam_type` ENUM('practice', 'mock', 'live') NOT NULL DEFAULT 'practice',
    ADD COLUMN `usersUser_id` INTEGER NULL,
    MODIFY `time_limit_minutes` INTEGER NOT NULL DEFAULT 30,
    MODIFY `total_marks` DECIMAL(12, 4) NOT NULL DEFAULT 0,
    MODIFY `question_count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `scheduled_start` DATETIME(3) NULL,
    MODIFY `scheduled_end` DATETIME(3) NULL,
    MODIFY `is_active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `questions` DROP COLUMN `exam_id`,
    DROP COLUMN `examsExam_id`,
    DROP COLUMN `is_draft`,
    ADD COLUMN `usersUser_id` INTEGER NULL,
    MODIFY `marks` DECIMAL(8, 4) NOT NULL DEFAULT 2,
    MODIFY `negative_marks` DECIMAL(8, 4) NOT NULL DEFAULT 0.66,
    MODIFY `difficulty` ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Medium',
    MODIFY `subject_id` INTEGER NOT NULL,
    MODIFY `topic_id` INTEGER NOT NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `student_answers` DROP COLUMN `answered_at`,
    DROP COLUMN `first_viewed_at`,
    DROP COLUMN `last_viewed_at`,
    DROP COLUMN `view_time_seconds`,
    MODIFY `is_correct` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `marks_awarded` DECIMAL(12, 4) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `student_details` DROP COLUMN `grade`,
    DROP COLUMN `school`,
    DROP COLUMN `section`;

-- AlterTable
ALTER TABLE `student_exam_attempts` DROP COLUMN `current_question_id`,
    DROP COLUMN `last_activity`,
    DROP COLUMN `total_questions`,
    MODIFY `start_time` DATETIME(3) NOT NULL,
    MODIFY `end_time` DATETIME(3) NULL,
    MODIFY `score` DECIMAL(12, 4) NOT NULL DEFAULT 0,
    MODIFY `correct_answers` INTEGER NOT NULL DEFAULT 0,
    MODIFY `wrong_answers` INTEGER NOT NULL DEFAULT 0,
    MODIFY `unanswered` INTEGER NOT NULL DEFAULT 0,
    MODIFY `status` ENUM('in_progress', 'completed', 'expired') NOT NULL DEFAULT 'in_progress';

-- AlterTable
ALTER TABLE `subjects` DROP COLUMN `topic_count`,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `topics` DROP COLUMN `created_at`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `department`,
    DROP COLUMN `last_login`,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `exam_subject_configs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exam_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `topic_id` INTEGER NULL,
    `question_count` INTEGER NOT NULL,

    INDEX `exam_subject_configs_exam_id_idx`(`exam_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exam_id` INTEGER NOT NULL,
    `assigned_by` INTEGER NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mode` ENUM('same', 'shuffle', 'random') NOT NULL,
    `usersUser_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_assignment_students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assignment_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,

    UNIQUE INDEX `exam_assignment_students_assignment_id_student_id_key`(`assignment_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `exams_exam_type_idx` ON `exams`(`exam_type`);

-- CreateIndex
CREATE UNIQUE INDEX `student_exam_attempts_student_id_exam_id_key` ON `student_exam_attempts`(`student_id`, `exam_id`);

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_usersUser_id_fkey` FOREIGN KEY (`usersUser_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_subject_configs` ADD CONSTRAINT `exam_subject_configs_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`exam_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_subject_configs` ADD CONSTRAINT `exam_subject_configs_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_subject_configs` ADD CONSTRAINT `exam_subject_configs_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`topic_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_questions` ADD CONSTRAINT `exam_questions_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`exam_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_questions` ADD CONSTRAINT `exam_questions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`topic_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_usersUser_id_fkey` FOREIGN KEY (`usersUser_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_answers` ADD CONSTRAINT `student_answers_attempt_id_fkey` FOREIGN KEY (`attempt_id`) REFERENCES `student_exam_attempts`(`attempt_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_answers` ADD CONSTRAINT `student_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_details` ADD CONSTRAINT `student_details_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_exam_attempts` ADD CONSTRAINT `student_exam_attempts_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_exam_attempts` ADD CONSTRAINT `student_exam_attempts_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`exam_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_assignments` ADD CONSTRAINT `exam_assignments_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`exam_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_assignments` ADD CONSTRAINT `exam_assignments_usersUser_id_fkey` FOREIGN KEY (`usersUser_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_assignment_students` ADD CONSTRAINT `exam_assignment_students_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `exam_assignments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_assignment_students` ADD CONSTRAINT `exam_assignment_students_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topics` ADD CONSTRAINT `topics_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `exam_questions` RENAME INDEX `unique_exam_question` TO `exam_questions_exam_id_question_id_key`;

-- RenameIndex
ALTER TABLE `exams` RENAME INDEX `created_by` TO `exams_created_by_idx`;

-- RenameIndex
ALTER TABLE `questions` RENAME INDEX `idx_subject` TO `questions_subject_id_idx`;

-- RenameIndex
ALTER TABLE `questions` RENAME INDEX `idx_topic` TO `questions_topic_id_idx`;

-- RenameIndex
ALTER TABLE `student_answers` RENAME INDEX `unique_attempt_question` TO `student_answers_attempt_id_question_id_key`;

-- RenameIndex
ALTER TABLE `student_details` RENAME INDEX `user_id_unique` TO `student_details_user_id_key`;

-- RenameIndex
ALTER TABLE `subjects` RENAME INDEX `subject_name` TO `subjects_subject_name_key`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `email` TO `users_email_key`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `idx_email` TO `users_email_idx`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `idx_role` TO `users_role_idx`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `username` TO `users_username_key`;
