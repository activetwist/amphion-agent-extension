# EVALUATE: Guided Structured Init (SIP-1) Onboarding Spec

**Phase:** 1 (Research & Scoping)
**Date:** 2026-02-24

## 1. Research Highlights
The user proposed adding a third onboarding mode based on the `amphion_agent_strategic_initialization_protocol_onboarding_spec_v_1.md` document. 
The system currently uses an HTML webview (`onboardingWebview.ts`) to manage onboarding with two options:
1. Quick Init (6 manual questions)
2. Import Existing Docs (Agent derivation)

## 2. Gap Analysis
To implement the third "Guided Structured Init (SIP-1)" mode, the following gaps need to be bridged:
- **UI Trigger:** `onboardingWebview.ts` needs a third button to trigger the new IDE-native wizard flow.
- **Data Capture:** A new module (`guidedWizard.ts`) is required to sequence 18 precise `vscode.window.showQuickPick` and `showInputBox` prompts.
- **Persistence Foundation:** A new `foundationWriter.ts` must be created to formalize the canonical persistence of a `referenceDocs/01_Strategy/foundation.json` state schema.
- **Downstream Generation:** New template adapters (`charterFromFoundation.ts` and `prdFromFoundation.ts`) must translate the `foundation.json` schema variables strictly into the Markdown structure.
- **Command Deck integration:** `init_command_deck.py` (or Python server) will need to be updated to inject new cards ("Spec Lock", "Non-Goals", "Artifacts exist") and append a `foundationPath` field to the board state metadata.
- **Post-Init Protocol:** All 3 initialization pathways must be updated to explicitly ask the user if they'd like to review their artifacts or start their first task via a new `postInitPrompt.ts`.

## 3. Scoping Boundaries
**In-Scope:**
- Implementing the SIP-1 guided wizard in the VS Code extension natively using the prompt sequence defined in the spec.
- Creating the canonical `foundation.json` schema and writer.
- Updating `onboardingWebview.ts` for the 3rd flow option.
- Implementing deterministic Charter and PRD generation from the JSON schema.
- Updating the Command Deck initial seed template for the new milestone cards.
- Adding the post-init Agent Review prompt.

**Out-of-Scope:**
- Retrofitting existing projects with a `foundation.json` backward compatibility layer.
- Building a full visual editor for the `foundation.json` file.
- Telemetry, paid gating, multi-agent collaboration (as explicitly disabled by the SIP-1 spec).

## 4. Primitive Review
- **New Canonical Artifact:** `referenceDocs/01_Strategy/foundation.json` will become the systemic source of truth for tracking project configuration and intent. This drastically improves the robustness over the current text-only strategy system.
