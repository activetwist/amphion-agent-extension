# EVALUATE: Scaffolded Mermaid Rendering Bug

**Phase: 1 (Research & Scoping)**
**Date:** 2026-02-23
**Focus:** Mermaid string literal escaping in `init_command_deck.py`

## 1. Research & Analysis
- **The Issue:** The `Sample IA · Marketing Site` Mermaid chart scaffolded in a new project is rendering as literal text (e.g., ``mermaid\nflowchart TD\n...``) instead of an interactive, zoom-and-pan-enabled Mermaid diagram.
- **Root Cause:** When injecting the JSON payload into `init_command_deck.py`, the Python string literal was written as `"```mermaid\\nflowchart TD\\n..."`. In Python, `\\n` evaluates to a literal backslash followed by an `n`. When passed to `json.dumps()`, this string is further escaped into `\\\\n`, completely breaking the Markeds.js/Mermaid parser on the frontend because it does not recognize the literal escape sequences as actual carriage returns.

## 2. Gap Analysis
- The string literal in `init_command_deck.py` needs to use unescaped `\n` characters to ensure `json.dumps()` correctly outputs true newline characters in the resulting JSON schema.

## 3. Scoping Boundaries
**In-Scope:**
- Modify `init_command_deck.py` in `mcd-starter-kit-dev/extension/assets/launch-command-deck/scripts/` to use `\n` instead of `\\n`.
- Generate and package a `1.25.8` VSIX patch.

**Out-of-Scope:**
- Modifying the frontend Mermaid renderer or zoom/pan behaviors.

## 4. Primitive Review
No new core Architecture Primitives are introduced. This is a strict string-escaping regression fix.
