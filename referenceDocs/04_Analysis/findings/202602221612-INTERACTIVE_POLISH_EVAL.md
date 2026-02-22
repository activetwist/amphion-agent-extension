# EVALUATE: Marketplace Polish (Interactive Variables)

## 1. Research & Analysis
The user provided explicit directives for the final `package.json` metadata variables and requested a nomenclature shift regarding the term "Product Owner".

**Findings & Validation:**
1. **Logo Integration**: The root `logo.png` is `512x512`. This perfectly satisfies the VS Code Marketplace requirement (minimum 128x128). We can safely clone this into the extension directory and link it.
2. **Missing Repository**: It is entirely acceptable to publish without a public git repository. The `vsce package` tool will throw a terminal warning asking "Are you sure?", but it will successfully compile. 
3. **Licensing**: Since we are bypassing open-source, we will inject `"license": "Proprietary"` into `package.json`. This signals to the marketplace that the code is copyrighted and restricted from unauthorized duplication.
4. **Publisher Identity Constraints**: The `"publisher"` field in `package.json` must exactly match the unique ID of the publisher account you create on the VS Code Marketplace (which must be strictly alphanumeric/hyphens, e.g., `stanton-brooks` or `active-twist-consulting`). We cannot inject "Stanton Brooks / Active Twist" with spaces in that specific field. 
5. **Author Block**: We CAN, however, beautifully format the `"author"` block to display your chosen dual identity and links. 
6. **Nomenclature Shift**: Grep search reveals that the phrase "Product Owner" is heavily baked into our IDE adapter templates (`mcd-starter-kit-dev/extension/src/templates/adapters.ts`), the `MCD_PLAYBOOK.md`, and the active workspace files. We must mass-refactor this string to "Product Manager" to soften the UX.

## 2. Gap Analysis
The new metadata fully equips the extension for packaging, but the `package.json` `"publisher"` field remains a hard constraint governed by Microsoft's backend. 

## 3. Scoping & Action Plan

**The Configuration Mapping:**
```json
{
  "icon": "icon.png",
  "license": "Proprietary",
  "publisher": "stanton-brooks",
  "author": {
    "name": "Stanton Brooks / Active Twist Consulting Group, LLC",
    "email": "Replace with real email if desired",
    "url": "https://linkedin.com/in/stanton-brooks"
  }
}
```
*(Note: You will need to make sure your Marketplace Publisher ID is `stanton-brooks` when you create your developer account online).*

**The Polish Architecture:**
1. Overwrite `mcd-starter-kit-dev/extension/icon.png` and `assets/icon.png` with `logo.png`.
2. Overwrite `package.json` with the new Author block, License, and strip out the legacy dependencies.
3. Update `.vscodeignore` to reject all `*.vsix` files.
4. Draft a pristine v1.25.0 `README.md` and `CHANGELOG.md`.
5. Execute a global Find & Replace across the workspace, shifting "Product Owner" to "Product Manager" (specifically targeting the `src/templates/adapters.ts` which scaffolds new projects).

## 4. Conclusion
**HALT.** Evaluation complete. The polish variables are locked in. 

*Would you like to build a contract based on these findings so we can execute the final marketplace sweep?*
