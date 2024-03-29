CREATE TABLE `company_campaigns` (
    `id` INT AUTO_INCREMENT,
    `company_id` INT NOT NULL,
    `game_id` INT NOT NULL,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `category` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `date_start` DATETIME NOT NULL DEFAULT NOW(),
    `date_end` DATETIME NOT NULL DEFAULT NOW(),
    `data` JSON NULL,
    `active` INT NOT NULL DEFAULT 1,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `update_user_id` INT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `create_user_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    KEY `company_id` (`company_id`),
    KEY `game_id` (`game_id`),
    CONSTRAINT `company_campaigns_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `user_companies` (`id`),
    CONSTRAINT `company_campaigns_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;