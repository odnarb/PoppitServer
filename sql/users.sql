CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT,
    `user_type_id` int NOT NULL,
    `is_admin` int NOT NULL DEFAULT 0,
    `is_support` int NOT NULL DEFAULT 0,
    `first_name` VARCHAR(80) NOT NULL DEFAULT '',
    `last_name` VARCHAR(80) NOT NULL DEFAULT '',
    `email_address` VARCHAR(255) NOT NULL DEFAULT '',
    `phone` varchar(30) NOT NULL DEFAULT '',
    `profession` varchar(80) NOT NULL DEFAULT '',
    `gender` varchar(1) NOT NULL DEFAULT 'M',
    `address1` varchar(500) DEFAULT '',
    `address2` varchar(500) DEFAULT '',
    `city` varchar(200) DEFAULT '',
    `state_province` varchar(200) NOT NULL DEFAULT '',
    `country` varchar(200) DEFAULT '',
    `country_code` varchar(2) DEFAULT '',
    `postal_code` varchar(100) DEFAULT '',
    `profile_picture` varchar(255) NOT NULL DEFAULT '',
    `verified` int NOT NULL DEFAULT 0,
    `needs_pw_change` int NOT NULL DEFAULT 0,
    `password_hash` varchar(255) NOT NULL,
    `forgot_password_token` varchar(255) NOT NULL DEFAULT '',
    `invite_token` varchar(255) NOT NULL DEFAULT '',
    `registration_type` VARCHAR(80) NOT NULL DEFAULT '',
    `notifications` JSON NULL,
    `active` int NOT NULL DEFAULT 1,
    `data` json DEFAULT NULL,
    `update_user_id` int NOT NULL DEFAULT 0,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `create_user_id` int NOT NULL DEFAULT 0,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email_address` (`email_address`),
    KEY `user_type_id` (`user_type_id`),
    CONSTRAINT `users_ibfk_1` FOREIGN KEY (`user_type_id`) REFERENCES `user_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;