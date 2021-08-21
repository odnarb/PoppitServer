DELIMITER //
CREATE PROCEDURE `forgotPW`(IN v_email_address VARCHAR(255))
BEGIN

  DECLARE user_id INT;

  DECLARE token VARCHAR(255);

  SET user_id = 0;

  SET user_id = (SELECT id FROM users WHERE email_address = v_email_address LIMIT 1);

  IF user_id > 0 THEN
    SET token = uuid();

    UPDATE `users`
    SET forgot_password_token = token, needs_pw_change = 1, updated_at = now(), update_user_id = 0
    WHERE id = user_id;

    SELECT user_id, v_email_address as email_address, token as forgot_password_token;
  ELSE
    SELECT 0, '' as forgot_password_token;
  END IF;

END//
DELIMITER ;
