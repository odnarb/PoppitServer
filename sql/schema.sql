/*
SET FOREIGN_KEY_CHECKS=0; -- to disable them

DROP TABLE campaigns           ;
DROP TABLE games               ;
DROP TABLE user_account_history;
DROP TABLE user_analytics      ;
DROP TABLE user_locations      ;
DROP TABLE user_rewards        ;
DROP TABLE user_type           ;
DROP TABLE users               ;

SET FOREIGN_KEY_CHECKS=1; -- to re-enable them

-- need relational tables for categories of games...or tags

-- some hard-coded data
/*

INSERT INTO `user_type`
(
    `user_type_name`,
    `user_type_description`,
    `active`,
    `data`,
    `update_user_id`,
    `updated_at`,
    `create_user_id`,
    `created_at`
)
VALUES
    ('Admins','Admins: with great power comes great responsibility',1,'{}',0,now(),0,now()),
    ('Support','Support will have many functions to manage the system, users, access, groups, etc.',1,'{}',0,now(),0,now()),
    ('Advertiser','Advertisers can create campaigns',1,'{}',0,now(),0,now()),
    ('User','Users can access games',1,'{}',0,now(),0,now());

INSERT INTO
    users (user_type_id,is_admin,is_support,first_name,last_name,email_address,password_hash,active)
VALUES
    (1,1,0,'Brandon','Chambers','bran.cham@gmail.com','$2b$10$tjr7swVGFsawHX/C4kX2MeYZaNA5CJWit/GReBACjVNNWiVVWPtYe',1),
    (2,0,1,'Support','Tech','i.have.rewt@gmail.com','$2b$10$tjr7swVGFsawHX/C4kX2MeYZaNA5CJWit/GReBACjVNNWiVVWPtYe',1),
    (3,0,0,'John','Smith','test@gmail.com','$2b$10$tjr7swVGFsawHX/C4kX2MeYZaNA5CJWit/GReBACjVNNWiVVWPtYe',0),
    (4,0,0,'Jimmy','Something','test2@gmail.com','$2b$10$tjr7swVGFsawHX/C4kX2MeYZaNA5CJWit/GReBACjVNNWiVVWPtYe',0);
*/