-- 01_fresh_install.sql
-- For a BRAND-NEW empty DPDP database only. PostgreSQL 15+.
-- Do not run this against the existing V1 database.
BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version_id varchar(64) PRIMARY KEY,
  script_name varchar(255) NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

CREATE TABLE tenants (
  tenant_id varchar(64) PRIMARY KEY,
  tenant_name varchar(255) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  default_retention_days integer NOT NULL DEFAULT 365 CHECK (default_retention_days > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  tenant_id varchar(64) NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  project_id varchar(64) NOT NULL,
  client_name varchar(255) NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','archived','suspended','completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, project_id)
);

CREATE TABLE job_state (
  job_id varchar(64) PRIMARY KEY,
  tenant_id varchar(64) NOT NULL,
  project_id varchar(64) NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','extracting','qa_retry','awaiting_human_review',
      'human_revision','approved','terminated_rejected',
      'manual_intervention_required','failed')),
  qa_attempts integer NOT NULL DEFAULT 0 CHECK (qa_attempts BETWEEN 0 AND 10),
  human_attempts integer NOT NULL DEFAULT 0 CHECK (human_attempts BETWEEN 0 AND 10),
  last_correction_requests jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_human_feedback jsonb NOT NULL DEFAULT '{}'::jsonb,
  manual_intervention_required boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (tenant_id, project_id, job_id),
  FOREIGN KEY (tenant_id, project_id) REFERENCES projects(tenant_id, project_id) ON DELETE CASCADE
);

CREATE TABLE documents (
  document_id varchar(64) PRIMARY KEY,
  tenant_id varchar(64) NOT NULL,
  project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL,
  filename varchar(512) NOT NULL,
  detected_mime varchar(128),
  file_size_bytes bigint CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  sha256 char(64),
  duplicate_of_document_id varchar(64),
  classified_type varchar(64),
  dpa_context_clarification text,
  page_count integer CHECK (page_count IS NULL OR page_count >= 0),
  sheet_names jsonb NOT NULL DEFAULT '[]'::jsonb,
  extraction_status varchar(32) NOT NULL DEFAULT 'pending'
    CHECK (extraction_status IN ('pending','completed','failed','truncated')),
  extraction_complete boolean NOT NULL DEFAULT false,
  pii_redacted boolean NOT NULL DEFAULT false,
  retention_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, document_id),
  FOREIGN KEY (tenant_id, project_id) REFERENCES projects(tenant_id, project_id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, project_id, job_id)
    REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE document_chunks (
  chunk_id bigserial PRIMARY KEY,
  document_id varchar(64) NOT NULL,
  tenant_id varchar(64) NOT NULL,
  project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL,
  evidence_id varchar(32) NOT NULL,
  locator varchar(255) NOT NULL,
  chunk_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, evidence_id),
  UNIQUE (tenant_id, project_id, job_id, evidence_id),
  FOREIGN KEY (tenant_id, project_id, document_id)
    REFERENCES documents(tenant_id, project_id, document_id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, project_id, job_id)
    REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE evidence (
  evidence_id varchar(32) NOT NULL,
  job_id varchar(64) NOT NULL,
  tenant_id varchar(64) NOT NULL,
  project_id varchar(64) NOT NULL,
  document_id varchar(64) NOT NULL,
  locator varchar(255) NOT NULL,
  excerpt text NOT NULL,
  verification_status varchar(32) NOT NULL DEFAULT 'extracted'
    CHECK (verification_status IN ('extracted','verified','flagged','superseded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (job_id, evidence_id),
  UNIQUE (tenant_id, project_id, job_id, evidence_id),
  FOREIGN KEY (tenant_id, project_id, document_id)
    REFERENCES documents(tenant_id, project_id, document_id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, project_id, job_id)
    REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE data_principals (
  id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, principal_id varchar(32) NOT NULL,
  category_name varchar(255) NOT NULL,
  includes_children varchar(32) NOT NULL DEFAULT 'unknown'
    CHECK (includes_children IN ('yes','no','unknown')),
  explicit_or_inferred varchar(32) NOT NULL DEFAULT 'explicit'
    CHECK (explicit_or_inferred IN ('explicit','inferred')),
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, job_id, principal_id),
  FOREIGN KEY (tenant_id, project_id, job_id) REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE personal_data_items (
  id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, item_id varchar(32) NOT NULL,
  category_name varchar(255) NOT NULL, description text, data_principal_id varchar(32),
  sensitivity_or_impact varchar(64) NOT NULL DEFAULT 'standard',
  collection_source text, processing_purpose text,
  explicit_or_inferred varchar(32) NOT NULL DEFAULT 'explicit'
    CHECK (explicit_or_inferred IN ('explicit','inferred')),
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, job_id, item_id),
  FOREIGN KEY (tenant_id, project_id, job_id) REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE processing_activities (
  id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, activity_id varchar(32) NOT NULL,
  business_process text NOT NULL, department varchar(255), processing_purpose text,
  data_principal_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  personal_data_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  collection_source text, collection_method text,
  processing_operations jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_fiduciary varchar(255), data_processors jsonb NOT NULL DEFAULT '[]'::jsonb,
  systems_involved jsonb NOT NULL DEFAULT '[]'::jsonb, storage_location text,
  recipients jsonb NOT NULL DEFAULT '[]'::jsonb, cross_border_transfer text,
  retention_period text, erasure_process text,
  security_controls jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_information jsonb NOT NULL DEFAULT '[]'::jsonb,
  explicit_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  inferred_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric(4,2) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  verification_status varchar(64) NOT NULL DEFAULT 'pending_review'
    CHECK (verification_status IN ('pending_review','requires_human_verification','human_approved','human_corrected','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, job_id, activity_id),
  FOREIGN KEY (tenant_id, project_id, job_id) REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE entities (
  id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, entity_id varchar(32) NOT NULL, name varchar(255) NOT NULL,
  entity_type varchar(64) NOT NULL, department_or_owner varchar(255),
  explicit_or_inferred varchar(32) NOT NULL DEFAULT 'explicit'
    CHECK (explicit_or_inferred IN ('explicit','inferred','stated')),
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, job_id, entity_id),
  FOREIGN KEY (tenant_id, project_id, job_id) REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE data_flows (
  id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, flow_id varchar(32) NOT NULL,
  source_entity_id varchar(32) NOT NULL, destination_entity_id varchar(32) NOT NULL,
  activity_id varchar(32), data_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  processing_stage varchar(64) NOT NULL, transfer_method text,
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric(4,2) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  explicit_or_inferred varchar(32) NOT NULL DEFAULT 'explicit'
    CHECK (explicit_or_inferred IN ('explicit','inferred','stated')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, job_id, flow_id),
  FOREIGN KEY (tenant_id, project_id, job_id, source_entity_id)
    REFERENCES entities(tenant_id, project_id, job_id, entity_id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, project_id, job_id, destination_entity_id)
    REFERENCES entities(tenant_id, project_id, job_id, entity_id) ON DELETE CASCADE
);

CREATE TABLE dpdp_requirements (
  requirement_id varchar(32) PRIMARY KEY, catalogue_version varchar(32) NOT NULL DEFAULT '2023.1',
  legal_instrument varchar(128) NOT NULL DEFAULT 'Digital Personal Data Protection Act, 2023 (No. 22 of 2023)',
  provision_reference varchar(255) NOT NULL, title varchar(255) NOT NULL,
  requirement_description text NOT NULL,
  requirement_type varchar(64) NOT NULL DEFAULT 'statutory_obligation'
    CHECK (requirement_type IN ('statutory_obligation','subordinate_rule_placeholder','best_practice')),
  applicability_conditions text NOT NULL DEFAULT '',
  effective_date date, source_url text NOT NULL DEFAULT 'https://www.meity.gov.in/',
  source_publication_date date, last_verified_date date,
  status varchar(32) NOT NULL DEFAULT 'pending_commencement_notification'
    CHECK (status IN ('active','superseded','pending_commencement_notification')),
  requires_legal_verification boolean NOT NULL DEFAULT true,
  verification_note text NOT NULL DEFAULT 'Technical mapping only; verify legal applicability and commencement with qualified counsel.',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (catalogue_version, requirement_id)
);

CREATE TABLE compliance_assessments (
  id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, requirement_id varchar(32) NOT NULL,
  catalogue_version varchar(32) NOT NULL DEFAULT '2023.1',
  applicability varchar(64) NOT NULL CHECK (applicability IN ('applicable','conditionally_applicable','not_applicable')),
  applicability_reason text, evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  compliance_status varchar(64) NOT NULL CHECK (compliance_status IN ('evidenced','partially_evidenced','not_evidenced_requires_verification','not_applicable')),
  gap_description text, recommendation text,
  confidence numeric(4,2) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, job_id, requirement_id),
  FOREIGN KEY (requirement_id) REFERENCES dpdp_requirements(requirement_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, project_id, job_id) REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE risk_findings (
  id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, risk_id varchar(32) NOT NULL,
  related_activity_id varchar(32), finding_type varchar(64) NOT NULL
    CHECK (finding_type IN ('confirmed_gap','potential_risk','not_evidenced_requires_verification')),
  risk_description text NOT NULL, evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  likelihood varchar(32) CHECK (likelihood IN ('Low','Medium','High')),
  impact varchar(32) CHECK (impact IN ('Low','Medium','High')),
  risk_rating varchar(32) CHECK (risk_rating IN ('Low','Medium','High','Critical')),
  rationale text, recommendation text, priority varchar(32),
  responsible_function varchar(128), suggested_remediation_timeline varchar(64),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, job_id, risk_id),
  FOREIGN KEY (tenant_id, project_id, job_id) REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE recommendations (
  id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, source_ref varchar(64) NOT NULL,
  recommendation_text text NOT NULL, priority varchar(32), responsible_function varchar(128),
  timeline varchar(64), status varchar(32) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','in_progress','implemented','accepted_risk')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, job_id, source_ref),
  FOREIGN KEY (tenant_id, project_id, job_id) REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE assessment_evidence_links (
  link_id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, evidence_id varchar(32) NOT NULL,
  artifact_type varchar(32) NOT NULL CHECK (artifact_type IN
    ('data_principal','personal_data_item','processing_activity','entity','data_flow','compliance_assessment','risk_finding')),
  artifact_ref_id varchar(64) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, job_id, artifact_type, artifact_ref_id, evidence_id),
  FOREIGN KEY (tenant_id, project_id, job_id, evidence_id)
    REFERENCES evidence(tenant_id, project_id, job_id, evidence_id) ON DELETE CASCADE
);

CREATE TABLE approvals (
  approval_id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, reviewer_id varchar(128) NOT NULL,
  decision varchar(32) NOT NULL CHECK (decision IN ('approved','changes_requested','rejected')),
  target_stage varchar(32), revision_number integer NOT NULL DEFAULT 0 CHECK (revision_number >= 0),
  comments text, decided_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, project_id, job_id) REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE generated_reports (
  report_id bigserial PRIMARY KEY, tenant_id varchar(64) NOT NULL, project_id varchar(64) NOT NULL,
  job_id varchar(64) NOT NULL, report_type varchar(64) NOT NULL,
  file_format varchar(16) NOT NULL CHECK (file_format IN ('json','csv','xlsx','pdf','svg','png','mmd')),
  file_path text NOT NULL, file_size_bytes bigint, sha256 char(64),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, project_id, job_id, report_type, file_format),
  FOREIGN KEY (tenant_id, project_id, job_id) REFERENCES job_state(tenant_id, project_id, job_id) ON DELETE CASCADE
);

CREATE TABLE agent_runs (
  run_id bigserial PRIMARY KEY, tenant_id varchar(64), project_id varchar(64),
  job_id varchar(64) NOT NULL, agent_name varchar(64) NOT NULL, model_name varchar(128),
  attempt_number integer NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
  status varchar(32) NOT NULL CHECK (status IN ('started','completed','failed','retried')),
  duration_ms integer CHECK (duration_ms IS NULL OR duration_ms >= 0),
  error_details text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE document_processing_errors (
  error_id bigserial PRIMARY KEY, tenant_id varchar(64), project_id varchar(64),
  job_id varchar(64) NOT NULL, document_id varchar(64), failed_stage varchar(128) NOT NULL,
  error_code varchar(64), error_message text NOT NULL,
  is_recoverable boolean NOT NULL DEFAULT false, occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  event_id bigserial PRIMARY KEY, tenant_id varchar(64), project_id varchar(64),
  job_id varchar(64) NOT NULL, event_type varchar(64) NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);

-- n8n LangChain Postgres Chat Memory table. Keep separate from evidence/audit records.
CREATE TABLE n8n_chat_histories (
  id serial PRIMARY KEY, session_id varchar(255) NOT NULL,
  message jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_tenant_created ON projects(tenant_id, created_at DESC);
CREATE INDEX idx_job_state_lookup ON job_state(tenant_id, project_id, status);
CREATE INDEX idx_documents_tenant_proj_sha256 ON documents(tenant_id, project_id, sha256);
CREATE INDEX idx_documents_job ON documents(job_id);
CREATE INDEX idx_chunks_job_ev ON document_chunks(job_id, evidence_id);
CREATE INDEX idx_chunks_fts ON document_chunks USING GIN (to_tsvector('english', chunk_text));
CREATE INDEX idx_evidence_tenant_job ON evidence(tenant_id, project_id, job_id);
CREATE INDEX idx_principals_job ON data_principals(tenant_id, project_id, job_id);
CREATE INDEX idx_pdata_job ON personal_data_items(tenant_id, project_id, job_id);
CREATE INDEX idx_activities_tenant_proj_job ON processing_activities(tenant_id, project_id, job_id);
CREATE INDEX idx_entities_job ON entities(tenant_id, project_id, job_id);
CREATE INDEX idx_flows_job_act ON data_flows(tenant_id, project_id, job_id, activity_id);
CREATE INDEX idx_dpdp_req_active ON dpdp_requirements(catalogue_version, status);
CREATE INDEX idx_compliance_job_req ON compliance_assessments(tenant_id, project_id, job_id);
CREATE INDEX idx_risks_job_act ON risk_findings(tenant_id, project_id, job_id);
CREATE INDEX idx_recommendations_job ON recommendations(tenant_id, project_id, job_id);
CREATE INDEX idx_ev_links_lookup ON assessment_evidence_links(tenant_id, project_id, job_id, evidence_id);
CREATE INDEX idx_approvals_job_decided ON approvals(tenant_id, project_id, job_id, decided_at DESC);
CREATE INDEX idx_reports_job ON generated_reports(tenant_id, project_id, job_id);
CREATE INDEX idx_agent_runs_job ON agent_runs(job_id, agent_name, created_at DESC);
CREATE INDEX idx_proc_errors_job ON document_processing_errors(job_id, occurred_at DESC);
CREATE INDEX idx_audit_job_created ON audit_events(job_id, created_at DESC);
CREATE INDEX idx_n8n_chat_session ON n8n_chat_histories(session_id);

INSERT INTO schema_migrations(version_id, script_name, notes)
VALUES ('2026.11.V3_FRESH','01_fresh_install.sql','Fresh DPDP schema; tenant RLS intentionally deferred until all clients set tenant context.')
ON CONFLICT (version_id) DO NOTHING;
COMMIT;
