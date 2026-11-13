#!/usr/bin/env python3
"""
DPDP Workflow Explorer - Public Security & Leak Prevention Audit
Verifies that no private credentials, personal emails, Docker internal URLs,
or backend access tokens are present in the frontend source or distribution build.
"""

import os
import re
import json
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DATA_DIR = os.path.join(BASE_DIR, "src", "data")
DIST_DIR = os.path.join(BASE_DIR, "dist")

FORBIDDEN_PATTERNS = [
    (r"host\.docker\.internal", "Docker internal hostname leak"),
    (r"dpdp-backend:8000", "Internal docker backend hostname leak"),
    (r"pranjalproject0705", "Personal email/username identifier leak"),
    (r"WMTiQJpJNzGAV7LT", "n8n HeaderAuth credential ID leak"),
    (r"8n1CpszSfSS5uhJo", "n8n Postgres credential ID leak"),
    (r"USaG34vab49W2RfL", "n8n Gemini API credential ID leak"),
    (r"tVFq5AbAUamYMiyS", "n8n OpenRouter credential ID leak"),
    (r"kksMGO92APAO5rbG", "n8n Gmail credential ID leak"),
    (r"DATABASE_URL\s*=\s*['\"][^'\"]+['\"]", "Live database connection string leak"),
    (r"sk-[a-zA-Z0-9]{20,}", "Raw OpenAI/OpenRouter API key leak"),
    (r"AIza[0-9A-Za-z-_]{35}", "Raw Google Gemini API key leak"),
]

def audit_directory(dir_path):
    issues = []
    if not os.path.exists(dir_path):
        return issues
    
    for root, _, files in os.walk(dir_path):
        for f in files:
            if f.endswith((".json", ".js", ".ts", ".tsx", ".html", ".css")):
                file_path = os.path.join(root, f)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read()
                    
                    for pattern, desc in FORBIDDEN_PATTERNS:
                        matches = re.findall(pattern, content, re.IGNORECASE)
                        if matches:
                            rel_path = os.path.relpath(file_path, BASE_DIR)
                            issues.append(f"[{desc}] found {len(matches)} occurrences in {rel_path}: {matches[:2]}")
                except Exception as e:
                    issues.append(f"Error reading {file_path}: {e}")
    return issues

def audit_workflow_integrity():
    issues = []
    wf_path = os.path.join(SRC_DATA_DIR, "workflow.json")
    if not os.path.exists(wf_path):
        return ["workflow.json does not exist in src/data/"]
    
    with open(wf_path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    
    nodes = data.get("nodes", [])
    conns = data.get("connections", {})
    
    if len(nodes) != 106:
        issues.append(f"Node count mismatch: expected 106, got {len(nodes)}")
    
    # Check for credentials sanitization
    for n in nodes:
        creds = n.get("credentials", {})
        for ctype, cval in creds.items():
            if not cval.get("sanitized"):
                issues.append(f"Node '{n.get('name')}' credential '{ctype}' is not marked sanitized!")
            if "id" in cval and len(cval["id"]) == 16:
                issues.append(f"Node '{n.get('name')}' contains unsanitized credential ID: {cval['id']}")
                
    return issues

def main():
    print("=" * 60)
    print("RUNNING SECURITY & LEAK PREVENTION AUDIT FOR DPDP EXPLORER")
    print("=" * 60)
    
    src_issues = audit_directory(os.path.join(BASE_DIR, "src"))
    dist_issues = audit_directory(DIST_DIR)
    integrity_issues = audit_workflow_integrity()
    
    all_issues = src_issues + dist_issues + integrity_issues
    
    print(f"Files scanned in 'src/' and 'dist/'.")
    print(f"Total security alerts: {len(all_issues)}")
    
    if all_issues:
        print("\nFAILURES DETECTED:")
        for iss in all_issues:
            print(f"  [X] {iss}")
        print("\nVERDICT: FAIL")
        sys.exit(1)
    else:
        print("\n[OK] Zero credentials or private identifiers found in source or dist build.")
        print("[OK] All 106 workflow nodes verified and sanitized.")
        print("[OK] Zero Docker internal URLs or personal email addresses present.")
        print("\nVERDICT: PASS")
        sys.exit(0)

if __name__ == "__main__":
    main()

