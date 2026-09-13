import { describe, expect, it } from "vitest";
import { demoTranscript } from "../fixtures/demoTranscript";
import { parseTranscript } from "../domain/transcript";
import {
  createExhibitState,
  loadExhibitTranscript,
  resetToDemo,
  selectMessage,
} from "./exhibit";

describe("demo transcript", () => {
  it("parses the bundled demonstration without diagnostics", () => {
    const result = parseTranscript(demoTranscript);

    expect(result.messages).toHaveLength(5);
    expect(result.diagnostics).toEqual([]);
  });
});

describe("exhibit selection", () => {
  it("starts with the first message selected and selects a requested message", () => {
    const messages = parseTranscript(demoTranscript).messages;
    const initialState = createExhibitState(messages);

    expect(initialState.selectedMessageId).toBe("source-1");
    expect(selectMessage(initialState, "source-4").selectedMessageId).toBe(
      "source-4",
    );
  });

  it("loads partial-valid pasted content in memory and resets deterministic selection", () => {
    const current = parseTranscript(demoTranscript).messages;
    const loaded = loadExhibitTranscript(
      current,
      `## Message bad - Supervisor to Builder

## Message 007 - Builder to Supervisor
**Status:** Ready`,
      "Pasted transcript",
    );

    expect(loaded.messages).toHaveLength(1);
    expect(loaded.sourceLabel).toBe("Pasted transcript");
    expect(loaded.selectedMessageId).toBe("source-2");
    expect(loaded.diagnostics).toHaveLength(1);
  });

  it("loads valid imported file content through the shared in-memory boundary", () => {
    const current = parseTranscript(demoTranscript).messages;
    const loaded = loadExhibitTranscript(
      current,
      "## Message 009 - Builder to Supervisor\n**Status:** Imported",
      "Imported: audit.md",
    );

    expect(loaded.sourceLabel).toBe("Imported: audit.md");
    expect(loaded.messages[0].id).toBe("009");
    expect(loaded.selectedMessageId).toBe("source-1");
  });

  it("rejects an invalid transcript and keeps the current exhibit", () => {
    const current = parseTranscript(demoTranscript).messages;
    const loaded = loadExhibitTranscript(
      current,
      "No messages here.",
      "Pasted transcript",
    );

    expect(loaded.messages).toBe(current);
    expect(loaded.error).toContain("No valid messages");
  });

  it("rejects content larger than one MiB", () => {
    const current = parseTranscript(demoTranscript).messages;
    const loaded = loadExhibitTranscript(
      current,
      "x".repeat(1024 * 1024 + 1),
      "Imported file",
    );

    expect(loaded.error).toContain("1 MiB");
  });

  it("resets the exhibit to the bundled demo", () => {
    const reset = resetToDemo();

    expect(reset.sourceLabel).toBe("Bundled demonstration");
    expect(reset.selectedMessageId).toBe("source-1");
  });
});
