-- DropForeignKey
ALTER TABLE `student_exam_attempts` DROP FOREIGN KEY `student_exam_attempts_student_id_fkey`;

-- DropIndex
DROP INDEX `student_exam_attempts_student_id_exam_id_key` ON `student_exam_attempts`;

-- AlterTable
ALTER TABLE `exam_assignments` ADD COLUMN `shuffle_questions` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `exams` MODIFY `time_limit_minutes` INTEGER NULL;

-- AlterTable
ALTER TABLE `student_details` ADD COLUMN `grade` VARCHAR(50) NULL,
    ADD COLUMN `school` VARCHAR(255) NULL,
    ADD COLUMN `section` VARCHAR(10) NULL;

-- AlterTable
ALTER TABLE `student_exam_attempts` ADD COLUMN `attempt_number` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `student_exam_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attempt_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `question_order` INTEGER NOT NULL,

    INDEX `fk_seq_question`(`question_id`),
    INDEX `idx_attempt_id`(`attempt_id`),
    UNIQUE INDEX `uq_attempt_question`(`attempt_id`, `question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- AddForeignKey
ALTER TABLE `student_exam_questions` ADD CONSTRAINT `fk_seq_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `student_exam_attempts`(`attempt_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_exam_questions` ADD CONSTRAINT `fk_seq_question` FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
