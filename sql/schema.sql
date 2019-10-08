SET FOREIGN_KEY_CHECKS=0; -- to disable them

DROP TABLE IF EXISTS `poppit_users`;
DROP TABLE IF EXISTS `poppit_companies`;
DROP TABLE IF EXISTS `poppit_campaigns`;
DROP TABLE IF EXISTS `poppit_company_campaigns`;
DROP TABLE IF EXISTS `poppit_roles`;
DROP TABLE IF EXISTS `poppit_user_role`;
DROP TABLE IF EXISTS `poppit_roles_policies`;
DROP TABLE IF EXISTS `poppit_policies`;

SET FOREIGN_KEY_CHECKS=1; -- to re-enable them

-- poppit_users
CREATE TABLE `poppit_users` (
    `id` INT AUTO_INCREMENT,
    `first_name` VARCHAR(80) NOT NULL DEFAULT '',
    `last_name` VARCHAR(80) NOT NULL DEFAULT '',
    `email_address` VARCHAR(255) NOT NULL DEFAULT '',
    `password_hash` VARCHAR(255) NOT NULL DEFAULT '',
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
    `id` INT AUTO_INCREMENT,
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
CREATE TABLE `poppit_campaigns` (
    `id` INT AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_company_campaigns
CREATE TABLE `poppit_company_campaigns` (
    `id` INT AUTO_INCREMENT,
    `company_id` INT NOT NULL,
    `campaign_id` INT NOT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    FOREIGN KEY (`campaign_id`) REFERENCES poppit_campaigns (`id`),
    FOREIGN KEY (`company_id`) REFERENCES poppit_companies (`id`),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_roles
CREATE TABLE `poppit_roles` (
    `id` INT AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `admin_only` INT NOT NULL,
    `internal_only` INT NOT NULL,
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;


-- poppit_policies
CREATE TABLE `poppit_policies` (
    `id` INT AUTO_INCREMENT,
    `module_name` VARCHAR(80) NOT NULL DEFAULT '',
    `function_name` VARCHAR(1000) NOT NULL DEFAULT '',
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_roles_policies
CREATE TABLE `poppit_roles_policies` (
    `id` INT AUTO_INCREMENT,
    `policy_id` INT NOT NULL,
    `role_id` INT NOT NULL,
    FOREIGN KEY (`policy_id`) REFERENCES poppit_policies (`id`),
    FOREIGN KEY (`role_id`) REFERENCES poppit_roles (`id`),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_user_role
CREATE TABLE `poppit_user_role` (
    `id` INT AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `role_id` INT NOT NULL,
    `company_id` INT NOT NULL,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    FOREIGN KEY (`user_id`) REFERENCES poppit_users (`id`),
    FOREIGN KEY (`role_id`) REFERENCES poppit_roles (`id`),
    FOREIGN KEY (`company_id`) REFERENCES poppit_companies (`id`),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- some hard-coded data

INSERT INTO `poppit_users` (`first_name`,`last_name`,`email_address`,`password_hash`) VALUES ('Brandon','Chambers','bran.cham@gmail.com','321321321');