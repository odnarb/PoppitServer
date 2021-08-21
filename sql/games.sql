-- games
CREATE TABLE `games` (
    `id` INT AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `images` JSON NULL,
    `url` VARCHAR(2000) NOT NULL DEFAULT '',
    `is_live` INT NOT NULL DEFAULT 0,
    `active` int NOT NULL DEFAULT 1,
    `data` json DEFAULT NULL,
    `update_user_id` int NOT NULL DEFAULT 0,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `create_user_id` int NOT NULL DEFAULT 0,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
