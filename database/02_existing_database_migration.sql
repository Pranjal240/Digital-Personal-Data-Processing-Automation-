-- 02_existing_database_migration.sql
-- Upgrade the user's original 18-table V1 schema. Additive/non-destructive.
-- Run only after a verified database backup. Does not enable RLS automatically.
BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version_id varchar(64) PRIMARY KEY, script_name varchar(255) NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(), notes text
);

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS default_retention_days integer NOT NULL DEFAULT 365;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Add missing columns without changing or deleting existing rows.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size_bytes bigint;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS duplicate_of_document_id varchar(64);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sheet_names jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS extraction_status varchar(32) NOT NULL DEFAULT 'completed';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS pii_redacted boolean NOT NULL DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS retention_expires_at timestamptz;
ALTER TABLE processing_activities ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE processing_activities ALTER COLUMN verification_status SET DEFAULT 'pending_review';
ALTER TABLE compliance_assessments ADD COLUMN IF NOT EXISTS catalogue_version varchar(32) NOT NULL DEFAULT '2023.1';
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS status varchar(32) NOT NULL DEFAULT 'open';
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS target_stage varchar(32);
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS revision_number integer NOT NULL DEFAULT 0;
ALTER TABLE generated_reports ADD COLUMN IF NOT EXISTS file_size_bytes bigint;
ALTER TABLE generated_reports ADD COLUMN IF NOT EXISTS sha256 char(64);

ALTER TABLE dpdp_requirements ADD COLUMN IF NOT EXISTS legal_instrument varchar(128) NOT NULL DEFAULT 'Digital Personal Data Protection Act, 2023 (No. 22 of 2023)';
ALTER TABLE dpdp_requirements ADD COLUMN IF NOT EXISTS applicability_conditions text NOT NULL DEFAULT '';
ALTER TABLE dpdp_requirements ADD COLUMN IF NOT EXISTS effective_date date;
ALTER TABLE dpdp_requirements ADD COLUMN IF NOT EXISTS source_url text NOT NULL DEFAULT 'https://www.meity.gov.in/';
ALTER TABLE dpdp_requirements ADD COLUMN IF NOT EXISTS source_publication_date date;
ALTER TABLE dpdp_requirements ADD COLUMN IF NOT EXISTS last_verified_date date;
ALTER TABLE dpdp_requirements ADD COLUMN IF NOT EXISTS status varchar(32) NOT NULL DEFAULT 'pending_commencement_notification';
ALTER TABLE dpdp_requirements ADD COLUMN IF NOT EXISTS requires_legal_verification boolean NOT NULL DEFAULT true;
ALTER TABLE dpdp_requirements ADD COLUMN IF NOT EXISTS verification_note text NOT NULL DEFAULT 'Technical mapping only; verify legal applicability and commencement with qualified counsel.';

-- Job state: create table and backfill only where a matching project exists.
CREATE TABLE IF NOT EXISTS job_state (
  job_id varchar(64) PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'running',
  qa_attempts integer NOT NULL DEFAULT 0, human_attempts integer NOT NULL DEFAULT 0,
  last_correction_requests jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_human_feedback jsonb NOT NULL DEFAULT '{}'::jsonb,
  manual_intervention_required boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (tenant_id, project_id, job_id),
  FOREIGN KEY (tenant_id, project_id) REFERENCES projects(tenant_id, project_id) ON DELETE CASCADE
);

INSERT INTO job_state(job_id,tenant_id,project_id,status)
SELECT DISTINCT d.job_id,d.tenant_id,d.project_id,'approved'
FROM documents d
JOIN projects p ON p.tenant_id=d.tenant_id AND p.project_id=d.project_id
WHERE d.job_id IS NOT NULL
ON CONFLICT (job_id) DO NOTHING;

-- Create new supporting tables. Existing source tables and rows are retained.
CREATE TABLE IF NOT EXISTS assessment_evidence_links (
  link_id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, evidence_id varchar(32) NOT NULL,
  artifact_type varchar(32) NOT NULL, artifact_ref_id varchar(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id,project_id,job_id,artifact_type,artifact_ref_id,evidence_id)
);
CREATE TABLE IF NOT EXISTS document_processing_errors (
  error_id bigserial PRIMARY KEY, tenant_id varchar(64), project_id varchar(64),
  job_id varchar(64) NOT NULL, document_id varchar(64), failed_stage varchar(128) NOT NULL,
  error_code varchar(64), error_message text NOT NULL,
  is_recoverable boolean NOT NULL DEFAULT false, occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id serial PRIMARY KEY, session_id varchar(255) NOT NULL,
  message jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);

-- Add safe indexes. Unique indexes are intentionally not forced where legacy
-- duplicates may exist; run 04_validation_tests.sql to identify them first.
CREATE INDEX IF NOT EXISTS idx_job_state_lookup ON job_state(tenant_id,project_id,status);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_proj_sha256 ON documents(tenant_id,project_id,sha256);
CREATE INDEX IF NOT EXISTS idx_documents_job ON documents(job_id);
CREATE INDEX IF NOT EXISTS idx_chunks_fts ON document_chunks USING GIN (to_tsvector('english',chunk_text));
CREATE INDEX IF NOT EXISTS idx_ev_links_lookup ON assessment_evidence_links(tenant_id,project_id,job_id,evidence_id);
CREATE INDEX IF NOT EXISTS idx_proc_errors_job ON document_processing_errors(job_id,occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_session ON n8n_chat_histories(session_id);

INSERT INTO schema_migrations(version_id,script_name,notes)
VALUES ('2026.11.V3_MIGRATION','02_existing_database_migration.sql','Additive upgrade from original V1 schema; no row deletion.')
ON CONFLICT (version_id) DO NOTHING;
COMMIT;
