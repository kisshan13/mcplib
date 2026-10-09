import { footerGroups } from "./landing-content";

function linkTarget(external?: boolean) {
  return external ? { target: "_blank", rel: "noreferrer" } : {};
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-topline">
        <a className="wordmark" href="#top" aria-label="Mcplib home">
          mcplib
          <span className="wordmark-mark" aria-hidden="true">
            /
          </span>
        </a>
        <p>Open-source tooling for the agentic ecosystem.</p>
      </div>
      <div className="footer-links">
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} {...linkTarget(link.external)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
