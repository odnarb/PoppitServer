SET FOREIGN_KEY_CHECKS=0; -- to disable them

DROP TABLE IF EXISTS `poppit_users`;
DROP TABLE IF EXISTS `poppit_companies`;
DROP TABLE IF EXISTS `poppit_campaigns`;
DROP TABLE IF EXISTS `poppit_games`;
DROP TABLE IF EXISTS `poppit_company_games`;
DROP TABLE IF EXISTS `poppit_company_campaigns`;
DROP TABLE IF EXISTS `poppit_company_locations`;
DROP TABLE IF EXISTS `poppit_roles`;
DROP TABLE IF EXISTS `poppit_user_role`;
DROP TABLE IF EXISTS `poppit_roles_policies`;
DROP TABLE IF EXISTS `poppit_policies`;

SET FOREIGN_KEY_CHECKS=1; -- to re-enable them

-- poppit_users
CREATE TABLE `poppit_users` (
    `id` BIGINT AUTO_INCREMENT,
    `first_name` VARCHAR(80) NOT NULL DEFAULT '',
    `last_name` VARCHAR(80) NOT NULL DEFAULT '',
    `email_address` VARCHAR(255) NOT NULL DEFAULT '',
    `password_hash` VARCHAR(255) NOT NULL DEFAULT '',
    `active` INT NOT NULL DEFAULT 0,
    -- `address` VARCHAR(255) NOT NULL DEFAULT '',
    -- `city` VARCHAR(80) NOT NULL DEFAULT '',
    -- `state` VARCHAR(80) NOT NULL DEFAULT '',
    -- `zip` VARCHAR(5) NOT NULL DEFAULT '',
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_companies
CREATE TABLE `poppit_companies` (
    `id` BIGINT AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `first_name` VARCHAR(80) NOT NULL DEFAULT '',
    `last_name` VARCHAR(80) NOT NULL DEFAULT '',
    `email_address` VARCHAR(255) NOT NULL DEFAULT '',
    `password_hash` VARCHAR(255) NOT NULL DEFAULT '',
    `address` VARCHAR(255) NOT NULL DEFAULT '',
    `city` VARCHAR(80) NOT NULL DEFAULT '',
    `state` VARCHAR(80) NOT NULL DEFAULT '',
    `zip` VARCHAR(5) NOT NULL DEFAULT '',
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_campaigns
CREATE TABLE `poppit_company_campaigns` (
    `id` BIGINT AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `data` JSON NOT NULL DEFAULT '',
    `date_start` DATETIME NOT NULL DEFAULT NOW(),
    `date_end` DATETIME NOT NULL DEFAULT NOW(),
    `active` INT NOT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    FOREIGN KEY (`company_id`) REFERENCES poppit_companies (`id`),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_games
CREATE TABLE `poppit_games` (
    `id` BIGINT AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `images` JSON NOT NULL DEFAULT '',
    `url` VARCHAR(2000) NOT NULL DEFAULT '',
    `data` JSON NOT NULL DEFAULT '',
    `is_live` INT NOT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

--need relational tables for categories of games...or tags

-- poppit_company_games
CREATE TABLE `poppit_company_games` (
    `id` BIGINT AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL,
    `game_id` BIGINT NOT NULL,
    FOREIGN KEY (`company_id`) REFERENCES poppit_companies (`id`),
    FOREIGN KEY (`game_id`) REFERENCES poppit_games (`id`),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_company_locations
CREATE TABLE `poppit_company_locations` (
    `id` BIGINT AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `city` VARCHAR(80) NOT NULL DEFAULT '',
    `state` VARCHAR(80) NOT NULL DEFAULT '',
    `zip` VARCHAR(5) NOT NULL DEFAULT '',
    `country_code` VARCHAR(2) NOT NULL DEFAULT '',
    `latitude` VARCHAR(30) NOT NULL DEFAULT '',
    `longitude` VARCHAR(30) NOT NULL DEFAULT '',
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    FOREIGN KEY (`company_id`) REFERENCES poppit_companies (`id`),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_roles
CREATE TABLE `poppit_roles` (
    `id` BIGINT AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `admin_only` INT NOT NULL,
    `internal_only` INT NOT NULL,
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;


-- poppit_policies
CREATE TABLE `poppit_policies` (
    `id` BIGINT AUTO_INCREMENT,
    `module_name` VARCHAR(80) NOT NULL DEFAULT '',
    `function_name` VARCHAR(1000) NOT NULL DEFAULT '',
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_roles_policies
CREATE TABLE `poppit_roles_policies` (
    `id` BIGINT AUTO_INCREMENT,
    `policy_id` INT NOT NULL,
    `role_id` INT NOT NULL,
    FOREIGN KEY (`policy_id`) REFERENCES poppit_policies (`id`),
    FOREIGN KEY (`role_id`) REFERENCES poppit_roles (`id`),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_user_role
CREATE TABLE `poppit_user_role` (
    `id` BIGINT AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    `company_id` BIGINT NOT NULL,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    FOREIGN KEY (`user_id`) REFERENCES poppit_users (`id`),
    FOREIGN KEY (`role_id`) REFERENCES poppit_roles (`id`),
    FOREIGN KEY (`company_id`) REFERENCES poppit_companies (`id`),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- some hard-coded data

INSERT INTO `poppit_users` (`first_name`,`last_name`,`email_address`,`password_hash`,`active`) VALUES ('Brandon','Chambers','bran.cham@gmail.com','$2b$10$ffk8fvqKTigHEynvaRqJd.E4ytGV/vpNvOEXTvki4qXNY/Ti2g1XW',1);
INSERT INTO `poppit_users` (`first_name`,`last_name`,`email_address`,`password_hash`,`active`) VALUES ('John','Smith','test@gmail.com','$2b$10$ffk8fvqKTigHEynvaRqJd.E4ytGV/vpNvOEXTvki4qXNY/Ti2g1XW',0);