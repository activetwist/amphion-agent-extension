# EXECUTE · AmphionAgent

**Phase:** 3 (Implementation & Verification)
**Status:** Canonical Instruction Set
**Codename:** `BlackClaw`

## When to Use
Invoke this command ONLY when an approved contract exists in `03_Contracts/active/`.

## Inputs
- [ ] Approved Contract
- [ ] Current Repository State
- [ ] Test Harness / Environment

## Instructions
1. **Implementation**: Execute the changes exactly as authorized by the contract. Do not deviate from the Approved AFPs.
2. **Verification**: Run all automated tests and perform manual validation as defined in the contract's Verification Plan.
3. **Iteration**: Fix bugs discovered during verification. If a fundamental design change is needed, stop and return to the Contract phase.
4. **Documentation**: Record outcomes and build details in `05_Records/buildLogs/`.

## Output
- [ ] Verified implementation matching all Acceptance Criteria.
- [ ] Build Log documenting the execution results.
- [ ] Walkthrough artifact demonstrating the completed work.
