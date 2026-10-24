import "./style.scss";

export function Header() {
  return (
    <header className="header">
      <h1 className="header__title">Meeting room bookings</h1>
      <p className="header__subtitle">
        Working hours 09:00–18:00 · All times are local
      </p>
    </header>
  );
}
