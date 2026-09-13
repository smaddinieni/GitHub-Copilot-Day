import boardMarkdown from "../../agentsMessageBoard.md?raw";

/**
 * The production default transcript: the repository's own public message board,
 * bundled at build time. The Markdown is never duplicated or fetched at runtime.
 */
export const repositoryTranscript: string = boardMarkdown;

/** Accurate source wording for the bundled repository board. */
export const REPOSITORY_SOURCE_LABEL = "Repository message board";