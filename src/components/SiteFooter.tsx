const ownerLinks = [
  {
    label: "@sabarnathX on X",
    href: "https://x.com/sabarnathX",
  },
  {
    label: "Sabarnath Maddinieni on LinkedIn",
    href: "https://www.linkedin.com/in/sabarnathmaddinieni/",
  },
];

export function SiteFooter() {
  return (
    <footer className="attribution site-footer">
      <p className="attribution-line">
        Implemented with GitHub Copilot. Planned and reviewed by Codex. Human
        directed.
      </p>
      <ul className="owner-links">
        {ownerLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}