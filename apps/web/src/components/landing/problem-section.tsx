export function ProblemSection() {
  return (
    <section className="story-section" aria-labelledby="problem-title">
      <div className="section-intro">
        <p className="section-kicker">The problem</p>
        <h2 id="problem-title">MCPs are powerful. Getting them running is still a hassle.</h2>
      </div>
      <div className="story-copy">
        <p>Found an MCP server on GitHub? The setup still looks something like this:</p>
        <ol className="friction-list">
          <li>
            <span>01</span>Clone and install.
          </li>
          <li>
            <span>02</span>Configure environment variables.
          </li>
          <li>
            <span>03</span>Set up authentication.
          </li>
          <li>
            <span>04</span>Wire it into the client. Repeat.
          </li>
        </ol>
        <p className="story-emphasis">
          MCP should make tools easier to use, not harder to connect.
        </p>
      </div>
    </section>
  );
}
