export function DiscoverSection() {
  return (
    <section
      className="landing-section discover-section"
      id="discover"
      aria-labelledby="discover-title"
    >
      <div className="section-grid">
        <div className="section-intro">
          <p className="section-kicker">01 / discover</p>
          <h2 id="discover-title">Find the tool. Keep the connection.</h2>
        </div>
        <div className="section-body">
          <p className="section-lead">
            Skip the repeated loop of finding a repository, installing dependencies, wiring a
            client, and configuring credentials for every MCP.
          </p>
          <div className="setup-compare" aria-label="MCP setup comparison">
            <div className="setup-column setup-column-muted">
              <p className="technical-label">without a shared layer</p>
              <ol>
                <li>Clone a repository</li>
                <li>Install dependencies</li>
                <li>Configure auth</li>
                <li>Wire the client</li>
              </ol>
            </div>
            <div className="setup-column setup-column-accent">
              <p className="technical-label">with MCPLib</p>
              <ol>
                <li>Discover a registered MCP</li>
                <li>Connect an account</li>
                <li>Use the available tools</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
