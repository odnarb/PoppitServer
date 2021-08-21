CREATE TABLE `notification_methods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(256) NOT NULL DEFAULT '',
  `update_user_id` int NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
