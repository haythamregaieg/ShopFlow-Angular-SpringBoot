-- Flyway migration: add is_new_status boolean column to orders if missing
-- H2 dialect: use conditional insert via INFORMATION_SCHEMA
DO
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='ORDERS' AND COLUMN_NAME='IS_NEW_STATUS') THEN
        ALTER TABLE orders ADD COLUMN is_new_status BOOLEAN DEFAULT FALSE;
    END IF;
END;
