DELIMITER //
CREATE PROCEDURE getUsers(IN o_search JSON)
BEGIN

    DECLARE v_search VARCHAR(255) DEFAULT '';
    DECLARE v_order VARCHAR(80) DEFAULT 'name';
    DECLARE v_order_direction VARCHAR(80) DEFAULT 'ASC';
    DECLARE i_limit INT DEFAULT 10;
    DECLARE i_offset INT DEFAULT 0;
    DECLARE query VARCHAR(1000) DEFAULT '';

    DECLARE v_order_override VARCHAR(80) DEFAULT '';
    DECLARE v_order_direction_override VARCHAR(80) DEFAULT '';
    DECLARE i_limit_override INT DEFAULT 0;
    DECLARE i_offset_override INT DEFAULT 0;

    SET v_search = JSON_UNQUOTE(JSON_EXTRACT(o_search,'$.search'));

    SET v_order_override  = JSON_UNQUOTE(JSON_EXTRACT(o_search,'$.order'));
    SET v_order_direction_override = JSON_UNQUOTE(JSON_EXTRACT(o_search,'$.order_direction'));
    SET i_limit_override  = JSON_UNQUOTE(JSON_EXTRACT(o_search,'$.limit'));
    SET i_offset_override = JSON_UNQUOTE(JSON_EXTRACT(o_search,'$.offset'));

    IF v_order_override = 'id' OR v_order_override = 'name' OR v_order_override = 'alias' THEN
        SET v_order = v_order_override;
    END IF;

    IF v_order_direction_override = 'DESC' THEN
        SET v_order_direction = 'DESC';
    END IF;

    IF (i_limit_override > 10) AND (i_limit_override <= 100) THEN
        SET i_limit = i_limit_override;
    END IF;

    SET query = 'SELECT id,first_name,last_name,email_address,active,updated_at,created_at FROM users';

    IF v_search <> '' THEN
        SET query = CONCAT(query, ' WHERE active=1 and name LIKE CONCAT(''%'',', v_search, ',''%'')' );
    ELSE
        SET query = CONCAT(query, ' WHERE active=1' );
    END IF;

    SET @query = CONCAT(query, ' ORDER BY ', v_order, ' ', v_order_direction, ' LIMIT ', i_limit);

    SET query = CONCAT(query, ' LIMIT ', i_limit);

    IF (i_offset_override > 0) THEN
        SET i_offset = i_offset_override;
        SET query = CONCAT(query,', ', i_offset);
    END IF;

    SET @query = CONCAT(query,';');

    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END //

DELIMITER ;
