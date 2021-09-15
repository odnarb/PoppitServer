DELIMITER //
CREATE PROCEDURE `createUser`(IN o_user JSON)
BEGIN

  /*
  {
    "user_type_id":3,
    "first_name": "Brandon",
    "last_name": "Chambers",
    "gender": "M",
    "email_address": "i.have.rewt@gmail.com",
    "phone": "123+123+1234",
    "language_id": 2,
    "city": "Santiago",
    "state_province": "Santiago",
    "country":"Chile",
    "country_code":"CE",
    "postal_code":"12345",
    "password_hash": "$2b$10$4AYT6jU0TjQxxu3Wsiq27ebwfdLSJf9yDfHE61kQZfCCn.Ov96roS",
    "invite_token":"38f13cd1-6f0c-11eb-8ae1-000c29a3f0df",
    "profession": "Student"
  }

  CALL createUser('{"first_name": "Brandon","last_name": "Chambers","gender": "M","email_address": "i.have.rewt@gmail.com","phone": "123+123+1234","language_id": 2,"city": "Santiago","state_province": "Santiago","country":"Chile","country_code":"CE","postal_code":"12345","password_hash": "$2b$10$4AYT6jU0TjQxxu3Wsiq27ebwfdLSJf9yDfHE61kQZfCCn.Ov96roS","invite_token":"38f13cd1-6f0c-11eb-8ae1-000c29a3f0df","group_id": "13","user_type_id":1}');
  */
    -- new id in `user` table
    DECLARE user_id INT DEFAULT 0;

    -- user creation data
    DECLARE v_first_name VARCHAR(255) DEFAULT '';
    DECLARE v_last_name VARCHAR(255) DEFAULT '';
    DECLARE v_phone VARCHAR(30) DEFAULT '';
    DECLARE v_gender VARCHAR(1) DEFAULT '';
    DECLARE v_email_address VARCHAR(255) DEFAULT '';
    DECLARE v_address1 VARCHAR(500) DEFAULT '';
    DECLARE v_address2 VARCHAR(500) DEFAULT '';
    DECLARE v_city VARCHAR(255) DEFAULT '';
    DECLARE v_state_province VARCHAR(255) DEFAULT '';
    DECLARE v_country VARCHAR(255) DEFAULT '';
    DECLARE v_country_code VARCHAR(255) DEFAULT '';
    DECLARE v_postal_code VARCHAR(255) DEFAULT '';
    DECLARE v_profile_picture VARCHAR(255) DEFAULT '';

    DECLARE v_password_hash VARCHAR(255) DEFAULT '';
    DECLARE v_invite_token VARCHAR(255) DEFAULT '';

    DECLARE i_user_type_id INT DEFAULT 4;
    DECLARE i_is_admin INT DEFAULT 0;
    DECLARE i_is_support INT DEFAULT 0;

    SET v_first_name      = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.first_name')),'');
    SET v_last_name       = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.last_name')),'');
    SET v_gender          = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.gender')),'');
    SET v_email_address   = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.email_address')),'');
    SET v_phone           = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.phone')), '');
    SET v_address1        = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.address1')),'');
    SET v_address2        = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.address2')),'');
    SET v_city            = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.city')),'');
    SET v_state_province  = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.state_province')),'');
    SET v_country         = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.country')),'');
    SET v_country_code    = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.country_code')),'');
    SET v_postal_code     = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.postal_code')),'');
    SET v_profile_picture = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.profile_picture')),'');
    SET v_password_hash   = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.password_hash')),'');
    SET v_invite_token    = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.invite_token')),'');
    SET i_user_type_id    = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.user_type_id')),4);
    SET i_is_admin        = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.is_admin')), 0);
    SET i_is_support      = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.is_support')), 0);

  -- insert user into table
    INSERT INTO `users` (
        `user_type_id`,
        `is_admin`,
        `is_support`,
        `active`,
        `first_name`,
        `last_name`,
        `phone`,
        `gender`,
        `email_address`,
        `address1`,
        `address2`,
        `city`,
        `state_province`,
        `country`,
        `country_code`,
        `postal_code`,
        `password_hash`,
        `verified`,
        `invite_token`,
        `data`,
        `notifications`,
        `update_user_id`,
        `updated_at`,
        `create_user_id`,
        `created_at`
    ) VALUES (
        i_user_type_id,
        i_is_admin,
        i_is_support,
        1, -- active
        v_first_name,
        v_last_name,
        v_phone,
        v_gender,
        v_email_address,
        v_address1,
        v_address2,
        v_city,
        v_state_province,
        v_country,
        v_country_code,
        v_postal_code,
        v_password_hash,
        0, -- not verified until they click the link in the registration email
        v_invite_token,
        '{}', -- no data just yet
        '{}', -- no data just yet
        0,
        now(),
        0,
        now()
    );

    SET user_id = last_insert_id();

    IF user_id > 0 THEN

      -- get some basic user information (for notifications)
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email_address,
        u.phone,
        u.invite_token
      FROM `users` u
      WHERE u.id = user_id;

    ELSE
      -- select nothing for the user object
      SELECT 0;
    END IF;

END//
DELIMITER ;
