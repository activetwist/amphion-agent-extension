# EVALUATE: Repository & Licensing Strategy

## 1. Context & Analysis
The Product Manager raised a highly astute point: because the `amphion-agent` extension scaffolds its core logic (the Command Deck `server.py`/`app.js` and governance files) entirely in plaintext directly into the user's workspace, the "secret sauce" is already completely transparent. 

The question is: **Can we publish a public repository for visibility/trust, but strictly reject community contributions?**

**Findings:**
Yes. This is an extremely common strategy for opinionated indie developers and is fully supported by modern git hosting platforms (like GitHub).

### Element A: Controlling the Repository (The "No PRs" Rule)
If you host the code on a public GitHub repository, you have absolute dictatorial control over it. You are never obligated to accept a Pull Request (PR). To enforce your opinionated structure without being "bothered":
1. **Disable Issues**: You can literally turn off the "Issues" tab in repository settings so users cannot log bugs or feature requests. 
2. **Setup a `CONTRIBUTING.md`**: You place a file in the root that explicitly states: *"This is a highly opinionated product. We do not accept external Pull Requests or feature suggestions. This repository is provided for transparency only."*
3. **Ignore PRs**: If someone submits a PR anyway, you simply close it and ignore it. 

### Element B: Licensing a Public Repo (Open Source vs "Source Available")
Since the code is visible, the License dictates what users are *legally* allowed to do with it once they read it.

- **Option 1: The "Open Source" route (`MIT` License)**
  - Users can read it, fork it, modify it, and literally repackage and sell it themselves.
  - *Why choose it?* Maximum community goodwill. You accept that copying happens, but trust your specific brand (`amphion-agent`) and execution speed to remain the canonical source.
- **Option 2: The "Source Available" route (`Proprietary` or `Custom` License)**
  - Users can read it on GitHub and use the extension on their machines, but they are legally prohibited from repackaging your scaffolding logic and publishing a competing "GhostMolt Command Deck" extension.
  - *Why choose it?* You want the transparency of a public repo to build trust, but want to strictly protect your intellectual property from blatant theft.

## 2. Recommendation
Given your goal (protecting the product vision while avoiding contributor noise), the **"Source Available"** model is the strongest move. 
You can create a public GitHub repository (e.g., `https://github.com/active-twist/amphion-agent`), but keep the `package.json` license set to `Proprietary`. 

## 3. Conclusion
**HALT.** Evaluation complete. 

If you decide to create a GitHub repository later, we can inject that URL into the `package.json` right now to ensure the Marketplace listing has a valid link.

*Are we ready to lock in the `Proprietary` license and proceed to Contract, or do you want to reserve a dummy/real GitHub URL to inject first?*
