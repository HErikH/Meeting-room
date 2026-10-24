import "./style.scss";

export function Skeleton({
  rows = 3,
  label = "Loading content…",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div className="skeleton" role="status">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">
        {Array.from({ length: rows }, (_, index) => (
          <div className="skeleton__row" key={index}>
            <span className="skeleton__block skeleton__block--icon" />
            <div className="skeleton__lines">
              <span className="skeleton__block" />
              <span className="skeleton__block skeleton__block--short" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
