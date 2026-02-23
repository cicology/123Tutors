import React from "react";
import { Link } from "react-router-dom";

export default function DashboardShell({
  portalLabel,
  title,
  description,
  navItems,
  activeTab,
  onTabChange,
  profileName,
  profileMeta,
  children,
  headerAction = null,
}) {
  return (
    <section className="portal-shell">
      <aside className="portal-sidebar">
        <Link className="portal-brand" to="/" aria-label="123tutors home">
          <span className="portal-brand-circle">123</span>
          <span className="portal-brand-text">
            tutors
            <small>{portalLabel}</small>
          </span>
        </Link>

        <nav className="portal-nav" aria-label={`${portalLabel} navigation`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                className={`portal-nav-btn${isActive ? " active" : ""}`}
                onClick={() => onTabChange(item.id)}
              >
                {Icon ? <Icon size={16} aria-hidden="true" /> : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="portal-user-card">
          <p className="portal-user-name">{profileName}</p>
          <p className="portal-user-meta">{profileMeta}</p>
        </div>
      </aside>

      <div className="portal-main">
        <header className="portal-main-header">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {headerAction}
        </header>

        <div className="portal-main-content">{children}</div>
      </div>
    </section>
  );
}
