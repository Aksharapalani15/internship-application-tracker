-- =============================================================================
-- Internship Application Tracker - Database Schema
-- RDBMS: MySQL 8.0+
-- Storage Engine: InnoDB
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- =============================================================================

-- 1. Create database if not exists
CREATE DATABASE IF NOT EXISTS `internship_tracker`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `internship_tracker`;

-- =============================================================================
-- Table: users
-- Purpose: Stores user accounts with securely hashed passwords
-- =============================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_unique_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Table: applications
-- Purpose: Stores individual internship applications owned by registered users
-- =============================================================================
CREATE TABLE IF NOT EXISTS `applications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `company_name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `company_website` VARCHAR(255) NULL,
  `application_url` VARCHAR(255) NULL,
  `location` VARCHAR(150) NULL,
  `work_mode` ENUM('Remote', 'Hybrid', 'Onsite') NOT NULL DEFAULT 'Onsite',
  `internship_type` VARCHAR(100) NULL,
  `stipend_amount` DECIMAL(12, 2) NULL,
  `stipend_currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `duration` VARCHAR(100) NULL,
  `application_deadline` DATE NULL,
  `date_applied` DATE NULL,
  `status` ENUM('Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn') NOT NULL DEFAULT 'Applied',
  `notes` TEXT NULL,
  `next_action` VARCHAR(255) NULL,
  `follow_up_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_applications_user_id` 
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `chk_applications_stipend_non_negative` 
    CHECK (`stipend_amount` IS NULL OR `stipend_amount` >= 0),
  -- Indexes optimized for user-scoped filtering, analytics, deadlines, and sorting:
  INDEX `idx_applications_user_id` (`user_id`),
  INDEX `idx_applications_user_status` (`user_id`, `status`),
  INDEX `idx_applications_user_date_applied` (`user_id`, `date_applied`),
  INDEX `idx_applications_user_deadline` (`user_id`, `application_deadline`),
  INDEX `idx_applications_user_follow_up` (`user_id`, `follow_up_date`),
  INDEX `idx_applications_user_company` (`user_id`, `company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
