import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteFooter } from "./SiteFooter";

describe("SiteFooter", () => {
  const markup = renderToStaticMarkup(<SiteFooter />);

  it("renders the exact owner link labels", () => {
    expect(markup).toContain("@sabarnathX on X");
    expect(markup).toContain("Sabarnath Maddinieni on LinkedIn");
  });

  it("renders the exact owner link destinations", () => {
    expect(markup).toContain('href="https://x.com/sabarnathX"');
    expect(markup).toContain(
      'href="https://www.linkedin.com/in/sabarnathmaddinieni/"',
    );
  });

  it("opens both links in a new tab with safe rel attributes", () => {
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(markup.match(/target="_blank"/g)).toHaveLength(2);
    expect(markup.match(/rel="noopener noreferrer"/g)).toHaveLength(2);
  });

  it("keeps the existing attribution inside a semantic footer", () => {
    expect(markup.startsWith("<footer")).toBe(true);
    expect(markup).toContain(
      "Implemented with GitHub Copilot. Planned and reviewed by Codex. Human directed.",
    );
  });
});