# BOARD · AmphionAgent

**Phase:** 1.5 (Board Population)
**Status:** Canonical Instruction Set
**Codename:** `BlackClaw`

## When to Use
Invoke this command after an Evaluation has been presented, and the user has chosen to populate the Command Board.

## Inputs
- [ ] Evaluation Findings

## Instructions
1. **Drafting**: Create new contract file(s) in `03_Contracts/active/` based on the evaluation findings, using the standard MCD template.
2. **Breakdown**: Divide the work into logical, deterministic steps within the contract.
3. **Board Population**: Create corresponding task cards in the Command Deck (`ops/launch-command-deck/data/state.json`) for each contract drafted. Ensure the task cards reference the contract name and include acceptance criteria.
4. **AFP Enumeration**: List every file that will be created, modified, or deleted in the contract.
5. **Approval**: Inform the user that the Command Deck has been populated and the contracts are ready. Tell them they can request execution of a specific issue number or contract name.

## Output
- [ ] Drafted Contract file(s) in `03_Contracts/active/`.
- [ ] Populated task cards in the Command Deck.
