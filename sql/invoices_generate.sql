-- invoices_generate()
DELIMITER //
CREATE PROCEDURE invoices_generate(IN o_packet JSON)
BEGIN
    DECLARE v_packet_table_name VARCHAR(255) DEFAULT '';

    -- SET v_packet_table_name  = JSON_UNQUOTE(JSON_EXTRACT(o_packet,'$.packet_table_name'));

    -- SET i_limit_override  = JSON_UNQUOTE(JSON_EXTRACT(o_packet,'$.limit'));
    -- SET i_offset_override = JSON_UNQUOTE(JSON_EXTRACT(o_packet,'$.offset'));

    -- SET query = 'SELECT id,data_packet_id,packet_table_name,contact_status_id,contact_method_id,data FROM';
    -- SET query = CONCAT(query, ' ', v_packet_table_name );
    -- SET query = CONCAT(query, ' WHERE contact_status_id=1 and num_tries < 3' );
    -- SET query = CONCAT(query, ' LIMIT ', i_limit);


-- how do we bill? per month?
-- campaigns * ACTIVE locations?
-- flat rate per month?

    SET @query = CONCAT(query,';');

    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END //
