#!/usr/bin/env python3
"""
MCP Bridge for AmphionAgent Command Deck.
Lightweight stdio-based MCP server that wraps the Command Deck REST API
as native Claude Code tools. No external dependencies (stdlib only).

Tool inputSchema fields carry full JSON Schema constraints (enum, maxLength,
pattern, description) so agents never need to call GET /api/conventions
before performing writes.
"""

import json
import sys
import urllib.request
import urllib.error
import os


def resolve_port():
    """Read port from .amphion/config.json. Errors if config is missing."""
    config_path = os.path.join(os.getcwd(), ".amphion", "config.json")
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
            port = str(config.get("port", "")).strip()
            if not port:
                raise ValueError("No port configured in .amphion/config.json")
            return port
    except FileNotFoundError:
        sys.stderr.write("No .amphion/config.json found. Run /amphion to set up.\n")
        raise
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        sys.stderr.write(f"Invalid .amphion/config.json: {e}\n")
        raise


def resolve_version():
    """Read mcdVersion from .amphion/config.json for serverInfo."""
    config_path = os.path.join(os.getcwd(), ".amphion", "config.json")
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
            return str(config.get("mcdVersion", "0.0.0")).strip()
    except Exception:
        return "0.0.0"


def api_request(method, path, body=None):
    """Make HTTP request to Command Deck API."""
    port = resolve_port()
    url = f"http://127.0.0.1:{port}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={"Content-Type": "application/json"} if data else {},
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_text = ""
        try:
            body_text = e.read().decode("utf-8", errors="replace")
        except Exception:
            pass
        return {"ok": False, "error": f"HTTP {e.code}: {body_text or e.reason}"}
    except urllib.error.URLError as e:
        return {"ok": False, "error": f"Command Deck unreachable: {e}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


# -- Tool definitions --
# Schemas embed enum, maxLength, pattern, and description constraints
# so agents can write payloads without calling GET /api/conventions first.

TOOLS = [
    # ── Read operations ──────────────────────────────────────────────
    {
        "name": "board_state",
        "description": "Get the current board state including milestones, cards, lists, and charts.",
        "inputSchema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "board_find",
        "description": (
            "Search the board for cards, milestones, or items. "
            "Returns a lean index with IDs, titles, and list membership. "
            "Supports filtering by query, milestoneId, or list."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "q": {
                    "type": "string",
                    "description": "Free-text search query",
                },
                "milestoneId": {
                    "type": "string",
                    "description": "Filter cards by milestone ID (e.g. ms_abc123)",
                },
                "list": {
                    "type": "string",
                    "enum": ["backlog", "active", "blocked", "qa", "done"],
                    "description": "Filter cards by list key",
                },
            },
        },
    },
    {
        "name": "board_conventions",
        "description": (
            "Get the payload schema and conventions for a specific entity type. "
            "Useful for discovering fields not covered by the MCP tool schemas, "
            "or for debugging payload validation errors."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "intent": {
                    "type": "string",
                    "enum": [
                        "chart",
                        "milestone",
                        "card",
                        "findings",
                        "outcomes",
                        "memory",
                        "board-artifact",
                    ],
                    "description": "Entity type to get conventions for",
                },
            },
            "required": ["intent"],
        },
    },
    {
        "name": "server_health",
        "description": "Check Command Deck server health and runtime status.",
        "inputSchema": {
            "type": "object",
            "properties": {},
        },
    },
    # ── Milestone operations ─────────────────────────────────────────
    {
        "name": "create_milestone",
        "description": "Create a new milestone on the board.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "boardId": {
                    "type": "string",
                    "description": "Board ID (from board_find or board_state)",
                },
                "title": {
                    "type": "string",
                    "description": "Milestone title",
                },
                "code": {
                    "type": "string",
                    "pattern": "^[A-Z][A-Z0-9]*-\\d+$",
                    "description": "Milestone code (e.g. AMP-068). Auto-extracted from title prefix if omitted.",
                },
                "metaContract": {
                    "type": "string",
                    "description": "Meta-contract describing milestone scope and boundaries",
                },
                "goals": {
                    "type": "string",
                    "description": "Milestone goals (markdown)",
                },
                "nonGoals": {
                    "type": "string",
                    "description": "Explicit non-goals for scope control",
                },
                "risks": {
                    "type": "string",
                    "description": "Known risks and mitigations",
                },
            },
            "required": ["boardId", "title"],
        },
    },
    {
        "name": "update_milestone",
        "description": "Update an existing milestone (title, code, goals, etc.).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "milestoneId": {
                    "type": "string",
                    "description": "Milestone ID to update",
                },
                "title": {"type": "string"},
                "code": {
                    "type": "string",
                    "pattern": "^[A-Z][A-Z0-9]*-\\d+$",
                },
                "order": {"type": "integer"},
                "metaContract": {"type": "string"},
                "goals": {"type": "string"},
                "nonGoals": {"type": "string"},
                "risks": {"type": "string"},
            },
            "required": ["milestoneId"],
        },
    },
    {
        "name": "delete_milestone",
        "description": "Soft-delete (archive) a milestone. Use restore_milestone to undo.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "milestoneId": {
                    "type": "string",
                    "description": "Milestone ID to archive",
                },
            },
            "required": ["milestoneId"],
        },
    },
    {
        "name": "restore_milestone",
        "description": "Restore a previously archived milestone.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "milestoneId": {
                    "type": "string",
                    "description": "Milestone ID to restore",
                },
            },
            "required": ["milestoneId"],
        },
    },
    # ── Card operations ──────────────────────────────────────────────
    {
        "name": "create_card",
        "description": "Create a contract card on the board, bound to a milestone.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "boardId": {
                    "type": "string",
                    "description": "Board ID (from board_find or board_state)",
                },
                "milestoneId": {
                    "type": "string",
                    "description": "Parent milestone ID",
                },
                "listId": {
                    "type": "string",
                    "description": "Target list ID. Resolve from board_find or board_state.",
                },
                "title": {
                    "type": "string",
                    "description": "Card title",
                },
                "description": {
                    "type": "string",
                    "description": "Card description (markdown). Include AFP (Approved File Perimeter).",
                },
                "acceptance": {
                    "type": "string",
                    "description": "Acceptance criteria (markdown, numbered list)",
                },
                "priority": {
                    "type": "string",
                    "enum": ["P0", "P1", "P2", "P3"],
                    "description": "Priority level",
                },
                "kind": {
                    "type": "string",
                    "enum": ["task", "bug"],
                    "description": "Card type. Defaults to 'task'.",
                },
                "owner": {
                    "type": "string",
                    "description": "Optional owner/assignee",
                },
                "targetDate": {
                    "type": "string",
                    "description": "Optional target date (ISO 8601)",
                },
            },
            "required": ["boardId", "milestoneId", "listId", "title"],
        },
    },
    {
        "name": "update_card",
        "description": "Update a card's fields (title, description, priority, etc.) or move it to a different list.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "cardId": {
                    "type": "string",
                    "description": "Card ID to update",
                },
                "boardId": {
                    "type": "string",
                    "description": "Board ID",
                },
                "listId": {
                    "type": "string",
                    "description": "Move card to this list ID",
                },
                "title": {"type": "string"},
                "description": {"type": "string"},
                "acceptance": {"type": "string"},
                "priority": {
                    "type": "string",
                    "enum": ["P0", "P1", "P2", "P3"],
                },
                "kind": {
                    "type": "string",
                    "enum": ["task", "bug"],
                },
                "milestoneId": {
                    "type": "string",
                    "description": "Re-assign card to a different milestone",
                },
                "owner": {"type": "string"},
                "targetDate": {"type": "string"},
            },
            "required": ["cardId", "boardId"],
        },
    },
    {
        "name": "move_card",
        "description": "Move a card to a different list (shorthand for update_card with only listId).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "cardId": {
                    "type": "string",
                    "description": "Card ID to move",
                },
                "listId": {
                    "type": "string",
                    "description": "Target list ID to move the card to",
                },
            },
            "required": ["cardId", "listId"],
        },
    },
    {
        "name": "delete_card",
        "description": "Permanently delete a card from the board.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "cardId": {
                    "type": "string",
                    "description": "Card ID to delete",
                },
            },
            "required": ["cardId"],
        },
    },
    # ── Chart operations ─────────────────────────────────────────────
    {
        "name": "create_chart",
        "description": "Create a Mermaid chart on the board.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "boardId": {
                    "type": "string",
                    "description": "Board ID",
                },
                "title": {
                    "type": "string",
                    "description": "Chart title",
                },
                "markdown": {
                    "type": "string",
                    "description": (
                        "Mermaid diagram source. First non-comment line must be a valid "
                        "diagram type: flowchart, graph, sequenceDiagram, classDiagram, "
                        "stateDiagram, erDiagram, journey, gantt, pie, gitGraph, mindmap, "
                        "timeline, quadrantChart, requirementDiagram, sankey-beta, xychart-beta. "
                        "Fenced ```mermaid blocks are accepted."
                    ),
                },
                "description": {
                    "type": "string",
                    "description": "Optional chart description",
                },
            },
            "required": ["boardId", "title"],
        },
    },
    {
        "name": "update_chart",
        "description": "Update an existing chart (title, description, or markdown).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "chartId": {
                    "type": "string",
                    "description": "Chart ID to update",
                },
                "title": {"type": "string"},
                "description": {"type": "string"},
                "markdown": {"type": "string"},
            },
            "required": ["chartId"],
        },
    },
    {
        "name": "delete_chart",
        "description": "Delete a chart from the board.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "chartId": {
                    "type": "string",
                    "description": "Chart ID to delete",
                },
            },
            "required": ["chartId"],
        },
    },
    # ── Artifact operations ──────────────────────────────────────────
    {
        "name": "write_findings",
        "description": (
            "Write a findings artifact to a milestone (EVALUATE phase). "
            "Append-only: each call creates a new revision. Never supply id or revision."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "milestoneId": {
                    "type": "string",
                    "description": "Milestone ID to attach findings to",
                },
                "boardId": {
                    "type": "string",
                    "description": "Board ID",
                },
                "title": {
                    "type": "string",
                    "description": "Findings title",
                },
                "summary": {
                    "type": "string",
                    "description": "Executive summary (1-3 sentences)",
                },
                "body": {
                    "type": "string",
                    "description": "Full findings body (markdown)",
                },
            },
            "required": ["milestoneId", "boardId", "title"],
        },
    },
    {
        "name": "write_outcomes",
        "description": (
            "Write an outcomes artifact to a milestone (CLOSEOUT phase). "
            "Append-only: each call creates a new revision. Never supply id or revision."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "milestoneId": {
                    "type": "string",
                    "description": "Milestone ID to attach outcomes to",
                },
                "boardId": {
                    "type": "string",
                    "description": "Board ID",
                },
                "title": {
                    "type": "string",
                    "description": "Outcomes title",
                },
                "summary": {
                    "type": "string",
                    "description": "Executive summary (1-3 sentences)",
                },
                "body": {
                    "type": "string",
                    "description": "Full outcomes body (markdown)",
                },
            },
            "required": ["milestoneId", "boardId", "title"],
        },
    },
    {
        "name": "write_board_artifact",
        "description": (
            "Write or update a board-level artifact (charter, prd, guardrails, playbook). "
            "Append-only revision model."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "boardId": {
                    "type": "string",
                    "description": "Board ID",
                },
                "artifactType": {
                    "type": "string",
                    "enum": ["charter", "prd", "guardrails", "playbook"],
                    "description": "Board artifact type",
                },
                "title": {
                    "type": "string",
                    "description": "Artifact title",
                },
                "summary": {
                    "type": "string",
                    "description": "Optional summary",
                },
                "body": {
                    "type": "string",
                    "description": "Artifact body (markdown)",
                },
            },
            "required": ["boardId", "artifactType", "title"],
        },
    },
    # ── Memory operations ────────────────────────────────────────────
    {
        "name": "write_memory",
        "description": "Write a memory event for context persistence across sessions.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "memoryKey": {
                    "type": "string",
                    "description": "Dot-separated key (e.g. task.42.handoff, phase.intent.evaluate)",
                },
                "value": {
                    "type": "object",
                    "description": "The memory payload (any JSON object)",
                },
                "sourceType": {
                    "type": "string",
                    "enum": ["user", "operator", "verified-system"],
                    "description": "Origin classification. Use 'verified-system' for deterministic agent writes.",
                },
                "eventType": {
                    "type": "string",
                    "enum": ["upsert", "delete", "touch"],
                    "description": "Event type. Defaults to 'upsert'.",
                },
                "bucket": {
                    "type": "string",
                    "enum": ["ct", "dec", "trb", "lrn", "nx", "ref", "misc"],
                    "description": (
                        "Memory bucket: ct=context, dec=decisions, trb=troubleshooting, "
                        "lrn=learnings, nx=next-actions, ref=reference, misc=miscellaneous"
                    ),
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Optional tags for categorization",
                },
                "ttlSeconds": {
                    "type": "integer",
                    "maximum": 31536000,
                    "description": "Time-to-live in seconds (max 1 year = 31536000)",
                },
                "boardId": {
                    "type": "string",
                    "description": "Optional board scope for the memory event",
                },
            },
            "required": ["memoryKey", "value", "sourceType"],
        },
    },
    {
        "name": "query_memory",
        "description": "Query memory events by key, source type, bucket, or tag.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string",
                    "description": "Memory key to query (exact match or prefix)",
                },
                "sourceType": {
                    "type": "string",
                    "enum": ["user", "operator", "verified-system"],
                    "description": "Filter by source type",
                },
                "bucket": {
                    "type": "string",
                    "enum": ["ct", "dec", "trb", "lrn", "nx", "ref", "misc"],
                    "description": "Filter by bucket",
                },
                "tag": {
                    "type": "string",
                    "description": "Filter by tag",
                },
                "limit": {
                    "type": "integer",
                    "description": "Max results to return",
                },
                "boardId": {
                    "type": "string",
                    "description": "Scope query to a specific board",
                },
            },
        },
    },
    {
        "name": "memory_state",
        "description": "Get the full memory state (all active memory entries).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "boardId": {
                    "type": "string",
                    "description": "Scope to a specific board",
                },
                "includeDeleted": {
                    "type": "boolean",
                    "description": "Include soft-deleted entries. Default false.",
                },
                "limit": {
                    "type": "integer",
                    "description": "Max results to return",
                },
            },
        },
    },
]


def handle_tool_call(name, arguments):
    """Route MCP tool call to Command Deck API."""

    # ── Read operations ──────────────────────────────────────────
    if name == "board_state":
        return api_request("GET", "/api/state")

    elif name == "board_find":
        params = []
        for key in ("q", "milestoneId", "list"):
            if key in arguments and arguments[key]:
                params.append(f"{key}={urllib.request.quote(str(arguments[key]))}")
        qs = f"?{'&'.join(params)}" if params else ""
        return api_request("GET", f"/api/find{qs}")

    elif name == "board_conventions":
        intent = arguments.get("intent", "")
        return api_request("GET", f"/api/conventions?intent={intent}")

    elif name == "server_health":
        return api_request("GET", "/api/health")

    # ── Milestone operations ─────────────────────────────────────
    elif name == "create_milestone":
        return api_request("POST", "/api/milestones", arguments)

    elif name == "update_milestone":
        ms_id = arguments.pop("milestoneId", "")
        return api_request("PATCH", f"/api/milestones/{ms_id}", arguments)

    elif name == "delete_milestone":
        ms_id = arguments.get("milestoneId", "")
        return api_request("DELETE", f"/api/milestones/{ms_id}")

    elif name == "restore_milestone":
        ms_id = arguments.get("milestoneId", "")
        return api_request("POST", f"/api/milestones/{ms_id}/restore")

    # ── Card operations ──────────────────────────────────────────
    elif name == "create_card":
        return api_request("POST", "/api/cards", arguments)

    elif name == "update_card":
        card_id = arguments.pop("cardId", "")
        return api_request("PATCH", f"/api/cards/{card_id}", arguments)

    elif name == "move_card":
        card_id = arguments.get("cardId", "")
        list_id = arguments.get("listId", "")
        return api_request("POST", f"/api/cards/{card_id}/move", {"listId": list_id})

    elif name == "delete_card":
        card_id = arguments.get("cardId", "")
        return api_request("DELETE", f"/api/cards/{card_id}")

    # ── Chart operations ─────────────────────────────────────────
    elif name == "create_chart":
        return api_request("POST", "/api/charts", arguments)

    elif name == "update_chart":
        chart_id = arguments.pop("chartId", "")
        return api_request("PATCH", f"/api/charts/{chart_id}", arguments)

    elif name == "delete_chart":
        chart_id = arguments.get("chartId", "")
        return api_request("DELETE", f"/api/charts/{chart_id}")

    # ── Artifact operations ──────────────────────────────────────
    elif name == "write_findings":
        ms_id = arguments.pop("milestoneId", "")
        arguments["artifactType"] = "findings"
        return api_request("POST", f"/api/milestones/{ms_id}/artifacts", arguments)

    elif name == "write_outcomes":
        ms_id = arguments.pop("milestoneId", "")
        arguments["artifactType"] = "outcomes"
        return api_request("POST", f"/api/milestones/{ms_id}/artifacts", arguments)

    elif name == "write_board_artifact":
        board_id = arguments.pop("boardId", "")
        return api_request("POST", f"/api/boards/{board_id}/artifacts", arguments)

    # ── Memory operations ────────────────────────────────────────
    elif name == "write_memory":
        if "eventType" not in arguments:
            arguments["eventType"] = "upsert"
        return api_request("POST", "/api/memory/events", arguments)

    elif name == "query_memory":
        params = []
        for key in ("key", "sourceType", "bucket", "tag", "limit", "boardId"):
            if key in arguments and arguments[key] is not None:
                val = arguments[key]
                if key == "key":
                    # Legacy compat: 'key' maps to 'q' query param
                    params.append(f"q={urllib.request.quote(str(val))}")
                else:
                    params.append(f"{key}={urllib.request.quote(str(val))}")
        qs = f"?{'&'.join(params)}" if params else ""
        return api_request("GET", f"/api/memory/query{qs}")

    elif name == "memory_state":
        params = []
        for key in ("boardId", "includeDeleted", "limit"):
            if key in arguments and arguments[key] is not None:
                params.append(f"{key}={urllib.request.quote(str(arguments[key]))}")
        qs = f"?{'&'.join(params)}" if params else ""
        return api_request("GET", f"/api/memory/state{qs}")

    return {"ok": False, "error": f"Unknown tool: {name}"}


# -- MCP Protocol (JSON-RPC over stdio) --


def send_response(id, result):
    """Send JSON-RPC response."""
    msg = {"jsonrpc": "2.0", "id": id, "result": result}
    content = json.dumps(msg)
    sys.stdout.write(f"Content-Length: {len(content)}\r\n\r\n{content}")
    sys.stdout.flush()


def send_error(id, code, message):
    """Send JSON-RPC error."""
    msg = {"jsonrpc": "2.0", "id": id, "error": {"code": code, "message": message}}
    content = json.dumps(msg)
    sys.stdout.write(f"Content-Length: {len(content)}\r\n\r\n{content}")
    sys.stdout.flush()


def read_message():
    """Read a JSON-RPC message from stdin (Content-Length framed)."""
    headers = {}
    while True:
        line = sys.stdin.readline()
        if not line or line.strip() == "":
            break
        if ":" in line:
            key, value = line.split(":", 1)
            headers[key.strip()] = value.strip()

    content_length = int(headers.get("Content-Length", 0))
    if content_length == 0:
        return None

    body = sys.stdin.read(content_length)
    return json.loads(body)


def main():
    """Main MCP server loop."""
    version = resolve_version()
    while True:
        try:
            msg = read_message()
            if msg is None:
                break

            method = msg.get("method", "")
            id = msg.get("id")
            params = msg.get("params", {})

            if method == "initialize":
                send_response(id, {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {
                        "name": "amphion-command-deck",
                        "version": version,
                    },
                })

            elif method == "notifications/initialized":
                pass  # No response needed for notifications

            elif method == "tools/list":
                send_response(id, {"tools": TOOLS})

            elif method == "tools/call":
                tool_name = params.get("name", "")
                arguments = params.get("arguments", {})
                result = handle_tool_call(tool_name, arguments)
                # Truncate large state responses to avoid context bloat
                result_text = json.dumps(result, indent=2)
                if len(result_text) > 30000:
                    result_text = result_text[:30000] + "\n... (truncated)"
                send_response(id, {
                    "content": [{"type": "text", "text": result_text}],
                })

            elif method == "ping":
                send_response(id, {})

            else:
                if id is not None:
                    send_error(id, -32601, f"Method not found: {method}")

        except Exception as e:
            sys.stderr.write(f"MCP Bridge error: {e}\n")
            if 'id' in dir() and id is not None:
                send_error(id, -32603, str(e))


if __name__ == "__main__":
    main()
