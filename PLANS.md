# ExecPlan Standard

An ExecPlan is a self-contained implementation plan for work that is too large or risky to track only in conversation.

## When an ExecPlan Is Required

Use an ExecPlan for:

- multi-page features
- architecture changes
- dependency migrations
- backend integration
- large animation refactors
- admin CRUD completion
- data-model migrations
- tasks spanning multiple implementation sessions

## ExecPlan Location

Active plans live in `plans/active/`.

Completed plans live in `plans/completed/`.

Move completed plans only after validation and a final result have been recorded.

## Required ExecPlan Sections

Every plan must contain:

- Title
- Status
- Objective
- User-visible outcome
- Current state
- Scope
- Non-goals
- Relevant files
- Dependencies
- Data-model changes
- Implementation stages
- Progress checklist
- Discoveries
- Decisions
- Risks
- Validation
- Rollback strategy
- Final result

## Plan Maintenance

Codex must:

- update Progress while working
- record discoveries as they happen
- record decisions that affect future work
- keep the plan self-contained
- move completed plans to `plans/completed/`
- not mark a plan completed before validation

## Reusable Template

```markdown
# Title

Status: Draft | Active | Blocked | Complete

## Objective

Describe the concrete result this plan will deliver.

## User-Visible Outcome

Describe what the user will see or be able to do after the work is complete.

## Current State

Summarize the existing implementation and known limitations.

## Scope

List what is included.

## Non-Goals

List what is intentionally excluded.

## Relevant Files

List source files, docs, assets, routes, and tests that matter.

## Dependencies

List package, API, data, asset, or environment dependencies.

## Data-Model Changes

Describe model, storage, migration, or seed-data changes.

## Implementation Stages

1. Stage name and intent.
2. Stage name and intent.
3. Stage name and intent.

## Progress Checklist

- [ ] Item
- [ ] Item
- [ ] Item

## Discoveries

Record facts learned during implementation.

## Decisions

Record decisions and link to `docs/DECISIONS.md` when the decision should persist.

## Risks

List technical, UX, performance, accessibility, or migration risks.

## Validation

List commands and manual checks required before completion.

## Rollback Strategy

Explain how to revert or disable the change safely.

## Final Result

Fill this only after validation passes.
```
