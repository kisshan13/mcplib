import type { Capability } from "./landing-content";

interface CapabilityListProps {
  items: Capability[];
}

export function CapabilityList({ items }: CapabilityListProps) {
  return (
    <div className="capability-list">
      {items.map((item, index) => (
        <article className="capability-item" key={item.title}>
          <p className="item-index">{String(index + 1).padStart(2, "0")}</p>
          <div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
