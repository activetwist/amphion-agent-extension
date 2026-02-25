#!/usr/bin/env python3
"""Launch Command Deck Kanban micro-service.

Local, SQLite-backed Kanban system with a minimal JSON API and static UI.
No external dependencies.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import mimetypes
import subprocess
import threading
import uuid
import sqlite3
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import unquote, urlparse

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
DATA_DIR = BASE_DIR / "data"
DOCS_DIR = BASE_DIR.parent.parent / "referenceDocs"
DB_FILE = DATA_DIR / "amphion.db"


def now_iso() -> str:
    return dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def sort_by_order(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return sorted(items, key=lambda x: (x.get("order", 0), x.get("title", "")))


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

class SQLiteStore:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self._lock = threading.RLock()

    def get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = dict_factory
        return conn

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            with self.get_conn() as conn:
                c = conn.cursor()
                
                c.execute("SELECT key, value FROM meta")
                meta = {r["key"]: r["value"] for r in c.fetchall()}
                
                c.execute("SELECT * FROM boards")
                boards = c.fetchall()
                
                c.execute("SELECT * FROM lists")
                lists = c.fetchall()
                
                c.execute("SELECT * FROM milestones")
                milestones = c.fetchall()
                
                c.execute("SELECT * FROM cards")
                cards = c.fetchall()
                
                c.execute("SELECT * FROM charts")
                charts = c.fetchall()

            lists_by_board = {}
            for l in lists:
                l["order"] = l.pop("listOrder", 0)
                lists_by_board.setdefault(l["boardId"], []).append(l)

            ms_by_board = {}
            for m in milestones:
                m["order"] = m.pop("msOrder", 0)
                ms_by_board.setdefault(m["boardId"], []).append(m)

            cards_by_board = {}
            for cd in cards:
                cd["order"] = cd.pop("cardOrder", 0)
                cards_by_board.setdefault(cd["boardId"], []).append(cd)

            for b in boards:
                b["lists"] = sorted(lists_by_board.get(b["id"], []), key=lambda x: x["order"])
                b["milestones"] = sorted(ms_by_board.get(b["id"], []), key=lambda x: x["order"])
                b["cards"] = sorted(cards_by_board.get(b["id"], []), key=lambda x: x["order"])

            return {
                "version": meta.get("version", 1),
                "updatedAt": now_iso(),
                "activeBoardId": meta.get("activeBoardId", ""),
                "charts": charts,
                "boards": boards
            }


STORE = SQLiteStore(DB_FILE)


class KanbanHandler(BaseHTTPRequestHandler):
    server_version = "LaunchCommandDeck/0.2"

    def log_message(self, format, *args):
        # Silence state polling to reduce terminal noise
        if len(args) > 0 and isinstance(args[0], str) and "/api/state/version" in args[0]:
            return
        super().log_message(format, *args)

    def _send_json(self, payload: Dict[str, Any], status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_error(self, message: str, status: int = HTTPStatus.BAD_REQUEST) -> None:
        self._send_json({"ok": False, "error": message}, status=status)

    def _read_json(self) -> Dict[str, Any]:
        try:
            raw_length = self.headers.get("Content-Length", "0")
            content_length = int(raw_length)
        except ValueError:
            raise ValueError("Invalid content length")
        if content_length == 0:
            return {}
        raw_body = self.rfile.read(content_length)
        try:
            body = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError(f"Malformed JSON: {exc}")
        if not isinstance(body, dict):
            raise ValueError("JSON body must be an object")
        return body

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Allow", "GET,POST,PATCH,DELETE,OPTIONS")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path

        if route == "/api/health":
            self._send_json({"ok": True, "time": now_iso()})
            return

        if route == "/api/state":
            self._send_json({"ok": True, "state": STORE.snapshot()})
            return

        if route == "/api/state/version":
            with STORE._lock:
                version = DB_FILE.stat().st_mtime if DB_FILE.exists() else 0
            self._send_json({"ok": True, "version": version})
            return

        if route.startswith("/api/docs/"):
            doc_id = route.split("/")[-1]
            try:
                content = ""
                if doc_id == "charter":
                    path = DOCS_DIR / "01_Strategy" / "PROJECT_CHARTER.md"
                    files = sorted((DOCS_DIR / "01_Strategy").glob("*PROJECT_CHARTER.md"), reverse=True)
                    if files: path = files[0]
                elif doc_id == "prd":
                    path = DOCS_DIR / "01_Strategy" / "HIGH_LEVEL_PRD.md"
                    files = sorted((DOCS_DIR / "01_Strategy").glob("*HIGH_LEVEL_PRD.md"), reverse=True)
                    if files: path = files[0]
                elif doc_id == "guardrails":
                    path = DOCS_DIR / "00_Governance" / "GUARDRAILS.md"
                elif doc_id == "playbook":
                    path = DOCS_DIR / "00_Governance" / "MCD_PLAYBOOK.md"
                elif doc_id == "contract":
                    active_dir = DOCS_DIR / "03_Contracts" / "active"
                    archive_dir = DOCS_DIR / "03_Contracts" / "archive"
                    
                    active_files = sorted(active_dir.glob("*.md"), reverse=True)
                    archive_files = sorted(archive_dir.glob("*.md"), reverse=True)
                    
                    if active_files:
                        path = active_files[0]
                        header = "> **[STATUS: ACTIVE CONTRACT]**\n\n"
                    elif archive_files:
                        path = archive_files[0]
                        header = "> **[STATUS: ARCHIVED]**\n\n"
                    else:
                        raise FileNotFoundError("No active or archived contracts found.")
                else:
                    self._send_error("Unknown doc")
                    return

                if path.exists():
                    content = path.read_text(encoding="utf-8")
                    if doc_id == "contract":
                        content = header + content
                else:
                    content = "*Not generated or not found.*"
                self._send_json({"ok": True, "content": content})
            except Exception as e:
                self._send_json({"ok": True, "content": f"*Error loading doc: {e}*"})
            return

        if route == "/api/git/log":
            try:
                result = subprocess.run(
                    ["git", "log", "-n", "8", "--oneline"],
                    cwd=BASE_DIR.parent.parent,
                    capture_output=True,
                    text=True,
                    check=False
                )
                self._send_json({"ok": True, "log": result.stdout.strip() if result.returncode == 0 else "Git log not available"})
            except Exception:
                self._send_json({"ok": True, "log": "Git not initialized or available"})
            return

        if route.startswith("/api/"):
            self._send_error("Route not found", status=HTTPStatus.NOT_FOUND)
            return

        self._serve_static(route)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path
        try:
            body = self._read_json()
        except ValueError as exc:
            self._send_error(str(exc))
            return

        with STORE._lock:
            conn = STORE.get_conn()
            c = conn.cursor()
            now = now_iso()

            try:
                if route == "/api/boards":
                    name = str(body.get("name") or "").strip()
                    if not name:
                        self._send_error("Board name is required")
                        return
                    description = str(body.get("description") or "")
                    codename = str(body.get("codename") or "PRJ").strip().upper()[:3]
                    
                    board_id = new_id("board")
                    c.execute("INSERT INTO boards (id, name, codename, nextIssueNumber, description, projectType, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (board_id, name, codename, 1, description, "standard", now, now))
                    
                    # add default lists
                    statuses = [("backlog", "Backlog"), ("active", "In Progress"), ("blocked", "Blocked"), ("qa", "QA / Review"), ("done", "Done")]
                    for i, (k, v) in enumerate(statuses):
                        c.execute("INSERT INTO lists (id, boardId, key, title, listOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
                            (new_id("list"), board_id, k, v, i, now, now))

                    c.execute("UPDATE meta SET value = ? WHERE key = 'activeBoardId'", (board_id,))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route.endswith("/activate") and route.startswith("/api/boards/"):
                    board_id = route.split("/")[3]
                    c.execute("UPDATE meta SET value = ? WHERE key = 'activeBoardId'", (board_id,))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route == "/api/lists":
                    board_id = str(body.get("boardId") or "")
                    title = str(body.get("title") or "").strip()
                    if not board_id or not title:
                        self._send_error("boardId and title are required")
                        return
                    c.execute("SELECT MAX(listOrder) as m FROM lists WHERE boardId=?", (board_id,))
                    res = c.fetchone()
                    max_ord = (res["m"] + 1) if res and res["m"] is not None else 0
                    c.execute("INSERT INTO lists (id, boardId, key, title, listOrder, createdAt, updatedAt) VALUES (?, ?, '', ?, ?, ?, ?)",
                        (new_id("list"), board_id, title, max_ord, now, now))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route == "/api/milestones":
                    board_id = str(body.get("boardId") or "")
                    title = str(body.get("title") or "").strip()
                    if not board_id or not title:
                        self._send_error("boardId and title are required")
                        return
                    c.execute("SELECT MAX(msOrder) as m FROM milestones WHERE boardId=?", (board_id,))
                    res = c.fetchone()
                    max_ord = (res["m"] + 1) if res and res["m"] is not None else 0
                    c.execute("INSERT INTO milestones (id, boardId, code, title, msOrder, createdAt, updatedAt) VALUES (?, ?, '', ?, ?, ?, ?)",
                        (new_id("ms"), board_id, title, max_ord, now, now))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route == "/api/cards":
                    required = ["boardId", "listId", "title"]
                    if any(not str(body.get(key) or "").strip() for key in required):
                        self._send_error("boardId, listId, and title are required")
                        return
                    board_id = body["boardId"]
                    list_id = body["listId"]
                    
                    c.execute("SELECT codename, nextIssueNumber FROM boards WHERE id=?", (board_id,))
                    b_row = c.fetchone()
                    if not b_row:
                        self._send_error("Board not found", status=HTTPStatus.NOT_FOUND)
                        return
                    
                    issue_number = f"{b_row['codename']}-{b_row['nextIssueNumber']:03d}"
                    c.execute("UPDATE boards SET nextIssueNumber = nextIssueNumber + 1 WHERE id=?", (board_id,))
                    
                    c.execute("SELECT MAX(cardOrder) as m FROM cards WHERE listId=?", (list_id,))
                    res = c.fetchone()
                    max_ord = (res["m"] + 1) if res and res["m"] is not None else 0

                    c.execute("INSERT INTO cards (id, boardId, issueNumber, title, description, acceptance, milestoneId, listId, priority, owner, targetDate, cardOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        (new_id("card"), board_id, issue_number, body["title"], body.get("description", ""), body.get("acceptance", ""), body.get("milestoneId", ""), list_id, body.get("priority", "P2"), body.get("owner", ""), body.get("targetDate", ""), max_ord, now, now))
                    
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route.endswith("/move") and route.startswith("/api/cards/"):
                    card_id = route.split("/")[3]
                    list_id = str(body.get("listId") or "")
                    if not list_id:
                        self._send_error("listId is required")
                        return
                    c.execute("SELECT MAX(cardOrder) as m FROM cards WHERE listId=?", (list_id,))
                    res = c.fetchone()
                    max_ord = (res["m"] + 1) if res and res["m"] is not None else 0
                    c.execute("UPDATE cards SET listId=?, cardOrder=?, updatedAt=? WHERE id=?", (list_id, max_ord, now, card_id))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route == "/api/boards/import" or route.endswith("/clone"):
                    self._send_error("Import/Clone not fully migrated to DB, skipped for simplicity", status=HTTPStatus.NOT_IMPLEMENTED)
                    return

                if route == "/api/reload":
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                self._send_error("Route not found", status=HTTPStatus.NOT_FOUND)
            finally:
                conn.close()

    def do_PATCH(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path
        try:
            body = self._read_json()
        except ValueError as exc:
            self._send_error(str(exc))
            return

        with STORE._lock:
            conn = STORE.get_conn()
            c = conn.cursor()
            now = now_iso()
            try:
                if route.startswith("/api/boards/"):
                    board_id = route.split("/")[3]
                    if "name" in body:
                        c.execute("UPDATE boards SET name=?, updatedAt=? WHERE id=?", (body["name"], now, board_id))
                    if "description" in body:
                        c.execute("UPDATE boards SET description=?, updatedAt=? WHERE id=?", (body["description"], now, board_id))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route.startswith("/api/lists/"):
                    list_id = route.split("/")[3]
                    if "title" in body:
                        c.execute("UPDATE lists SET title=?, updatedAt=? WHERE id=?", (body["title"], now, list_id))
                    if "order" in body:
                        c.execute("UPDATE lists SET listOrder=?, updatedAt=? WHERE id=?", (body["order"], now, list_id))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route.startswith("/api/milestones/"):
                    milestone_id = route.split("/")[3]
                    if "title" in body:
                        c.execute("UPDATE milestones SET title=?, updatedAt=? WHERE id=?", (body["title"], now, milestone_id))
                    if "order" in body:
                        c.execute("UPDATE milestones SET msOrder=?, updatedAt=? WHERE id=?", (body["order"], now, milestone_id))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route.startswith("/api/cards/"):
                    card_id = route.split("/")[3]
                    fields = ["title", "description", "acceptance", "owner", "targetDate", "priority", "milestoneId", "listId"]
                    for f in fields:
                        if f in body:
                            db_field = "cardOrder" if f == "order" else f
                            c.execute(f"UPDATE cards SET {db_field}=?, updatedAt=? WHERE id=?", (body[f], now, card_id))
                    if "listId" in body:
                        list_id = body["listId"]
                        c.execute("SELECT MAX(cardOrder) as m FROM cards WHERE listId=?", (list_id,))
                        res = c.fetchone()
                        max_ord = (res["m"] + 1) if res and res["m"] is not None else 0
                        c.execute("UPDATE cards SET cardOrder=? WHERE id=?", (max_ord, card_id))
                        
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return
                self._send_error("Route not found", status=HTTPStatus.NOT_FOUND)
            finally:
                conn.close()

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path
        with STORE._lock:
            conn = STORE.get_conn()
            c = conn.cursor()
            try:
                if route.startswith("/api/boards/"):
                    board_id = route.split("/")[3]
                    c.execute("DELETE FROM boards WHERE id=?", (board_id,))
                    c.execute("DELETE FROM cards WHERE boardId=?", (board_id,))
                    c.execute("DELETE FROM lists WHERE boardId=?", (board_id,))
                    c.execute("DELETE FROM milestones WHERE boardId=?", (board_id,))
                    c.execute("DELETE FROM charts WHERE boardId=?", (board_id,))
                    # fallback active board
                    c.execute("SELECT id FROM boards LIMIT 1")
                    res = c.fetchone()
                    if res:
                        c.execute("UPDATE meta SET value=? WHERE key='activeBoardId'", (res["id"],))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route.startswith("/api/lists/"):
                    list_id = route.split("/")[3]
                    c.execute("SELECT boardId FROM lists WHERE id=?", (list_id,))
                    res = c.fetchone()
                    if res:
                        board_id = res["boardId"]
                        c.execute("SELECT id FROM lists WHERE boardId=? AND id!=? LIMIT 1", (board_id, list_id))
                        fallback = c.fetchone()
                        if fallback:
                            c.execute("UPDATE cards SET listId=? WHERE listId=?", (fallback["id"], list_id))
                        c.execute("DELETE FROM lists WHERE id=?", (list_id,))
                        conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route.startswith("/api/milestones/"):
                    milestone_id = route.split("/")[3]
                    c.execute("UPDATE cards SET milestoneId='' WHERE milestoneId=?", (milestone_id,))
                    c.execute("DELETE FROM milestones WHERE id=?", (milestone_id,))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route.startswith("/api/cards/"):
                    card_id = route.split("/")[3]
                    c.execute("DELETE FROM cards WHERE id=?", (card_id,))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                if route.startswith("/api/charts/"):
                    chart_id = route.split("/")[3]
                    c.execute("DELETE FROM charts WHERE id=?", (chart_id,))
                    conn.commit()
                    self._send_json({"ok": True, "state": STORE.snapshot()})
                    return

                self._send_error("Route not found", status=HTTPStatus.NOT_FOUND)
            finally:
                conn.close()

    def _serve_static(self, route: str) -> None:
        sanitized = route.lstrip("/")
        if not sanitized:
            sanitized = "index.html"
        fs_path = (PUBLIC_DIR / unquote(sanitized)).resolve()
        in_scope = str(fs_path).startswith(str(PUBLIC_DIR.resolve()))

        if not in_scope or not fs_path.exists() or fs_path.is_dir():
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        content_type, _ = mimetypes.guess_type(fs_path.name)
        content_type = content_type or "application/octet-stream"
        payload = fs_path.read_bytes()

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the local Kanban micro-service")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host")
    parser.add_argument("--port", type=int, default=8765, help="Bind port")
    return parser.parse_args()

def main() -> None:
    args = parse_args()
    server = ThreadingHTTPServer((args.host, args.port), KanbanHandler)
    print(f"Kanban (SQLite) running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
