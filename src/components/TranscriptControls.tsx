import { useRef, useState } from "react";
import { MAX_TRANSCRIPT_BYTES } from "../app/exhibit";

type TranscriptControlsProps = {
  sourceLabel: string;
  onLoad: (content: string, sourceLabel: string) => void;
  onReset: () => void;
};

export function TranscriptControls({
  sourceLabel,
  onLoad,
  onReset,
}: TranscriptControlsProps) {
  const [draft, setDraft] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPaste = () => {
    setFileError("");
    onLoad(draft, "Pasted transcript");
  };

  const loadFile = async (file: File | undefined) => {
    if (!file) {
      fileInputRef.current && (fileInputRef.current.value = "");
      return;
    }
    if (file.size > MAX_TRANSCRIPT_BYTES) {
      setFileError("File exceeds the 1 MiB limit.");
      fileInputRef.current && (fileInputRef.current.value = "");
      return;
    }

    try {
      setFileError("");
      onLoad(await file.text(), `Imported: ${file.name}`);
    } catch {
      setFileError("The selected file could not be read.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const chooseFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  return (
    <section className="transcript-controls" aria-labelledby="controls-title">
      <div className="section-heading">
        <div>
          <p className="stamped-label">IN-MEMORY TRANSCRIPT</p>
          <h2 id="controls-title">Load Audit Log</h2>
        </div>
        <span className="source-label">SOURCE: {sourceLabel}</span>
      </div>
      <label htmlFor="transcript-paste">Paste Markdown</label>
      <textarea
        id="transcript-paste"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="## Message 001 - Supervisor to Builder"
      />
      <p className="privacy-note">
        Imported content stays in memory and is never uploaded.
      </p>
      <div className="control-actions">
        <button type="button" onClick={loadPaste}>
          Load pasted transcript
        </button>
        <button type="button" onClick={chooseFile}>
          Choose .md file
        </button>
        <button type="button" className="reset-button" onClick={onReset}>
          Reset to demo
        </button>
      </div>
      <input
        ref={fileInputRef}
        className="file-input"
        type="file"
        accept=".md,text/markdown,text/plain"
        onChange={(event) => void loadFile(event.target.files?.[0])}
      />
      {fileError && (
        <p className="control-error" role="alert">
          {fileError}
        </p>
      )}
    </section>
  );
}
