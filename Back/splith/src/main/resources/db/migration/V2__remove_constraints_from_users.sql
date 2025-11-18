-- src/main/resources/db/migration/V2__remove_constraints_from_users.sql
BEGIN;
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_name_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
COMMIT;