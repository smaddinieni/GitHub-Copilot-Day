import type { TranscriptState } from "../domain/types";

export function Telemetry({ state }: { state: TranscriptState }) {
  const gate = state.currentGate ?? "NO GATE";

  return (
    <section className="telemetry" aria-label="Workflow telemetry">
      <div className={`gate-indicator gate-indicator--${gate.toLowerCase()}`}>
        <span className="stamped-label">CURRENT GATE</span>
        <strong>{gate}</strong>
      </div>
      <dl>
        <div>
          <dt>MESSAGES</dt>
          <dd>{state.messageCount}</dd>
        </div>
        <div>
          <dt>REVIEWS</dt>
          <dd>{state.reviewCount}</dd>
        </div>
        <div>
          <dt>EVIDENCE</dt>
          <dd>{state.evidenceCount}</dd>
        </div>
      </dl>
    </section>
  );
}
