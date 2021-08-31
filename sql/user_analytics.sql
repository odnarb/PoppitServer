CREATE TABLE `user_analytics` (
    `id` INT AUTO_INCREMENT,
    `user_id` INT NOT NULL DEFAULT 0,
    `method` VARCHAR(80) NOT NULL DEFAULT '',
    `path` VARCHAR(1000) NOT NULL DEFAULT '',
    -- tap, swipe, click, etc
    `action` VARCHAR(1000) NOT NULL DEFAULT '',
    `data` JSON NULL,
    `active` INT NOT NULL DEFAULT 1,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `update_user_id` INT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `create_user_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `user_analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
