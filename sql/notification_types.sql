CREATE TABLE `notification_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(256) NOT NULL DEFAULT '',
  `data` JSON NULL,
  `active` INT NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT NOW(),
  `update_user_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `create_user_id` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
