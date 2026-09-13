import type { TranscriptMessage } from "../domain/types";

type HandoffTimelineProps = {
  messages: TranscriptMessage[];
  selectedMessageId: string | null;
  onSelect: (messageId: string) => void;
};

export function HandoffTimeline({
  messages,
  selectedMessageId,
  onSelect,
}: HandoffTimelineProps) {
  return (
    <section className="timeline-panel" aria-labelledby="handoff-title">
      <div className="section-heading">
        <p className="stamped-label">AUDIT TRAIL</p>
        <h2 id="handoff-title">Handoff Sequence</h2>
      </div>
      <ol className="handoff-timeline">
        {messages.map((message) => {
          const isSelected = message.sourceId === selectedMessageId;
          const button = (
            <button
              type="button"
              className={
                isSelected ? "handoff-button is-selected" : "handoff-button"
              }
              aria-pressed={isSelected}
              onClick={() => onSelect(message.sourceId)}
            >
              <span className="message-number">MSG {message.id}</span>
              <span className="handoff-route">
                {message.sender} to {message.recipient}
              </span>
              <span className="handoff-status">
                {message.status ?? message.stage ?? "Recorded"}
              </span>
            </button>
          );

          return (
            <li
              className={`handoff handoff--${message.sender.toLowerCase()}`}
              key={message.sourceId}
            >
              {message.sender === "Supervisor" ? button : <span />}
              <span className="handoff-rail" aria-hidden="true">
                <span />
              </span>
              {message.sender === "Builder" ? button : <span />}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
