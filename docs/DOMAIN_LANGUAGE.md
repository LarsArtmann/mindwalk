# Domain Language

> Glossary of the ubiquitous language used throughout mindwalk. Terms here
> shape how we interpret code, write tests, and document features. When a
> term appears in code, it means what this document says it means.

## The three primary artifacts

| Term        | Definition                                                                                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trace**   | The normalized, source-agnostic record of what happened during one coding-agent session. Built from adapter output; the judge reads only the trace, never raw session logs. |
| **Citymap** | A deterministic 3D "code city" layout of the repository being edited. Files become blocks sized by line/byte weight, arranged via squarified treemap.                       |
| **Report**  | An LLM-assisted evaluation of one trace. The judge contributes findings and narrative; verdicts are always derived mechanically from finding severities.                    |

## Session and trace

| Term        | Definition                                                                                                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Session** | One agent conversation: a sequence of messages and tool calls from one coding-agent run. Identified by harness + id.                                                         |
| **Harness** | The source coding-agent product the session originated from: Claude Code, Codex, pi, or Crush.                                                                               |
| **Adapter** | A package-boundary converter that turns one source agent session format into the shared `Trace`. Every source stays behind its adapter; parsing never knows about rendering. |
| **Event**   | A single normalized tool action in a trace — the atomic unit of playback. Carries `Tool`, `Action`, `Targets`, and metadata.                                                 |
| **Target**  | A file or resource an event acted upon. Has a `Path`, `Touch` descriptor, optional `Lines` ranges, and a `Weak` flag.                                                        |
| **Touch**   | The kind of contact an event made with a target: read, edit, search, exec, or verify.                                                                                        |
| **Mark**    | A non-tool signal stamped onto the trace: user messages, compactions, subagent launches, thinking durations, finish reasons, model switches.                                 |
| **Stats**   | Derived aggregate metrics for a trace: file coverage (fovea/parafovea/edited), error rate, regression rate, churn, observability grades.                                     |

## File coverage vocabulary

| Term              | Definition                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Fovea**         | Files deeply attended by the agent (the central focus band). Borrowed from vision.                                                       |
| **Parafovea**     | Files in the surrounding attended ring — visited but not deeply modified.                                                                |
| **Edited**        | Files that received at least one edit event.                                                                                             |
| **Ghost**         | A citymap file the trace touched but that no longer exists on disk. Synthesized from trace targets so the session footprint is complete. |
| **Observability** | A per-metric grade: `exact` (structurally recorded), `estimated` (inferred from text), or `unavailable` (no signal).                     |

## Agent graph

| Term                  | Definition                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Agent Graph**       | A computed tree of the main agent and its subagents for one session. Persisted to `~/.mindwalk/agent-graphs/`.                    |
| **AgentNode**         | One node in the graph: main agent or subagent, with trace-link metadata.                                                          |
| **Link Quality**      | How confidently a subagent was linked to its parent: `exact` (structural id match), `derived` (inferred), or `unavailable`.       |
| **Link Method**       | The specific linkage strategy: `codex-agent-id`, `claude-tool-use-id`, `crush-agent-id`, `claude-subagents-directory`, or `root`. |
| **TraceAvailability** | Whether a node's own trace was recoverable: `available`, `missing`, or `unavailable`.                                             |

## Evaluation

| Term          | Definition                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Judge**     | A sealed local agent CLI (`claude`, `codex`, or `crush`) invoked over a rendered evidence document. Gets no tools, no user config; never decides verdicts.     |
| **Dimension** | One of four fixed evaluation axes enforced by Go: `exploration`, `scope`, `wandering`, `verification`.                                                         |
| **Verdict**   | The rolled-up status of a dimension or criterion, derived mechanically from finding severities: `good`, `warning`, `problem`, or `insufficient-data`.          |
| **Severity**  | Per-finding impact grade the judge assigns: `info`, `warning`, or `problem`. The highest severity determines the verdict.                                      |
| **Finding**   | An evidence-backed claim the judge makes. Must cite at least one real trace event seq; evidence-less findings are dropped at parse time.                       |
| **Rubric**    | The task-accounting layer: session-specific criteria generated before scoring, grouped by tasks the judge enumerated from user messages.                       |
| **Criterion** | A single checkable item under a rubric task. Scored with `Coverage` and `Verdict`, backed by findings.                                                         |
| **Coverage**  | Whether the log can evidence a criterion: `sufficient`, `partial`, or `none`. A criterion with no evidence rolls up to `insufficient-data` instead of warning. |
| **Evidence**  | The trace rendered into text that the judge reads. Fingerprinted by `InputDigest` for staleness detection. Treated as untrusted input.                         |

## Bounded-context notes

Terms that mean something different depending on where you encounter them:

| Term        | Trace context                                     | Report context                   | Citymap context                                 |
| ----------- | ------------------------------------------------- | -------------------------------- | ----------------------------------------------- |
| **Event**   | A normalized tool action in the playback timeline | — (not used)                     | Drives which files are marked as visited/edited |
| **Mark**    | A lifecycle signal on the timeline                | — (not used)                     | — (not used)                                    |
| **Touch**   | How an event contacted a file (read/edit/etc.)    | — (not used)                     | Determines file coloring (seen/read/edited)     |
| **Target**  | A file/resource an event acted upon               | — (not used)                     | Mapped to a `CityFile` by path                  |
| **Session** | The conversation being replayed                   | The session the report evaluates | — (the repo is what matters, not the session)   |
