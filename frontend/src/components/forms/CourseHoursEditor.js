import React from "react";

export default function CourseHoursEditor({ value, onChange }) {
  const rows = value?.length ? value : [{ course: "", hours: 0, rate: 0 }];

  const updateRow = (index, key, nextValue) => {
    const next = rows.map((row, idx) =>
      idx === index
        ? {
            ...row,
            [key]: key === "course" ? nextValue : Number(nextValue || 0),
          }
        : row,
    );
    onChange(next);
  };

  const addRow = () => {
    onChange([...rows, { course: "", hours: 0, rate: 0 }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) {
      return;
    }
    onChange(rows.filter((_, idx) => idx !== index));
  };

  return (
    <div className="course-hours-editor">
      <div className="table-head">
        <span>Course / Subject</span>
        <span>Hours</span>
        <span>Rate (R/hr)</span>
        <span></span>
      </div>
      {rows.map((row, index) => (
        <div className="table-row" key={`${row.course}_${index}`}>
          <input
            className="input"
            placeholder="e.g. Calculus I"
            value={row.course}
            onChange={(event) => updateRow(index, "course", event.target.value)}
          />
          <input
            className="input"
            type="number"
            min="0"
            value={row.hours}
            onChange={(event) => updateRow(index, "hours", event.target.value)}
          />
          <input
            className="input"
            type="number"
            min="0"
            value={row.rate}
            onChange={(event) => updateRow(index, "rate", event.target.value)}
          />
          <button type="button" className="btn btn-ghost" onClick={() => removeRow(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-outline" onClick={addRow}>
        + Add course
      </button>
    </div>
  );
}
