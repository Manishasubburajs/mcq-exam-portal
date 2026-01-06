-- CreateTable
CREATE TABLE `exam_questions` (
    `exam_question_id` INTEGER NOT NULL AUTO_INCREMENT,
    `exam_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `question_order` INTEGER NOT NULL,

    INDEX `idx_exam_order`(`exam_id`, `question_order`),
    INDEX `question_id`(`question_id`),
    UNIQUE INDEX `unique_exam_question`(`exam_id`, `question_id`),
    PRIMARY KEY (`exam_question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exams` (
    `exam_id` INTEGER NOT NULL AUTO_INCREMENT,
    `exam_title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('draft', 'published') NULL DEFAULT 'draft',
    `subject_id` INTEGER NULL,
    `time_limit_minutes` INTEGER NULL DEFAULT 30,
    `duration_minutes` INTEGER NULL DEFAULT 0,
    `total_marks` DECIMAL(12, 4) NULL DEFAULT 0,
    `question_count` INTEGER NULL DEFAULT 0,
    `scheduled_start` DATETIME(0) NULL,
    `scheduled_end` DATETIME(0) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_by` INTEGER NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `created_by`(`created_by`),
    INDEX `idx_active`(`is_active`),
    INDEX `idx_scheduled_time`(`scheduled_start`, `scheduled_end`),
    INDEX `subject_id`(`subject_id`),
    UNIQUE INDEX `uq_subject_title`(`subject_id`, `exam_title`),
    PRIMARY KEY (`exam_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `question_id` INTEGER NOT NULL AUTO_INCREMENT,
    `exam_id` INTEGER NULL,
    `question_text` TEXT NOT NULL,
    `option_a` TEXT NULL,
    `option_b` TEXT NULL,
    `option_c` TEXT NULL,
    `option_d` TEXT NULL,
    `correct_answer` CHAR(1) NULL,
    `marks` DECIMAL(8, 4) NULL DEFAULT 1,
    `negative_marks` DECIMAL(8, 4) NULL DEFAULT 0,
    `difficulty` ENUM('Easy', 'Medium', 'Hard') NULL DEFAULT 'Medium',
    `subject_id` INTEGER NULL,
    `topic_id` INTEGER NULL,
    `created_by` INTEGER NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_draft` BOOLEAN NULL DEFAULT false,
    `examsExam_id` INTEGER NULL,

    INDEX `created_by`(`created_by`),
    INDEX `exam_id`(`exam_id`),
    INDEX `idx_difficulty`(`difficulty`),
    INDEX `idx_subject`(`subject_id`),
    INDEX `idx_topic`(`topic_id`),
    PRIMARY KEY (`question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_answers` (
    `answer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `attempt_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `selected_answer` CHAR(1) NULL,
    `is_correct` BOOLEAN NULL DEFAULT false,
    `answered_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `time_taken_seconds` INTEGER NULL,
    `view_time_seconds` INTEGER NULL,
    `first_viewed_at` DATETIME(3) NULL,
    `last_viewed_at` DATETIME(3) NULL,
    `marks_awarded` DECIMAL(12, 4) NULL DEFAULT 0,

    INDEX `idx_attempt_id`(`attempt_id`),
    INDEX `question_id`(`question_id`),
    UNIQUE INDEX `unique_attempt_question`(`attempt_id`, `question_id`),
    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_details` (
    `student_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `dob` DATE NOT NULL,
    `gender` ENUM('male', 'female', 'other') NOT NULL,
    `school` VARCHAR(100) NOT NULL,
    `grade` VARCHAR(20) NOT NULL,
    `section` VARCHAR(20) NULL,

    UNIQUE INDEX `user_id_unique`(`user_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`student_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_exam_attempts` (
    `attempt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `exam_id` INTEGER NOT NULL,
    `start_time` DATETIME(0) NOT NULL,
    `end_time` DATETIME(0) NULL,
    `total_time_seconds` INTEGER NULL,
    `score` DECIMAL(12, 4) NULL DEFAULT 0,
    `total_questions` INTEGER NOT NULL,
    `correct_answers` INTEGER NULL DEFAULT 0,
    `wrong_answers` INTEGER NULL DEFAULT 0,
    `unanswered` INTEGER NULL DEFAULT 0,
    `status` ENUM('in-progress', 'completed', 'expired') NULL DEFAULT 'in-progress',
    `current_question_id` INTEGER NULL,
    `last_activity` DATETIME(3) NULL,

    INDEX `exam_id`(`exam_id`),
    INDEX `idx_start_time`(`start_time`),
    INDEX `idx_student_exam`(`student_id`, `exam_id`),
    PRIMARY KEY (`attempt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subjects` (
    `subject_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `topic_count` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `subject_name`(`subject_name`),
    INDEX `subjects_subject_name_idx`(`subject_name`),
    PRIMARY KEY (`subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topics` (
    `topic_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_id` INTEGER NOT NULL,
    `topic_name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `topics_subject_id_idx`(`subject_id`),
    PRIMARY KEY (`topic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'student') NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `last_login` TIMESTAMP(0) NULL,
    `status` ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
    `department` VARCHAR(100) NULL,

    UNIQUE INDEX `username`(`username`),
    UNIQUE INDEX `email`(`email`),
    INDEX `idx_email`(`email`),
    INDEX `idx_role`(`role`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exam_questions` ADD CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`exam_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exam_questions` ADD CONSTRAINT `exam_questions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`topic_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_examsExam_id_fkey` FOREIGN KEY (`examsExam_id`) REFERENCES `exams`(`exam_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_answers` ADD CONSTRAINT `student_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `student_exam_attempts`(`attempt_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_answers` ADD CONSTRAINT `student_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_details` ADD CONSTRAINT `student_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_exam_attempts` ADD CONSTRAINT `student_exam_attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_exam_attempts` ADD CONSTRAINT `student_exam_attempts_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`exam_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `topics` ADD CONSTRAINT `topics_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
