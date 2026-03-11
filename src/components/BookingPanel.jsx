import React from 'react';

export default function BookingPanel({
  room,
  selectedSeats,
  error,
  message,
  stage,
  onCancel,
  onConfirm,
  onStartOver
}) {
  return (
    <aside className="booking-panel" aria-live="polite">
      <div className="booking-head">
        <h3>Your Booking</h3>
      </div>

      <p className="meta">Room: {room?.name || '-'}</p>
      <p className="meta">You can pick up to {room?.maxSelectableSeats || 0} seats</p>

      <div className="selected-list">
        <strong>
          Selected Seats{selectedSeats.length ? <span className="selected-count"> ({selectedSeats.length})</span> : null}
        </strong>
        <p>{selectedSeats.length ? selectedSeats.join(', ') : 'None selected'}</p>
      </div>

      {error ? <p className="alert error">{error}</p> : null}
      {message ? <p className="alert success">{message}</p> : null}

      <div className="panel-actions">
        {stage === 'select' ? (
          <>
            <button type="button" className="btn light" onClick={onCancel}>
              Clear Selection
            </button>
            <button type="button" className="btn" onClick={onConfirm}>
              Confirm Booking
            </button>
          </>
        ) : null}

        {stage === 'confirmed' ? (
          <button type="button" className="btn light" onClick={onStartOver}>
            Book More Seats
          </button>
        ) : null}
      </div>
    </aside>
  );
}
