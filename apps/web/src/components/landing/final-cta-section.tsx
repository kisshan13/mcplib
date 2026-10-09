import { projectLinks } from "./landing-content";

export function FinalCtaSection() {
  return (
    <section className="final-cta-section" aria-labelledby="final-cta-title">
      <p className="section-kicker">Start here</p>
      <h2 id="final-cta-title">Less setup. More tools. Better agents.</h2>
      <p>
        Connect your first MCP server or build the infrastructure behind an agentic application.
      </p>
      <div className="action-row">
        <a className="action-link action-link-primary" href="#mcp-users">
          Explore MCPs <span aria-hidden="true">↗</span>
        </a>
        <a
          className="action-link"
          href={projectLinks.documentation}
          target="_blank"
          rel="noreferrer"
        >
          Build with the SDK <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
