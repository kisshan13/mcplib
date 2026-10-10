import { navigationLinks } from "./landing-content";
import { ActionLink, TextLink } from "../ui";

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
          <TextLink key={link.label} href={link.href} {...linkTarget(link.external)}>
            {link.label}
          </TextLink>
        ))}
      </nav>
      <ActionLink compact variant="primary" href="#discover">
        Get started
      </ActionLink>
    </header>
  );
}
