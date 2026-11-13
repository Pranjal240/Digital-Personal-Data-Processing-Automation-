-- 04_validation_tests.sql
-- Run after the selected install/migration and catalogue seed.
-- Read-only checks; review all result sets before enabling the workflow.

-- A. Required tables
SELECT required.table_name,
       CASE WHEN actual.table_name IS NULL THEN 'MISSING' ELSE 'OK' END AS result
FROM (VALUES
 ('tenants'),('projects'),('job_state'),('documents'),('document_chunks'),('evidence'),
 ('data_principals'),('personal_data_items'),('processing_activities'),('entities'),
 ('data_flows'),('dpdp_requirements'),('compliance_assessments'),('risk_findings'),
 ('recommendations'),('assessment_evidence_links'),('approvals'),('generated_reports'),
 ('agent_runs'),('document_processing_errors'),('audit_events'),('n8n_chat_histories'),
 ('schema_migrations')
) AS required(table_name)
LEFT JOIN information_schema.tables actual
  ON actual.table_schema='public' AND actual.table_name=required.table_name
ORDER BY required.table_name;

-- B. Migration history
SELECT version_id, script_name, applied_at, notes
FROM schema_migrations ORDER BY applied_at;

-- C. Catalogue row count and entries
SELECT COUNT(*) AS catalogue_rows FROM dpdp_requirements;
SELECT requirement_id, catalogue_version, provision_reference, title,
       status, requires_legal_verification
FROM dpdp_requirements ORDER BY requirement_id;

-- D. Potential duplicate keys that must be reviewed before adding unique constraints
SELECT tenant_id, project_id, job_id, activity_id, COUNT(*) AS duplicate_count
FROM processing_activities
GROUP BY tenant_id, project_id, job_id, activity_id HAVING COUNT(*) > 1;

SELECT tenant_id, project_id, job_id, report_type, file_format, COUNT(*) AS duplicate_count
FROM generated_reports
GROUP BY tenant_id, project_id, job_id, report_type, file_format HAVING COUNT(*) > 1;

-- E. Orphaned project references in job_state (should return zero rows)
SELECT js.job_id, js.tenant_id, js.project_id
FROM job_state js
LEFT JOIN projects p ON p.tenant_id=js.tenant_id AND p.project_id=js.project_id
WHERE p.project_id IS NULL;

-- F. Documents whose job state is missing (can occur in legacy DB before backfill)
SELECT d.document_id, d.job_id, d.tenant_id, d.project_id
FROM documents d
LEFT JOIN job_state js ON js.job_id=d.job_id
WHERE js.job_id IS NULL;

-- G. Existing foreign keys / indexes summary
SELECT conrelid::regclass AS table_name, conname, contype
FROM pg_constraint
WHERE connamespace='public'::regnamespace
ORDER BY 1,2;

SELECT tablename, indexname, indexdef
FROM pg_indexes WHERE schemaname='public'
ORDER BY tablename,indexname;

-- H. Security note: RLS is intentionally not enabled by these scripts.
-- Enable it only after n8n and FastAPI set app.current_tenant_id on every
-- transaction/connection and cross-tenant tests pass. Do not use a permissive
-- fallback such as tenant_id = COALESCE(setting, tenant_id).
