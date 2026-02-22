#!/usr/bin/env python3
"""Initialize Launch Command Deck state for a new project scaffold."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import uuid
from pathlib import Path
from typing import Any, Dict, List


def now_iso() -> str:
    return dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def board_status_lists() -> List[Dict[str, Any]]:
    statuses = [
        ("backlog", "Backlog"),
        ("active", "In Progress"),
        ("blocked", "Blocked"),
        ("qa", "QA / Review"),
        ("done", "Done"),
    ]
    items: List[Dict[str, Any]] = []
    for order, (key, title) in enumerate(statuses):
        items.append(
            {
                "id": new_id("list"),
                "key": key,
                "title": title,
                "order": order,
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            }
        )
    return items


def build_state(
    project_name: str,
    codename: str,
    initial_version: str,
    milestone_title: str,
    seed_template: str,
    project_type: str = "standard",
) -> Dict[str, Any]:
    board_id = new_id("board")
    milestone_id = new_id("ms")
    lists = board_status_lists()
    list_id_by_key = {item["key"]: item["id"] for item in lists}

    board = {
        "id": board_id,
        "name": f"{project_name} Launch Command Deck",
        "codename": codename.upper()[:3],
        "nextIssueNumber": 1,
        "description": f"Command deck for {project_name} ({codename}) using MCD protocol.",
        "projectType": project_type,
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
        "lists": lists,
        "milestones": [
            {
                "id": milestone_id,
                "code": initial_version.lower().replace(".", "").replace("-", ""),
                "title": milestone_title,
                "order": 0,
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            }
        ],
        "cards": [],
    }

    if seed_template == "scaffold":
        seed_cards = [
            (
                "active",
                f"{initial_version} - Scaffold Baseline",
                "P0",
                "Validate guardrails, canonical milestone, and startup flow for the new project.",
                "- MCD directories exist.\\n- GUARDRAILS.md is created.\\n- Launch Command Deck is reachable.",
            ),
            (
                "backlog",
                f"{initial_version} - Project Charter + PRD Baseline",
                "P0",
                "Capture charter, strategy baseline, and high-level PRD before implementation contracts.",
                "- Charter and PRD drafts exist in strategy docs.\\n- Scope boundaries are explicit.",
            ),
            (
                "backlog",
                f"{initial_version} - First Contract + Execute Slice",
                "P1",
                "Write first build contract and execute one deterministic slice end-to-end.",
                "- Contract is approved.\\n- Implementation validates against acceptance criteria.",
            ),
        ]
        for order, (list_key, title, priority, description, acceptance) in enumerate(seed_cards):
            issue_num = board["nextIssueNumber"]
            board["cards"].append(
                {
                    "id": new_id("card"),
                    "issueNumber": f"{board['codename']}-{issue_num:03d}",
                    "title": title,
                    "description": description,
                    "acceptance": acceptance,
                    "milestoneId": milestone_id,
                    "listId": list_id_by_key[list_key],
                    "priority": priority,
                    "owner": "",
                    "targetDate": "",
                    "order": order if list_key == "backlog" else 0,
                    "createdAt": now_iso(),
                    "updatedAt": now_iso(),
                }
            )
            board["nextIssueNumber"] += 1

    state = {
        "version": 1,
        "updatedAt": now_iso(),
        "activeBoardId": board_id,
        "boards": [board],
    }
    return state


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Initialize Launch Command Deck for a project")
    parser.add_argument("--project-name", required=True, help="Project name")
    parser.add_argument("--codename", default="Genesis", help="Project codename")
    parser.add_argument("--initial-version", default="v0.01a", help="Initial project version")
    parser.add_argument("--milestone-title", default="Version 0a Pre-Release", help="Initial milestone title")
    parser.add_argument(
        "--seed-template",
        choices=["empty", "scaffold"],
        default="scaffold",
        help="Seed with starter cards or keep empty board",
    )
    parser.add_argument(
        "--type",
        default="standard",
        help="Project type (e.g., standard, content_pipeline, software_dev)",
    )
    parser.add_argument(
        "--state-file",
        default="",
        help="Override state path (defaults to deck_root/data/state.json)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    script_dir = Path(__file__).resolve().parent
    deck_root = script_dir.parent
    state_path = Path(args.state_file).expanduser().resolve() if args.state_file else (deck_root / "data" / "state.json")
    state_path.parent.mkdir(parents=True, exist_ok=True)

    state = build_state(
        project_name=args.project_name.strip(),
        codename=args.codename.strip(),
        initial_version=args.initial_version.strip(),
        milestone_title=args.milestone_title.strip(),
        seed_template=args.seed_template,
        project_type=args.type.strip(),
    )
    state_path.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    print(f"Initialized Launch Command Deck state at {state_path}")


if __name__ == "__main__":
    main()
