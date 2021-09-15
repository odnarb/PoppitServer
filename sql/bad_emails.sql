CREATE TABLE `bad_emails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email_address` varchar(256) NOT NULL DEFAULT '',
  `reason` varchar(80) NOT NULL DEFAULT '',
  `reason_detail` TEXT NOT NULL,
  `data` JSON NULL,
  `active` INT NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT NOW(),
  `update_user_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `create_user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_address` (`email_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;