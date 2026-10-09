const authenticationMethods = [
  ["platform OAuth", "Authorize through the platform's configured service integrations."],
  ["organization OAuth", "Use an organization's own OAuth application credentials."],
  ["existing credentials", "Reuse supported API keys or tokens where permissions allow."]
] as const;

export function AuthenticationSection() {
  return (
    <section className="landing-section auth-section" aria-labelledby="authentication-title">
      <div className="section-grid section-grid-tight">
        <div className="section-intro">
          <p className="section-kicker">04 / access</p>
          <h2 id="authentication-title">Access without the sprawl.</h2>
        </div>
        <div className="section-body auth-layout">
          <div>
            <p className="section-lead">
              Different services need different credentials. Keep that complexity at the boundary,
              where it can be governed and reused.
            </p>
            <div className="auth-list">
              {authenticationMethods.map(([label, description]) => (
                <div className="auth-row" key={label}>
                  <span className="auth-marker" aria-hidden="true" />
                  <div>
                    <h3>{label}</h3>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="boundary-note">
            <p className="technical-label">credential boundary</p>
            <div
              className="boundary-path"
              aria-label="Tool to secret provider to authorized credential"
            >
              <span>tool</span>
              <b aria-hidden="true">-&gt;</b>
              <span>provider</span>
              <b aria-hidden="true">-&gt;</b>
              <span>scoped secret</span>
            </div>
            <p>
              MCP implementations request access through <span>SecretProvider</span>; they do not
              read platform storage directly.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
