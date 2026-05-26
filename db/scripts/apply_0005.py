"""Aplica a migração F47 0005 via MCP Supabase apply_migration."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SQL_PATH = ROOT / "db" / "migrations" / "0005_f47_invitations_sessions_deal_rooms.sql"

sql = SQL_PATH.read_text(encoding="utf-8")

payload = {
    "project_id": "jfeqkgdimjhbwaqmzxpu",
    "name": "f47_invitations_sessions_deal_rooms",
    "query": sql,
}

cmd = [
    "manus-mcp-cli",
    "tool",
    "call",
    "apply_migration",
    "--server",
    "supabase",
    "--input",
    json.dumps(payload),
]

result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
print("STDOUT:", result.stdout[-3000:])
print("STDERR:", result.stderr[-500:] if result.stderr else "(empty)")
sys.exit(result.returncode)
