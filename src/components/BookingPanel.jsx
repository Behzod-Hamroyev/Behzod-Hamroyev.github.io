import React from 'react';

export default function BookingPanel({
  room,
  selectedSeats,
  stats,
  error,
  message,
  onCancel,
  onConfirm
}) {
  return (
    <aside className="booking-panel">
      <h3>Reservation</h3>
      <p className="meta">Room: {room?.name || '-'}</p>
      <p className="meta">Max selectable: {room?.maxSelectableSeats || 0}</p>

      <div className="stats-grid">
        <span>Available: {stats.available}</span>
        <span>Selected: {stats.selected}</span>
        <span>Reserved: {stats.reserved}</span>
        <span>Occupied: {stats.occupied}</span>
      </div>

      <div className="selected-list">
        <strong>Selected Seats</strong>
        <p>{selectedSeats.length ? selectedSeats.join(', ') : 'None selected'}</p>
      </div>

      {error ? <p className="alert error">{error}</p> : null}
      {message ? <p className="alert success">{message}</p> : null}

      <div className="panel-actions">
        <button type="button" className="btn light" onClick={onCancel}>
          Cancel Selection
        </button>
        <button type="button" className="btn" onClick={onConfirm}>
          Confirm Reservation
        </button>
      </div>
    </aside>
  );
}
