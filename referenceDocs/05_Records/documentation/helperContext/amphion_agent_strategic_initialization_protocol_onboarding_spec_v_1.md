# Amphion Agent
## Strategic Initialization Protocol (SIP-1) Implementation Spec
**Version:** 1.0  
**Date:** 2026-02-23

---

# 0. Scope

Add a third optional onboarding mode that deterministically captures project variables and generates a higher-fidelity Charter + PRD than the existing 6-question flow, while preserving the existing two modes:

1. Quick Init (6 questions)
2. Import Existing Docs
3. **Guided Structured Init (SIP-1)** (new)

After any initialization mode completes, the agent must immediately ask whether the user wants to review the Charter, PRD, and initial architecture. If the user declines, the agent asks what they want to work on first.

This spec is designed to align with Amphion’s existing MCD scaffold patterns and Command Deck integration style. Reference architecture patterns are consistent with the extension structure described in the provided README. fileciteturn5file0

---

# 1. Product Outcomes

## 1.1 User outcomes

- A developer with low product vocabulary can still produce coherent strategic artifacts.
- Project initialization becomes repeatable and predictable.
- The agent starts from grounded artifacts, not vague prompts.

## 1.2 System outcomes

- Deterministic capture of foundational variables into a machine-usable state file.
- Charter + PRD generated from structured variables.
- Artifacts are stored in a canonical location so downstream agent actions can reference them.

---

# 2. Canonical Artifacts

## 2.1 New state file

Create a single source of truth file:

- `referenceDocs/01_Strategy/foundation.json`

This file stores all captured variables for any init mode.

### 2.1.1 foundation.json schema (minimum)

```json
{
  "schemaVersion": "sip-1",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "initMode": "quick" | "import" | "guided",
  "project": {
    "name": "",
    "codename": "",
    "version": "",
    "repoType": "new" | "existing"
  },
  "actors": {
    "primaryBuilder": "solo" | "team",
    "roles": ["developer", "product_manager", "designer", "content_manager", "other"]
  },
  "product": {
    "targetUsers": [""],
    "problemStatement": "",
    "coreValueProposition": "",
    "hardNonGoals": [""],
    "keyFeatures": [""],
    "successMetric": {
      "type": "",
      "definition": "",
      "target": "",
      "timeHorizon": ""
    }
  },
  "constraints": {
    "deployment": "",
    "data": "",
    "security": [""],
    "performance": [""],
    "outOfScope": [""],
    "ai": {
      "usesAI": true,
      "providers": [""],
      "multiModel": true,
      "safetyNotes": [""
      ]
    }
  },
  "notes": {
    "openQuestions": [""],
    "assumptions": [""],
    "risks": [""]
  }
}
```

---

## 2.2 Generated docs (unchanged locations)

Continue writing to existing canonical paths (or adopt these if not already canonical):

- `referenceDocs/01_Strategy/PROJECT_CHARTER.md`
- `referenceDocs/01_Strategy/HIGH_LEVEL_PRD.md`
- `referenceDocs/02_Architecture/SYSTEM_ARCHITECTURE.md` (optional in v1; can be a stub)

---

# 3. New Onboarding Mode: Guided Structured Init (SIP-1)

## 3.1 UX requirements

- Uses short prompts.
- Uses examples.
- Prefers multiple choice (QuickPick) over free text where possible.
- Limits free-text answers to short strings or short bullet lists.
- Total completion time target: under 5 minutes.

## 3.2 Deterministic capture approach

Instead of asking abstract questions directly, decompose them into constrained prompts.

### SIP-1 prompt set (recommended)

**A. Target users**
1) “Who uses this?” (multi-select)
- Individual consumer
- Small team (2–10)
- Org team (10–100)
- Enterprise
- Public/no login
- Other (short text)

2) “What does a successful user look like?” (short text)

**B. Problem statement**
3) “What happens today without this?” (multi-select)
- manual work
- spreadsheets
- tool switching
- copying/pasting
- slow approvals
- errors/rework
- other

4) “What is the most painful step?” (short text)

**C. Core value proposition**
5) “This reduces…” (multi-select)
- time
- errors
- cost
- cognitive load
- tool switching
- other

6) “This increases…” (multi-select)
- speed
- visibility
- accuracy
- automation
- revenue
- other

7) “One-sentence value statement” (short text; example shown)

**D. Hard non-goals**
8) “Do not include in v1” (multi-select)
- payments
- auth/login
- multi-user collaboration
- mobile app
- analytics/telemetry
- marketplace/plugins
- AI features
- other

9) “What is explicitly NOT a goal?” (short text)

**E. Key features (Version X.Y.Z)**
10) “Name the version you’re targeting first” (pre-filled with current project version)

11) “List up to 5 must-have features for that version” (multi-line, enforced max 5)

**F. Success metric**
12) “What event proves this worked?” (pick one)
- shipped to production
- first real user
- first paying user
- replaces an existing tool
- saves X hours/week
- other

13) “Define the metric target” (short text)
14) “Time horizon” (pick)
- 7 days
- 30 days
- 90 days
- 6 months
- 12 months

**G. Constraints (optional but recommended)**
15) “Deployment target” (pick)
- local-only
- shared hosting
- VPS
- cloud
- other

16) “Data storage” (pick)
- file-based
- SQLite
- MySQL
- Postgres
- other

17) “Security stance” (multi-select)
- no telemetry
- encrypted secrets
- audit logs
- role-based permissions
- other

**H. Wrap-up**
18) “Open questions (optional)” (multi-line)

---

# 4. Post-Initialization Conversation Rules (All 3 Modes)

After project initialization completes (quick/import/guided), the agent must ask:

> “Do you want to review your Charter, PRD, and initial architecture now?”

If YES:

- Present 3 options:
  - Review Charter
  - Review PRD
  - Review Architecture
- Allow the user to pick one to start.

If NO:

- Ask:
  - “What do you want to work on first?”
- Provide 3 suggested next actions:
  - Define MVP milestone plan
  - Build initial contracts
  - Generate board/cards

This rule must run regardless of init mode.

---

# 5. Charter + PRD Generation Rules

## 5.1 Determinism requirements

- Always generate the same section order.
- Always use the same headings.
- Always include an explicit Non-Goals section.
- Always include a Definition of Done section.

## 5.2 Fidelity rules

- **Quick mode** generates minimal Charter/PRD from 6 inputs.
- **Import mode** uses the user’s docs as source of truth and produces an indexed summary + normalized Charter/PRD.
- **Guided mode (SIP-1)** generates fuller Charter/PRD and additionally writes `foundation.json`.

---

# 6. Command Deck / Board Integration

If Amphion already generates cards, extend generation to include:

- A dedicated “Spec Lock” milestone
- A “Non-Goals” card (hard constraint enforcement)
- A “Artifacts exist and are canonical” card

Also add a board metadata field:

- `foundationPath`: `referenceDocs/01_Strategy/foundation.json`

---

# 7. Implementation Notes for Antigravity

This spec assumes an extension structure similar to:

- `src/extension.ts` entry
- `src/wizard.ts` prompts
- `src/scaffolder.ts` file writing + conflict detection
- `src/templates/*` doc generation

(Names can vary in Amphion; map accordingly.) fileciteturn5file0

## 7.1 New modules/files

Add:

- `src/onboarding/initMode.ts` (enum + chooser)
- `src/onboarding/guidedWizard.ts` (SIP-1 prompt flow)
- `src/foundation/foundationSchema.ts` (types)
- `src/foundation/foundationWriter.ts` (writes foundation.json)
- `src/templates/charterFromFoundation.ts`
- `src/templates/prdFromFoundation.ts`
- `src/postInit/postInitPrompt.ts` (the review-or-work-first prompt)

## 7.2 Update existing modules

- Update the existing onboarding picker to include “Guided Structured Init (SIP-1)”.
- Ensure all modes populate `foundation.json`:
  - quick mode fills only known fields
  - import mode fills fields where possible and stores import manifest
  - guided fills full fields

## 7.3 Cancellation behavior

- If the user cancels any prompt, abort with no writes.
- If partial state exists in memory, do not persist it.

## 7.4 Collision avoidance

- Never overwrite user files without confirmation.
- If `foundation.json` already exists, prompt:
  - Replace
  - Create new timestamped foundation file
  - Abort

---

# 8. Acceptance Criteria

## AC-1: Third onboarding mode exists
- User can choose Guided Structured Init (SIP-1).

## AC-2: Deterministic variable capture
- Guided mode writes `foundation.json`.
- Guided mode completes in under ~5 minutes for typical input.

## AC-3: Charter + PRD generation
- Guided mode generates Charter + PRD with stable headings and section order.
- Quick/import modes still function.

## AC-4: Post-init prompt
- After any mode completes, the agent asks whether to review Charter/PRD/Architecture.
- If declined, the agent asks what to work on first.

## AC-5: No collisions
- Existing behavior remains intact.
- No unexpected file overwrites.

---

# 9. Out of Scope (This Implementation)

- Building a full visual editor.
- Adding paid gating.
- Adding telemetry.
- Adding multi-agent collaboration.

---

**End of SIP-1 Implementation Spec**

