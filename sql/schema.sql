SET FOREIGN_KEY_CHECKS=0; -- to disable them

DROP TABLE IF EXISTS `poppit_users`;
DROP TABLE IF EXISTS `poppit_users_campaigns`;
DROP TABLE IF EXISTS `poppit_companies`;
DROP TABLE IF EXISTS `poppit_games`;
DROP TABLE IF EXISTS `poppit_company_invoices`;
DROP TABLE IF EXISTS `poppit_company_subscriptions`;
DROP TABLE IF EXISTS `poppit_company_users`;
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
    `email_address` VARCHAR(255) NOT NULL DEFAULT '' UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL DEFAULT '',
    `forgot_password_token` VARCHAR(255) NOT NULL DEFAULT '',
    `active` INT NOT NULL DEFAULT 0,
    `notifications` JSON NULL,
    `registration_type` VARCHAR(80) NOT NULL DEFAULT '',
    `city` VARCHAR(80) NOT NULL DEFAULT '',
    `state` VARCHAR(2) NOT NULL DEFAULT '',
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_users_campaigns
CREATE TABLE `poppit_users_campaigns` (
    `id` BIGINT AUTO_INCREMENT,
    `campaign_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `coupon_state` VARCHAR(80) NOT NULL DEFAULT '',
    `tries` INT NOT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_companies
CREATE TABLE `poppit_companies` (
    `id` BIGINT AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `address` VARCHAR(255) NOT NULL DEFAULT '',
    `city` VARCHAR(80) NOT NULL DEFAULT '',
    `state` VARCHAR(2) NOT NULL DEFAULT '',
    `zip` VARCHAR(5) NOT NULL DEFAULT '',
    `active` INT NOT NULL DEFAULT 0,
    `demo_acct` INT NOT NULL DEFAULT 1,
    `country_code` VARCHAR(2) NOT NULL DEFAULT '',
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_company_invoices
CREATE TABLE `poppit_company_invoices` (
    `id` BIGINT AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL DEFAULT 0,
    `amount` FLOAT NOT NULL DEFAULT 0,
    `num_locations` INT NOT NULL DEFAULT 0,
    `notes` VARCHAR(1000) NOT NULL DEFAULT '',
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_company_subscriptions
CREATE TABLE `poppit_company_subscriptions` (
    `id` BIGINT AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL DEFAULT 0,
    `charge_frequency` INT NOT NULL DEFAULT 0,
    `amount` FLOAT NOT NULL DEFAULT 0,
    `subscription_start` DATETIME NOT NULL,
    `subscription_end` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_company_users
CREATE TABLE `poppit_company_users` (
    `id` BIGINT AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL DEFAULT 0,
    `first_name` VARCHAR(80) NOT NULL DEFAULT '',
    `last_name` VARCHAR(80) NOT NULL DEFAULT '',
    `email_address` VARCHAR(255) NOT NULL DEFAULT '' UNIQUE,
    `phone_number` VARCHAR(80) NOT NULL DEFAULT '',
    `password_hash` VARCHAR(255) NOT NULL DEFAULT '',
    `forgot_password_token` VARCHAR(255) NOT NULL DEFAULT '',
    `company_role` INT NOT NULL DEFAULT 0,
    `company_contact` INT NOT NULL DEFAULT 0,
    `active` INT NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_company_campaigns
-- json column is for branding information, links to images, etc?
CREATE TABLE `poppit_company_campaigns` (
    `id` BIGINT AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL DEFAULT 0,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `category` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `game_id` INT NOT NULL DEFAULT 0,
    `data` JSON NULL,
    `date_start` DATETIME NOT NULL DEFAULT NOW(),
    `date_end` DATETIME NOT NULL DEFAULT NOW(),
    `active` INT NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_games
CREATE TABLE `poppit_games` (
    `id` INT AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `images` JSON NULL,
    `url` VARCHAR(2000) NOT NULL DEFAULT '',
    `data` JSON NULL,
    `is_live` INT NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- need relational tables for categories of games...or tags

-- poppit_company_locations
CREATE TABLE `poppit_company_locations` (
    `id` BIGINT AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `address` VARCHAR(255) NOT NULL DEFAULT '',
    `city` VARCHAR(80) NOT NULL DEFAULT '',
    `state` VARCHAR(80) NOT NULL DEFAULT '',
    `zip` VARCHAR(5) NOT NULL DEFAULT '',
    `country_code` VARCHAR(2) NOT NULL DEFAULT '',
    `latitude` VARCHAR(30) NOT NULL DEFAULT '',
    `longitude` VARCHAR(30) NOT NULL DEFAULT '',
    `altitude` VARCHAR(30) NOT NULL DEFAULT '',
    `polygon` JSON NULL,
    `active` INT NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

-- poppit_roles
CREATE TABLE `poppit_roles` (
    `id` BIGINT AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `internal_only` INT NOT NULL,
    `admin` INT NOT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
)  ENGINE=INNODB;

/*
-- poppit_user_role
CREATE TABLE `poppit_user_role` (
    `id` BIGINT AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    `company_id` BIGINT NOT NULL,
    `name` VARCHAR(80) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `updated_at` DATETIME NOT NULL DEFAULT NOW(),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
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

INSERT INTO
    poppit_roles (name, description, internal_only, admin)
VALUES
    ('none','No company access or permissions',0,0),
    ('admin','Company admin users',0,0),
    ('technical','Company technical users',0,0),
    ('marketing','Company marketing users',0,0);

*/
-- some hard-coded data


INSERT INTO
    poppit_users (first_name,last_name,email_address,password_hash,active)
VALUES
    ('Brandon','Chambers','bran.cham@gmail.com','$2b$10$ffk8fvqKTigHEynvaRqJd.E4ytGV/vpNvOEXTvki4qXNY/Ti2g1XW',1),
    ('John','Smith','test@gmail.com','$2b$10$ffk8fvqKTigHEynvaRqJd.E4ytGV/vpNvOEXTvki4qXNY/Ti2g1XW',0);


INSERT INTO
    poppit_companies (name,description,address,city,state,zip)
VALUES
    ('ACME 123','first company ever!','123 Nowhere Dr.','Tucson','AZ','85737'),
    ('ACME 321','second company ever!','321 Nowhere Dr.','Phoenix','AZ','12345'),
    ('7 Eleven','home of the slurpee','321 Nowhere Dr.','Phoenix','AZ','12345'),
    ('QuikTrip','gas and food','321 Nowhere Dr.','Phoenix','AZ','12345');

INSERT INTO
    poppit_company_users (company_id,first_name,last_name,email_address,phone_number,password_hash,company_role,company_contact,active)
VALUES
    (1,'Brandon','Chambers','bran.cham@gmail.com','(123) 123-1234','$2b$10$r4nCvcCKWnioJ4Qm2DlWauErLW6vSeSRvOJLHR5s2NRyrPHl8rkAG',1,1,1),
    (2,'John','Smith','test@gmail.com','(999) 598-7777','$2b$10$ffk8fvqKTigHEynvaRqJd.E4ytGV/vpNvOEXTvki4qXNY/Ti2g1XW',2,1,1);
