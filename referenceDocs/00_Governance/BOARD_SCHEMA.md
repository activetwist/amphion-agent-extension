# Command Deck Board Schema (`state.json`)

This document provides the canonical schema for generating milestones and cards for the AmphionAgent Launch Command Deck. Agents generating project specifications must strictly adhere to this format when appending or seeding `state.json`.

## 1. Root Structure
The `state.json` file is a rigid JSON structure that holds all project data.

```json
{
  "version": 1,
  "updatedAt": "2026-02-23T19:24:01Z",
  "activeBoardId": "board_46736b188b",
  "charts": [...],
  "boards": [
    {
      "id": "board_46736b188b",
      "name": "Project Name",
      "codename": "PR",
      "nextIssueNumber": 1,
      "description": "Project description.",
      "projectType": "standard",
      "createdAt": "2026-02-23T04:15:00Z",
      "updatedAt": "2026-02-23T19:24:01Z",
      "lists": [...],
      "milestones": [...],
      "cards": [...]
    }
  ]
}
```

## 2. Milestones Array
Milestones group cards into deliverables or versions.

### Type Definition
```typescript
type Milestone = {
  id: string;        // Format: "ms_" + 10 hex chars (e.g., "ms_dad9ed83f5")
  code: string;      // Short code (e.g., "v1.0" or "v001a")
  title: string;     // Human-readable title
  order: number;     // 0-indexed integer for sorting
  createdAt: string; // ISO 8601 UTC timestamp
  updatedAt: string; // ISO 8601 UTC timestamp
}
```

### Example
```json
{
  "id": "ms_dad9ed83f5",
  "code": "v001a",
  "title": "Version 0a Pre-Release",
  "order": 0,
  "createdAt": "2026-02-23T04:15:00Z",
  "updatedAt": "2026-02-23T04:15:00Z"
}
```

## 3. Cards Array
Cards represent actionable work items (Contracts, Evaluations, or generic Tasks) assigned to a Milestone and a List.

### Type Definition
```typescript
type Card = {
  id: string;          // Format: "card_" + 10 hex chars (e.g., "card_7c3a215378")
  title: string;       // Card title. Often includes type and issue number (e.g., "CT-001 · v1.0 — Initial Scaffold")
  description: string; // Detailed description. Free text, supports simple formatting.
  acceptance: string;  // Acceptance criteria. Free text, use "\\n" for line breaks and bullet points.
  milestoneId: string; // ID of the parent milestone (e.g., "ms_dad9ed83f5")
  listId: string;      // ID of the column/list (see Lists section below)
  priority: string;    // "P0", "P1", or "P2"
  owner: string;       // Default empty string ""
  targetDate: string;  // Default empty string "" or ISO 8601 UTC
  order: number;       // 0-indexed integer for vertical sorting within the list
  createdAt: string;   // ISO 8601 UTC timestamp
  updatedAt: string;   // ISO 8601 UTC timestamp
  issueNumber: string; // Deterministic tracker ID. Format: "{CODENAME}-{NNN}" (e.g., "AM-009").
}
```

### Important Schema Rules
- **IDs**: Prefix IDs with `card_` or `ms_` followed by an unpredictable hex hash to prevent collisions.
- **Escape Characters**: The `description` and `acceptance` fields are standard strings. To insert a newline in the UI rendering, use the literal escape sequence `\n` in JSON (e.g., `"acceptance": "- Item 1\n- Item 2"`). 
- **List IDs**: Reference existing Lists in the Board. Standard List keys usually map to these categories:
  - `backlog`
  - `active` (In Progress)
  - `blocked`
  - `qa` (Review)
  - `done`

### Example
```json
{
  "id": "card_2591263b94",
  "issueNumber": "AM-060",
  "title": "Fix wiki new document creation persistence",
  "description": "Ensure \"+ New Note\" creates a persisted markdown file and immediately reflects it in the Notes Tree.",
  "acceptance": "- Creating a note writes the file immediately.\n- Newly created note appears in tree.\n- Existing save behavior remains intact.",
  "milestoneId": "ms_dad9ed83f5",
  "listId": "list_1b38384ac5", 
  "priority": "P0",
  "owner": "",
  "targetDate": "",
  "order": 5,
  "createdAt": "2026-02-23T17:45:50Z",
  "updatedAt": "2026-02-23T17:45:50Z"
}
```

## 4. Default List Definitions
If scaffolding a new board from scratch, the Canonical Lists structure is:

```json
[
  { "id": "list_1b38384ac5", "key": "backlog", "title": "Backlog", "order": 0 },
  { "id": "list_fe6160088d", "key": "active", "title": "In Progress", "order": 1 },
  { "id": "list_7f1fd2b289", "key": "blocked", "title": "Blocked", "order": 2 },
  { "id": "list_3782c4a334", "key": "qa", "title": "QA / Review", "order": 3 },
  { "id": "list_5c158d96b9", "key": "done", "title": "Done", "order": 4 }
]
```
*(Note: IDs should be generated fresh per board, but this illustrates structure and standard keys).*
