import { describe, expect, it } from "vitest";
import { parseTranscript } from "../domain/transcript";
import {
  REPOSITORY_SOURCE_LABEL,
  repositoryTranscript,
  resetToRepositoryBoard,
} from "./exhibit";

describe("repository board as the production default", () => {
  it("bundles the repository board and parses more than five messages", () => {
    const parsed = parseTranscript(repositoryTranscript);

    expect(parsed.messages.length).toBeGreaterThan(5);
  });

  it("includes Message 046 from the repository board", () => {
    const parsed = parseTranscript(repositoryTranscript);

    expect(parsed.messages.some((message) => message.id === "046")).toBe(true);
  });

  it("labels and resets first load to the repository message board", () => {
    const result = resetToRepositoryBoard();

    expect(REPOSITORY_SOURCE_LABEL).toBe("Repository message board");
    expect(result.sourceLabel).toBe("Repository message board");
    expect(result.messages.length).toBeGreaterThan(5);
    expect(result.messages.some((message) => message.id === "046")).toBe(true);
  });
});