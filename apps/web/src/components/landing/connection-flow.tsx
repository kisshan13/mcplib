export function ConnectionFlow() {
  return (
    <figure className="connection-flow" aria-labelledby="connection-flow-title">
      <figcaption className="flow-caption">
        <span id="connection-flow-title">A shorter path to a useful tool</span>
        <span>runtime / 01-03</span>
      </figcaption>
      <div className="flow-track">
        <div className="flow-node">
          <span className="flow-index">01</span>
          <div>
            <strong>Agent app</strong>
            <small>requests a capability</small>
          </div>
        </div>
        <div className="flow-connector" aria-hidden="true" />
        <div className="flow-node flow-node-accent">
          <span className="flow-index">02</span>
          <div>
            <strong>MCPLib</strong>
            <small>finds + authorizes</small>
          </div>
        </div>
        <div className="flow-connector" aria-hidden="true" />
        <div className="flow-node">
          <span className="flow-index">03</span>
          <div>
            <strong>MCP tools</strong>
            <small>run with scoped access</small>
          </div>
        </div>
      </div>
    </figure>
  );
}
