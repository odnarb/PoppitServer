CREATE TABLE `games` (
    `id` INT AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `images` JSON NULL,
    `url` VARCHAR(2000) NOT NULL DEFAULT '',
    `is_live` INT NOT NULL DEFAULT 0,
    `data` JSON NULL,
    `active` INT NOT NULL DEFAULT 1,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `update_user_id` INT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `create_user_id` INT NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
