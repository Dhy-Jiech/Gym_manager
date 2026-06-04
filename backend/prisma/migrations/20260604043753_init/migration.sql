-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'TRAINER') NOT NULL DEFAULT 'STAFF',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `avatar_url` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(512) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_code` VARCHAR(20) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NOT NULL,
    `date_of_birth` DATE NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `address` TEXT NULL,
    `avatar_url` TEXT NULL,
    `emergency_contact` VARCHAR(100) NULL,
    `health_note` TEXT NULL,
    `qr_code` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_member_code_key`(`member_code`),
    UNIQUE INDEX `members_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membership_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `duration_days` INTEGER NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `features` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `memberships` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_id` INTEGER NOT NULL,
    `plan_id` INTEGER NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `price` DECIMAL(12, 2) NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `check_ins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_id` INTEGER NOT NULL,
    `checkin_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `checkout_at` DATETIME(3) NULL,
    `method` ENUM('QR', 'CARD', 'MANUAL') NOT NULL DEFAULT 'QR',
    `note` TEXT NULL,

    INDEX `check_ins_member_id_idx`(`member_id`),
    INDEX `check_ins_checkin_at_idx`(`checkin_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `specialization` VARCHAR(200) NULL,
    `bio` TEXT NULL,
    `certifications` JSON NULL,
    `hourly_rate` DECIMAL(10, 2) NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `trainers_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gym_classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `trainer_id` INTEGER NULL,
    `capacity` INTEGER NOT NULL DEFAULT 20,
    `duration_min` INTEGER NOT NULL DEFAULT 60,
    `level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL') NOT NULL DEFAULT 'ALL',
    `location` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `image_url` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `class_schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_id` INTEGER NOT NULL,
    `start_at` DATETIME(3) NOT NULL,
    `end_at` DATETIME(3) NOT NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `current_count` INTEGER NOT NULL DEFAULT 0,
    `note` TEXT NULL,

    INDEX `class_schedules_start_at_idx`(`start_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `class_bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schedule_id` INTEGER NOT NULL,
    `member_id` INTEGER NOT NULL,
    `status` ENUM('CONFIRMED', 'CANCELLED', 'ATTENDED', 'NO_SHOW') NOT NULL DEFAULT 'CONFIRMED',
    `booked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `attended_at` DATETIME(3) NULL,

    UNIQUE INDEX `class_bookings_schedule_id_member_id_key`(`schedule_id`, `member_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pt_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_id` INTEGER NOT NULL,
    `trainer_id` INTEGER NOT NULL,
    `scheduled_at` DATETIME(3) NOT NULL,
    `duration_min` INTEGER NOT NULL DEFAULT 60,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `note` TEXT NULL,
    `price` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_id` INTEGER NOT NULL,
    `membership_id` INTEGER NULL,
    `pt_session_id` INTEGER NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `method` ENUM('CASH', 'BANK_TRANSFER', 'VNPAY', 'MOMO') NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `reference_code` VARCHAR(100) NULL,
    `paid_at` DATETIME(3) NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_pt_session_id_key`(`pt_session_id`),
    INDEX `payments_member_id_idx`(`member_id`),
    INDEX `payments_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `serial_number` VARCHAR(100) NULL,
    `purchase_date` DATE NULL,
    `purchase_price` DECIMAL(12, 2) NULL,
    `status` ENUM('ACTIVE', 'MAINTENANCE', 'BROKEN', 'DISPOSED') NOT NULL DEFAULT 'ACTIVE',
    `location` VARCHAR(100) NULL,
    `last_maintained_at` DATETIME(3) NULL,
    `next_maintenance_at` DATETIME(3) NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `equipment_serial_number_key`(`serial_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipment_id` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `cost` DECIMAL(10, 2) NULL,
    `maintained_at` DATETIME(3) NOT NULL,
    `maintained_by` VARCHAR(100) NULL,
    `next_due_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `body` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `target_id` INTEGER NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `table_name` VARCHAR(50) NOT NULL,
    `record_id` INTEGER NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_table_name_record_id_idx`(`table_name`, `record_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `membership_plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `check_ins` ADD CONSTRAINT `check_ins_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trainers` ADD CONSTRAINT `trainers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gym_classes` ADD CONSTRAINT `gym_classes_trainer_id_fkey` FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_schedules` ADD CONSTRAINT `class_schedules_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `gym_classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_bookings` ADD CONSTRAINT `class_bookings_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `class_schedules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_bookings` ADD CONSTRAINT `class_bookings_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pt_sessions` ADD CONSTRAINT `pt_sessions_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pt_sessions` ADD CONSTRAINT `pt_sessions_trainer_id_fkey` FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_membership_id_fkey` FOREIGN KEY (`membership_id`) REFERENCES `memberships`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_pt_session_id_fkey` FOREIGN KEY (`pt_session_id`) REFERENCES `pt_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_logs` ADD CONSTRAINT `maintenance_logs_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
