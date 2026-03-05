import React from 'react';

const items = [
  { key: 'available', label: 'Available' },
  { key: 'selected', label: 'Selected' },
  { key: 'reserved', label: 'Reserved' },
  { key: 'occupied', label: 'Occupied' }
];

export default function Legend() {
  return (
    <div className="legend" aria-label="Seat status legend">
      {items.map((item) => (
        <div key={item.key} className="legend-item">
          <span className={`dot ${item.key}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
