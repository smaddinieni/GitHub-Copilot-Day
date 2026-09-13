# Agent Airlock

Live demo: https://smaddinieni.github.io/GitHub-Copilot-Day/

Agent Airlock is a local-first web exhibit for a coding workflow where agents have deliberately separate duties. The Supervisor plans and reviews but cannot implement. The Builder implements approved work but cannot change requirements. Their Markdown transcript provides the audit trail.

## Features

- First load shows the repository's own `agentsMessageBoard.md`, bundled at build time via Vite `?raw`, so the exhibit opens on the real audit trail.
- Chronological two-lane handoff timeline with message inspection and workflow telemetry.
- Paste and `.md`/plain-text import with recoverable diagnostics.
- Duplicate and out-of-order sequence detection without dropping valid entries.
- Reset restores the bundled `Repository message board`. Transcript data stays in memory only.

## Local commands

```sh
npm.cmd install
npm.cmd run dev
npm.cmd run test -- --run
npm.cmd run build
```

## Architecture

- `src/domain/`: pure transcript types, parsing, diagnostics, ordering, and derived state.
- `src/app/`: in-memory exhibit state and loading boundaries.
- `src/components/`: timeline, inspector, role boundaries, telemetry, transcript controls, and site footer.
- `src/fixtures/`: the build-time repository-board import plus a small sample fixture used only by tests.

## Transcript format

Use a message heading such as `## Message 001 - Supervisor to Builder`, followed by optional canonical metadata lines such as `**Status:** Ready`. The parser supports `-`, en-dash, and em-dash heading separators; known Supervisor and Builder aliases; and preserves unrecognized content as inert text. It records malformed, duplicate, out-of-order, and unknown-field conditions as non-fatal diagnostics.

## Privacy and security

There is no backend, authentication, storage, analytics, network transmission, external service, or AI API. Imports are held only in memory. Transcript content is rendered as text rather than executed HTML or Markdown.

## Accessibility

The interface uses native keyboard controls, visible focus states, accessible labels, polite status announcements, responsive desktop/mobile layouts, and reduced-motion support.

## Known limitations

Filtering, persistence, routing, backend services, analytics, and external integrations are intentionally out of scope. The parser recognizes the documented transcript convention rather than implementing all Markdown.

## Attribution

Implemented with GitHub Copilot. Planned and reviewed by Codex. Human directed.

## Suggested post

Suggested sweepstakes post only; it has not been posted or submitted:

`Agent Airlock demonstrates a local-first, auditable separation-of-duties workflow for coding agents. #githubcopilotdaycontest #sweepstakes`
