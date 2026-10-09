import { userCapabilities } from "./landing-content";

export function McpUsersSection() {
  return (
    <section className="users-section content-section" id="mcp-users" aria-labelledby="users-title">
      <div className="section-intro">
        <p className="section-kicker">For MCP users</p>
        <h2 id="users-title">Stop installing every MCP by hand.</h2>
      </div>
      <div className="users-content">
        <p>Browse available MCP integrations and connect the services you need.</p>
        <ul className="plain-list">
          {userCapabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
        <p className="section-close">Spend less time configuring tools and more time using them.</p>
        <a className="text-link" href="#mcp-users">
          Explore MCPs <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
