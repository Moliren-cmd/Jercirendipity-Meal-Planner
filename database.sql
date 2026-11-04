CREATE DATABASE IF NOT EXISTS filipino_student_meal_planner
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE filipino_student_meal_planner;

CREATE TABLE IF NOT EXISTS planner_state (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  payload LONGTEXT NOT NULL,
  revision INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO planner_state (id, payload, revision)
VALUES (1, '{}', 0)
ON DUPLICATE KEY UPDATE id = VALUES(id);

