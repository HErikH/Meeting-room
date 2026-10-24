import { Icon } from "@components/UI/icon/Icon";
import "./style.scss";

export function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <a href="#main-content" className="header__skip">
          Skip to content
        </a>
        <a
          href="#main-content"
          className="header__brand"
          aria-label="Roomly home"
        >
          <span className="header__mark">
            <Icon name="room" />
          </span>
          roomly<span className="header__brand-dot">.</span>
        </a>
        <nav className="header__nav" aria-label="Main navigation">
          <a href="#schedule" className="header__link" aria-current="page">
            <Icon name="calendar" />
            Bookings
          </a>
        </nav>
        <div className="header__workspace">
          <span className="header__workspace-icon">
            <Icon name="room" />
          </span>
          <span>Shared workspace</span>
        </div>
      </div>
    </header>
  );
}
