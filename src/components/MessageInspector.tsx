import type { TranscriptMessage } from "../domain/types";

export function MessageInspector({
  message,
}: {
  message: TranscriptMessage | undefined;
}) {
  if (!message) {
    return (
      <aside className="inspector">
        <p>No message selected.</p>
      </aside>
    );
  }

  return (
    <aside
      className="inspector"
      aria-labelledby="inspector-title"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="stamped-label">INSPECTION WINDOW</p>
      <h2 id="inspector-title">
        Message {message.id} / Source {message.sourceOrder}
      </h2>
      <dl className="message-metadata">
        <div>
          <dt>FROM</dt>
          <dd>{message.sender}</dd>
        </div>
        <div>
          <dt>TO</dt>
          <dd>{message.recipient}</dd>
        </div>
        {message.stage && (
          <div>
            <dt>STAGE</dt>
            <dd>{message.stage}</dd>
          </div>
        )}
        {message.status && (
          <div>
            <dt>STATUS</dt>
            <dd>{message.status}</dd>
          </div>
        )}
        {message.permission && (
          <div>
            <dt>PERMISSION</dt>
            <dd>{message.permission}</dd>
          </div>
        )}
      </dl>
      <p className="message-body">{message.displayContent}</p>
    </aside>
  );
}
