"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPrdFromFoundation = renderPrdFromFoundation;
function renderPrdFromFoundation(state, timestamp) {
    const listFeatures = state.product.keyFeatures.map(f => `### ${f}
- **User Story:** As a user, I want this feature so I can achieve my goal.
- **Acceptance Criteria:**
  - [ ] Criteria 1
  - [ ] Criteria 2`).join('\n\n');
    const openQs = state.notes.openQuestions.map(q => `- ${q}`).join('\n');
    return `# High-Level PRD · ${state.project.name} (\`${state.project.codename}\`)

**Version:** ${state.project.version}
**Date:** ${timestamp.substring(0, 4)}-${timestamp.substring(4, 6)}-${timestamp.substring(6, 8)}

## 1. Product Summary
This document breaks down the core features required to achieve the Definition of Done metric established in the Project Charter.

## 2. Success Metric (Definition of Done)
- **Type:** ${state.product.successMetric.type}
- **Goal:** ${state.product.successMetric.target} within ${state.product.successMetric.timeHorizon}.

## 3. Core Features (Version ${state.project.version})

${listFeatures}

## 4. Open Questions & Assumptions
${openQs}

## 5. Non-Functional Requirements
- **Performance:** Sub-second latency.
- **Availability:** 99.9% uptime.
`;
}
//# sourceMappingURL=prdFromFoundation.js.map