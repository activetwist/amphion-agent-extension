"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCharterFromFoundation = renderCharterFromFoundation;
function renderCharterFromFoundation(state, timestamp) {
    const listFeatures = state.product.keyFeatures.map(f => `- ${f}`).join('\n');
    const listNonGoals = state.product.hardNonGoals.map(f => `- ${f}`).join('\n');
    const listSecurity = state.constraints.security.map(f => `- ${f}`).join('\n');
    return `# Project Charter · ${state.project.name}

**Codename:** \`${state.project.codename}\`
**Version:** ${state.project.version}
**Date:** ${timestamp.substring(0, 4)}-${timestamp.substring(4, 6)}-${timestamp.substring(6, 8)}

## 1. Core Value Proposition
${state.product.coreValueProposition}

## 2. Target Users
${state.product.targetUsers.map(u => `- ${u}`).join('\n')}

## 3. Problem Statement
${state.product.problemStatement}

## 4. Key Features
${listFeatures}

## 5. Non-Goals (Out of Scope)
${listNonGoals}

## 6. Definition of Done (Success Metric)
**Metric:** ${state.product.successMetric.type}
**Target:** ${state.product.successMetric.target}
**Time Horizon:** ${state.product.successMetric.timeHorizon}

## 7. Operating Constraints
- **Deployment:** ${state.constraints.deployment}
- **Data Storage:** ${state.constraints.data}
- **Security:** 
${listSecurity}
`;
}
//# sourceMappingURL=charterFromFoundation.js.map