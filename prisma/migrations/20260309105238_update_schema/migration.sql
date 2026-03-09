-- AlterTable
ALTER TABLE `questions` ADD COLUMN `explanation` TEXT NULL;

-- AlterTable
ALTER TABLE `student_exam_attempts` ADD COLUMN `accuracy` DECIMAL(5, 2) NULL DEFAULT 0,
    ADD COLUMN `result` ENUM('pass', 'fail') NULL;
