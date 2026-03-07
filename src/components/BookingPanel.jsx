import React from 'react';

export default function BookingPanel({
  room,
  selectedSeats,
  stats,
  error,
  message,
  stage,
  onCancel,
  onStartReview,
  onBackToSelect,
  onConfirm,
  onStartOver
}) {
  return (
    <aside className="booking-panel" aria-live="polite">
      <div className="booking-head">
        <h3>Your Booking</h3>
        <span className={`stage-chip stage-${stage}`}>{stage.toUpperCase()}</span>
      </div>

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
        {stage === 'select' ? (
          <>
            <button type="button" className="btn light" onClick={onCancel}>
              Clear Selection
            </button>
            <button type="button" className="btn" onClick={onStartReview}>
              Review Seats
            </button>
          </>
        ) : null}

        {stage === 'review' ? (
          <>
            <button type="button" className="btn light" onClick={onBackToSelect}>
              Back to Seats
            </button>
            <button type="button" className="btn" onClick={onConfirm}>
              Confirm Booking
            </button>
          </>
        ) : null}

        {stage === 'confirmed' ? (
          <>
            <button type="button" className="btn light" onClick={onStartOver}>
              Start a New Booking
            </button>
          </>
        ) : null}
      </div>
    </aside>
  );
}
