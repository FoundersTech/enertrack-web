ALTER TABLE devices
ADD COLUMN firmware_version TEXT;

ALTER TABLE devices
ADD COLUMN target_firmware_version TEXT;

ALTER TABLE devices
ADD COLUMN firmware_update_requested INTEGER NOT NULL DEFAULT 0;

ALTER TABLE devices
ADD COLUMN firmware_update_status TEXT;

ALTER TABLE devices
ADD COLUMN firmware_updated_at INTEGER;