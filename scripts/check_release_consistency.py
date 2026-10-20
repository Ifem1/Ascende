"""Verify release manifest source identity against the canonical Git bytes."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "MANIFEST.json"
CONTRACT = ROOT / "contracts" / "ascende.py"
EXPECTED_ADDRESS = "0x5bF12b1033A5827edBB27cdc92C7FAb0C4d1304F"
EXPECTED_GITHUB_COMMIT = "8fd697b07485f46011cac331ec05a9aa958c0007"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fail(message: str) -> None:
    print(f"release consistency check failed: {message}", file=sys.stderr)
    raise SystemExit(1)


manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
source = manifest.get("source", {})
deployment = manifest.get("deployment", {})
equivalence = manifest.get("source_equivalence", {})

raw_contract = CONTRACT.read_bytes()
if b"\r" in raw_contract.replace(b"\r\n", b""):
    fail("contracts/ascende.py contains a standalone CR byte")
lf = raw_contract.replace(b"\r\n", b"\n")
lf_hash = sha256(lf)
crlf = lf.replace(b"\n", b"\r\n")
crlf_hash = sha256(crlf)

if source.get("sha256") != lf_hash:
    fail(f"manifest source.sha256 is stale: expected {lf_hash}")
if source.get("bytes") != len(lf) or source.get("lf_newlines") != lf.count(b"\n"):
    fail("manifest canonical source byte length or LF newline count is stale")
schema_bytes = (ROOT / source.get("schema", "")).read_bytes().replace(b"\r\n", b"\n")
if source.get("schema_sha256") != sha256(schema_bytes):
    fail("manifest schema SHA-256 is stale")
if deployment.get("source_file_sha256") != crlf_hash:
    fail(f"manifest deployment.source_file_sha256 is stale: expected {crlf_hash}")
if deployment.get("source_file_bytes") != len(crlf):
    fail("manifest deployed CRLF source byte length is stale")
for key, expected in {
    "canonical_github_source_sha256": lf_hash,
    "canonical_github_source_bytes": len(lf),
    "canonical_lf_newlines": lf.count(b"\n"),
    "deployed_source_sha256": crlf_hash,
    "deployed_source_bytes": len(crlf),
    "rpc_returned_sha256": crlf_hash,
    "rpc_returned_bytes": len(crlf),
}.items():
    if equivalence.get(key) != expected:
        fail(f"manifest source_equivalence.{key} is stale or contradictory")
if equivalence.get("result") != "byte_identical_after_lf_to_crlf_conversion":
    fail("manifest does not record confirmed LF-to-CRLF byte equivalence")
if equivalence.get("rpc_method") != "gen_getContractCode":
    fail("manifest does not name the source readback RPC method")
if equivalence.get("rpc_address", "").lower() != EXPECTED_ADDRESS.lower():
    fail("manifest source readback address is not the corrective deployment")
if equivalence.get("rpc_response_equals_converted_github_source") is not True or equivalence.get("reverse_normalization_equals_github_source") is not True:
    fail("manifest does not confirm both source normalization comparisons")
if deployment.get("contract_address", "").lower() != EXPECTED_ADDRESS.lower():
    fail("manifest deployment address is not the corrective deployment")
if manifest.get("audited_github_commit") != EXPECTED_GITHUB_COMMIT:
    fail("manifest audited main commit is stale")

status = manifest.get("status", "")
if not status.startswith("verified_") or re.search(r"pending|outstanding|obsolete", status, re.I):
    fail(f"manifest status is contradictory or still pending: {status!r}")
if re.search(r"pending|outstanding", manifest.get("release_note", ""), re.I):
    fail("manifest release note contains contradictory pending/outstanding evidence status")

for item in manifest.get("items", []):
    path = ROOT / item["path"]
    if not path.is_file():
        fail(f"manifest item is missing: {item['path']}")
    content = path.read_bytes()
    if path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf"}:
        content = content.replace(b"\r\n", b"\n")
    if item.get("bytes") != len(content) or item.get("sha256") != sha256(content):
        fail(f"manifest item is stale: {item['path']}")

print(
    "release consistency verified: "
    f"LF {len(lf)} bytes / {lf_hash}; "
    f"deployed CRLF {len(crlf)} bytes / {crlf_hash}; "
    f"RPC byte parity recorded for {EXPECTED_ADDRESS}"
)
