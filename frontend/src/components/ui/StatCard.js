import React from "react";

export default function StatCard({ label, value, note }) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {note ? <p className="stat-note">{note}</p> : null}
    </article>
  );
}
