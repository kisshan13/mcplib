import { processSteps } from "./landing-content";

export function ProcessSection() {
  return (
    <section className="content-section process-section" aria-labelledby="process-title">
      <div className="section-intro">
        <p className="section-kicker">How it works</p>
        <h2 id="process-title">From discovery to execution.</h2>
      </div>
      <ol className="process-list">
        {processSteps.map((step, index) => (
          <li className="process-item" key={step.title}>
            <span className="item-index">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
