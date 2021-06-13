-- getPacketData()
DROP PROCEDURE IF EXISTS getPacketData;

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

-- getPacketBatch()
DROP PROCEDURE IF EXISTS getPacketBatch;

DELIMITER //
CREATE PROCEDURE getPacketBatch()
BEGIN

    -- get data packets where stage == 4 (queued)
    SELECT
        id,
        campaign_id,
        data_ingest_source_id,
        data_ingest_stage_id,
        packet_table_tracking_id,
        company_id,
        user_id,
        tx_guid,
        version,
        num_tries,
        metadata,
        updated_at,
        created_at
    FROM
        data_packet
    WHERE
        data_ingest_stage_id = 4
        and num_tries < 3
    LIMIT 10;
 

END //

DELIMITER ;


-- createCompany()
DROP PROCEDURE IF EXISTS createCompany;

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

-- removeCompany()
DROP PROCEDURE IF EXISTS removeCompany;

DELIMITER //
CREATE PROCEDURE removeCompany(IN o_company JSON)
BEGIN

    DECLARE i_company_id INT DEFAULT null;

    SET i_company_id = JSON_UNQUOTE(JSON_EXTRACT(o_company,'$.id'));

    delete from company where id = i_company_id;

END //

DELIMITER ;



-- getCompany()
DROP PROCEDURE IF EXISTS getCompany;

DELIMITER //
CREATE PROCEDURE getCompany(IN o_company JSON)
BEGIN

    DECLARE i_company_id INT DEFAULT null;

    SET i_company_id = JSON_UNQUOTE(JSON_EXTRACT(o_company,'$.id'));

    select
        id,
        name,
        alias,
        details,
        active,
        updated_at,
        created_at
    from
        company
    where
        id = i_company_id;

END //

DELIMITER ;


-- updateCompany()
DROP PROCEDURE IF EXISTS updateCompany;

DELIMITER //
CREATE PROCEDURE updateCompany(IN o_company JSON)
BEGIN

    DECLARE i_company_id INT DEFAULT null;
    DECLARE v_name VARCHAR(255) DEFAULT null;
    DECLARE v_alias VARCHAR(255) DEFAULT null;
    DECLARE i_active INT DEFAULT null;
    DECLARE j_details JSON DEFAULT null;

    SET i_company_id = JSON_UNQUOTE(JSON_EXTRACT(o_company,'$.id'));
    SET v_name = JSON_UNQUOTE(JSON_EXTRACT(o_company,'$.name'));
    SET v_alias = JSON_UNQUOTE(JSON_EXTRACT(o_company,'$.alias'));
    SET i_active = JSON_UNQUOTE(JSON_EXTRACT(o_company,'$.active'));
    SET j_details = JSON_UNQUOTE(JSON_EXTRACT(o_company,'$.details'));

    update
        company
    SET
        name = v_name,
        alias = v_alias,
        details = j_details,
        active = i_active,
        updated_at = now()
    where id = i_company_id;

END //

DELIMITER ;


-- getCompanies()
DROP PROCEDURE IF EXISTS getCompanies;

DELIMITER //
CREATE PROCEDURE getCompanies(IN o_search JSON)
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

    SET query = 'SELECT id,name,alias,active,updated_at,created_at FROM company';

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

/*
DROP PROCEDURE IF EXISTS GetMessages;

DELIMITER //
CREATE PROCEDURE GetMessages(IN v_contact_method VARCHAR(80))
BEGIN

    -- get a guid for this group
    SET @new_tx_guid=UUID();

     CREATE TEMPORARY TABLE tmp_msgs(
        `message_id` INT NOT NULL,
        `contact_method_id` INT NOT NULL,
        `contact_status_id` INT NOT NULL,
        `tx_guid` VARCHAR(80) NOT NULL DEFAULT '',
        `data` json NOT NULL,
        PRIMARY KEY (`id`), KEY(`id`)
    )  ENGINE=INNODB SELECT
            msgs.id,
            msgs.contact_method_id,
            cs.id,
            @new_tx_guid,
            msgs.data
        FROM
            messages msgs
        INNER JOIN contact_method cm
            ON msgs.contact_method_id = cm.id
        INNER JOIN messages_status_updates msu
            ON msu.message_id = msgs.id
        INNER JOIN contact_status cs
            ON msu.contact_status_id = cs.id
        WHERE
            -- text match here: sms, email, phone. etc..maybe weak?
            cm.contact_method = v_contact_method
            AND ISNULL(cs.contact_status)
        ORDER BY contact_date DESC
        LIMIT 1000;

    -- insert an entry for each msg to contain a guid
    INSERT INTO messages_status_updates
        (message_id, tx_guid, contact_status_id, created_at, updated_at)
    SELECT
        ( message_id, @new_tx_guid, contact_status_id, getdate(), getdate() )
    FROM
       tmp_msgs;


    -- select from tmp_msgs insert into messages_status_updates

    -- SELECT @new_tx_guid;
    -- SELECT id FROM tmp_msgs;
    -- SELECT * from messages WHERE id IN (SELECT id FROM tmp_msgs);
    SELECT * FROM tmp_msgs;

    DROP TEMPORARY TABLE tmp_msgs;
 END //
DELIMITER ;


DROP PROCEDURE IF EXISTS SetMessagesProcessed;

DELIMITER //
CREATE PROCEDURE SetMessagesProcessed(IN p_tx_guid VARCHAR(80))
BEGIN

    -- SET @tx_guid='7566e977-5e23-11e9-9f1d-000c2988b5a1';
-- get messages with this tx_guid from status updates table

    INSERT INTO messages_status_updates
        (message_id, tx_guid, contact_status_id, created_at, updated_at)
    SELECT
        message_id, tx_guid, 2, created_at, updated_at
    FROM
       tmp_msgs;

    UPDATE messages m
    INNER JOIN contact_status cs
    ON m.contact_status = cs.id
    SET m.contact_status_id = 3
    WHERE
        cs.contact_status = 'queue'
        and m.tx_guid = p_tx_guid;


 END //
DELIMITER ;

DROP PROCEDURE IF EXISTS RotateMessagesTable;

DELIMITER //
CREATE PROCEDURE RotateMessagesTable()
BEGIN

    -- prepare a new messages table, based on the structure of the current one
    CREATE TABLE `messages_new` like `messages`;

    -- prep the statement
    PREPARE stmt1 FROM "RENAME TABLE `reminderly`.`messages` TO `reminderly`.`messages_history_?`";

    SET @current_history_num=0;

    -- get the next number we're to use for messages_history_# table name
    -- SELECT @group := `group` FROM user WHERE user = @user;

    SET @current_history_num = (SELECT
        max(id)+1
    FROM
        history_table_tracking
    WHERE
        table_name like 'messages_history%');

    -- further prepping
    PREPARE stmt FROM @current_history_num;

    -- do it.. move the current to be a backup
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- add our entry
    INSERT into history_table_tracking (`table_name`) VALUES ( CONCAT('messages_history_', @current_history_num ));

    -- bring the new table into production use
    RENAME TABLE `reminderly`.`messages_new` TO `reminderly`.`messages`;

 END //
DELIMITER ;

DROP PROCEDURE IF EXISTS RotateMessageStatusUpdatesTable;

DELIMITER //
CREATE PROCEDURE RotateMessageStatusUpdatesTable()
BEGIN

    -- prepare a new messages_status_updates table, based on the structure of the current one
    CREATE TABLE `messages_status_updates_new` like `messages_status_updates`;

    -- prep the statement
    PREPARE stmt1 FROM "RENAME TABLE `reminderly`.`messages_status_updates` TO `reminderly`.`messages_status_updates_history_?`";

    SET @current_history_num=0;

    -- get the next number we're to use for messages_status_updates_history_# table name
    SET @current_history_num = (SELECT
        max(id)+1
    FROM
        history_table_tracking
    WHERE
        table_name like 'messages_status_updates_history%');

    -- further prepping
    PREPARE stmt FROM @current_history_num;

    -- do it.. move the current to be a backup
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- add our entry
    INSERT into history_table_tracking (`table_name`) VALUES ( CONCAT('messages_status_updates_history_', @current_history_num ));

    -- bring the new table into production use
    RENAME TABLE `reminderly`.`messages_status_updates_new` TO `reminderly`.`messages_status_updates`;

 END //
DELIMITER ;

DROP PROCEDURE IF EXISTS CleanupHistoryTables;

DELIMITER //
CREATE PROCEDURE CleanupHistoryTables()
BEGIN

    -- drop older %_history tables.. anything older than 90 days, drop it
        -- get table names where `history_table_tracking`.`created_at` older than 90 days
        -- put them into a temp table
        CREATE TEMPORARY TABLE IF NOT EXISTS temp_hist_tables AS (
            SELECT
                *
            FROM
                history_table_tracking
            WHERE
                created_at < date_add(now(), INTERVAL -90 DAY)
        );

        -- drop em
        SET @tables = NULL;
        SELECT GROUP_CONCAT('`', table_name,'`') INTO @tables FROM temp_hist_tables;
        SET @tables = CONCAT('DROP TABLE IF EXISTS ', @tables);
        PREPARE stmt1 FROM @tables;
        EXECUTE stmt1;
        DEALLOCATE PREPARE stmt1;

        -- drop from the tracking table
        DELETE FROM history_table_tracking WHERE id IN (SELECT id FROM temp_hist_tables);

        DROP TEMPORARY TABLE temp_hist_tables;
        -- done with table maint

 END //
DELIMITER ;
*/

/*
    --Need a proc for dropping old packet tables
    --Maybe keep a summary of the meta data...?  (# of contacts, per contact type...etc)

*/