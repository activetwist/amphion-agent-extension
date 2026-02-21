# Contract: MCD Starter Kit v1.3 — Source Documents Path

Contract ID: `CT-20260221-OPS-016`
Date: `2026-02-21`
Base Version: `1.2.0`
Target Version: `1.3.0`

---

## Objective

Add a branching source-documents path to the Charter/PRD wizard. Before the 6-prompt manual wizard, the operator is asked whether they have existing background documents. If yes, a file picker collects those documents into `helperContext/`, and stub Charter/PRD documents are written with `[AI_DERIVE]` markers pointing to the collected files. The agent in the new workspace is responsible for completing the stubs.

---

## Authorized File Changes

| File | Action | Purpose |
|---|---|---|
| `src/templates/charterStub.ts` | **[NEW]** | Stub Charter renderer with `[AI_DERIVE]` markers and source file list |
| `src/templates/prdStub.ts` | **[NEW]** | Stub PRD renderer with `[AI_DERIVE]` markers and source file list |
| `src/charterWizard.ts` | **[MODIFY]** | Add branching question before existing prompts; implement file picker path |
| `package.json` | **[MODIFY]** | Bump version to `1.3.0` |
| `README.md` | **[MODIFY]** | Document the source-documents path |

---

## Behavioral Specification

### Branch Question
Immediately after the operator accepts the Charter/PRD offer:

```
"Do you have existing research or background documents for this project?"
  [Yes — import documents]   [No — start from scratch]
```

### Path A: No source documents
Existing 6-prompt manual wizard runs unchanged. No modification to current behavior.

### Path B: Source documents exist

**Step 1 — File picker**
```typescript
vscode.window.showOpenDialog({
  canSelectMany: true,
  openLabel: 'Import as source documents',
  filters: {
    'Documents': ['md', 'txt', 'pdf', 'docx'],
    'All Files': ['*']
  }
})
```

**Step 2 — Copy to helperContext**
Each selected file is copied verbatim to:
`referenceDocs/05_Records/documentation/helperContext/{original-filename}`

**Step 3 — Write stub Charter**
`referenceDocs/01_Strategy/YYYYMMDDHHMM-PROJECT_CHARTER.md`

Contents use the `charterStub.ts` template, which includes:
- Project name, codename, version (from scaffold config — already known)
- A `[!IMPORTANT]` GitHub alert marking the document as requiring AI derivation
- The list of collected source filenames
- Placeholder text `*[Derive from source documents]*` in each field section

**Step 4 — Write stub PRD**
`referenceDocs/01_Strategy/YYYYMMDDHHMM-HIGH_LEVEL_PRD.md`
Same pattern via `prdStub.ts`.

**Step 5 — Git commit**
Files staged and committed via the MCD Init terminal:
```
git commit -m "docs(v0.01a): add source documents + Charter/PRD stubs for AI derivation"
```

**Step 6 — Closing notification**
```
"✅ {N} source document(s) added to helperContext/. 
Charter and PRD stubs are ready for AI completion in referenceDocs/01_Strategy/."
```

---

## Stub Document Shape (Charter)

```markdown
# Project Charter — {projectName}

> [!IMPORTANT]
> **AI Derivation Required.** This document was initialized with source materials.
> Complete each section below by reading the following files in `helperContext/`:
> - `filename-1.md`
> - `filename-2.pdf`

Codename: `{codename}`
Version: `{version}`
Date: `{timestamp}`

---

## Target Users
*[Derive from source documents]*

## Problem Statement
*[Derive from source documents]*

## Core Value Proposition
*[Derive from source documents]*

## Hard Non-Goals
*[Derive from source documents]*

## Operating Constraints
- All development follows the MCD methodology
- Every change must be authorized by an active contract
...
```

---

## Acceptance Criteria

1. If the operator selects "No", the existing 6-prompt wizard runs with zero change
2. If the operator selects "Yes" and picks files, all selected files appear in `helperContext/`
3. Stub Charter and PRD are written with correct `YYYYMMDDHHMM-` prefixes
4. Every stub section contains `*[Derive from source documents]*` and the source file list is correct
5. Files are staged and committed
6. If the operator cancels the file picker without selecting files, the wizard gracefully falls back to the manual 6-prompt flow
7. TypeScript compiles with zero errors
