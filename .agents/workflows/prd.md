---
description: Generate High-Level PRD from source documents for AmphionAgent
---

# PRD

This command automates the derivation of your High-Level PRD.

1.  **Read Source Documents**: Read every file in `referenceDocs/05_Records/documentation/helperContext/`.
2.  **Read Charter**: Read the completed Project Charter in `referenceDocs/01_Strategy/` to ensure alignment.
3.  **Derive Content**: Fill every section marked `*[Derive from source documents]*` in the latest High-Level PRD in `referenceDocs/01_Strategy/`.
4.  **Cleanup**: Remove any remaining stub markers or introductory agent instructions from both the Charter and the PRD.
5.  **Completion**: Once finished, tell the user: "The Project PRD and Strategy documents are complete! Please return to the Onboarding WebUI and click **Complete & Launch Command Deck**."
