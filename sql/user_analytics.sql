-- user_analytics
-- this may be redundant, or not needed if we use some third party for analytics
CREATE TABLE `user_analytics` (
    `id` INT AUTO_INCREMENT,
    `user_id` INT NOT NULL DEFAULT 0,
    `method` VARCHAR(80) NOT NULL DEFAULT '',
    `path` VARCHAR(1000) NOT NULL DEFAULT '',
    -- tap, swipe, click, etc
    `action` VARCHAR(1000) NOT NULL DEFAULT '',
    `data` json DEFAULT NULL,
    `update_user_id` int NOT NULL DEFAULT 0,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `create_user_id` int NOT NULL DEFAULT 0,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `user_analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
