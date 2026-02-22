# CONTRACT · Webview Instantiation & Agent Handoff (v1.9.0)

**Phase:** 2 (Planning & Agreement)
**Status:** PROPOSED
**Codename:** `BlackClaw`

## Objective
Unify the onboarding experience by entirely moving the project instantiation flow (`mcd.init`) into the Custom HTML Webview, removing all native `showInputBox` sequences. Implement the Lean "Product Owner" handoff UX by discarding clipboard hijacking in favor of direct embedded `[!AGENT INSTRUCTION]` directives within the generated strategy stubs.

## Proposed Changes

### [Webview Unified Onboarding]
- **MODIFY**: `src/onboardingWebview.ts` to include a new HTML view for the 5 configuration inputs (Project Name, Codename, Port, Version, Language). The Webview manages the state transition from Initialization -> Scaffolding -> Strategy (Docs).
- **MODIFY**: `src/extension.ts` to immediately open the Webview upon `mcd.init` instead of calling the native wizard.

### [Lean Product Owner Handoff]
- **MODIFY**: `src/charterWizard.ts` to strip out the OS clipboard hooks and clunky `while()` loop notifications. The function will strictly generate the stubs, open the Charter in the active editor, and exit immediately.
- **MODIFY**: `src/templates/charterStub.ts` to include a direct, conversational `[!AGENT INSTRUCTION]` block aimed at waking up the IDE agent and asking the user for permission to execute the generative prompt.
- **MODIFY**: `src/templates/prdStub.ts` to include the subsequent agent instruction block.

### [Metadata]
- **BUMP**: `package.json` to version `1.9.0`.

## Acceptance Criteria
- [ ] Running `MCD: Initialize New Project` opens the Webview immediately.
- [ ] Webview UI contains the 5 project config fields.
- [ ] Submitting the config triggers standard MCD scaffolding without restarting the Webview.
- [ ] The BYO Docs path generates stubs and opens the Charter file; NO clipboard notifications appear.
- [ ] `PROJECT_CHARTER.md` contains an `[!AGENT INSTRUCTION]` block dictating the bot's behavior.
- [ ] Extension compiles and packages perfectly.
