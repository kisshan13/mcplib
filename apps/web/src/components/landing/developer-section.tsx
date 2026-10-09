import { projectLinks } from "./landing-content";

const capabilities = [
  ["registry", "Discover registered MCP implementations and their metadata."],
  ["auth", "Support platform OAuth, organization OAuth, and existing credentials."],
  ["secrets", "Request scoped credentials through a provider, not a database."],
  ["sdk", "Bring discovery, connections, and access into your own applications."]
] as const;

export function DeveloperSection() {
  return (
    <section
      className="landing-section developer-section"
      id="developers"
      aria-labelledby="developers-title"
    >
      <div className="section-grid">
        <div className="section-intro">
          <p className="section-kicker">03 / build</p>
          <h2 id="developers-title">Start with the pieces you need.</h2>
        </div>
        <div className="section-body">
          <p className="section-lead">
            Build on the pieces every integration needs: discovery, authentication, controlled
            secret access, and a runtime boundary for MCP implementations.
          </p>
          <div className="developer-layout">
            <div className="capability-list" aria-label="MCPLib developer capabilities">
              {capabilities.map(([label, description], index) => (
                <div className="capability-row" key={label}>
                  <span className="capability-index">0{index + 1}</span>
                  <div>
                    <h3>{label}</h3>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="code-sample">
              <div className="code-header">
                <span>packages/example-mcp/src/tools/add.ts</span>
                <span>typescript</span>
              </div>
              <pre>
                <code>{`mcp.registerTool({
  name: "add",
  inputSchema: z.object({
    a: z.number(), b: z.number()
  }),
  async execute({ a, b }) {
    return { result: a + b };
  }
});`}</code>
              </pre>
            </div>
          </div>
          <div className="section-actions">
            <a
              className="text-link"
              href={projectLinks.documentation}
              target="_blank"
              rel="noreferrer"
            >
              Read the documentation <span aria-hidden="true">-&gt;</span>
            </a>
            <a className="text-link" href={projectLinks.github} target="_blank" rel="noreferrer">
              Explore the repository <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
