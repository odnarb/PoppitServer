CREATE TABLE `user_rewards` (
    `id` INT AUTO_INCREMENT,
    `campaign_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `coupon_state` VARCHAR(80) NOT NULL DEFAULT '',
    `tries` INT NOT NULL,
    `data` JSON NULL,
    `active` INT NOT NULL DEFAULT 1,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `update_user_id` INT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `create_user_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    KEY `campaign_id` (`campaign_id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `user_rewards_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`),
    CONSTRAINT `user_rewards_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;