import React from 'react';

const STEPS = [
  { key: 'select', label: 'Select' },
  { key: 'review', label: 'Review' },
  { key: 'confirmed', label: 'Done' }
];

const STAGE_INDEX = { select: 0, review: 1, confirmed: 2 };

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
  const currentStep = STAGE_INDEX[stage] ?? 0;
  return (
    <aside className="booking-panel" aria-live="polite">
      <div className="booking-head">
        <h3>Your Booking</h3>
      </div>

      <div className="step-indicator" aria-label={`Step ${currentStep + 1} of 3`}>
        {STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <React.Fragment key={step.key}>
              {i > 0 && <span className={`step-divider${isDone ? ' done' : ''}`} aria-hidden="true" />}
              <div className={`step${isActive ? ' active' : isDone ? ' done' : ''}`}>
                <span className="step-num" aria-hidden="true">{isDone ? '✓' : i + 1}</span>
                <span className="step-label">{step.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <p className="meta">Room: {room?.name || '-'}</p>
      <p className="meta">You can pick up to {room?.maxSelectableSeats || 0} seats</p>

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
              Book More Seats
            </button>
          </>
        ) : null}
      </div>
    </aside>
  );
}
