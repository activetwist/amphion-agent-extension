#!/usr/bin/env python3
"""
MCP Bridge for AmphionAgent Command Deck.
Lightweight stdio-based MCP server that wraps the Command Deck REST API
as native Claude Code tools. No external dependencies (stdlib only).
"""

import json
import sys
import urllib.request
import urllib.error
import os

DEFAULT_PORT = "8765"


def resolve_port():
    """Read port from .amphion/config.json, fallback to default."""
    config_path = os.path.join(os.getcwd(), ".amphion", "config.json")
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
            return str(config.get("port", DEFAULT_PORT))
    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        return DEFAULT_PORT


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
    except urllib.error.URLError as e:
        return {"ok": False, "error": f"Command Deck unreachable: {e}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


# -- Tool definitions --

TOOLS = [
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
        "description": "Search the board for cards, milestones, or items. Supports filtering by query, milestoneId, or list.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "q": {"type": "string", "description": "Search query text"},
                "milestoneId": {"type": "string", "description": "Filter by milestone ID"},
                "list": {"type": "string", "description": "Filter by list key (backlog, active, blocked, qa, done)"},
            },
        },
    },
    {
        "name": "board_conventions",
        "description": "Get the payload schema and conventions for a specific entity type before writing.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "intent": {
                    "type": "string",
                    "description": "Entity type: chart, milestone, card, findings, outcomes, memory, board-artifact",
                },
            },
            "required": ["intent"],
        },
    },
    {
        "name": "create_milestone",
        "description": "Create a new milestone on the board.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "boardId": {"type": "string"},
                "title": {"type": "string"},
                "code": {"type": "string", "description": "Milestone code (e.g., AMP-066)"},
                "metaContract": {"type": "string"},
                "goals": {"type": "string"},
                "nonGoals": {"type": "string"},
                "risks": {"type": "string"},
            },
            "required": ["boardId", "title"],
        },
    },
    {
        "name": "create_card",
        "description": "Create a contract card on the board, bound to a milestone.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "boardId": {"type": "string"},
                "milestoneId": {"type": "string"},
                "listId": {"type": "string"},
                "title": {"type": "string"},
                "description": {"type": "string"},
                "acceptance": {"type": "string"},
                "priority": {"type": "string", "description": "P0, P1, P2, or P3"},
                "kind": {"type": "string", "description": "task or bug"},
            },
            "required": ["boardId", "milestoneId", "listId", "title"],
        },
    },
    {
        "name": "update_card",
        "description": "Update a card (e.g., move to a different list, change status).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "cardId": {"type": "string"},
                "boardId": {"type": "string"},
                "listId": {"type": "string", "description": "Move card to this list"},
                "title": {"type": "string"},
                "description": {"type": "string"},
                "acceptance": {"type": "string"},
                "priority": {"type": "string"},
            },
            "required": ["cardId", "boardId"],
        },
    },
    {
        "name": "write_findings",
        "description": "Write a findings artifact to a milestone (used during EVALUATE phase).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "milestoneId": {"type": "string"},
                "boardId": {"type": "string"},
                "title": {"type": "string"},
                "summary": {"type": "string"},
                "body": {"type": "string"},
            },
            "required": ["milestoneId", "boardId", "title"],
        },
    },
    {
        "name": "write_outcomes",
        "description": "Write an outcomes artifact to a milestone (used during CLOSEOUT phase).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "milestoneId": {"type": "string"},
                "boardId": {"type": "string"},
                "title": {"type": "string"},
                "summary": {"type": "string"},
                "body": {"type": "string"},
            },
            "required": ["milestoneId", "boardId", "title"],
        },
    },
    {
        "name": "write_memory",
        "description": "Write a memory event for context persistence across sessions.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "memoryKey": {"type": "string"},
                "value": {"type": "object", "description": "The memory payload"},
                "sourceType": {"type": "string", "description": "user, operator, or verified-system"},
                "eventType": {"type": "string", "description": "upsert (default)"},
                "bucket": {"type": "string", "description": "Memory bucket (ref, dec, etc.)"},
                "tags": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["memoryKey", "value", "sourceType"],
        },
    },
    {
        "name": "query_memory",
        "description": "Query a memory event by key to load prior context.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "key": {"type": "string", "description": "Memory key to query"},
            },
            "required": ["key"],
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
]


def handle_tool_call(name, arguments):
    """Route MCP tool call to Command Deck API."""
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

    elif name == "create_milestone":
        return api_request("POST", "/api/milestones", arguments)

    elif name == "create_card":
        return api_request("POST", "/api/cards", arguments)

    elif name == "update_card":
        card_id = arguments.pop("cardId", "")
        return api_request("PATCH", f"/api/cards/{card_id}", arguments)

    elif name == "write_findings":
        ms_id = arguments.pop("milestoneId", "")
        arguments["artifactType"] = "findings"
        return api_request("POST", f"/api/milestones/{ms_id}/artifacts", arguments)

    elif name == "write_outcomes":
        ms_id = arguments.pop("milestoneId", "")
        arguments["artifactType"] = "outcomes"
        return api_request("POST", f"/api/milestones/{ms_id}/artifacts", arguments)

    elif name == "write_memory":
        if "eventType" not in arguments:
            arguments["eventType"] = "upsert"
        return api_request("POST", "/api/memory/events", arguments)

    elif name == "query_memory":
        key = urllib.request.quote(arguments.get("key", ""))
        return api_request("GET", f"/api/memory/query?key={key}")

    elif name == "server_health":
        return api_request("GET", "/api/health")

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
                        "version": "1.54.0",
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
