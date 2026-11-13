import base64
import csv
import hashlib
import html
import io
import json
import math
import os
import re
import shutil
import subprocess
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import fitz  # PyMuPDF
import openpyxl
import psycopg2
from docx import Document as DocxDocument
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from psycopg2.extras import Json
from pydantic import BaseModel
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

app = FastAPI(title="DPDP AI Automation Backend", version="2.1.0")

API_KEY = os.getenv("DPDP_BACKEND_API_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
EXPORT_ROOT = Path(
    os.getenv("DPDP_EXPORT_DIR", str(Path(__file__).resolve().parent / "exports"))
).expanduser().resolve()
EXPORT_ROOT.mkdir(parents=True, exist_ok=True)


def verify_api_key(x_api_key: str = Header(default="")):
    if not API_KEY:
        raise HTTPException(status_code=503, detail="Backend API key is not configured.")
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid X-API-Key header")


def get_db():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured. Set it in backend/.env.")
    return psycopg2.connect(DATABASE_URL, connect_timeout=8)


def safe_path_segment(value: Any, field_name: str) -> str:
    value = str(value or "").strip()
    if (
        not value
        or value in {".", ".."}
        or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,63}", value)
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}; use 1-64 letters, digits, dot, underscore or hyphen.",
        )
    return value


def json_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def parse_bool(value: Any, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def spreadsheet_safe(value: Any) -> Any:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        value = json.dumps(value, ensure_ascii=False, default=str)
    text_value = str(value)
    if text_value.startswith(("=", "+", "-", "@", "\t", "\r")):
        return "'" + text_value
    return text_value


def safe_confidence(value: Any, default: Optional[float] = None) -> Optional[float]:
    try:
        number = float(value)
        return number if math.isfinite(number) and 0 <= number <= 1 else default
    except (TypeError, ValueError):
        return default


EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PHONE_RE = re.compile(r"\b(?:\+91[-\s]?)?[6-9]\d{9}\b")
PAN_RE = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")
AADHAAR_RE = re.compile(r"\b\d{4}\s\d{4}\s\d{4}\b")


def redact_units_with_audit(
    raw_units: List[Tuple[str, str]], do_redact: bool
) -> Tuple[List[Tuple[str, str]], Dict[str, Any], List[Dict[str, Any]]]:
    """Masks PII tokens while recording exact counts and unmasked vault entries for PostgreSQL inspection."""
    counts = {"EMAIL": 0, "PHONE": 0, "PAN": 0, "AADHAAR": 0}
    redacted_items: List[Dict[str, str]] = []
    unmasked_vault: List[Dict[str, str]] = []
    processed_units: List[Tuple[str, str]] = []

    patterns = [
        ("EMAIL", EMAIL_RE, "[REDACTED_EMAIL]"),
        ("PHONE", PHONE_RE, "[REDACTED_PHONE]"),
        ("PAN", PAN_RE, "[REDACTED_PAN]"),
        ("AADHAAR", AADHAAR_RE, "[REDACTED_AADHAAR]"),
    ]

    for locator, original_text in raw_units:
        if not do_redact:
            processed_units.append((locator, original_text))
            continue

        masked_text = original_text
        unit_had_pii = False
        for pii_type, regex, replacement in patterns:
            matches = regex.findall(masked_text)
            if matches:
                unit_had_pii = True
                counts[pii_type] += len(matches)
                for m in matches[:10]:
                    redacted_items.append(
                        {
                            "locator": locator,
                            "pii_type": pii_type,
                            "masked_as": replacement,
                            "unmasked_value": str(m),
                        }
                    )
                masked_text = regex.sub(replacement, masked_text)

        if unit_had_pii:
            unmasked_vault.append(
                {
                    "locator": locator,
                    "unmasked_text": original_text,
                    "masked_text": masked_text,
                }
            )
        processed_units.append((locator, masked_text))

    summary = {
        "pii_redaction_enabled": do_redact,
        "total_masked_tokens": sum(counts.values()),
        "counts_by_type": counts,
        "masked_locations": [
            {"locator": item["locator"], "pii_type": item["pii_type"], "masked_as": item["masked_as"]}
            for item in redacted_items[:25]
        ],
    }
    return processed_units, summary, unmasked_vault


def build_job_sql_queries(tenant_id: str, project_id: str, job_id: str) -> Dict[str, str]:
    """Generates ready-to-run PostgreSQL queries pre-filled with the exact job_id, tenant_id, and project_id."""
    return {
        "1_check_unmasked_pii_vault": (
            f"SELECT event_id, created_at, payload->'redaction_summary' AS summary, "
            f"payload->'unmasked_vault' AS unmasked_original_text\n"
            f"FROM audit_events\n"
            f"WHERE job_id = '{job_id}' AND event_type = 'PII_REDACTION_VAULT';"
        ),
        "2_check_extracted_evidence_chunks": (
            f"SELECT evidence_id, locator, excerpt\n"
            f"FROM evidence\n"
            f"WHERE job_id = '{job_id}' AND tenant_id = '{tenant_id}' AND project_id = '{project_id}'\n"
            f"ORDER BY evidence_id ASC;"
        ),
        "3_check_personal_data_inventory": (
            f"SELECT item_id, category_name, description, sensitivity_or_impact, collection_source, processing_purpose, explicit_or_inferred, evidence_ids\n"
            f"FROM personal_data_items\n"
            f"WHERE job_id = '{job_id}' AND tenant_id = '{tenant_id}' AND project_id = '{project_id}'\n"
            f"ORDER BY item_id ASC;"
        ),
        "4_check_ropa_processing_activities": (
            f"SELECT activity_id, business_process, processing_purpose, data_fiduciary, data_processors, retention_period, verification_status, evidence_ids\n"
            f"FROM processing_activities\n"
            f"WHERE job_id = '{job_id}' AND tenant_id = '{tenant_id}' AND project_id = '{project_id}'\n"
            f"ORDER BY activity_id ASC;"
        ),
        "5_check_dpdp_compliance_and_risks": (
            f"SELECT risk_id, related_activity_id, finding_type, risk_rating, risk_description, recommendation, priority\n"
            f"FROM risk_findings\n"
            f"WHERE job_id = '{job_id}' AND tenant_id = '{tenant_id}' AND project_id = '{project_id}'\n"
            f"ORDER BY risk_id ASC;"
        ),
    }


def build_word_report(
    payload: Dict[str, Any], docx_path: Path, is_pre_approval: bool = False
) -> None:
    """Builds a comprehensive .docx document covering Document Overview, Masking Summary, Phrased Outputs, and Job-Specific SQL Commands."""
    tenant_id = str(payload.get("tenant_id") or "default_tenant")
    project_id = str(payload.get("project_id") or "default_project")
    job_id = str(payload.get("job_id") or "unknown_job")
    client_name = str(payload.get("client_name") or "Organization")
    review_status = "PENDING HUMAN APPROVAL" if is_pre_approval else str(payload.get("review_status") or "human_approved")

    doc_meta = (payload.get("source_documents") or [{}])[0] if isinstance(payload.get("source_documents"), list) and payload.get("source_documents") else (payload.get("document") or {})
    redaction_summary = doc_meta.get("redaction_summary") or payload.get("redaction_summary") or {}
    doc_intel = ((payload.get("document_intelligence") or {}).get("documents") or [{}])
    d0 = doc_intel[0] if doc_intel else {}

    data_inventory = payload.get("personal_data_inventory") or {}
    principals = json_list(data_inventory.get("data_principal_categories")) if isinstance(data_inventory, dict) else []
    personal_items = json_list(data_inventory.get("personal_data_items")) if isinstance(data_inventory, dict) else []
    activities = json_list(payload.get("processing_activities_register"))
    mappings = json_list(payload.get("dpdp_compliance_mapping"))
    risks = json_list(payload.get("risk_and_gap_register"))
    sql_queries = build_job_sql_queries(tenant_id, project_id, job_id)

    word_doc = DocxDocument()
    title_prefix = "PRE-APPROVAL VERIFICATION BRIEFING" if is_pre_approval else "FINAL APPROVED DPDP ASSESSMENT REPORT"
    word_doc.add_heading(f"{title_prefix} — {client_name}", 0)
    word_doc.add_paragraph(
        f"Job ID: {job_id} | Tenant ID: {tenant_id} | Project ID: {project_id} | Status: {review_status} | Generated: {datetime.now(timezone.utc).isoformat()}"
    )
    word_doc.add_paragraph(
        "Disclaimer: This document is an evidence-backed technical privacy analysis generated for human verification under the India DPDP Act, 2023. It does not constitute formal legal certification."
    )

    # 1. What the Document is About
    word_doc.add_heading("1. What This Document Is About (Phrased Document Intelligence)", level=1)
    word_doc.add_paragraph(f"• Original Filename: {doc_meta.get('filename') or d0.get('filename') or 'Uploaded Document'}")
    word_doc.add_paragraph(f"• Document ID & SHA-256: {doc_meta.get('document_id') or '-'} | {doc_meta.get('sha256') or '-'}")
    word_doc.add_paragraph(f"• Classified Document Type: {d0.get('classified_type') or '-'}")
    word_doc.add_paragraph(f"• Contextual Meaning of 'DPA': {d0.get('dpa_context_clarification') or '-'}")
    word_doc.add_paragraph(f"• Purpose & Scope: {d0.get('purpose_and_scope') or '-'}")
    word_doc.add_paragraph(f"• Executive Summary: {d0.get('concise_summary') or '-'}")
    missing_doc_info = json_list((payload.get("document_intelligence") or {}).get("missing_information"))
    word_doc.add_paragraph(f"• Missing Information Flagged for Review: {', '.join(map(str, missing_doc_info)) if missing_doc_info else 'None'}")

    for sec in json_list(d0.get("sections")):
        word_doc.add_paragraph(
            f"   - Section [{sec.get('title')}]: {sec.get('summary')} (Evidence: {', '.join(json_list(sec.get('evidence_ids')))})"
        )

    # 2. What Was Masked / Redacted
    word_doc.add_heading("2. What We Masked / Redacted Before AI Processing", level=1)
    total_masked = redaction_summary.get("total_masked_tokens", 0)
    counts_by_type = redaction_summary.get("counts_by_type") or {"EMAIL": 0, "PHONE": 0, "PAN": 0, "AADHAAR": 0}
    word_doc.add_paragraph(
        f"• PII Redaction Enabled: {redaction_summary.get('pii_redaction_enabled', True)} | Total Direct PII Tokens Masked: {total_masked}"
    )
    word_doc.add_paragraph(
        f"• Breakdown by Pattern: EMAIL: {counts_by_type.get('EMAIL', 0)} | PHONE: {counts_by_type.get('PHONE', 0)} | PAN: {counts_by_type.get('PAN', 0)} | AADHAAR: {counts_by_type.get('AADHAAR', 0)}"
    )
    word_doc.add_paragraph(
        "• Category-Level Abstraction Rule: In addition to regex masking, AI Agents are strictly instructed never to copy raw personal identifiers into outputs and instead phrase findings as category labels (see Section 3)."
    )
    masked_locs = json_list(redaction_summary.get("masked_locations"))
    if masked_locs:
        for ml in masked_locs:
            word_doc.add_paragraph(f"   - Masked {ml.get('pii_type')} as {ml.get('masked_as')} at {ml.get('locator')}")
    else:
        word_doc.add_paragraph("   - No raw email/phone/PAN/Aadhaar strings were present in the uploaded text; only category-level personal data descriptions were phrased.")

    # 3. Phrased Personal Data Inventory
    word_doc.add_heading("3. Phrased Personal Data Inventory & Data Principals", level=1)
    for dp in principals:
        word_doc.add_paragraph(
            f"• Data Principal [{dp.get('principal_id')}]: {dp.get('category_name')} | Includes Children: {dp.get('includes_children')} | Basis: {dp.get('explicit_or_inferred')}"
        )
    for pd_item in personal_items:
        p = word_doc.add_paragraph()
        p.add_run(f"[{pd_item.get('item_id')}] {pd_item.get('category_name')} ({pd_item.get('sensitivity_or_impact')}): ").bold = True
        p.add_run(
            f"{pd_item.get('description')} | Purpose: {pd_item.get('processing_purpose') or '-'} | Source: {pd_item.get('collection_source') or '-'} | Basis: {pd_item.get('explicit_or_inferred')} | Evidence: {', '.join(json_list(pd_item.get('evidence_ids')))}"
        )

    # 4. Phrased Processing Activities Register (RoPA)
    word_doc.add_heading("4. Phrased Processing Activities Register (RoPA)", level=1)
    for act in activities:
        word_doc.add_heading(f"{act.get('activity_id')}: {act.get('business_process')}", level=2)
        word_doc.add_paragraph(f"• Processing Purpose: {act.get('processing_purpose') or '-'}")
        word_doc.add_paragraph(f"• Data Fiduciary: {act.get('data_fiduciary') or '-'} | Data Processors: {', '.join(json_list(act.get('data_processors'))) or '-'}")
        word_doc.add_paragraph(f"• Personal Data Categories: {', '.join(json_list(act.get('personal_data_categories'))) or '-'}")
        word_doc.add_paragraph(f"• Systems Involved: {', '.join(json_list(act.get('systems_involved'))) or '-'} | Storage: {act.get('storage_location') or 'Not specified'}")
        word_doc.add_paragraph(f"• Security Controls: {', '.join(json_list(act.get('security_controls'))) or '-'}")
        word_doc.add_paragraph(f"• Retention Period: {act.get('retention_period') or 'Not specified'} | Erasure: {act.get('erasure_process') or 'Not specified'}")
        word_doc.add_paragraph(f"• Missing Fields Flagged: {', '.join(json_list(act.get('missing_information'))) or 'None'}")

    # 5. Phrased DPDP Act, 2023 Compliance Mapping
    word_doc.add_heading("5. Phrased DPDP Act, 2023 Compliance Mapping", level=1)
    for m in mappings:
        p = word_doc.add_paragraph()
        p.add_run(f"{m.get('requirement_id')} ({m.get('provision_reference')}) — Status: {m.get('compliance_status')}\n").bold = True
        p.add_run(f"Applicability: {m.get('applicability')} ({m.get('applicability_reason')})\n")
        p.add_run(f"Gap Identified: {m.get('gap_description') or 'None'}\n")
        p.add_run(f"Recommendation: {m.get('recommendation') or '-'}")

    # 6. Phrased Privacy Risks & Remediation
    word_doc.add_heading("6. Phrased Privacy Risk & Gap Register", level=1)
    for r in risks:
        p = word_doc.add_paragraph()
        p.add_run(f"[{r.get('risk_id')}] {r.get('risk_rating')} Risk ({r.get('finding_type')}) — Priority: {r.get('priority')}\n").bold = True
        p.add_run(f"Description: {r.get('risk_description')}\n")
        p.add_run(f"Rationale: {r.get('rationale')}\n")
        p.add_run(f"Recommendation ({r.get('responsible_function')}, {r.get('suggested_remediation_timeline')}): {r.get('recommendation')}")

    # 7. Exact PostgreSQL SQL Commands for This Specific Job
    word_doc.add_heading(f"7. PostgreSQL SQL Commands for Job {job_id} (Unmasked Vault & Tables)", level=1)
    word_doc.add_paragraph(
        "Run these exact queries in pgAdmin Query Tool to inspect the unmasked text vault, extracted evidence chunks, and structured personal data records for this specific file execution:"
    )
    for q_title, q_sql in sql_queries.items():
        p = word_doc.add_paragraph()
        p.add_run(f"-- {q_title}\n").bold = True
        p.add_run(q_sql)

    word_doc.save(str(docx_path))


def verify_magic_bytes(ext: str, content: bytes) -> None:
    if ext == "pdf" and not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="File signature does not match PDF (%PDF-).")
    if ext in ("docx", "xlsx") and not content.startswith(b"PK\x03\x04"):
        raise HTTPException(
            status_code=400,
            detail=f"File signature does not match ZIP/OOXML container for .{ext}.",
        )


def chunk_paragraphs(paragraphs: List[tuple], max_chars: int = 1200) -> List[Dict[str, str]]:
    chunks = []
    ev_counter = 1
    for locator, text in paragraphs:
        clean = re.sub(r"\s+", " ", text).strip()
        if not clean:
            continue
        for start in range(0, len(clean), max_chars):
            part = clean[start : start + max_chars]
            sub_loc = locator if start == 0 else f"{locator} (part {start // max_chars + 1})"
            chunks.append(
                {
                    "evidence_id": f"EV-{ev_counter:04d}",
                    "locator": sub_loc,
                    "text": part,
                }
            )
            ev_counter += 1
    return chunks


@app.get("/health")
def health():
    return {"status": "ok", "service": "dpdp-fastapi-backend", "version": app.version}


@app.post("/api/v1/extract", dependencies=[Depends(verify_api_key)])
async def extract_document(
    file: UploadFile = File(...),
    tenant_id: str = Form(...),
    project_id: str = Form(...),
    job_id: str = Form(...),
    redact_pii: str = Form("true"),
):
    tenant_id = safe_path_segment(tenant_id, "tenant_id")
    project_id = safe_path_segment(project_id, "project_id")
    job_id = safe_path_segment(job_id, "job_id")
    raw = await file.read(20 * 1024 * 1024 + 1)
    await file.close()
    if len(raw) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds the 20 MB upload limit.")
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    filename = Path(file.filename or "uploaded_document").name[:512]
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in {"pdf", "docx", "xlsx", "csv", "txt", "md"}:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension: .{ext}")
    verify_magic_bytes(ext, raw)

    sha256_hash = hashlib.sha256(raw).hexdigest()
    doc_id = f"DOC-{uuid.uuid4().hex.upper()}"
    do_redact = parse_bool(redact_pii, default=True)
    raw_units: List[tuple] = []
    page_count = None
    sheet_names: List[str] = []

    try:
        if ext == "pdf":
            with fitz.open(stream=raw, filetype="pdf") as pdf:
                page_count = len(pdf)
                for p_idx, page in enumerate(pdf, start=1):
                    for b_idx, block in enumerate(page.get_text("blocks"), start=1):
                        txt = block[4].strip() if len(block) > 4 else ""
                        if txt:
                            raw_units.append((f"Page {p_idx}, Block {b_idx}", txt))
        elif ext == "docx":
            doc = DocxDocument(io.BytesIO(raw))
            for idx, para in enumerate(doc.paragraphs, start=1):
                if para.text.strip():
                    raw_units.append((f"Paragraph {idx}", para.text.strip()))
            for t_idx, table in enumerate(doc.tables, start=1):
                for r_idx, row in enumerate(table.rows, start=1):
                    cells = [c.text.strip() for c in row.cells if c.text.strip()]
                    if cells:
                        raw_units.append((f"Table {t_idx}, Row {r_idx}", " | ".join(cells)))
        elif ext == "xlsx":
            wb = openpyxl.load_workbook(io.BytesIO(raw), data_only=True, read_only=True)
            sheet_names = wb.sheetnames
            for s_name in sheet_names:
                for r_idx, row in enumerate(wb[s_name].iter_rows(values_only=True), start=1):
                    vals = [str(v).strip() for v in row if v is not None and str(v).strip()]
                    if vals:
                        raw_units.append((f"Sheet '{s_name}', Row {r_idx}", " | ".join(vals)))
            wb.close()
        elif ext == "csv":
            reader = csv.reader(io.StringIO(raw.decode("utf-8-sig", errors="replace")))
            for r_idx, row in enumerate(reader, start=1):
                vals = [c.strip() for c in row if c.strip()]
                if vals:
                    raw_units.append((f"CSV Row {r_idx}", " | ".join(vals)))
        else:
            for idx, line in enumerate(
                raw.decode("utf-8-sig", errors="replace").splitlines(), start=1
            ):
                if line.strip():
                    raw_units.append((f"Line {idx}", line.strip()))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400, detail=f"Could not parse uploaded {ext} file: {str(exc)[:200]}"
        ) from exc

    raw_units, redaction_summary, unmasked_vault = redact_units_with_audit(raw_units, do_redact)

    chunks = chunk_paragraphs(raw_units)
    evidence_prefix = uuid.uuid4().hex[:8].upper()
    for idx, chunk in enumerate(chunks, start=1):
        chunk["evidence_id"] = f"EV-{evidence_prefix}-{idx:04d}"

    duplicate_of = None
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO tenants (tenant_id, tenant_name) VALUES (%s,%s) ON CONFLICT (tenant_id) DO NOTHING",
                    (tenant_id, tenant_id),
                )
                cur.execute(
                    "INSERT INTO projects (tenant_id, project_id, client_name) VALUES (%s,%s,%s) ON CONFLICT (tenant_id,project_id) DO NOTHING",
                    (tenant_id, project_id, tenant_id),
                )
                cur.execute(
                    """INSERT INTO job_state (job_id,tenant_id,project_id,status)
                       VALUES (%s,%s,%s,'extracting')
                       ON CONFLICT (job_id) DO UPDATE SET updated_at=now()
                       WHERE job_state.tenant_id=EXCLUDED.tenant_id AND job_state.project_id=EXCLUDED.project_id""",
                    (job_id, tenant_id, project_id),
                )
                cur.execute("SELECT tenant_id,project_id FROM job_state WHERE job_id=%s", (job_id,))
                job_row = cur.fetchone()
                if not job_row or job_row != (tenant_id, project_id):
                    raise HTTPException(
                        status_code=409,
                        detail="job_id already belongs to a different tenant or project.",
                    )

                cur.execute(
                    "SELECT document_id FROM documents WHERE tenant_id=%s AND project_id=%s AND sha256=%s ORDER BY created_at LIMIT 1",
                    (tenant_id, project_id, sha256_hash),
                )
                existing = cur.fetchone()
                duplicate_of = existing[0] if existing else None

                cur.execute(
                    """INSERT INTO documents
                       (document_id,tenant_id,project_id,job_id,filename,detected_mime,file_size_bytes,sha256,
                        duplicate_of_document_id,page_count,sheet_names,extraction_status,extraction_complete,pii_redacted)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'completed',TRUE,%s)""",
                    (
                        doc_id,
                        tenant_id,
                        project_id,
                        job_id,
                        filename,
                        file.content_type,
                        len(raw),
                        sha256_hash,
                        duplicate_of,
                        page_count,
                        Json(sheet_names),
                        do_redact,
                    ),
                )
                for chunk in chunks:
                    cur.execute(
                        """INSERT INTO document_chunks
                           (document_id,tenant_id,project_id,job_id,evidence_id,locator,chunk_text)
                           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                        (
                            doc_id,
                            tenant_id,
                            project_id,
                            job_id,
                            chunk["evidence_id"],
                            chunk["locator"],
                            chunk["text"],
                        ),
                    )
                    cur.execute(
                        """INSERT INTO evidence
                           (evidence_id,job_id,tenant_id,project_id,document_id,locator,excerpt)
                           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                        (
                            chunk["evidence_id"],
                            job_id,
                            tenant_id,
                            project_id,
                            doc_id,
                            chunk["locator"],
                            chunk["text"],
                        ),
                    )
                cur.execute(
                    """INSERT INTO audit_events (tenant_id,project_id,job_id,event_type,payload)
                       VALUES (%s,%s,%s,'PII_REDACTION_VAULT',%s)""",
                    (
                        tenant_id,
                        project_id,
                        job_id,
                        Json(
                            {
                                "document_id": doc_id,
                                "filename": filename,
                                "redaction_summary": redaction_summary,
                                "unmasked_vault": unmasked_vault,
                            }
                        ),
                    ),
                )
                cur.execute(
                    "UPDATE job_state SET status='extracting',updated_at=now() WHERE job_id=%s AND tenant_id=%s AND project_id=%s",
                    (job_id, tenant_id, project_id),
                )
    except HTTPException:
        raise
    except Exception as db_err:
        raise HTTPException(
            status_code=503,
            detail=f"Extraction persistence failed; transaction rolled back: {str(db_err)[:300]}",
        ) from db_err

    return {
        "document_id": doc_id,
        "filename": filename,
        "sha256": sha256_hash,
        "file_size_bytes": len(raw),
        "page_count": page_count,
        "sheet_names": sheet_names,
        "duplicate_of": duplicate_of,
        "extraction_complete": True,
        "pii_redacted": do_redact,
        "redaction_summary": redaction_summary,
        "chunks": chunks,
        "warnings": (
            ["Scanned/image-only PDFs may require OCR; no OCR was performed."]
            if ext == "pdf" and not chunks
            else []
        ),
    }


@app.get("/api/v1/catalogue/dpdp", dependencies=[Depends(verify_api_key)])
def get_dpdp_catalogue(catalogue_version: Optional[str] = None):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                if catalogue_version:
                    cur.execute(
                        """SELECT requirement_id, catalogue_version, provision_reference, title,
                                  requirement_description, requirement_type, updated_at
                           FROM dpdp_requirements WHERE catalogue_version=%s
                           ORDER BY requirement_id""",
                        (catalogue_version,),
                    )
                else:
                    cur.execute(
                        """SELECT requirement_id, catalogue_version, provision_reference, title,
                                  requirement_description, requirement_type, updated_at
                           FROM dpdp_requirements ORDER BY catalogue_version, requirement_id"""
                    )
                columns = [desc[0] for desc in cur.description]
                rows = [dict(zip(columns, row)) for row in cur.fetchall()]
        return {"count": len(rows), "requirements": rows}
    except Exception as exc:
        raise HTTPException(
            status_code=503, detail=f"Could not read DPDP catalogue: {str(exc)[:250]}"
        ) from exc


@app.post("/api/v1/review-doc", dependencies=[Depends(verify_api_key)])
async def generate_pre_approval_review_doc(payload: Dict[str, Any]):
    """Generates the Pre-Approval Verification .docx file + job-specific SQL queries and returns Base64 for Gmail attachment."""
    tenant_id = safe_path_segment(payload.get("tenant_id"), "tenant_id")
    project_id = safe_path_segment(payload.get("project_id"), "project_id")
    job_id = safe_path_segment(payload.get("job_id"), "job_id")
    out_dir = EXPORT_ROOT / tenant_id / project_id / job_id
    out_dir.mkdir(parents=True, exist_ok=True)

    review_docx_path = out_dir / f"{job_id}_pre_approval_review.docx"
    build_word_report(payload, review_docx_path, is_pre_approval=True)
    docx_bytes = review_docx_path.read_bytes()
    sql_queries = build_job_sql_queries(tenant_id, project_id, job_id)

    return {
        "status": "review_doc_ready",
        "job_id": job_id,
        "tenant_id": tenant_id,
        "project_id": project_id,
        "filename": review_docx_path.name,
        "file_path": str(review_docx_path),
        "docx_base64": base64.b64encode(docx_bytes).decode("ascii"),
        "sql_queries": sql_queries,
    }


class DiagramRenderRequest(BaseModel):
    job_id: str
    tenant_id: str
    project_id: str
    level_0_mermaid: str
    level_1_mermaid: str


def render_mermaid_locally(mmd_source: str, out_prefix: Path) -> Dict[str, str]:
    if not isinstance(mmd_source, str) or not mmd_source.strip():
        raise HTTPException(status_code=400, detail="Mermaid source cannot be empty.")
    if len(mmd_source.encode("utf-8")) > 1_000_000:
        raise HTTPException(status_code=413, detail="Mermaid source exceeds the 1 MB limit.")

    mmd_path = out_prefix.with_suffix(".mmd")
    svg_path = out_prefix.with_suffix(".svg")
    png_path = out_prefix.with_suffix(".png")
    mmd_path.parent.mkdir(parents=True, exist_ok=True)
    mmd_path.write_text(mmd_source, encoding="utf-8")

    mmdc_path = shutil.which("mmdc.cmd") or shutil.which("mmdc")
    if not mmdc_path:
        raise HTTPException(
            status_code=503,
            detail="Mermaid CLI (mmdc) is not visible to the FastAPI process.",
        )

    def execute_mermaid(output_path: Path, background: str) -> None:
        args = ["-i", str(mmd_path), "-o", str(output_path), "-b", background]
        if os.name == "nt" and Path(mmdc_path).suffix.lower() in {".cmd", ".bat"}:
            command_line = subprocess.list2cmdline([mmdc_path, *args])
            result = subprocess.run(
                ["cmd.exe", "/d", "/s", "/c", f'"{command_line}"'],
                capture_output=True,
                text=True,
                timeout=120,
                check=False,
            )
        else:
            result = subprocess.run(
                [mmdc_path, *args],
                capture_output=True,
                text=True,
                timeout=120,
                check=False,
            )
        if result.returncode != 0 or not output_path.is_file() or output_path.stat().st_size == 0:
            raise HTTPException(
                status_code=503,
                detail=f"Mermaid CLI failed: {(result.stderr or result.stdout or '')[-500:]}",
            )

    execute_mermaid(svg_path, "transparent")
    execute_mermaid(png_path, "white")
    return {"mmd": str(mmd_path), "svg": str(svg_path), "png": str(png_path)}


@app.post("/api/v1/diagram/render", dependencies=[Depends(verify_api_key)])
async def render_diagrams(req: DiagramRenderRequest):
    if not req.level_0_mermaid.strip() or not req.level_1_mermaid.strip():
        raise HTTPException(status_code=400, detail="Both Mermaid diagram sources are required.")
    tenant_id = safe_path_segment(req.tenant_id, "tenant_id")
    project_id = safe_path_segment(req.project_id, "project_id")
    job_id = safe_path_segment(req.job_id, "job_id")
    out_dir = EXPORT_ROOT / tenant_id / project_id / job_id
    out_dir.mkdir(parents=True, exist_ok=True)
    l0 = render_mermaid_locally(req.level_0_mermaid, out_dir / "dfd_level_0")
    l1 = render_mermaid_locally(req.level_1_mermaid, out_dir / "dfd_level_1")
    return {"job_id": job_id, "level_0": l0, "level_1": l1}


@app.post("/api/v1/export", dependencies=[Depends(verify_api_key)])
async def export_package(payload: Dict[str, Any]):
    tenant_id = safe_path_segment(payload.get("tenant_id"), "tenant_id")
    project_id = safe_path_segment(payload.get("project_id"), "project_id")
    job_id = safe_path_segment(payload.get("job_id"), "job_id")
    out_dir = EXPORT_ROOT / tenant_id / project_id / job_id
    out_dir.mkdir(parents=True, exist_ok=True)

    activities = json_list(payload.get("processing_activities_register"))
    data_inventory = payload.get("personal_data_inventory") or {}
    principals = json_list(data_inventory.get("data_principal_categories")) if isinstance(data_inventory, dict) else []
    personal_items = json_list(data_inventory.get("personal_data_items")) if isinstance(data_inventory, dict) else []
    flow_model = payload.get("data_flow_model") or {}
    entities = json_list(flow_model.get("entities")) if isinstance(flow_model, dict) else []
    flows = json_list(flow_model.get("flows")) if isinstance(flow_model, dict) else []
    mappings = json_list(payload.get("dpdp_compliance_mapping"))
    risks = json_list(payload.get("risk_and_gap_register"))
    approval = payload.get("approval_record") or {}

    generated_files: List[str] = []

    # 1. Consolidated JSON
    json_path = out_dir / f"{job_id}_consolidated_report.json"
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
    generated_files.append(str(json_path))

    # 2. RoPA CSV
    ropa_headers = [
        "activity_id", "business_process", "department", "processing_purpose",
        "data_principal_categories", "personal_data_categories", "data_fiduciary",
        "data_processors", "systems_involved", "storage_location", "retention_period",
        "erasure_process", "security_controls", "evidence_ids", "confidence",
    ]
    csv_path = out_dir / f"{job_id}_processing_activities_register.csv"
    with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=ropa_headers)
        writer.writeheader()
        for act in activities:
            writer.writerow({k: spreadsheet_safe(act.get(k)) for k in ropa_headers})
    generated_files.append(str(csv_path))

    # 3. Multi-Tab XLSX Workbook
    xlsx_path = out_dir / f"{job_id}_dpdp_compliance_workbook.xlsx"
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Processing_Activities"
    ws.append(ropa_headers)
    for act in activities:
        ws.append([spreadsheet_safe(act.get(k)) for k in ropa_headers])
    sheets = [
        ("Personal_Data", ["item_id", "category_name", "description", "data_principal_id", "sensitivity_or_impact", "collection_source", "processing_purpose", "explicit_or_inferred", "evidence_ids"], personal_items),
        ("DPDP_Compliance", ["requirement_id", "provision_reference", "applicability", "compliance_status", "gap_description", "recommendation", "evidence_ids"], mappings),
        ("Risk_Register", ["risk_id", "related_activity_id", "finding_type", "risk_rating", "likelihood", "impact", "risk_description", "recommendation", "priority", "responsible_function", "evidence_ids"], risks),
        ("Entities", ["entity_id", "name", "entity_type", "department_or_owner", "explicit_or_inferred", "evidence_ids"], entities),
        ("Data_Flows", ["flow_id", "source_entity_id", "destination_entity_id", "activity_id", "data_categories", "processing_stage", "transfer_method", "evidence_ids", "confidence", "explicit_or_inferred"], flows),
        ("Evidence_Index", ["evidence_id", "locator", "text"], json_list(payload.get("evidence_index"))),
    ]
    for title, headers, rows in sheets:
        wsx = wb.create_sheet(title)
        wsx.append(headers)
        for item in rows:
            wsx.append([spreadsheet_safe(item.get(k)) for k in headers])
    wb.save(xlsx_path)
    generated_files.append(str(xlsx_path))

    # 4. Executive Landscape PDF Report
    pdf_path = out_dir / f"{job_id}_dpdp_executive_report.pdf"
    styles = getSampleStyleSheet()
    client = html.escape(str(payload.get("client_name") or "Unspecified Client"))
    story = [
        Paragraph(f"DPDP Act, 2023 Data Privacy Assessment & RoPA Report — {client}", styles["Title"]),
        Spacer(1, 10),
        Paragraph(
            f"<b>Job ID:</b> {html.escape(job_id)} | <b>Project ID:</b> {html.escape(project_id)} | <b>Review Status:</b> {html.escape(str(payload.get('review_status') or 'Pending'))}",
            styles["Normal"],
        ),
        Paragraph("<i>Technical assessment for human/legal review; not a legal opinion or compliance certification.</i>", styles["Normal"]),
        Spacer(1, 12),
        Paragraph("1. Processing Activities Register", styles["Heading2"]),
    ]
    table_data = [["ID", "Process", "Purpose", "Principals", "Processors", "Retention", "Evidence"]]
    for a in activities:
        table_data.append([
            str(a.get("activity_id", "")),
            str(a.get("business_process", ""))[:35],
            str(a.get("processing_purpose", ""))[:40],
            ", ".join(map(str, json_list(a.get("data_principal_categories"))))[:30],
            ", ".join(map(str, json_list(a.get("data_processors"))))[:30],
            str(a.get("retention_period") or "Not stated")[:25],
            ", ".join(map(str, json_list(a.get("evidence_ids"))))[:25],
        ])
    t = Table(table_data, repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke), ("GRID", (0, 0), (-1, -1), 0.4, colors.grey), ("FONTSIZE", (0, 0), (-1, -1), 7)]))
    story.extend([t, Spacer(1, 12), Paragraph("2. DPDP Compliance Mapping", styles["Heading2"])])
    comp_data = [["Requirement", "Provision", "Applicability", "Status", "Gap / Recommendation"]]
    for m in mappings:
        comp_data.append([str(m.get("requirement_id", "")), str(m.get("provision_reference", ""))[:28], str(m.get("applicability", "")), str(m.get("compliance_status", "")), (str(m.get("gap_description") or "") + " " + str(m.get("recommendation") or ""))[:75]])
    tc = Table(comp_data, repeatRows=1)
    tc.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke), ("GRID", (0, 0), (-1, -1), 0.4, colors.grey), ("FONTSIZE", (0, 0), (-1, -1), 7)]))
    story.append(tc)
    story.extend([Spacer(1, 12), Paragraph("3. Privacy Risk & Gap Register", styles["Heading2"])])
    risk_data = [["Risk", "Type", "Rating", "Description", "Recommendation"]]
    for r in risks:
        risk_data.append([str(r.get("risk_id", "")), str(r.get("finding_type", "")), str(r.get("risk_rating", "")), str(r.get("risk_description", ""))[:55], str(r.get("recommendation", ""))[:55]])
    tr = Table(risk_data, repeatRows=1)
    tr.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7f1d1d")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke), ("GRID", (0, 0), (-1, -1), 0.4, colors.grey), ("FONTSIZE", (0, 0), (-1, -1), 7)]))
    story.append(tr)
    SimpleDocTemplate(str(pdf_path), pagesize=landscape(A4)).build(story)
    generated_files.append(str(pdf_path))

    # 5. Complete Detailed MS Word Document (.docx)
    docx_path = out_dir / f"{job_id}_dpdp_detailed_report.docx"
    build_word_report(payload, docx_path, is_pre_approval=False)
    generated_files.append(str(docx_path))

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM job_state WHERE job_id=%s AND tenant_id=%s AND project_id=%s", (job_id, tenant_id, project_id))
                if not cur.fetchone():
                    raise HTTPException(status_code=409, detail="Job state not found for this tenant/project.")

                for item in principals:
                    pid = str(item.get("principal_id") or "").strip()
                    name = str(item.get("category_name") or "").strip()
                    if not pid or not name:
                        continue
                    children = item.get("includes_children") if item.get("includes_children") in {"yes", "no", "unknown"} else "unknown"
                    explicit = item.get("explicit_or_inferred") if item.get("explicit_or_inferred") in {"explicit", "inferred"} else "inferred"
                    cur.execute(
                        """INSERT INTO data_principals (tenant_id,project_id,job_id,principal_id,category_name,includes_children,explicit_or_inferred,evidence_ids)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (tenant_id,project_id,job_id,principal_id) DO UPDATE SET category_name=EXCLUDED.category_name,includes_children=EXCLUDED.includes_children,explicit_or_inferred=EXCLUDED.explicit_or_inferred,evidence_ids=EXCLUDED.evidence_ids""",
                        (tenant_id, project_id, job_id, pid, name, children, explicit, Json(json_list(item.get("evidence_ids")))),
                    )
                for item in personal_items:
                    iid = str(item.get("item_id") or "").strip()
                    name = str(item.get("category_name") or "").strip()
                    if not iid or not name:
                        continue
                    explicit = item.get("explicit_or_inferred") if item.get("explicit_or_inferred") in {"explicit", "inferred"} else "inferred"
                    cur.execute(
                        """INSERT INTO personal_data_items (tenant_id,project_id,job_id,item_id,category_name,description,data_principal_id,sensitivity_or_impact,collection_source,processing_purpose,explicit_or_inferred,evidence_ids)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (tenant_id,project_id,job_id,item_id) DO UPDATE SET category_name=EXCLUDED.category_name,description=EXCLUDED.description,data_principal_id=EXCLUDED.data_principal_id,sensitivity_or_impact=EXCLUDED.sensitivity_or_impact,collection_source=EXCLUDED.collection_source,processing_purpose=EXCLUDED.processing_purpose,explicit_or_inferred=EXCLUDED.explicit_or_inferred,evidence_ids=EXCLUDED.evidence_ids""",
                        (tenant_id, project_id, job_id, iid, name, item.get("description"), item.get("data_principal_id"), item.get("sensitivity_or_impact") or "unknown", item.get("collection_source"), item.get("processing_purpose"), explicit, Json(json_list(item.get("evidence_ids")))),
                    )

                for a in activities:
                    aid = str(a.get("activity_id") or "").strip()
                    bp = str(a.get("business_process") or "").strip()
                    if not aid or not bp:
                        continue
                    verification = a.get("verification_status") if a.get("verification_status") in {"pending_review", "requires_human_verification", "human_approved", "human_corrected", "rejected"} else "pending_review"
                    cur.execute(
                        """INSERT INTO processing_activities (tenant_id,project_id,job_id,activity_id,business_process,department,processing_purpose,data_principal_categories,personal_data_categories,data_fiduciary,data_processors,systems_involved,storage_location,retention_period,erasure_process,security_controls,evidence_ids,missing_information,confidence,verification_status)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                           ON CONFLICT (tenant_id,project_id,job_id,activity_id) DO UPDATE SET business_process=EXCLUDED.business_process,department=EXCLUDED.department,processing_purpose=EXCLUDED.processing_purpose,data_principal_categories=EXCLUDED.data_principal_categories,personal_data_categories=EXCLUDED.personal_data_categories,data_fiduciary=EXCLUDED.data_fiduciary,data_processors=EXCLUDED.data_processors,systems_involved=EXCLUDED.systems_involved,storage_location=EXCLUDED.storage_location,retention_period=EXCLUDED.retention_period,erasure_process=EXCLUDED.erasure_process,security_controls=EXCLUDED.security_controls,evidence_ids=EXCLUDED.evidence_ids,missing_information=EXCLUDED.missing_information,confidence=EXCLUDED.confidence,verification_status=EXCLUDED.verification_status,updated_at=now()""",
                        (tenant_id, project_id, job_id, aid, bp, a.get("department"), a.get("processing_purpose"), Json(json_list(a.get("data_principal_categories"))), Json(json_list(a.get("personal_data_categories"))), a.get("data_fiduciary"), Json(json_list(a.get("data_processors"))), Json(json_list(a.get("systems_involved"))), a.get("storage_location"), a.get("retention_period"), a.get("erasure_process"), Json(json_list(a.get("security_controls"))), Json(json_list(a.get("evidence_ids"))), Json(json_list(a.get("missing_information"))), safe_confidence(a.get("confidence"), 0.0), verification),
                    )

                for e in entities:
                    eid = str(e.get("entity_id") or "").strip()
                    name = str(e.get("name") or "").strip()
                    etype = str(e.get("entity_type") or "").strip()
                    if not eid or not name or not etype:
                        continue
                    explicit = e.get("explicit_or_inferred") if e.get("explicit_or_inferred") in {"explicit", "inferred", "stated"} else "inferred"
                    cur.execute(
                        """INSERT INTO entities (tenant_id,project_id,job_id,entity_id,name,entity_type,department_or_owner,explicit_or_inferred,evidence_ids)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (tenant_id,project_id,job_id,entity_id) DO UPDATE SET name=EXCLUDED.name,entity_type=EXCLUDED.entity_type,department_or_owner=EXCLUDED.department_or_owner,explicit_or_inferred=EXCLUDED.explicit_or_inferred,evidence_ids=EXCLUDED.evidence_ids""",
                        (tenant_id, project_id, job_id, eid, name, etype, e.get("department_or_owner"), explicit, Json(json_list(e.get("evidence_ids")))),
                    )
                for f in flows:
                    fid = str(f.get("flow_id") or "").strip()
                    src = str(f.get("source_entity_id") or "").strip()
                    dst = str(f.get("destination_entity_id") or "").strip()
                    stage = str(f.get("processing_stage") or "").strip()
                    if not all([fid, src, dst, stage]):
                        continue
                    explicit = f.get("explicit_or_inferred") if f.get("explicit_or_inferred") in {"explicit", "inferred", "stated"} else "inferred"
                    cur.execute(
                        """INSERT INTO data_flows (tenant_id,project_id,job_id,flow_id,source_entity_id,destination_entity_id,activity_id,data_categories,processing_stage,transfer_method,evidence_ids,confidence,explicit_or_inferred)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (tenant_id,project_id,job_id,flow_id) DO UPDATE SET source_entity_id=EXCLUDED.source_entity_id,destination_entity_id=EXCLUDED.destination_entity_id,activity_id=EXCLUDED.activity_id,data_categories=EXCLUDED.data_categories,processing_stage=EXCLUDED.processing_stage,transfer_method=EXCLUDED.transfer_method,evidence_ids=EXCLUDED.evidence_ids,confidence=EXCLUDED.confidence,explicit_or_inferred=EXCLUDED.explicit_or_inferred""",
                        (tenant_id, project_id, job_id, fid, src, dst, f.get("activity_id"), Json(json_list(f.get("data_categories"))), stage, f.get("transfer_method"), Json(json_list(f.get("evidence_ids"))), safe_confidence(f.get("confidence")), explicit),
                    )

                for m in mappings:
                    rid = str(m.get("requirement_id") or "").strip()
                    if not rid:
                        continue
                    applicability = m.get("applicability") if m.get("applicability") in {"applicable", "conditionally_applicable", "not_applicable"} else "conditionally_applicable"
                    status = m.get("compliance_status") if m.get("compliance_status") in {"evidenced", "partially_evidenced", "not_evidenced_requires_verification", "not_applicable"} else "not_evidenced_requires_verification"
                    cur.execute(
                        """INSERT INTO compliance_assessments (tenant_id,project_id,job_id,requirement_id,catalogue_version,applicability,applicability_reason,evidence_ids,missing_evidence,compliance_status,gap_description,recommendation,confidence)
                           SELECT %s,%s,%s,requirement_id,catalogue_version,%s,%s,%s,%s,%s,%s,%s,%s FROM dpdp_requirements WHERE requirement_id=%s
                           ON CONFLICT (tenant_id,project_id,job_id,requirement_id) DO UPDATE SET catalogue_version=EXCLUDED.catalogue_version,applicability=EXCLUDED.applicability,applicability_reason=EXCLUDED.applicability_reason,evidence_ids=EXCLUDED.evidence_ids,missing_evidence=EXCLUDED.missing_evidence,compliance_status=EXCLUDED.compliance_status,gap_description=EXCLUDED.gap_description,recommendation=EXCLUDED.recommendation,confidence=EXCLUDED.confidence""",
                        (tenant_id, project_id, job_id, applicability, m.get("applicability_reason"), Json(json_list(m.get("evidence_ids"))), Json(json_list(m.get("missing_evidence"))), status, m.get("gap_description"), m.get("recommendation"), safe_confidence(m.get("confidence")), rid),
                    )

                for r in risks:
                    rid = str(r.get("risk_id") or "").strip()
                    desc = str(r.get("risk_description") or "").strip()
                    ftype = r.get("finding_type")
                    if not rid or not desc or ftype not in {"confirmed_gap", "potential_risk", "not_evidenced_requires_verification"}:
                        continue
                    likelihood = r.get("likelihood") if r.get("likelihood") in {"Low", "Medium", "High"} else None
                    impact = r.get("impact") if r.get("impact") in {"Low", "Medium", "High"} else None
                    rating = r.get("risk_rating") if r.get("risk_rating") in {"Low", "Medium", "High", "Critical"} else None
                    cur.execute(
                        """INSERT INTO risk_findings (tenant_id,project_id,job_id,risk_id,related_activity_id,finding_type,risk_description,evidence_ids,likelihood,impact,risk_rating,rationale,recommendation,priority,responsible_function,suggested_remediation_timeline)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (tenant_id,project_id,job_id,risk_id) DO UPDATE SET related_activity_id=EXCLUDED.related_activity_id,finding_type=EXCLUDED.finding_type,risk_description=EXCLUDED.risk_description,evidence_ids=EXCLUDED.evidence_ids,likelihood=EXCLUDED.likelihood,impact=EXCLUDED.impact,risk_rating=EXCLUDED.risk_rating,rationale=EXCLUDED.rationale,recommendation=EXCLUDED.recommendation,priority=EXCLUDED.priority,responsible_function=EXCLUDED.responsible_function,suggested_remediation_timeline=EXCLUDED.suggested_remediation_timeline""",
                        (tenant_id, project_id, job_id, rid, r.get("related_activity_id"), ftype, desc, Json(json_list(r.get("evidence_ids"))), likelihood, impact, rating, r.get("rationale"), r.get("recommendation"), r.get("priority"), r.get("responsible_function"), r.get("suggested_remediation_timeline")),
                    )
                    if r.get("recommendation"):
                        cur.execute(
                            """INSERT INTO recommendations (tenant_id,project_id,job_id,source_ref,recommendation_text,priority,responsible_function,timeline)
                               VALUES (%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (tenant_id,project_id,job_id,source_ref) DO UPDATE SET recommendation_text=EXCLUDED.recommendation_text,priority=EXCLUDED.priority,responsible_function=EXCLUDED.responsible_function,timeline=EXCLUDED.timeline""",
                            (tenant_id, project_id, job_id, rid, str(r.get("recommendation")), r.get("priority"), r.get("responsible_function"), r.get("suggested_remediation_timeline")),
                        )

                if isinstance(approval, dict) and approval:
                    decision = approval.get("decision") or approval.get("review_decision")
                    if decision in {"approved", "changes_requested", "rejected"}:
                        cur.execute(
                            """INSERT INTO approvals (tenant_id,project_id,job_id,reviewer_id,decision,target_stage,revision_number,comments)
                               VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                            (tenant_id, project_id, job_id, str(approval.get("reviewer_id") or "human_reviewer")[:128], decision, approval.get("target_stage"), max(0, min(10, int(approval.get("revision_number") or 0))), str(approval.get("comments") or approval.get("feedback") or "")),
                        )

                report_types = {
                    "json": "consolidated_json",
                    "csv": "processing_activities_csv",
                    "xlsx": "compliance_workbook_xlsx",
                    "pdf": "executive_report_pdf",
                    "docx": "detailed_report_docx",
                }
                for fpath in generated_files:
                    path = Path(fpath)
                    fmt = path.suffix.lstrip(".").lower()
                    digest = hashlib.sha256(path.read_bytes()).hexdigest()
                    cur.execute(
                        """INSERT INTO generated_reports (tenant_id,project_id,job_id,report_type,file_format,file_path,file_size_bytes,sha256)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (tenant_id,project_id,job_id,report_type,file_format) DO UPDATE SET file_path=EXCLUDED.file_path,file_size_bytes=EXCLUDED.file_size_bytes,sha256=EXCLUDED.sha256,created_at=now()""",
                        (tenant_id, project_id, job_id, report_types.get(fmt, "report_" + fmt), fmt, str(path), path.stat().st_size, digest),
                    )
                cur.execute(
                    "UPDATE job_state SET status='approved',updated_at=now(),completed_at=now() WHERE job_id=%s AND tenant_id=%s AND project_id=%s",
                    (job_id, tenant_id, project_id),
                )
                cur.execute(
                    "INSERT INTO audit_events (tenant_id,project_id,job_id,event_type,payload) VALUES (%s,%s,%s,%s,%s)",
                    (tenant_id, project_id, job_id, "reports_generated", Json({"file_count": len(generated_files), "review_status": payload.get("review_status")})),
                )
    except HTTPException:
        raise
    except Exception as db_err:
        raise HTTPException(
            status_code=503,
            detail=f"Files were generated, but database persistence failed: {str(db_err)[:350]}",
        ) from db_err

    attachments_base64 = {
        "docx": {
            "filename": docx_path.name,
            "mime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "base64": base64.b64encode(docx_path.read_bytes()).decode("ascii"),
        },
        "pdf": {
            "filename": pdf_path.name,
            "mime": "application/pdf",
            "base64": base64.b64encode(pdf_path.read_bytes()).decode("ascii"),
        },
        "xlsx": {
            "filename": xlsx_path.name,
            "mime": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "base64": base64.b64encode(xlsx_path.read_bytes()).decode("ascii"),
        },
        "csv": {
            "filename": csv_path.name,
            "mime": "text/csv",
            "base64": base64.b64encode(csv_path.read_bytes()).decode("ascii"),
        },
    }

    return {
        "status": "exported",
        "job_id": job_id,
        "tenant_id": tenant_id,
        "project_id": project_id,
        "files": generated_files,
        "attachments_base64": attachments_base64,
        "sql_queries": build_job_sql_queries(tenant_id, project_id, job_id),
        "persisted": {
            "processing_activities": len(activities),
            "personal_data_principals": len(principals),
            "personal_data_items": len(personal_items),
            "entities": len(entities),
            "data_flows": len(flows),
            "compliance_mappings": len(mappings),
            "risk_findings": len(risks),
        },
    }


@app.post("/api/v1/jobs/{job_id}/error", dependencies=[Depends(verify_api_key)])
async def report_job_error(job_id: str, payload: Dict[str, Any]):
    job_id = safe_path_segment(job_id, "job_id")
    tenant_id = payload.get("tenant_id")
    project_id = payload.get("project_id")
    document_id = payload.get("document_id")
    failed_stage = str(payload.get("failed_stage") or payload.get("stage") or "n8n_workflow")[:128]
    error_code = str(payload.get("error_code") or "WORKFLOW_ERROR")[:64]
    error_message = str(payload.get("error_message") or payload.get("message") or "Unspecified workflow error")[:5000]
    recoverable = parse_bool(payload.get("is_recoverable"), default=False)
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT tenant_id,project_id FROM job_state WHERE job_id=%s", (job_id,))
                row = cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Job not found; cannot associate error with a job.")
                db_tenant, db_project = row
                if (tenant_id and tenant_id != db_tenant) or (project_id and project_id != db_project):
                    raise HTTPException(status_code=409, detail="Job does not belong to supplied tenant/project.")
                cur.execute(
                    "INSERT INTO document_processing_errors (tenant_id,project_id,job_id,document_id,failed_stage,error_code,error_message,is_recoverable) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                    (db_tenant, db_project, job_id, document_id, failed_stage, error_code, error_message, recoverable),
                )
                cur.execute(
                    "INSERT INTO audit_events (tenant_id,project_id,job_id,event_type,payload) VALUES (%s,%s,%s,%s,%s)",
                    (db_tenant, db_project, job_id, "workflow_error", Json({"failed_stage": failed_stage, "error_code": error_code, "error_message": error_message, "is_recoverable": recoverable})),
                )
                cur.execute(
                    "UPDATE job_state SET status='failed',updated_at=now() WHERE job_id=%s AND tenant_id=%s AND project_id=%s AND status NOT IN ('approved','terminated_rejected')",
                    (job_id, db_tenant, db_project),
                )
        return {"status": "logged", "job_id": job_id, "received_at": datetime.now(timezone.utc).isoformat()}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Could not persist workflow error: {str(exc)[:250]}") from exc