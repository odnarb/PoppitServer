-- user_account_history
-- payment history for users
CREATE TABLE `user_account_history` (
    `id` INT AUTO_INCREMENT,
    `user_id` INT NOT NULL DEFAULT 0,
    `amount` FLOAT NOT NULL DEFAULT 0,
    `num_locations` INT NOT NULL DEFAULT 0,
    `num_campaigns` INT NOT NULL DEFAULT 0,
    `notes` VARCHAR(1000) NOT NULL DEFAULT '',
    `date_start` DATETIME NOT NULL,
    `date_end` DATETIME NOT NULL,
    `data` json DEFAULT NULL,
    `update_user_id` int NOT NULL DEFAULT 0,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `create_user_id` int NOT NULL DEFAULT 0,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `user_account_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;