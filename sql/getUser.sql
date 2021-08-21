DELIMITER //
CREATE PROCEDURE getUser(IN o_user JSON)
BEGIN

    DECLARE i_user_id INT DEFAULT null;

    SET i_user_id = JSON_UNQUOTE(JSON_EXTRACT(o_user,'$.id'));

    select
        *
        -- id,
        -- first_name,
        -- last_name,
        -- email_address,
        -- active,
        -- updated_at,
        -- created_at
    from
        users
    where
        id = i_user_id;

END //

DELIMITER ;