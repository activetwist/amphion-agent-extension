#!/usr/bin/env python3
"""Validate closeout hygiene and compact agent memory constraints."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Iterable

TIMESTAMPED_MD = re.compile(r"^\d{12}-.+\.md$")
MAX_MEMORY_BYTES = 16 * 1024
MAX_HIST = 3
MAX_LIST_ITEMS = {
    "ct": 10,
    "dec": 20,
    "trb": 20,
    "lrn": 20,
    "nx": 20,
    "ref": 30,
}
REQUIRED_TOP_KEYS = {"v", "upd", "cur", "hist"}
REQUIRED_CUR_KEYS = {"st", "ms", "ct", "dec", "trb", "lrn", "nx", "ref"}


def _iter_md_files(path: Path) -> Iterable[Path]:
    if not path.exists():
        return []
    return sorted([p for p in path.iterdir() if p.is_file() and p.suffix == ".md"])


def _check_timestamped_markdown(dir_path: Path, warnings: list[str]) -> None:
    for md in _iter_md_files(dir_path):
        if not TIMESTAMPED_MD.match(md.name):
            warnings.append(f"{md} does not follow YYYYMMDDHHMM-* naming (legacy file)")


def _check_memory_file(memory_path: Path, failures: list[str]) -> None:
    if not memory_path.exists():
        failures.append(f"Missing memory file: {memory_path}")
        return

    size = memory_path.stat().st_size
    if size > MAX_MEMORY_BYTES:
        failures.append(f"Memory file exceeds {MAX_MEMORY_BYTES} bytes ({size})")

    try:
        payload = json.loads(memory_path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        failures.append(f"Memory file is not valid JSON: {exc}")
        return

    missing_top = REQUIRED_TOP_KEYS - set(payload.keys())
    if missing_top:
        failures.append(f"Memory file missing top-level keys: {sorted(missing_top)}")

    cur = payload.get("cur")
    if not isinstance(cur, dict):
        failures.append("Memory file key 'cur' must be an object")
        return

    missing_cur = REQUIRED_CUR_KEYS - set(cur.keys())
    if missing_cur:
        failures.append(f"Memory file 'cur' missing keys: {sorted(missing_cur)}")

    hist = payload.get("hist")
    if not isinstance(hist, list):
        failures.append("Memory file key 'hist' must be an array")
    elif len(hist) > MAX_HIST:
        failures.append(f"Memory history exceeds max entries ({len(hist)} > {MAX_HIST})")

    for key, cap in MAX_LIST_ITEMS.items():
        value = cur.get(key)
        if not isinstance(value, list):
            failures.append(f"Memory key cur.{key} must be an array")
            continue
        if len(value) > cap:
            failures.append(f"Memory key cur.{key} exceeds cap ({len(value)} > {cap})")
        if any(not isinstance(item, str) for item in value):
            failures.append(f"Memory key cur.{key} must contain only strings")


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate closeout hygiene + agent memory constraints")
    parser.add_argument("--root", default=".", help="Repository root path")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    failures: list[str] = []
    warnings: list[str] = []

    required_paths = [
        root / "referenceDocs/00_Governance/GUARDRAILS.md",
        root / "referenceDocs/00_Governance/MCD_PLAYBOOK.md",
        root / "referenceDocs/00_Governance/mcd/CLOSEOUT.md",
        root / "referenceDocs/00_Governance/mcd/REMEMBER.md",
        root / "referenceDocs/06_AgentMemory/README.md",
        root / "referenceDocs/06_AgentMemory/agent-memory.json",
    ]
    for req in required_paths:
        if not req.exists():
            failures.append(f"Missing required artifact: {req}")

    _check_timestamped_markdown(root / "referenceDocs/05_Records/closeout", warnings)
    _check_timestamped_markdown(root / "referenceDocs/05_Records/buildLogs", warnings)
    _check_memory_file(root / "referenceDocs/06_AgentMemory/agent-memory.json", failures)

    if failures:
        print("CLOSEOUT HYGIENE VALIDATION: FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("CLOSEOUT HYGIENE VALIDATION: PASS")
    for warning in warnings:
        print(f"- WARNING: {warning}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
