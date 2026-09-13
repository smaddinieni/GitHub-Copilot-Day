import {
  getChronologicalMessages,
  parseTranscript,
} from "../domain/transcript";
import type { TranscriptDiagnostic, TranscriptMessage } from "../domain/types";
import {
  REPOSITORY_SOURCE_LABEL,
  repositoryTranscript,
} from "../fixtures/repositoryTranscript";

export const MAX_TRANSCRIPT_BYTES = 1024 * 1024;

export { REPOSITORY_SOURCE_LABEL, repositoryTranscript };

export type ExhibitState = {
  selectedMessageId: string | null;
};

export type ExhibitLoadResult = ExhibitState & {
  messages: TranscriptMessage[];
  diagnostics: TranscriptDiagnostic[];
  sourceLabel: string;
  error?: string;
};

export function createExhibitState(
  messages: TranscriptMessage[],
): ExhibitState {
  return {
    selectedMessageId: getChronologicalMessages(messages)[0]?.sourceId ?? null,
  };
}

export function selectMessage(
  state: ExhibitState,
  messageId: string,
): ExhibitState {
  return { ...state, selectedMessageId: messageId };
}

export function loadExhibitTranscript(
  currentMessages: TranscriptMessage[],
  content: string,
  sourceLabel: string,
): ExhibitLoadResult {
  if (new TextEncoder().encode(content).byteLength > MAX_TRANSCRIPT_BYTES) {
    return {
      messages: currentMessages,
      diagnostics: [],
      sourceLabel: "Current exhibit",
      selectedMessageId: createExhibitState(currentMessages).selectedMessageId,
      error: "Transcript exceeds the 1 MiB limit.",
    };
  }

  const parsed = parseTranscript(content);
  if (parsed.messages.length === 0) {
    return {
      messages: currentMessages,
      diagnostics: parsed.diagnostics,
      sourceLabel: "Current exhibit",
      selectedMessageId: createExhibitState(currentMessages).selectedMessageId,
      error: "No valid messages found. The current exhibit is unchanged.",
    };
  }

  return {
    messages: getChronologicalMessages(parsed.messages),
    diagnostics: parsed.diagnostics,
    sourceLabel,
    selectedMessageId: createExhibitState(parsed.messages).selectedMessageId,
  };
}

export function resetToRepositoryBoard(): ExhibitLoadResult {
  const parsed = parseTranscript(repositoryTranscript);
  return {
    messages: getChronologicalMessages(parsed.messages),
    diagnostics: parsed.diagnostics,
    sourceLabel: REPOSITORY_SOURCE_LABEL,
    selectedMessageId: createExhibitState(parsed.messages).selectedMessageId,
  };
}
