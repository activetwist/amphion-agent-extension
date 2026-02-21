# Contract: v0.06a-hotfix View Flash Elimination

Contract ID: `CT-20260220-OPS-009`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Phase: `Contract`

## Objective
Implement an inline, synchronous rendering block inside the Command Deck SPA to eliminate the Flash of Unstyled Content (FOUC), ensuring that reloading the browser always paints the cached view (Board, Dashboard, or MCD Guide) on the very first frame.

## Authorized File Changes

### 1. Synchronous View Binding
**Files**: `ops/launch-command-deck/public/index.html`
- **Script Injection**: Insert an inline `<script>` block directly inside the `<head>`. This script will synchronously read `localStorage.getItem("mcd_current_view")` and apply it as a `data-current-view` attribute on the root `<html>` element.
- **CSS Overrides**: Immediately following the script, inject an inline `<style>` block. This block will declare absolute `display: none !important;` rules for the inactive `.workspace` nodes based solely on the `data-current-view` attribute matching state.

## Acceptance Criteria
1. The SPA still correctly boots into the last viewed tab saved in `localStorage`.
2. Hard refreshing the SPA while on the "Dashboard" or "MCD Guide" tab instantly loads that tab.
3. Zero visual artifacts or sub-second flashes of the "Board" view occur during the refresh cycle.
