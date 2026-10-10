import { Surface } from "../ui";

const features = [
  ["01", "MCP discovery", "Find registered implementations and inspect their public metadata."],
  [
    "02",
    "Authentication",
    "Use platform OAuth, organization OAuth, or supported existing credentials."
  ],
  [
    "03",
    "Controlled secrets",
    "Request only the credentials an MCP implementation is allowed to use."
  ]
] as const;

export function FeatureCards() {
  return (
    <section
      className="landing-section feature-section"
      id="capabilities"
      aria-labelledby="features-title"
    >
      <div className="section-heading-centered">
        <p className="section-kicker">02 / the platform layer</p>
        <h2 id="features-title">The useful parts, in one place.</h2>
        <p>
          A small set of primitives for finding MCPs, handling access, and connecting them to
          agentic applications.
        </p>
      </div>
      <div className="feature-grid">
        {features.map(([index, title, description]) => (
          <article className="feature-card" key={title}>
            <Surface
              className="h-full"
              tone={index === "01" ? "dark" : index === "02" ? "muted" : "dark"}
            >
              <span className="feature-index">{index}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </Surface>
          </article>
        ))}
      </div>
    </section>
  );
}
