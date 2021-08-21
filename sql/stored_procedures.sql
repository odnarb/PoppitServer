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