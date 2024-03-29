CREATE TABLE `user_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT 0,
  `notification_type_id` int NOT NULL DEFAULT 1,
  `notification_method_id` int NOT NULL DEFAULT 1,
  `to_email` varchar(256) NOT NULL DEFAULT '',
  `from_email` varchar(256) NOT NULL DEFAULT '',
  `subject` varchar(256) NOT NULL DEFAULT '',
  `body_html` text NOT NULL,
  `body_text` text NOT NULL,
  `status` int NOT NULL DEFAULT 0,
  `status_detail` varchar(1000) NOT NULL DEFAULT '',
  `data` JSON NULL,
  `active` INT NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT NOW(),
  `update_user_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `create_user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_type_id` (`notification_type_id`),
  KEY `notification_method_id` (`notification_method_id`),
  CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`notification_type_id`) REFERENCES `notification_types` (`id`),
  CONSTRAINT `user_notifications_ibfk_2` FOREIGN KEY (`notification_method_id`) REFERENCES `notification_methods` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;