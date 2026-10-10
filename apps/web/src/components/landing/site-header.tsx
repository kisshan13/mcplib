import { navigationLinks } from "./landing-content";
import { ActionLink, BrandMark, TextLink } from "../ui";

function linkTarget(external?: boolean) {
  return external ? { target: "_blank", rel: "noreferrer" } : {};
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="wordmark inline-flex items-center gap-2" href="#top" aria-label="Mcplib home">
        <BrandMark size={30} className="size-9 shrink-0" label="MCPLib brand mark" />
        <span>
          mcplib
          <span className="wordmark-mark" aria-hidden="true">
            /
          </span>
        </span>
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        {navigationLinks.map((link) => (
          <TextLink key={link.label} href={link.href} {...linkTarget(link.external)}>
            {link.label}
          </TextLink>
        ))}
      </nav>
      <ActionLink compact variant="primary" href="/auth">
        Get started
      </ActionLink>
    </header>
  );
}
