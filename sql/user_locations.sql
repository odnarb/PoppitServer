-- user_locations
CREATE TABLE `user_locations` (
    `id` INT AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `address` VARCHAR(255) NOT NULL DEFAULT '',
    `city` VARCHAR(80) NOT NULL DEFAULT '',
    `state` VARCHAR(80) NOT NULL DEFAULT '',
    `zip` VARCHAR(5) NOT NULL DEFAULT '',
    `country_code` VARCHAR(2) NOT NULL DEFAULT '',
    `latitude` VARCHAR(30) NOT NULL DEFAULT '',
    `longitude` VARCHAR(30) NOT NULL DEFAULT '',
    `altitude` VARCHAR(30) NOT NULL DEFAULT '',
    `polygon` JSON NULL,

    `data` JSON NULL,
    `date_start` DATETIME NOT NULL DEFAULT NOW(),
    `date_end` DATETIME NOT NULL DEFAULT NOW(),
    `active` INT NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `user_locations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;