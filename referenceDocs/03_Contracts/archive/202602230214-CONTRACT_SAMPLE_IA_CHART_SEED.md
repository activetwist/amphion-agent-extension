# CONTRACT: Seed Sample IA Chart for Charts Tab

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-23  
**Codename:** `BlackClaw`

## 1. Goal
Seed one default sample chart in the Charts tab so users can immediately see how chart selection and preview work, while preserving an easy deterministic deletion path.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602230214-CONTRACT_SAMPLE_IA_CHART_SEED.md` (this contract)
- `ops/launch-command-deck/data/state.json` (add top-level `charts` array with one sample chart)
- `referenceDocs/05_Records/buildLogs/202602230214-EXECUTE_SAMPLE_IA_CHART_SEED.md` (new)
- `referenceDocs/05_Records/buildLogs/202602230214-WALKTHROUGH_SAMPLE_IA_CHART_SEED.md` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Add one sample chart entry to state for immediate Charts-tab demo visibility.
  - Seed Mermaid IA content for: `Home -> About / Blog / Contact`.
  - Validate sample chart can be selected and rendered in preview panel.
  - Document deterministic removal instructions.
- **Out of Scope:**
  - Chart CRUD UI.
  - Backend API/schema changes.
  - Auto-discovery of chart files from workspace.
  - Multiple chart templates.

## 4. Deterministic Execution Plan
1. **State Seeding**
   - Add top-level `charts` array to `ops/launch-command-deck/data/state.json` (if missing).
   - Add one chart object:
     - `id`: `sample_ia_home_about_blog_contact`
     - `title`: `Sample IA · Marketing Site`
     - `description`: `Simple website structure example`
     - `markdown`: Mermaid flowchart for Home/About/Blog/Contact.
2. **Verification**
   - Reload state in Command Deck.
   - Open `Charts` tab and select sample chart.
   - Confirm Mermaid renders in preview panel.
3. **Documentation**
   - Write execute and walkthrough logs with explicit deletion path.

## 5. Risk Assessment
- **Render Syntax Risk (Low):** Mermaid block could fail if malformed.
  - **Mitigation:** Use minimal known-good `flowchart TD` syntax.
- **State Shape Risk (Low):** New top-level key could conflict with existing expectations.
  - **Mitigation:** Charts loader already tolerates missing key and reads optional `state.data.charts`.
- **Scope Drift Risk (Low):** Request could expand into chart management features.
  - **Mitigation:** Keep to one seeded sample only.

## 6. Acceptance Criteria
- [ ] One sample IA chart appears in Charts list by default.
- [ ] Selecting sample chart renders Mermaid diagram in preview panel.
- [ ] Existing board/dashboard/guide behavior is unaffected.
- [ ] Deletion path is documented (remove sample chart from state and reload).
- [ ] Execute and walkthrough records are created.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602230214-CONTRACT_SAMPLE_IA_CHART_SEED.md`
