DELIMITER //
CREATE PROCEDURE getPacketData(IN o_packet JSON)
BEGIN
    -- define limit.. if any
    DECLARE v_packet_table_name VARCHAR(255) DEFAULT '';

    DECLARE i_limit INT DEFAULT 1000;
    DECLARE i_offset INT DEFAULT 0;

    DECLARE i_limit_override INT DEFAULT 0;
    DECLARE i_offset_override INT DEFAULT 0;
    DECLARE query VARCHAR(1000) DEFAULT '';

    SET v_packet_table_name  = JSON_UNQUOTE(JSON_EXTRACT(o_packet,'$.packet_table_name'));

    SET i_limit_override  = JSON_UNQUOTE(JSON_EXTRACT(o_packet,'$.limit'));
    SET i_offset_override = JSON_UNQUOTE(JSON_EXTRACT(o_packet,'$.offset'));

    IF (i_limit_override > 0) AND (i_limit_override < 1000) THEN
        SET i_limit = i_limit_override;
    END IF;

    SET query = 'SELECT id,data_packet_id,packet_table_name,contact_status_id,contact_method_id,data FROM';
    SET query = CONCAT(query, ' ', v_packet_table_name );
    SET query = CONCAT(query, ' WHERE contact_status_id=1 and num_tries < 3' );
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