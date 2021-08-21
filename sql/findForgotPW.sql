DELIMITER //
CREATE PROCEDURE `findForgotPW`(IN user_id INT,IN v_token VARCHAR(255))
BEGIN

  SELECT
    id, email_address
  FROM `users`
  WHERE
    id = user_id AND forgot_password_token = v_token
  LIMIT 1;

END//
DELIMITER ;
