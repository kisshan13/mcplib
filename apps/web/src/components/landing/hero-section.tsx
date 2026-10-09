import { Blobatar } from "@blobatar/react";
import "blobatar/motion.css";

export function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-content">
        <div className="mascot-wrap" role="img" aria-label="MCPLib mascot">
          <Blobatar name="mcplib" size={88} animate="hover" />
        </div>
        <p className="eyebrow">Open-source MCP infrastructure</p>
        <h1 id="hero-title">MCPs, ready to connect.</h1>
        <p className="hero-copy">
          Discover MCP servers, manage authentication, and build agentic infrastructure with
          reusable tooling.
        </p>
        <div className="hero-actions">
          <a className="action-link action-link-primary" href="#discover">
            Explore MCPs <span aria-hidden="true">-&gt;</span>
          </a>
          <a
            className="action-link"
            href="https://github.com/kisshan13/mcplib"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub <span aria-hidden="true">-&gt;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
