import type {
  AgentRole,
  ImplementationGate,
  ParseResult,
  TranscriptDiagnostic,
  TranscriptMessage,
  TranscriptState,
} from "./types";

const headingPattern =
  /^##\s+Message\s+(\d+)\s*(?:-|–|—)\s*(.+?)\s+to\s+(.+?)\s*$/i;
const sectionPattern = /^##\s+Message\b.*$/gim;
const metadataPattern = /^\s*\*\*([^*:\r\n]+?)\s*:\*\*\s*([^\r\n]+?)\s*$/m;
const fencePattern = /^\s*(`{3,}|~{3,})/;
const knownMetadata = new Set([
  "stage",
  "status",
  "implementation permission",
  "type",
  "evidence",
  "approval",
]);

function normalizeRole(value: string): AgentRole | undefined {
  const alias = value.trim().replace(/\s+/g, " ").toLowerCase();

  if (alias === "supervisor" || alias === "codex supervisor") {
    return "Supervisor";
  }

  if (alias === "builder" || alias === "github copilot builder") {
    return "Builder";
  }

  return undefined;
}

function deriveContent(
  body: string,
  section: number,
  diagnostics: TranscriptDiagnostic[],
) {
  const metadata: Record<string, string> = {};
  const displayLines: string[] = [];
  let fenceMarker: "`" | "~" | undefined;

  for (const line of body.split(/\r?\n/)) {
    const fence = line.match(fencePattern);
    if (fence) {
      const marker = fence[1][0] as "`" | "~";
      if (!fenceMarker) {
        fenceMarker = marker;
      } else if (fenceMarker === marker) {
        fenceMarker = undefined;
      }
      displayLines.push(line);
      continue;
    }

    const match = !fenceMarker ? line.match(metadataPattern) : null;
    if (!match) {
      displayLines.push(line);
      continue;
    }

    const label = match[1];
    const key = label.trim().toLowerCase();
    const value = match[2].trim();
    metadata[key] = value;

    if (!knownMetadata.has(key)) {
      diagnostics.push({
        code: "unknown-metadata",
        message: `Unknown metadata field: ${label.trim()}`,
        section,
      });
    }
  }

  return { metadata, displayContent: displayLines.join("\n").trim() };
}

export function parseTranscript(transcript: string): ParseResult {
  const diagnostics: TranscriptDiagnostic[] = [];
  const messages: TranscriptMessage[] = [];
  const headings = [...transcript.matchAll(sectionPattern)];
  const seenSequences = new Set<number>();
  let previousSequence: number | undefined;

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const start = heading.index ?? 0;
    const end = headings[index + 1]?.index ?? transcript.length;
    const section = index + 1;
    const title = heading[0];
    const match = title.match(headingPattern);

    if (!match) {
      diagnostics.push({
        code: "malformed-heading",
        message: `Malformed message heading: ${title}`,
        section,
      });
      continue;
    }

    const sender = normalizeRole(match[2]);
    const recipient = normalizeRole(match[3]);

    if (!sender || !recipient) {
      diagnostics.push({
        code: "unknown-role",
        message: `Unknown message role in: ${title}`,
        section,
      });
      continue;
    }

    const body = transcript
      .slice(start + title.length, end)
      .replace(/^(?:\r?\n)+/, "")
      .trimEnd();
    const { metadata, displayContent } = deriveContent(
      body,
      section,
      diagnostics,
    );
    const permission = metadata["implementation permission"];
    const sequence = Number(match[1]);

    if (seenSequences.has(sequence)) {
      diagnostics.push({
        code: "duplicate-sequence",
        message: `Duplicate message number: ${match[1]}`,
        section,
      });
    }

    if (previousSequence !== undefined && sequence < previousSequence) {
      diagnostics.push({
        code: "out-of-order-sequence",
        message: `Out-of-order message number: ${match[1]}`,
        section,
      });
    }

    seenSequences.add(sequence);
    previousSequence = sequence;

    if (
      permission &&
      !/\bhold\b|\bimplementation approved\b/i.test(permission)
    ) {
      diagnostics.push({
        code: "unknown-permission",
        message: `Unknown implementation permission: ${permission}`,
        section,
      });
    }

    messages.push({
      id: match[1],
      sequence,
      sourceId: `source-${section}`,
      sourceOrder: section,
      sender,
      recipient,
      stage: metadata.stage,
      status: metadata.status,
      type: metadata.type,
      permission,
      metadata,
      rawSection: transcript.slice(start, end),
      body,
      displayContent,
    });
  }

  return { messages, diagnostics };
}

export function getChronologicalMessages(
  messages: TranscriptMessage[],
): TranscriptMessage[] {
  return [...messages].sort(
    (left, right) =>
      left.sequence - right.sequence || left.sourceOrder - right.sourceOrder,
  );
}

export function deriveTranscriptState(
  messages: TranscriptMessage[],
): TranscriptState {
  const chronologicalMessages = getChronologicalMessages(messages);
  const currentGate = normalizeGate(
    [...chronologicalMessages].reverse().find((message) => message.permission)
      ?.permission,
  );
  const reviewCount = messages.filter(
    (message) =>
      message.sender === "Supervisor" &&
      message.recipient === "Builder" &&
      /review|revision|changes requested/i.test(
        `${message.status ?? ""} ${message.type ?? ""}`,
      ),
  ).length;
  const evidenceCount = messages.filter(
    (message) =>
      message.metadata.evidence !== undefined ||
      message.metadata.approval !== undefined,
  ).length;

  return {
    currentGate,
    messageCount: messages.length,
    reviewCount,
    evidenceCount,
  };
}

function normalizeGate(
  permission: string | undefined,
): ImplementationGate | null {
  if (!permission) {
    return null;
  }

  if (/\bimplementation approved\b/i.test(permission)) {
    return "APPROVED";
  }

  return /\bhold\b/i.test(permission) ? "HOLD" : null;
}
