import { describe, expect, it } from "vitest";
import {
  deriveTranscriptState,
  getChronologicalMessages,
  parseTranscript,
} from "./transcript";

describe("parseTranscript", () => {
  it.each(["-", "–", "—"])(
    "parses %s as a message-heading separator",
    (separator) => {
      const result = parseTranscript(
        `## Message 1 ${separator} Supervisor to Builder`,
      );

      expect(result.messages).toHaveLength(1);
    },
  );

  it.each([
    ["Codex Supervisor", "Supervisor"],
    ["GitHub Copilot Builder", "Builder"],
  ])("normalizes the %s role alias", (alias, canonicalRole) => {
    const result = parseTranscript(`## Message 1 - ${alias} to Builder`);

    expect(result.messages[0].sender).toBe(canonicalRole);
  });

  it("normalizes a leading-zero message ID to a numeric sequence", () => {
    const result = parseTranscript(`## Message 001 - Supervisor to Builder`);

    expect(result.messages[0]).toMatchObject({ id: "001", sequence: 1 });
  });

  it("extracts permission text without changing its display value", () => {
    const result = parseTranscript(`## Message 1 - Supervisor to Builder
**Implementation permission:** HOLD for evidence`);

    expect(result.messages[0].permission).toBe("HOLD for evidence");
  });

  it("parses a canonical bold metadata field", () => {
    const result = parseTranscript(`## Message 1 - Supervisor to Builder
**Status:** Ready for review`);

    expect(result.messages[0].metadata.status).toBe("Ready for review");
  });

  it("preserves raw sections while removing canonical metadata from display content", () => {
    const result = parseTranscript(`## Message 1 - Supervisor to Builder
**Stage:** Review
**Status:** Ready

- Preserve this list item.
https://example.test/path:8443

\`\`\`ts
type Gate = { currentGate: "HOLD" };
\`\`\``);

    expect(result.messages[0].rawSection).toContain("**Stage:** Review");
    expect(result.messages[0].displayContent).toBe(`- Preserve this list item.
https://example.test/path:8443

\`\`\`ts
type Gate = { currentGate: "HOLD" };
\`\`\``);
  });

  it("preserves metadata-shaped lines inside backtick fences as display content", () => {
    const result = parseTranscript(`## Message 1 - Supervisor to Builder
\`\`\`md
**Status:** simulated
\`\`\``);

    expect(result.messages[0].metadata).toEqual({});
    expect(result.messages[0].displayContent).toContain(
      "**Status:** simulated",
    );
  });

  it("preserves metadata-shaped lines inside tilde fences as display content", () => {
    const result = parseTranscript(`## Message 1 - Supervisor to Builder
~~~md
**Status:** simulated
~~~`);

    expect(result.messages[0].metadata).toEqual({});
    expect(result.messages[0].displayContent).toContain(
      "**Status:** simulated",
    );
  });

  it("extracts real metadata outside fences while preserving fenced examples", () => {
    const result = parseTranscript(`## Message 1 - Supervisor to Builder
**Status:** Ready

\`\`\`md
**Status:** simulated
\`\`\``);

    expect(result.messages[0].metadata.status).toBe("Ready");
    expect(result.messages[0].displayContent).toBe(`\`\`\`md
**Status:** simulated
\`\`\``);
  });

  it("preserves an unknown bold metadata field and reports one diagnostic", () => {
    const result = parseTranscript(`## Message 1 - Builder to Supervisor
**Future field:** preserved`);

    expect(result.messages[0].metadata["future field"]).toBe("preserved");
    expect(
      result.diagnostics.filter(
        (diagnostic) => diagnostic.code === "unknown-metadata",
      ),
    ).toHaveLength(1);
  });

  it("does not classify prose, lists, URLs, or fenced TypeScript as metadata", () => {
    const result = parseTranscript(`## Message 1 - Supervisor to Builder
Narrative: must remain body text.
- Item: must remain body text.
https://example.test/path:8443/resource
\`\`\`ts
type Gate = { currentGate: "HOLD" | null };
\`\`\``);

    expect(result.messages[0].metadata).toEqual({});
    expect(result.diagnostics).toEqual([]);
  });

  it("parses a representative multi-message board excerpt without false metadata diagnostics", () => {
    const result =
      parseTranscript(`## Message 001 - Codex Supervisor to GitHub Copilot Builder
**Stage:** Discovery and feasibility
**Implementation permission:** HOLD - do not create files.

### Product objective
- Transcript contract: preserve body text.

## Message 002 — GitHub Copilot Builder to Codex Supervisor
**Status:** Ready for approval

\`\`\`ts
type AgentMessage = { id: string; sequence: number };
\`\`\``);

    expect(result.messages).toHaveLength(2);
    expect(result.diagnostics).toEqual([]);
  });

  it("preserves body text as inert text", () => {
    const body = "<script>never execute()</script>";
    const result = parseTranscript(
      `## Message 1 - Supervisor to Builder\n\n${body}`,
    );

    expect(result.messages[0].body).toBe(body);
  });

  it("recovers valid messages after a malformed heading", () => {
    const result = parseTranscript(`## Message unknown - Supervisor to Builder

## Message 2 - Builder to Supervisor`);

    expect(result.messages.map((message) => message.sequence)).toEqual([2]);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "malformed-heading" }),
      ]),
    );
  });

  it("recovers valid messages after an unknown role", () => {
    const result = parseTranscript(`## Message 1 - Unknown Agent to Builder

## Message 2 - Builder to Supervisor`);

    expect(result.messages.map((message) => message.sequence)).toEqual([2]);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unknown-role" }),
      ]),
    );
  });

  it("preserves duplicate messages with unique source identities and diagnoses audit anomalies", () => {
    const result = parseTranscript(`## Message 2 - Supervisor to Builder
**Implementation permission:** HOLD

## Message 1 - Builder to Supervisor

## Message 2 - Supervisor to Builder
**Implementation permission:** IMPLEMENTATION APPROVED`);

    expect(result.messages.map((message) => message.sourceId)).toEqual([
      "source-1",
      "source-2",
      "source-3",
    ]);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining(["out-of-order-sequence", "duplicate-sequence"]),
    );
  });

  it("orders messages by sequence then source order and derives latest state chronologically", () => {
    const result = parseTranscript(`## Message 2 - Supervisor to Builder
**Implementation permission:** IMPLEMENTATION APPROVED

## Message 1 - Builder to Supervisor
**Implementation permission:** HOLD

## Message 2 - Supervisor to Builder
**Implementation permission:** HOLD`);

    expect(
      getChronologicalMessages(result.messages).map(
        (message) => message.sourceId,
      ),
    ).toEqual(["source-2", "source-1", "source-3"]);
    expect(deriveTranscriptState(result.messages).currentGate).toBe("HOLD");
  });
});

describe("deriveTranscriptState", () => {
  it("normalizes an explicit HOLD permission to the HOLD gate", () => {
    const result = parseTranscript(`## Message 1 - Supervisor to Builder
**Implementation permission:** HOLD pending checks`);

    expect(deriveTranscriptState(result.messages).currentGate).toBe("HOLD");
  });

  it("uses the latest explicit permission to derive the current gate", () => {
    const result = parseTranscript(`## Message 1 - Supervisor to Builder
**Implementation permission:** HOLD pending checks

## Message 2 - Supervisor to Builder
**Implementation permission:** IMPLEMENTATION APPROVED - Phase 1`);

    expect(deriveTranscriptState(result.messages).currentGate).toBe("APPROVED");
  });

  it("counts Supervisor-to-Builder reviews identified by status", () => {
    const result = parseTranscript(`## Message 1 - Supervisor to Builder
**Status:** Changes requested

## Message 2 - Supervisor to Builder
**Type:** Revision`);

    expect(deriveTranscriptState(result.messages).reviewCount).toBe(2);
  });

  it("does not count review metadata flowing from Builder to Supervisor", () => {
    const result = parseTranscript(`## Message 1 - Builder to Supervisor
**Status:** Review complete`);

    expect(deriveTranscriptState(result.messages).reviewCount).toBe(0);
  });

  it("counts only explicit evidence and approval metadata", () => {
    const result = parseTranscript(`## Message 1 - Builder to Supervisor
Evidence appears only in prose.

## Message 2 - Builder to Supervisor
**Evidence:** Parser tests passed

## Message 3 - Supervisor to Builder
**Approval:** Verified`);

    expect(deriveTranscriptState(result.messages).evidenceCount).toBe(2);
  });
});
