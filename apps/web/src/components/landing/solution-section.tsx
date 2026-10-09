export function SolutionSection() {
  return (
    <section className="story-section solution-section" aria-labelledby="solution-title">
      <div className="section-intro">
        <p className="section-kicker">The solution</p>
        <h2 id="solution-title">One place for your MCPs. One foundation for your agents.</h2>
      </div>
      <div className="story-copy">
        <p>
          Discover available MCP servers, connect the services you already use, and manage
          authentication through a consistent interface.
        </p>
        <p>
          Building agentic infrastructure? Use the same APIs and SDKs instead of rebuilding
          discovery, authentication, and credential management for every integration.
        </p>
        <div className="audience-notes">
          <p>
            <strong>For users</strong> Find and connect tools without the usual setup overhead.
          </p>
          <p>
            <strong>For developers</strong> Build agentic applications on reusable MCP
            infrastructure.
          </p>
        </div>
      </div>
    </section>
  );
}
