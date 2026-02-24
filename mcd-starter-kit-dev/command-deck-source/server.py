#!/usr/bin/env python3
"""Launch Command Deck Kanban micro-service.

Local, file-backed Kanban system with a minimal JSON API and static UI.
No external dependencies.
"""

from __future__ import annotations

import argparse
import copy
import datetime as dt
import json
import mimetypes
import subprocess
import threading
import uuid
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import unquote, urlparse

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
DATA_DIR = BASE_DIR / "data"
DOCS_DIR = BASE_DIR.parent.parent / "referenceDocs"
STATE_FILE = DATA_DIR / "state.json"


def now_iso() -> str:
    return dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def sort_by_order(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return sorted(items, key=lambda x: (x.get("order", 0), x.get("title", "")))


def timestamp_compact() -> str:
    return dt.datetime.now().strftime("%Y%m%d%H%M")


def _write_json_atomic(path: Path, payload: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    with tmp_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
    tmp_path.replace(path)


def board_status_lists() -> List[Dict[str, Any]]:
    statuses = [
        ("backlog", "Backlog"),
        ("active", "In Progress"),
        ("blocked", "Blocked"),
        ("qa", "QA / Review"),
        ("done", "Done"),
    ]
    lists: List[Dict[str, Any]] = []
    for idx, (key, title) in enumerate(statuses):
        lists.append(
            {
                "id": new_id("list"),
                "key": key,
                "title": title,
                "order": idx,
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            }
        )
    return lists


def empty_board(name: str, description: str = "", codename: str = "PRJ") -> Dict[str, Any]:
    return {
        "id": new_id("board"),
        "name": name,
        "codename": codename.upper()[:3],
        "nextIssueNumber": 1,
        "description": description,
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
        "lists": board_status_lists(),
        "milestones": [],
        "cards": [],
    }


def seeded_launch_board(name: Optional[str] = None) -> Dict[str, Any]:
    board = empty_board(
        name or "Launch Command Deck",
        "Single source of truth for evaluation, contracts, execution, and release readiness.",
    )

    milestone_specs = [
        ("ops", "Program Ops"),
        ("m1", "M1 Evaluate + Scope"),
        ("m2", "M2 Contract + Plan"),
        ("m3", "M3 Build + Verify"),
        ("m4", "M4 Release Readiness"),
    ]

    milestone_id_by_code: Dict[str, str] = {}
    for order, (code, title) in enumerate(milestone_specs):
        milestone_id = new_id("ms")
        milestone_id_by_code[code] = milestone_id
        board["milestones"].append(
            {
                "id": milestone_id,
                "code": code,
                "title": title,
                "order": order,
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            }
        )

    list_id_by_key = {item["key"]: item["id"] for item in board["lists"]}
    backlog_id = list_id_by_key["backlog"]
    active_id = list_id_by_key["active"]

    task_specs = [
        ("ops", "Establish guardrails and workflow baseline", "P0", "Confirm Evaluate -> Contract -> Execute loop and closeout rules."),
        ("m1", "Document project charter and scope boundaries", "P0", "Capture target users, value, and hard non-goals."),
        ("m1", "Create first evaluation card set", "P1", "Break scope into milestone cards with dependencies and acceptance criteria."),
        ("m2", "Write initial build contracts", "P0", "Draft contract files for first implementation slice."),
        ("m3", "Execute first contract and verify acceptance", "P0", "Implement changes and validate against contract criteria."),
        ("m4", "Prepare release checklist and QA matrix", "P1", "Define go/no-go gates, metadata requirements, and test matrix."),
    ]

    codename = "AM"
    board["codename"] = codename
    board["nextIssueNumber"] = len(task_specs) + 1

    for index, (ms_code, title, priority, description) in enumerate(task_specs):
        list_id = active_id if index == 0 else backlog_id
        issue_number = index + 1
        board["cards"].append(
            {
                "id": new_id("card"),
                "issueNumber": f"{codename}-{issue_number:03d}",
                "title": title,
                "description": description,
                "acceptance": "",
                "milestoneId": milestone_id_by_code[ms_code],
                "listId": list_id,
                "priority": priority,
                "owner": "",
                "targetDate": "",
                "order": index,
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            }
        )

    board["updatedAt"] = now_iso()
    return board


@dataclass
class Lookup:
    board: Dict[str, Any]
    item: Dict[str, Any]


class StateStore:
    def __init__(self, path: Path):
        self.path = path
        self._lock = threading.Lock()
        self._last_mtime = None
        self._state = self._load_or_create()

    def _load_or_create(self) -> Dict[str, Any]:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        if self.path.exists():
            self._last_mtime = self.path.stat().st_mtime
            with self.path.open("r", encoding="utf-8") as handle:
                state = json.load(handle)
            normalize_state_orders(state)
            self._write(state)
            return state
        board = seeded_launch_board()
        state = {
            "version": 1,
            "updatedAt": now_iso(),
            "activeBoardId": board["id"],
            "boards": [board],
        }
        self._write(state)
        return state

    def _write(self, payload: Dict[str, Any]) -> None:
        tmp_path = self.path.with_suffix(".tmp")
        with tmp_path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
            handle.write("\n")
        tmp_path.replace(self.path)
        self._last_mtime = self.path.stat().st_mtime

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            try:
                if self.path.exists():
                    current_mtime = self.path.stat().st_mtime
                    if self._last_mtime is None or current_mtime > self._last_mtime:
                        self._state = self._load_or_create()
            except Exception:
                pass
            return copy.deepcopy(self._state)

    def mutate(self, fn):
        with self._lock:
            fn(self._state)
            normalize_state_orders(self._state)
            self._state["updatedAt"] = now_iso()
            self._write(self._state)
            return copy.deepcopy(self._state)

    def reload(self) -> Dict[str, Any]:
        with self._lock:
            self._state = self._load_or_create()
            return copy.deepcopy(self._state)


def find_board(state: Dict[str, Any], board_id: str) -> Dict[str, Any]:
    for board in state["boards"]:
        if board["id"] == board_id:
            return board
    raise KeyError(f"board not found: {board_id}")


def find_list(state: Dict[str, Any], list_id: str) -> Lookup:
    for board in state["boards"]:
        for item in board["lists"]:
            if item["id"] == list_id:
                return Lookup(board=board, item=item)
    raise KeyError(f"list not found: {list_id}")


def find_milestone(state: Dict[str, Any], milestone_id: str) -> Lookup:
    for board in state["boards"]:
        for item in board["milestones"]:
            if item["id"] == milestone_id:
                return Lookup(board=board, item=item)
    raise KeyError(f"milestone not found: {milestone_id}")


def find_card(state: Dict[str, Any], card_id: str) -> Lookup:
    for board in state["boards"]:
        for item in board["cards"]:
            if item["id"] == card_id:
                return Lookup(board=board, item=item)
    raise KeyError(f"card not found: {card_id}")


def max_order(cards: List[Dict[str, Any]], list_id: str) -> int:
    subset = [card.get("order", 0) for card in cards if card.get("listId") == list_id]
    if not subset:
        return 0
    return max(subset) + 1


def normalize_board_orders(board: Dict[str, Any]) -> None:
    board_lists = sort_by_order(board.get("lists", []))
    board["lists"] = board_lists
    for order, item in enumerate(board_lists):
        item["order"] = order

    board_milestones = sort_by_order(board.get("milestones", []))
    board["milestones"] = board_milestones
    for order, item in enumerate(board_milestones):
        item["order"] = order

    cards = list(board.get("cards", []))
    if not board_lists:
        board["cards"] = cards
        return

    valid_list_ids = {item["id"] for item in board_lists}
    fallback_list_id = board_lists[0]["id"]
    for card in cards:
        if card.get("listId") not in valid_list_ids:
            card["listId"] = fallback_list_id

    for list_item in board_lists:
        list_id = list_item["id"]
        list_cards = sort_by_order([card for card in cards if card.get("listId") == list_id])
        for order, card in enumerate(list_cards):
            card["order"] = order

    board["cards"] = cards


def normalize_state_orders(state: Dict[str, Any]) -> None:
    for board in state.get("boards", []):
        normalize_board_orders(board)


STORE = StateStore(STATE_FILE)


def sanitize_imported_board(payload: Dict[str, Any]) -> Dict[str, Any]:
    title = str(payload.get("name") or payload.get("title") or "Imported Board").strip()
    board = empty_board(title)
    board["description"] = str(payload.get("description") or "")

    incoming_lists = payload.get("lists") or []
    incoming_milestones = payload.get("milestones") or []
    incoming_cards = payload.get("cards") or []

    if incoming_lists:
        board["lists"] = []
        list_id_map: Dict[str, str] = {}
        for order, item in enumerate(sort_by_order(incoming_lists)):
            old_id = str(item.get("id") or new_id("legacy_list"))
            new_list_id = new_id("list")
            list_id_map[old_id] = new_list_id
            board["lists"].append(
                {
                    "id": new_list_id,
                    "key": str(item.get("key") or "").strip().lower(),
                    "title": str(item.get("title") or "List").strip(),
                    "order": order,
                    "createdAt": now_iso(),
                    "updatedAt": now_iso(),
                }
            )
    else:
        list_id_map = {item["id"]: item["id"] for item in board["lists"]}

    milestone_id_map: Dict[str, str] = {}
    for order, item in enumerate(sort_by_order(incoming_milestones)):
        old_id = str(item.get("id") or new_id("legacy_ms"))
        new_ms_id = new_id("ms")
        milestone_id_map[old_id] = new_ms_id
        board["milestones"].append(
            {
                "id": new_ms_id,
                "code": str(item.get("code") or "").strip().lower(),
                "title": str(item.get("title") or "Milestone").strip(),
                "order": order,
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            }
        )

    if not incoming_lists:
        first_list_id = board["lists"][0]["id"]
        list_id_map = {"": first_list_id}

    fallback_list = board["lists"][0]["id"]
    for order, item in enumerate(incoming_cards):
        source_list_id = str(item.get("listId") or "")
        source_ms_id = str(item.get("milestoneId") or "")
        board["cards"].append(
            {
                "id": new_id("card"),
                "title": str(item.get("title") or "Untitled Card").strip(),
                "description": str(item.get("description") or ""),
                "acceptance": str(item.get("acceptance") or ""),
                "milestoneId": milestone_id_map.get(source_ms_id, ""),
                "listId": list_id_map.get(source_list_id, fallback_list),
                "priority": str(item.get("priority") or "P2"),
                "owner": str(item.get("owner") or ""),
                "targetDate": str(item.get("targetDate") or ""),
                "order": order,
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            }
        )

    board["updatedAt"] = now_iso()
    return board


class KanbanHandler(BaseHTTPRequestHandler):
    server_version = "LaunchCommandDeck/0.1"

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

    def _read_raw(self) -> bytes:
        try:
            raw_length = self.headers.get("Content-Length", "0")
            content_length = int(raw_length)
        except ValueError:
            raise ValueError("Invalid content length")
        if content_length <= 0:
            return b""
        return self.rfile.read(content_length)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Allow", "GET,POST,PATCH,DELETE,OPTIONS")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
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
                version = STORE._last_mtime
            self._send_json({"ok": True, "version": version})
            return

        if route.startswith("/api/docs/"):
            doc_id = route.split("/")[-1]
            try:
                content = ""
                if doc_id == "charter":
                    path = DOCS_DIR / "01_Strategy" / "PROJECT_CHARTER.md"
                    # Read the most recent file matching *PROJECT_CHARTER.md
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

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        route = parsed.path

        try:
            body = self._read_json()
        except ValueError as exc:
            self._send_error(str(exc))
            return

        try:
            if route == "/api/boards":
                name = str(body.get("name") or "").strip()
                if not name:
                    self._send_error("Board name is required")
                    return
                description = str(body.get("description") or "")
                codename = str(body.get("codename") or "PRJ").strip().upper()[:3]
                seed_template = bool(body.get("seedTemplate"))

                def mutate(state):
                    if seed_template:
                        board = seeded_launch_board(name=name)
                        board["description"] = description or board["description"]
                    else:
                        board = empty_board(name, description, codename=codename)
                    state["boards"].append(board)
                    state["activeBoardId"] = board["id"]

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route == "/api/boards/import":
                board_payload = body.get("board")
                if not isinstance(board_payload, dict):
                    self._send_error("Import requires a board object")
                    return

                def mutate(state):
                    board = sanitize_imported_board(board_payload)
                    state["boards"].append(board)
                    state["activeBoardId"] = board["id"]

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route.endswith("/activate") and route.startswith("/api/boards/"):
                board_id = route.split("/")[3]

                def mutate(state):
                    find_board(state, board_id)
                    state["activeBoardId"] = board_id

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route.endswith("/clone") and route.startswith("/api/boards/"):
                board_id = route.split("/")[3]

                def mutate(state):
                    source = find_board(state, board_id)
                    clone = sanitize_imported_board(source)
                    clone["name"] = f"{source['name']} (Clone)"
                    state["boards"].append(clone)
                    state["activeBoardId"] = clone["id"]

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route == "/api/lists":
                board_id = str(body.get("boardId") or "")
                title = str(body.get("title") or "").strip()
                if not board_id or not title:
                    self._send_error("boardId and title are required")
                    return

                def mutate(state):
                    board = find_board(state, board_id)
                    board["lists"].append(
                        {
                            "id": new_id("list"),
                            "key": "",
                            "title": title,
                            "order": len(board["lists"]),
                            "createdAt": now_iso(),
                            "updatedAt": now_iso(),
                        }
                    )
                    board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route == "/api/milestones":
                board_id = str(body.get("boardId") or "")
                title = str(body.get("title") or "").strip()
                if not board_id or not title:
                    self._send_error("boardId and title are required")
                    return

                def mutate(state):
                    board = find_board(state, board_id)
                    board["milestones"].append(
                        {
                            "id": new_id("ms"),
                            "code": "",
                            "title": title,
                            "order": len(board["milestones"]),
                            "createdAt": now_iso(),
                            "updatedAt": now_iso(),
                        }
                    )
                    board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route == "/api/cards":
                required = ["boardId", "listId", "title"]
                if any(not str(body.get(key) or "").strip() for key in required):
                    self._send_error("boardId, listId, and title are required")
                    return

                def mutate(state):
                    board = find_board(state, str(body["boardId"]))
                    list_id = str(body["listId"])
                    if not any(item["id"] == list_id for item in board["lists"]):
                        raise KeyError("Target list does not exist on board")
                    milestone_id = str(body.get("milestoneId") or "")
                    if milestone_id and not any(ms["id"] == milestone_id for ms in board["milestones"]):
                        raise KeyError("Milestone does not exist on board")

                    codename = board.get("codename", "PRJ")
                    next_num = board.get("nextIssueNumber", 1)
                    issue_number = f"{codename}-{next_num:03d}"
                    board["nextIssueNumber"] = next_num + 1

                    board["cards"].append(
                        {
                            "id": new_id("card"),
                            "issueNumber": issue_number,
                            "title": str(body["title"]).strip(),
                            "description": str(body.get("description") or ""),
                            "acceptance": str(body.get("acceptance") or ""),
                            "milestoneId": milestone_id,
                            "listId": list_id,
                            "priority": str(body.get("priority") or "P2"),
                            "owner": str(body.get("owner") or ""),
                            "targetDate": str(body.get("targetDate") or ""),
                            "order": max_order(board["cards"], list_id),
                            "createdAt": now_iso(),
                            "updatedAt": now_iso(),
                        }
                    )
                    board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route.endswith("/move") and route.startswith("/api/cards/"):
                card_id = route.split("/")[3]
                list_id = str(body.get("listId") or "")
                if not list_id:
                    self._send_error("listId is required")
                    return

                def mutate(state):
                    lookup = find_card(state, card_id)
                    board = lookup.board
                    if not any(item["id"] == list_id for item in board["lists"]):
                        raise KeyError("Target list not found")
                    lookup.item["listId"] = list_id
                    lookup.item["order"] = max_order(board["cards"], list_id)
                    lookup.item["updatedAt"] = now_iso()
                    board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route == "/api/reload":
                state = STORE.reload()
                self._send_json({"ok": True, "state": state})
                return

            self._send_error("Route not found", status=HTTPStatus.NOT_FOUND)
        except KeyError as exc:
            self._send_error(str(exc), status=HTTPStatus.NOT_FOUND)

    def do_PATCH(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        route = parsed.path
        try:
            body = self._read_json()
        except ValueError as exc:
            self._send_error(str(exc))
            return

        try:
            if route.startswith("/api/boards/"):
                board_id = route.split("/")[3]

                def mutate(state):
                    board = find_board(state, board_id)
                    if "name" in body:
                        value = str(body["name"]).strip()
                        if value:
                            board["name"] = value
                    if "description" in body:
                        board["description"] = str(body.get("description") or "")
                    board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route.startswith("/api/lists/"):
                list_id = route.split("/")[3]

                def mutate(state):
                    lookup = find_list(state, list_id)
                    if "title" in body:
                        title = str(body["title"]).strip()
                        if title:
                            lookup.item["title"] = title
                    if "order" in body:
                        lookup.item["order"] = int(body["order"])
                    lookup.item["updatedAt"] = now_iso()
                    lookup.board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route.startswith("/api/milestones/"):
                milestone_id = route.split("/")[3]

                def mutate(state):
                    lookup = find_milestone(state, milestone_id)
                    if "title" in body:
                        title = str(body["title"]).strip()
                        if title:
                            lookup.item["title"] = title
                    if "order" in body:
                        lookup.item["order"] = int(body["order"])
                    lookup.item["updatedAt"] = now_iso()
                    lookup.board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route.startswith("/api/cards/"):
                card_id = route.split("/")[3]

                def mutate(state):
                    lookup = find_card(state, card_id)
                    board = lookup.board
                    card = lookup.item
                    for field in ["title", "description", "acceptance", "owner", "targetDate", "priority"]:
                        if field in body:
                            card[field] = str(body.get(field) or "")

                    if "milestoneId" in body:
                        milestone_id = str(body.get("milestoneId") or "")
                        if milestone_id and not any(ms["id"] == milestone_id for ms in board["milestones"]):
                            raise KeyError("Milestone not found")
                        card["milestoneId"] = milestone_id

                    if "listId" in body:
                        list_id = str(body.get("listId") or "")
                        if not any(item["id"] == list_id for item in board["lists"]):
                            raise KeyError("List not found")
                        card["listId"] = list_id
                        card["order"] = max_order(board["cards"], list_id)

                    card["updatedAt"] = now_iso()
                    board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            self._send_error("Route not found", status=HTTPStatus.NOT_FOUND)
        except KeyError as exc:
            self._send_error(str(exc), status=HTTPStatus.NOT_FOUND)

    def do_DELETE(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        route = parsed.path
        try:
            if route.startswith("/api/boards/"):
                board_id = route.split("/")[3]

                def mutate(state):
                    state["boards"] = [board for board in state["boards"] if board["id"] != board_id]
                    if not state["boards"]:
                        board = seeded_launch_board()
                        state["boards"] = [board]
                        state["activeBoardId"] = board["id"]
                    elif state.get("activeBoardId") == board_id:
                        state["activeBoardId"] = state["boards"][0]["id"]

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route.startswith("/api/lists/"):
                list_id = route.split("/")[3]

                def mutate(state):
                    lookup = find_list(state, list_id)
                    board = lookup.board
                    if len(board["lists"]) == 1:
                        raise KeyError("Cannot delete the last list")
                    fallback_list = sort_by_order([item for item in board["lists"] if item["id"] != list_id])[0]["id"]
                    for card in board["cards"]:
                        if card["listId"] == list_id:
                            card["listId"] = fallback_list
                            card["order"] = max_order(board["cards"], fallback_list)
                    board["lists"] = [item for item in board["lists"] if item["id"] != list_id]
                    for order, item in enumerate(sort_by_order(board["lists"])):
                        item["order"] = order
                    board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route.startswith("/api/milestones/"):
                milestone_id = route.split("/")[3]

                def mutate(state):
                    lookup = find_milestone(state, milestone_id)
                    board = lookup.board
                    board["milestones"] = [item for item in board["milestones"] if item["id"] != milestone_id]
                    for card in board["cards"]:
                        if card.get("milestoneId") == milestone_id:
                            card["milestoneId"] = ""
                    for order, item in enumerate(sort_by_order(board["milestones"])):
                        item["order"] = order
                    board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            if route.startswith("/api/cards/"):
                card_id = route.split("/")[3]

                def mutate(state):
                    lookup = find_card(state, card_id)
                    board = lookup.board
                    board["cards"] = [item for item in board["cards"] if item["id"] != card_id]
                    board["updatedAt"] = now_iso()

                state = STORE.mutate(mutate)
                self._send_json({"ok": True, "state": state})
                return

            self._send_error("Route not found", status=HTTPStatus.NOT_FOUND)
        except KeyError as exc:
            self._send_error(str(exc), status=HTTPStatus.NOT_FOUND)

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
    print(f"Kanban running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
