import { navigationLinks } from "./landing-content";

function linkTarget(external?: boolean) {
  return external ? { target: "_blank", rel: "noreferrer" } : {};
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Mcplib home">
        mcplib
        <span className="wordmark-mark" aria-hidden="true">
          /
        </span>
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        {navigationLinks.map((link) => (
          <a key={link.label} href={link.href} {...linkTarget(link.external)}>
            {link.label}
          </a>
        ))}
      </nav>
      <a className="header-action" href="#discover">
        Get started
      </a>
    </header>
  );
}
