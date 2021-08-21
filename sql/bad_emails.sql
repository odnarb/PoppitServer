CREATE TABLE `bad_emails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email_address` varchar(256) NOT NULL DEFAULT '',
  `reason` varchar(80) NOT NULL DEFAULT '',
  `reason_detail` TEXT NOT NULL,
  `data` json DEFAULT NULL,
  `update_user_id` int NOT NULL DEFAULT 0,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_address` (`email_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;