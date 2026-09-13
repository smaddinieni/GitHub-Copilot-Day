export type AgentRole = "Supervisor" | "Builder";
export type ImplementationGate = "HOLD" | "APPROVED";

export type TranscriptMessage = {
  id: string;
  sequence: number;
  sourceId: string;
  sourceOrder: number;
  sender: AgentRole;
  recipient: AgentRole;
  stage?: string;
  status?: string;
  type?: string;
  permission?: string;
  metadata: Record<string, string>;
  rawSection: string;
  body: string;
  displayContent: string;
};

export type TranscriptDiagnostic = {
  code:
    | "malformed-heading"
    | "unknown-role"
    | "unknown-metadata"
    | "unknown-permission"
    | "duplicate-sequence"
    | "out-of-order-sequence";
  message: string;
  section: number;
};

export type ParseResult = {
  messages: TranscriptMessage[];
  diagnostics: TranscriptDiagnostic[];
};

export type TranscriptState = {
  currentGate: ImplementationGate | null;
  messageCount: number;
  reviewCount: number;
  evidenceCount: number;
};
