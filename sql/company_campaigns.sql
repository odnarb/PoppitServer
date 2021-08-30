-- json column is for game(s), branding information, links to images, etc?
CREATE TABLE `company_campaigns` (
    `id` INT AUTO_INCREMENT,
    `company_id` INT NOT NULL,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `category` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `date_start` DATETIME NOT NULL DEFAULT NOW(),
    `date_end` DATETIME NOT NULL DEFAULT NOW(),
    `active` int NOT NULL DEFAULT 1,
    `data` json DEFAULT NULL,
    `update_user_id` int NOT NULL DEFAULT '0',
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `create_user_id` int NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `company_id` (`company_id`),
    CONSTRAINT `user_locations_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `user_companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;