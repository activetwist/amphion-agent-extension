# Contract: MCD Starter Kit v1.4 — AI Derivation Follow-Through

Contract ID: `CT-20260221-OPS-017`
Date: `2026-02-21`
Base Version: `1.3.0`
Target Version: `1.4.0`

---

## Objective

Close the UX gap in the source-documents path of the Charter/PRD wizard. Currently, after stub documents are written and committed, the extension emits a passive notification and stops. The operator is given no explicit instruction on how to invoke an AI agent to complete the stubs. This contract funds two targeted improvements: (1) an actionable closing notification that tells the operator exactly what to do next, and (2) embedded agent prompt directives inside both stub documents so the agent has explicit, self-contained instructions when the file is opened.

---

## Authorized File Changes

| File | Action | Purpose |
|---|---|---|
| `src/templates/charterStub.ts` | **[MODIFY]** | Embed an agent prompt directive block after the `[!IMPORTANT]` alert |
| `src/templates/prdStub.ts` | **[MODIFY]** | Same — embed agent prompt directive block |
| `src/charterWizard.ts` | **[MODIFY]** | Replace passive closing notification with an actionable instruction message |
| `package.json` | **[MODIFY]** | Bump version to `1.4.0` |
| `README.md` | **[MODIFY]** | Document the enhanced stub behavior and notification copy |

---

## Behavioral Specification

### Stub Template Change (charterStub.ts, prdStub.ts)

After the existing `[!IMPORTANT]` alert block, insert a `[!NOTE]` block containing a ready-to-use agent instruction. The note must be agent-agnostic in phrasing:

**Charter stub addition:**
```markdown
> [!NOTE]
> **Agent Prompt (copy and run in your AI agent):**
> "Read each file listed above in `referenceDocs/05_Records/documentation/helperContext/` and derive the content for every section marked `*[Derive from source documents]*`. Populate each section directly from the source material. Do not add sections not already present in this document. Do not modify the Operating Constraints section."
```

**PRD stub addition:**
```markdown
> [!NOTE]
> **Agent Prompt (copy and run in your AI agent):**
> "Read each file listed above in `referenceDocs/05_Records/documentation/helperContext/` and derive the content for every section marked `*[Derive from source documents]*`. Populate the Background, Feature Set, and Success Metric sections directly from the source material. Do not add sections not already present in this document."
```

### Closing Notification Change (charterWizard.ts)

Replace the current `showInformationMessage` in `runSourceDocsPath` (line ~170) with a two-button notification:

**Button 1 — "Open Charter"**: Opens `referenceDocs/01_Strategy/{timestamp}-PROJECT_CHARTER.md` in the editor
**Button 2 — "Open PRD"**: Opens `referenceDocs/01_Strategy/{timestamp}-HIGH_LEVEL_PRD.md` in the editor

Notification copy:
> *"✅ {N} source doc(s) staged. Charter and PRD stubs are ready — open a stub, copy the Agent Prompt inside, and run it in your AI agent to complete the document."*

This converts the closing action from a pure notification into a navigational shortcut that drops the operator directly into the stub with the prompt in view.

---

## Acceptance Criteria

1. After source-docs path completes, both stub files contain the `[!NOTE]` agent prompt block immediately after the `[!IMPORTANT]` block
2. The agent prompt text is accurate and complete for both Charter and PRD variants
3. The closing notification copy matches the spec above
4. "Open Charter" and "Open PRD" buttons are present and open the correct file in the VS Code editor
5. The `[!IMPORTANT]` source file list is unchanged — source filenames render correctly
6. Manual path (6-prompt wizard) is unaffected — no changes to `runManualPath`
7. TypeScript compiles with zero errors
8. `package.json` version is `1.4.0`
