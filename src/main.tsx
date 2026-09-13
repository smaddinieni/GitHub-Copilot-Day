import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { HandoffTimeline } from "./components/HandoffTimeline";
import { MessageInspector } from "./components/MessageInspector";
import { RoleBoundary } from "./components/RoleBoundary";
import { Telemetry } from "./components/Telemetry";
import { TranscriptControls } from "./components/TranscriptControls";
import {
  createExhibitState,
  loadExhibitTranscript,
  resetToDemo,
} from "./app/exhibit";
import { deriveTranscriptState, parseTranscript } from "./domain/transcript";
import { demoTranscript } from "./fixtures/demoTranscript";
import "./styles.css";

function App() {
  const initialParsed = parseTranscript(demoTranscript);
  const [messages, setMessages] = useState(initialParsed.messages);
  const [diagnostics, setDiagnostics] = useState(initialParsed.diagnostics);
  const [sourceLabel, setSourceLabel] = useState("Bundled demonstration");
  const [status, setStatus] = useState("Bundled demonstration loaded.");
  const [selectedMessageId, setSelectedMessageId] = useState(
    () => createExhibitState(initialParsed.messages).selectedMessageId,
  );
  const selectedMessage = messages.find(
    (message) => message.sourceId === selectedMessageId,
  );

  const loadTranscript = (content: string, label: string) => {
    const result = loadExhibitTranscript(messages, content, label);
    setDiagnostics(result.diagnostics);
    setStatus(
      result.error ?? `${label} loaded: ${result.messages.length} messages.`,
    );
    if (!result.error) {
      setMessages(result.messages);
      setSourceLabel(result.sourceLabel);
      setSelectedMessageId(result.selectedMessageId);
    }
  };

  const reset = () => {
    const result = resetToDemo();
    setMessages(result.messages);
    setDiagnostics(result.diagnostics);
    setSourceLabel(result.sourceLabel);
    setSelectedMessageId(result.selectedMessageId);
    setStatus("Reset to bundled demonstration.");
  };

  return (
    <main className="airlock">
      <header className="masthead">
        <p className="stamped-label">AGENT AIRLOCK / PROTOCOL 1.0</p>
        <h1>TWO AGENTS. ONE AIRLOCK. ZERO SHARED CONTROL.</h1>
        <p className="masthead-copy">
          A visible audit trail for a deliberately divided coding workflow.
        </p>
      </header>

      <section className="role-deck" aria-label="Immutable role boundaries">
        <RoleBoundary
          role="Supervisor"
          authority="Can plan and review."
          restriction="Cannot write implementation."
        />
        <div className="airlock-seal" aria-hidden="true">
          <span>
            CONTROL
            <br />
            AIRLOCK
          </span>
        </div>
        <RoleBoundary
          role="Builder"
          authority="Can implement approved work."
          restriction="Cannot change requirements."
        />
      </section>

      <Telemetry state={deriveTranscriptState(messages)} />

      <TranscriptControls
        sourceLabel={sourceLabel}
        onLoad={loadTranscript}
        onReset={reset}
      />
      <section className="load-status" aria-live="polite" aria-atomic="true">
        <p>{status}</p>
        {diagnostics.length > 0 && (
          <details>
            <summary>
              {diagnostics.length} recoverable audit diagnostic(s)
            </summary>
            <ul>
              {diagnostics.map((diagnostic, index) => (
                <li key={`${diagnostic.section}-${diagnostic.code}-${index}`}>
                  {diagnostic.message}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section className="command-deck">
        <HandoffTimeline
          messages={messages}
          selectedMessageId={selectedMessageId}
          onSelect={setSelectedMessageId}
        />
        <MessageInspector message={selectedMessage} />
      </section>
      <footer className="attribution">
        Implemented with GitHub Copilot. Planned and reviewed by Codex. Human
        directed.
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
