DELIMITER //
CREATE PROCEDURE `getUser`(IN passed_user_id INT, IN email VARCHAR(255))
BEGIN

  /*
    the email address param should just be used as an override/helper,
      like getting a user when we don't know their id, such as logging in 
  */

  IF email != '' THEN
    SET passed_user_id = (SELECT id FROM user where email_address = email);
  END IF;

  -- get the user
  SELECT
    id,
    user_type_id,
    is_admin,
    is_support,
    first_name,
    last_name,
    email_address,
    phone,
    profession,
    gender,
    address1,
    address2,
    city,
    state_province,
    country,
    country_code,
    postal_code,
    profile_picture,
    verified,
    needs_pw_change,
    password_hash,
    forgot_password_token,
    invite_token,
    registration_type,
    notifications,
    active,
    data,
    update_user_id,
    updated_at,
    create_user_id,
    created_at
  FROM `users`
  WHERE id = passed_user_id
  LIMIT 1;

END//
DELIMITER ;
