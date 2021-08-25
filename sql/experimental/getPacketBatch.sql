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