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
    DECLARE v_gender VARCHAR(1) DEFAULT '';
    DECLARE v_email_address VARCHAR(255) DEFAULT '';
    DECLARE v_phone VARCHAR(30) DEFAULT '';
    DECLARE v_profession VARCHAR(80) DEFAULT '';
    DECLARE i_language_id INT DEFAULT 1;
    DECLARE v_city VARCHAR(255) DEFAULT '';
    DECLARE v_state_province VARCHAR(255) DEFAULT '';
    DECLARE v_country VARCHAR(255) DEFAULT '';
    DECLARE v_country_code VARCHAR(255) DEFAULT '';
    DECLARE v_postal_code VARCHAR(255) DEFAULT '';
    DECLARE v_password_hash VARCHAR(255) DEFAULT '';
    DECLARE v_invite_token VARCHAR(255) DEFAULT '';
    DECLARE i_user_type_id INT DEFAULT 1;

    SET v_first_name = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.first_name'));
    SET v_last_name = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.last_name'));
    SET v_gender = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.gender'));
    SET v_email_address = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.email_address'));
    SET v_phone = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.phone'));
    SET v_profession = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.profession'));
    SET i_language_id = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.language_id'));
    SET v_city = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.city'));
    SET v_state_province = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.state_province'));
    SET v_country = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.country'));
    SET v_country_code = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.country_code'));
    SET v_postal_code = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.postal_code'));
    SET v_password_hash = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.password_hash'));
    SET v_invite_token = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.invite_token'));
    SET i_user_type_id = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.user_type_id'));

  -- insert user into table
    INSERT INTO `user` (
        `user_type_id`,
        `language_id`,
        `active`,
        `first_name`,
        `last_name`,
        `phone`,
        `profession`,
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
        `update_user_id`,
        `updated_at`,
        `create_user_id`,
        `created_at`
    ) VALUES (
        i_user_type_id, -- user_type_id: Students only for now
        i_language_id,
        1, -- active
        v_first_name,
        v_last_name,
        v_phone,
        v_profession,
        v_gender,
        v_email_address,
        '', -- address1..nothing for now..
        '', -- address2..nothing for now..
        v_city,
        v_state_province,
        v_country,
        v_country_code,
        v_postal_code,
        v_password_hash,
        0, -- not verified until they click the link in the registration email
        v_invite_token,
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
        u.invite_token,

        g.id as group_id,
        g.group_name as group_name,
        g.country
      FROM `user` u
      INNER JOIN `group_members` gm ON u.id = gm.user_id
      INNER JOIN `group` g ON g.id = gm.group_id
      WHERE u.id = user_id;

      -- get the group owners' information (for notifications)
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email_address,
        u.phone,

        g.id as g_id,
        g.group_name as g_name,
        g.country as g_country,
        g.country_code as country_code
      FROM `group_owners` go
      INNER JOIN `group` g ON go.group_id = g.id
      INNER JOIN `user` u ON go.user_id = u.id
      WHERE go.group_id = group_id;

    ELSE
      -- select nothing for the user object
      SELECT 0;
    END IF;

END//
DELIMITER ;
