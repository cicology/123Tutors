import React from "react";

export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="page-title">{title}</h1>
      {description ? <p className="page-description">{description}</p> : null}
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}
