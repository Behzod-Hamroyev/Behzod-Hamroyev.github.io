import React from 'react';

const items = [
  { key: 'available', label: 'Available' },
  { key: 'selected', label: 'Selected' },
  { key: 'reserved', label: 'Reserved' },
  { key: 'occupied', label: 'Occupied' }
];

export default function Legend({ counts, activeStatusFilter, onStatusFilterChange }) {
  return (
    <div className="legend-wrap">
      <div className="legend" aria-label="Seat status legend">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`legend-item ${activeStatusFilter === item.key ? 'active' : ''}`}
            aria-pressed={activeStatusFilter === item.key}
            onClick={() => onStatusFilterChange(activeStatusFilter === item.key ? 'all' : item.key)}
          >
            <span className={`dot ${item.key}`} />
            <span>{item.label}</span>
            <small>{counts[item.key] ?? 0}</small>
          </button>
        ))}
      </div>
      <p className="hint">Tip: click a status to quickly show matching seats.</p>
    </div>
  );
}
