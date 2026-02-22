# Contract: CT-039 Re-branding to AmphionAgent (v1.19.0)

**Objective**: 
Pivot the identity of the MCD Starter Kit to "AmphionAgent", integrate the new systemic logo, and produce a comprehensive pre-release build record.

**Context**: 
The project has reached a level of maturity (v1.18.0) where it requires a unique brand identity. "AmphionAgent" represents the synthesis of MCD determinism and proactive agentic support.

**Proposed Changes**:
1. **Identity Refactor (`package.json`)**:
   - name: `mcd-starter-kit` -> `amphion-agent`
   - displayName: `MCD Starter Kit` -> `AmphionAgent`
   - icon: Reference `icon.svg`.
2. **Asset Integration**:
   - Copy `logo.svg` to the extension root as `icon.svg`.
3. **UI String Updates**:
   - `index.html`: Header text "Command Deck" -> "AmphionAgent".
   - `extension.ts` / `wizard.ts`: Update display notifications and wizard steps from "MCD" or "Starter Kit" references to "AmphionAgent".
   - *Note*: MCD Methodology references will remain as they describe the underlying logic.
4. **Documentation**:
   - Generate `202602221229-Pre-Release-Build-Notes-AmphionAgent.md` in `referenceDocs/05_Records/documentation/`.

**Acceptance Criteria**:
- **Branding**: Extension displays as "AmphionAgent" in the VS Code Marketplace/Extensions sidebar.
- **Logo**: The custom SVG logo is displayed as the extension icon.
- **UI**: The Command Deck header displays "AmphionAgent".
- **Notes**: The build notes file contains a detailed history of the evolution from v1.1 to v1.19.
- **Packaging**: Successful generation of `amphion-agent-1.19.0.vsix`.
