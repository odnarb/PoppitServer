DELIMITER //
CREATE PROCEDURE createCompany(IN o_company JSON)
BEGIN

    DECLARE v_name VARCHAR(255) DEFAULT null;
    DECLARE v_alias VARCHAR(255) DEFAULT null;
    DECLARE j_details JSON DEFAULT null;

    SET v_name = JSON_UNQUOTE(JSON_EXTRACT(o_company,'$.name'));
    SET v_alias = JSON_UNQUOTE(JSON_EXTRACT(o_company,'$.alias'));
    SET j_details = JSON_UNQUOTE(JSON_EXTRACT(o_company,'$.details'));

    INSERT INTO
    `company` (
        `name`,
        `alias`,
        `details`
    ) VALUES (
        v_name,
        v_alias,
        j_details
    );

    select last_insert_id() as company_id;

END //

DELIMITER ;