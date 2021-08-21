-- user_rewards
CREATE TABLE `user_rewards` (
    `id` INT AUTO_INCREMENT,
    `campaign_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `coupon_state` VARCHAR(80) NOT NULL DEFAULT '',
    `tries` INT NOT NULL,
    `data` json DEFAULT NULL,
    `update_user_id` int NOT NULL DEFAULT 0,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `create_user_id` int NOT NULL DEFAULT 0,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `campaign_id` (`campaign_id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `user_rewards_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`),
    CONSTRAINT `user_rewards_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;