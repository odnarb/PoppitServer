CREATE TABLE `user_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  -- `access_level_id` int NOT NULL,
  `user_type_name` varchar(200) NOT NULL DEFAULT '',
  `user_type_description` text NOT NULL,
  `active` int NOT NULL DEFAULT 1,
  `data` json DEFAULT NULL,
  `update_user_id` int NOT NULL DEFAULT 0,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  -- KEY `access_level_id` (`access_level_id`),
  -- CONSTRAINT `user_type_ibfk_1` FOREIGN KEY (`access_level_id`) REFERENCES `access_level` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
