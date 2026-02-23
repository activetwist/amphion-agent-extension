# WALKTHROUGH: GitHub First-Push Transport Remediation

## Goal
Reproduce and resolve first-push transport failure, then verify `origin/main` creation.

## Steps
1. Verify baseline:
   - `git rev-parse HEAD`
   - `git remote -v`
   - `git ls-remote --heads origin main`
2. Run one traced diagnostic attempt:
   - `GIT_TRACE=1 GIT_TRACE_PACKET=1 GIT_CURL_VERBOSE=1 git push -u origin main`
3. Apply first safe transport tweak:
   - `git config --local http.version HTTP/1.1`
   - Retry push.
4. If still failing, apply second safe transport tweak:
   - `git config --local http.postBuffer 524288000`
   - Retry with explicit refspec:
     - `git push --set-upstream origin HEAD:main`
5. Verify success:
   - `git ls-remote --heads origin main`
   - `gh repo view activetwist/amphion-agent --json defaultBranchRef,url`
   - `git status -sb`

## Expected Success State
- Push succeeds and upstream tracking is set.
- `origin/main` exists.
- GitHub default branch is `main`.

## Safety Constraints
- No destructive git commands (`reset --hard`, force push, history rewrite).
- Use local-only transport config changes (`git config --local ...`).
