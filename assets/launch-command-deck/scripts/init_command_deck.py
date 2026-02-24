#!/usr/bin/env python3
"""Initialize Launch Command Deck state (SQLite) for a new project scaffold."""

from __future__ import annotations

import argparse
import datetime as dt
import sqlite3
import uuid
from pathlib import Path
from typing import Any, Dict, List, Tuple


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
    items = []
    for order, (key, title) in enumerate(statuses):
        items.append(
            {
                "id": new_id("list"),
                "key": key,
                "title": title,
                "order": order,
            }
        )
    return items


def init_db(db_path: Path, project_name: str, codename: str, initial_version: str, milestone_title: str, seed_template: str, project_type: str = "standard") -> None:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Create Tables
    c.executescript('''
        CREATE TABLE IF NOT EXISTS meta (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS boards (
            id TEXT PRIMARY KEY,
            name TEXT,
            codename TEXT,
            nextIssueNumber INTEGER,
            description TEXT,
            projectType TEXT,
            createdAt TEXT,
            updatedAt TEXT
        );

        CREATE TABLE IF NOT EXISTS lists (
            id TEXT PRIMARY KEY,
            boardId TEXT,
            key TEXT,
            title TEXT,
            listOrder INTEGER,
            createdAt TEXT,
            updatedAt TEXT
        );

        CREATE TABLE IF NOT EXISTS milestones (
            id TEXT PRIMARY KEY,
            boardId TEXT,
            code TEXT,
            title TEXT,
            msOrder INTEGER,
            createdAt TEXT,
            updatedAt TEXT
        );

        CREATE TABLE IF NOT EXISTS cards (
            id TEXT PRIMARY KEY,
            boardId TEXT,
            issueNumber TEXT,
            title TEXT,
            description TEXT,
            acceptance TEXT,
            milestoneId TEXT,
            listId TEXT,
            priority TEXT,
            owner TEXT,
            targetDate TEXT,
            cardOrder INTEGER,
            createdAt TEXT,
            updatedAt TEXT
        );
        
        CREATE TABLE IF NOT EXISTS charts (
            id TEXT PRIMARY KEY,
            boardId TEXT,
            title TEXT,
            description TEXT,
            markdown TEXT,
            createdAt TEXT,
            updatedAt TEXT
        );
    ''')
    conn.commit()

    # 2. Setup Meta & Board
    board_id = new_id("board")
    c.execute("INSERT INTO meta (key, value) VALUES (?, ?)", ("activeBoardId", board_id))
    c.execute("INSERT INTO meta (key, value) VALUES (?, ?)", ("version", "1"))

    now = now_iso()
    c.execute('''
        INSERT INTO boards (id, name, codename, nextIssueNumber, description, projectType, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (board_id, f"{project_name} Launch Command Deck", codename.upper()[:3], 1, f"Command deck for {project_name} ({codename}) using MCD protocol.", project_type, now, now))

    # 3. Setup Lists
    lists = board_status_lists()
    list_id_by_key = {}
    for lst in lists:
        list_id_by_key[lst["key"]] = lst["id"]
        c.execute('''
            INSERT INTO lists (id, boardId, key, title, listOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (lst["id"], board_id, lst["key"], lst["title"], lst["order"], now, now))

    # 4. Setup Milestone
    milestone_id = new_id("ms")
    c.execute('''
        INSERT INTO milestones (id, boardId, code, title, msOrder, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (milestone_id, board_id, initial_version.lower().replace(".", "").replace("-", ""), milestone_title, 0, now, now))

    # 5. Setup Charts (Sample IA)
    c.execute('''
        INSERT INTO charts (id, boardId, title, description, markdown, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', ("sample_ia_home_about_blog_contact", board_id, "Sample IA · Marketing Site", "Simple website structure example", "```mermaid\nflowchart TD\n  Home --> About\n  Home --> Blog\n  Home --> Contact\n```", now, now))

    # 6. Seed Cards
    next_issue_num = 1
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
            card_id = new_id("card")
            issue_num_str = f"{codename.upper()[:3]}-{next_issue_num:03d}"
            c.execute('''
                INSERT INTO cards (id, boardId, issueNumber, title, description, acceptance, milestoneId, listId, priority, owner, targetDate, cardOrder, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (card_id, board_id, issue_num_str, title, description, acceptance, milestone_id, list_id_by_key[list_key], priority, "", "", order if list_key == "backlog" else 0, now, now))
            next_issue_num += 1
            
        c.execute("UPDATE boards SET nextIssueNumber = ? WHERE id = ?", (next_issue_num, board_id))

    conn.commit()
    conn.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Initialize Launch Command Deck (SQLite) for a project")
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
        "--db-file",
        default="",
        help="Override database path (defaults to deck_root/data/amphion.db)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    script_dir = Path(__file__).resolve().parent
    deck_root = script_dir.parent
    db_path = Path(args.db_file).expanduser().resolve() if args.db_file else (deck_root / "data" / "amphion.db")
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Remove existing db if re-initializing
    if db_path.exists():
        db_path.unlink()

    init_db(
        db_path=db_path,
        project_name=args.project_name.strip(),
        codename=args.codename.strip(),
        initial_version=args.initial_version.strip(),
        milestone_title=args.milestone_title.strip(),
        seed_template=args.seed_template,
        project_type=args.type.strip(),
    )
    print(f"Initialized SQLite Launch Command Deck at {db_path}")


if __name__ == "__main__":
    main()
