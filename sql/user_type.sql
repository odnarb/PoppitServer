CREATE TABLE `user_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  -- `access_level_id` int NOT NULL,
  `user_type_name` varchar(200) NOT NULL DEFAULT '',
  `user_type_description` text NOT NULL,
  `data` JSON NULL,
  `active` INT NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT NOW(),
  `update_user_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `create_user_id` INT NOT NULL,
  PRIMARY KEY (`id`)
  -- KEY `access_level_id` (`access_level_id`),
  -- CONSTRAINT `user_type_ibfk_1` FOREIGN KEY (`access_level_id`) REFERENCES `access_level` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
