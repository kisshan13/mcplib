import { ActionLink, BrandMark } from "../ui";

export function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-content">
        <BrandMark size={104} className="mb-5 size-28 sm:size-32" />
        <p className="eyebrow">Open-source MCP infrastructure</p>
        <h1 id="hero-title">MCPs, ready to connect.</h1>
        <p className="hero-copy">
          Discover MCP servers, manage authentication, and build agentic infrastructure with
          reusable tooling.
        </p>
        <div className="hero-actions">
          <ActionLink variant="primary" href="#discover">
            Explore MCPs <span aria-hidden="true">-&gt;</span>
          </ActionLink>
          <ActionLink href="https://github.com/kisshan13/mcplib" target="_blank" rel="noreferrer">
            View on GitHub <span aria-hidden="true">-&gt;</span>
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
