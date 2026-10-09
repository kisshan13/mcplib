import { projectLinks } from "./landing-content";

export function OpenSourceSection() {
  return (
    <section className="landing-section open-source-section" aria-labelledby="open-source-title">
      <div className="open-source-layout">
        <div>
          <p className="section-kicker">05 / open source</p>
          <h2 id="open-source-title">Build with MCP. Skip the busywork.</h2>
        </div>
        <div className="open-source-copy">
          <p>
            Inspect the tooling, adapt the abstractions, self-host the pieces you need, and build
            new MCP implementations on top of an open foundation.
          </p>
          <div className="action-row">
            <a
              className="action-link action-link-primary"
              href={projectLinks.github}
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub <span aria-hidden="true">-&gt;</span>
            </a>
            <a
              className="action-link"
              href={projectLinks.documentation}
              target="_blank"
              rel="noreferrer"
            >
              Start with the docs <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
