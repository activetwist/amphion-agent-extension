# Micro-Contract Development (MCD): Moving Fast Because of Reasonable Constraints

## A Complete Distillation of the Methodology, Its Philosophy, and Why It Works

---

## What Problem Does MCD Solve?

There's a paradox at the heart of building software with AI. AI coding agents — tools like Claude Code, GitHub Copex, Cursor, Windsurf, and others — can generate code at extraordinary speed. You can describe what you want, and working code appears in seconds. That speed is real, and it's transformative. But speed without governance produces chaos, not software.

Here's what actually happens when people start building with AI and no structure: the AI generates something that works. The operator says "great, now add this." The AI adds it. "Now change this." Changed. "Actually, let's also do this other thing." Done. An hour later, there are fifteen files that have been touched, the feature set has drifted from what was originally intended, there's no record of what was deliberately chosen versus what was improvised, and when something breaks — and something will break — there's no way to know which change caused it, because there's no checkpoint to roll back to and no contract that specified what was supposed to happen in the first place.

This isn't a hypothetical. This is the default experience for most people building with AI agents today. The AI is fast. The human is reactive. And the output is fragile, undocumented software that works until it doesn't, with no audit trail explaining why it was built the way it was built.

Micro-Contract Development solves this by introducing a simple but non-negotiable governance layer between the human operator and the AI agent. Every change to the codebase must be explicitly authorized by a written contract before execution begins. No contract, no code. The constraint sounds like it would slow you down. In practice, it's the reason you move fast — because you never have to stop, diagnose a mystery failure, untangle scope creep, or rebuild something that drifted from its intended purpose.

---

## The Core Insight: Constraints Create Velocity

This is counterintuitive, so it's worth explaining carefully.

Most people assume that process slows you down and that removing constraints lets you move faster. In traditional software development, there's some truth to this — heavyweight processes like excessive documentation, multi-layer approval chains, and rigid phase gates can absolutely slow a team down when the bottleneck is human implementation speed.

But AI-assisted development inverts this equation. When your "engineering team" can implement changes in seconds, the bottleneck is no longer implementation. The bottleneck is decision quality. Can you clearly define what should be built? Can you hold the scope to what was decided? Can you verify that what was built matches what was intended? Can you maintain a clean, traceable record of every deliberate choice?

Without structure, AI's speed becomes a liability. You move fast in the wrong direction. You add features nobody asked for because the AI suggested them and they seemed cool. You skip validation because the next feature is already being generated. You accumulate technical debt at machine speed instead of human speed.

MCD's constraints exist to protect the operator from AI's speed. They force a pause — not a long pause, sometimes just minutes — where the human explicitly decides what should happen next, writes it down, and then authorizes execution. That pause is where all the quality lives. The contract is the artifact that proves the pause happened and records what was decided.

The result is that you move fast *and* in the right direction, with a complete audit trail, clean git history, and the ability to roll back to any checkpoint if something goes wrong. Practitioners who use MCD report zero-defect outcomes and zero rollbacks — not because the AI never makes mistakes, but because the governance catches mistakes before they compound.

---

## The 4-Phase Lifecycle

MCD operates on a simple, repeating cycle with four phases. Every piece of work — from a single bug fix to a major feature — moves through this cycle.

### Phase 1: Evaluate

Before you build anything, you assess the current state. What exists today? What's working? What's broken? What does the project need next? What are the risks?

The Evaluate phase produces a document called evaluation findings. This is a written assessment — not code, not a prototype, not a proof of concept. It's the operator's analysis of the situation, informed by reviewing the codebase, consulting documentation, running the application, researching best practices, or whatever is appropriate for the specific question at hand.

The critical discipline here is that no code is written during Evaluate. The human is thinking, not building. This is the phase where architectural judgment, product instinct, and strategic thinking do their work. The AI can assist with research and analysis, but the findings represent the operator's assessment, not the AI's suggestion.

A key insight that emerged from stress-testing MCD across multiple domains is that the Evaluate phase sometimes reveals that the operator doesn't have enough knowledge to make a decision. When that happens, the operator doesn't skip ahead — they recognize the gap and route to an appropriate contract type. This is covered in the section on polymorphic contracts below.

### Phase 2: Contract

Once the evaluation is complete and the operator knows what should happen next, they write a Micro-Contract. This is the authorization document. It specifies, in plain language:

- What is being built or changed
- Which files will be affected
- What the acceptance criteria are (how do you know it's done?)
- What is explicitly out of scope (what are you choosing *not* to do?)
- Any constraints or technical requirements

The contract is a text file, stored in the project's contracts directory, with a timestamp prefix for traceability. It's written before any code is generated. The operator must review and approve the contract before execution begins. This is non-negotiable — it's the governance gate that prevents scope drift.

The contract doesn't need to be long. Some contracts are a few paragraphs. Complex features might warrant a page or two. The length matches the complexity of the work. What matters is that the scope is explicit, the acceptance criteria are defined, and the operator has deliberately authorized this specific piece of work.

Here's why this matters practically: when the AI starts executing and suggests "while we're here, we should also refactor this other thing," the contract is the answer. Is the refactor in the contract? No? Then it doesn't happen in this cycle. It goes into a future evaluation. The contract is the scope boundary that prevents the single most common failure mode in AI-assisted development: the gradual, unintentional expansion of scope that turns a focused change into an undocumented rewrite.

### Phase 3: Execute

With an approved contract in hand, the AI agent implements exactly what the contract specifies. Not more. Not less. Not "while we're here, let's also..." — exactly the contracted scope.

If the AI or the operator discovers during execution that the contract is insufficient — that the work requires changes not covered by the current scope — execution stops. The operator writes a contract amendment or a new contract. Then execution resumes. This is not bureaucracy. This is the mechanism that prevents the compounding errors that occur when scope changes are made without being explicitly authorized and recorded.

During execution, the AI operates with full creative and technical latitude within the contracted boundaries. MCD doesn't micromanage how the AI writes code. It governs what the AI is authorized to build. The AI can choose implementation patterns, select algorithms, structure files — all within the scope the contract defines. The constraint is on scope, not on craft.

### Phase 4: Closeout

When the contracted work is complete and passes its acceptance criteria, the operator closes the cycle:

1. The active contract is moved to the archive directory (contracts are immutable once archived — if there's an error, you write a new remediation contract)
2. A closeout record is written documenting what was delivered
3. A git commit is made with a standardized message format

The git commit is the formal closure. A version is not considered closed until the commit is executed. This gives the project a clean, traceable history where every commit corresponds to a completed contract, and every contract corresponds to an explicit decision.

After closeout, the cycle repeats. The next Evaluate phase assesses the new state of the project — which now includes everything delivered in the previous cycle — and the process continues.

---

## Polymorphic Contracts: The Discovery That Changed Everything

When MCD was first developed, it was applied primarily to software development. In that context, the Evaluate phase almost always produced findings that were sufficient to directly contract a production task — "build this feature," "fix this bug," "refactor this module." The routing decision from evaluation to contract type was invisible because it always resolved to the same answer: production contract.

Then MCD was applied to content production — a completely different domain — and the assumption broke. Content production routinely requires the operator to research topics they don't yet understand or synthesize scattered inputs into a coherent position before they can specify what should be produced. The evaluation reveals "I don't know enough to contract the final deliverable yet."

This stress test didn't break MCD. It revealed that the contract layer was always polymorphic — it supports multiple contract types, and the operator's judgment at the Review Findings stage determines which type is appropriate:

**Research Contract**: When evaluation reveals insufficient knowledge, the operator contracts a research task. "Go find out about X. Deliver findings in this format." The research executes, produces findings, and those findings become input to a new Evaluate cycle at the same depth.

**Synthesis Contract**: When abundant raw material exists but no consolidated position, the operator contracts a synthesis task. "Take these seven inputs and produce a coherent analysis." The synthesis executes, produces a consolidated artifact, and that artifact informs the next evaluation.

**Production Contract**: When findings are sufficient to specify the deliverable, the operator contracts production. "Build this feature according to these specifications." This is the contract type most people think of when they hear "MCD."

The routing decision — "Do I know enough to contract production, or do I need to contract research or synthesis first?" — is where the operator's judgment matters most. It's also what separates someone who can follow MCD steps from someone who truly understands the methodology. The phases are always the same. The contract type varies based on what the evaluation reveals. Cycle feeds cycle at the same depth until the operator has sufficient findings to contract the target deliverable.

This discovery means MCD isn't limited to software development. It's a general-purpose governance system for any domain where work benefits from structured evaluation, contracted scope, and quality-gated execution — including content production, technical writing, research projects, product design, and book authoring.

---

## The Governance Layer: GUARDRAILS

Every MCD project includes a GUARDRAILS document that establishes the non-negotiable rules for that specific project. The GUARDRAILS are generated automatically when the scaffold is initialized and are tailored to the project's name and codename.

The core guardrails that apply across all MCD projects include:

**No uncontracted code changes.** Every modification to the codebase must be authorized by an active contract. This is the foundational rule that makes everything else work. If there's no contract, there's no authorization, and no code gets written.

**Immutability of archived artifacts.** Once a contract is archived or a closeout record is written, it cannot be edited. If an error is discovered in an archived contract or closeout, the operator writes a new remediation contract. This preserves the integrity of the project's decision history — you can always trace back to what was decided, when, and why.

**Deterministic document naming.** All project documents use a timestamp prefix (YYYYMMDDHHMM-DOCUMENT_TITLE.md) for unambiguous ordering and traceability. You never have to guess which version of a document came first.

**Git discipline.** Closeout commits follow a standardized format. A version is not considered closed until the git commit is executed. This creates a one-to-one correspondence between completed contracts and commits in the version history.

The GUARDRAILS aren't suggestions. They're the governance mechanism that gives MCD its reliability. When the operator and the AI both operate within the guardrails, the output is predictable, traceable, and auditable. When someone skips a guardrail — "just this once, I'll make a quick change without a contract" — that's when errors compound and the audit trail breaks.

---

## The Command Deck: Operational Visibility

The MCD Starter Kit includes a fully operational project dashboard called the Command Deck. It's a local application — no cloud services, no accounts, no subscriptions — that runs on Python 3 and renders in your browser.

The Command Deck provides three views:

**The Board** is a Kanban board for managing work across the project lifecycle. Cards move between columns (Backlog, In Progress, Blocked, Review, Done), with support for milestones, priorities, due dates, and filtering. This is where the operator tracks what's being evaluated, what's contracted, what's in execution, and what's been closed out.

**The Dashboard** is a project telemetry panel. It includes an active phase indicator that infers the current development phase from card distribution, milestone burn-down progress bars, a live blockers feed, and a traceability feed showing the last eight git commits in real time. It also provides one-click access to rendered versions of the project's governance documents — the charter, the PRD, the guardrails, and the active contract — displayed as formatted Markdown with Mermaid diagram support.

**The MCD Guide** is a fully rendered, in-app view of the MCD Playbook — the complete operating manual for the methodology. It includes a "Why MCD?" button that opens an explanatory modal summarizing the core philosophy. This means the methodology documentation lives inside the tool, not in a separate wiki or document folder.

The Command Deck is initialized automatically when the project scaffold is created. It's pre-configured with the project's name, codename, and version. The Kanban board starts with columns that mirror the MCD lifecycle. The operator can customize it from there, but the starting structure reflects the methodology.

All state is stored locally in a JSON file within the project directory. There are no external dependencies, no database servers, and no network calls. The entire operations layer is version-controllable and portable.

---

## The Project Scaffold: Governance by Default

When the MCD Starter Kit initializes a new project, it creates a complete directory structure designed to support the methodology from day one. This isn't an empty folder you have to organize yourself — it's a governance-ready workspace where every artifact has a designated home.

The structure includes:

- **Governance** — where the GUARDRAILS and MCD Playbook live
- **Strategy** — where the Project Charter and High-Level PRD are stored
- **Architecture** — where system architecture documents and primitive definitions go
- **Contracts** — split into active (currently in execution) and archive (completed and immutable)
- **Analysis** — where evaluation findings and analysis scripts are kept
- **Records** — where build logs, chat logs, and documentation accumulate over the life of the project

This structure means that from the very first moment of the project, there's a place for everything. When the operator writes evaluation findings, they go in Analysis. When they write a contract, it goes in Contracts/active. When they close it out, it moves to Contracts/archive. Build logs accumulate in Records. The project's history builds itself as a natural byproduct of following the methodology.

The scaffold also initializes a git repository and creates the first commit, establishing a clean provenance baseline. From that point forward, every closeout commit adds to a traceable history that corresponds to completed contracts.

---

## Who MCD Is For

MCD was designed for solo operators building software with AI agents — product managers, designers, technical founders, and other professionals who have deep domain expertise and product judgment but who aren't traditional software engineers. These are people who know what should be built but historically couldn't build it themselves because the implementation bottleneck was in the way.

AI removed that bottleneck. But removing the bottleneck exposed a new problem: without the discipline that professional software engineering teams have built up over decades — code review, pull request workflows, sprint planning, QA processes — the solo operator building with AI has no governance layer. MCD provides that governance layer.

That said, MCD is equally applicable to professional developers who work with AI agents. The governance benefits — explicit scope, traceable decisions, clean git history, zero scope drift — are valuable regardless of whether the operator can write code manually. The methodology governs the process, not the operator's skill set.

The methodology also scales beyond software. Any domain where work benefits from the cycle of evaluating the current state, explicitly contracting the next piece of work, executing against that contract, and formally closing out the deliverable — content production, technical writing, research, product design — can apply MCD principles. The polymorphic contract types (research, synthesis, production) make this cross-domain application practical rather than theoretical.

---

## The Evidence: What MCD Produces in Practice

The methodology has been validated across a portfolio of projects spanning multiple technology stacks and domains:

- A WordPress SEO plugin achieved zero defects on the WordPress.org Plugin Check compliance audit — a rigorous automated assessment covering security, escaping, sanitization, naming conventions, and coding standards. The remediation arc went from 522 compliance findings to zero. Not approximately zero. Zero. This was the operator's first independently shipped piece of software.

- An AI orchestration engine for automated content production embedded three different AI models (Perplexity for research, Claude for creative writing, GPT-4o for structured logic) governed by contract-first JSON schemas and gated workflows — built across three development sessions using MCD.

- An enterprise application infrastructure platform providing IAM, multi-tenancy, RBAC/ABAC permissions, billing, subscriptions, and AI orchestration was designed and initiated using MCD governance with a polyglot technology stack (PostgreSQL, Redis, Docker, Kubernetes).

- Projects spanning PHP, Swift, Rust, Python, JavaScript, and SQL have all been governed by the same methodology, demonstrating that MCD is stack-agnostic. The governance operates at the process layer, not the implementation layer.

Across all MCD-governed projects: zero defects on external compliance audits, zero rollbacks due to scope drift, and extraordinary development velocity — not despite the governance overhead, but because of it.

---

## Why "Reasonable Constraints" Is the Right Frame

The phrase "reasonable constraints" captures something important about MCD's philosophy. The methodology doesn't impose constraints for the sake of rigor. Every constraint exists because removing it leads to a specific, documented failure mode:

- Remove the contract requirement, and scope drifts without anyone noticing until something breaks
- Remove the immutability rule, and the project's decision history becomes unreliable
- Remove the git discipline, and there's no clean checkpoint to roll back to when errors occur
- Remove the evaluation phase, and the operator starts building before understanding what the project actually needs
- Remove the closeout formality, and half-finished work accumulates without clear boundaries between what's done and what isn't

Each constraint prevents a specific failure. None of them exist because "process is good." They exist because the absence of that specific constraint has been observed to produce that specific problem. The constraints are reasonable because they're proportional to the risks they mitigate.

And because AI handles the implementation, the time cost of the governance is minimal relative to the total development cycle. Writing a contract takes minutes. Executing the contract takes minutes. The governance overhead is a small fraction of the total effort, but it's the fraction that determines whether the output is professional-grade software or an untraceable collection of AI-generated code.

MCD doesn't slow you down. It's the reason you can move fast with confidence — because every step is deliberate, every decision is recorded, and every change is authorized. The constraints are the foundation the speed is built on.

---

## The MCD Starter Kit: From Methodology to Practice

The MCD Starter Kit is a VS Code extension that installs the complete MCD governance environment from an empty folder in seconds. One command. Four prompts — project name, codename, initial version, and Command Deck port. That's it.

After those four inputs, the extension creates the full directory scaffold, generates the GUARDRAILS and Playbook tailored to the project, initializes the Command Deck with the project's configuration, runs git init, creates the first commit, starts the Command Deck server, and opens the dashboard in the browser.

The operator goes from an empty folder to a fully governed, operationally visible project environment in under a minute. The next step is to begin the first Evaluate phase. There is no setup friction between deciding to build something and having the governance infrastructure in place to build it well.

The entire system runs locally. Python 3 is the only external runtime requirement, and the Command Deck uses only Python's standard library — no pip install is ever needed. The Command Deck frontend is Vanilla JavaScript, HTML, and CSS. No React, no Vue, no build tools, no node_modules. Everything is version-controllable, portable, and inspectable.

This is the methodology, packaged as a tool, delivered where the work happens.
