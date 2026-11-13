-- 05_rollback_and_recovery.sql
-- Deliberately NON-DESTRUCTIVE. There is no safe generic DROP script for this
-- database because it contains client evidence and assessment outputs.
--
-- If a migration fails inside pgAdmin Query Tool and the script used BEGIN,
-- PostgreSQL marks the transaction aborted. Run:
--   ROLLBACK;
--
-- If a migration committed and needs reversal:
-- 1) Stop n8n executions and the FastAPI worker.
-- 2) Restore the pre-migration pg_dump/pgAdmin backup to a NEW database.
-- 3) Validate the restored database with 04_validation_tests.sql.
-- 4) Point the application to the restored database only after verification.
--
-- Inspect applied scripts:
SELECT version_id, script_name, applied_at, notes
FROM schema_migrations ORDER BY applied_at;

-- Inspect database size and table row estimates:
SELECT schemaname, relname AS table_name, n_live_tup AS estimated_rows
FROM pg_stat_user_tables ORDER BY relname;

-- No DROP TABLE, DELETE, or destructive rollback is performed here.
