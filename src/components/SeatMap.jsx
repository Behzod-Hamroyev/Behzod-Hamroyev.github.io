import React from 'react';

export default function SeatMap({ room, selectedSeatIds, onToggle }) {
  if (!room) {
    return <div className="empty">No room selected.</div>;
  }

  const columns = `repeat(${room.cols}, minmax(40px, 1fr))`;

  return (
    <div className="seat-map-wrapper">
      <div className="seat-map" style={{ gridTemplateColumns: columns }} role="grid" aria-label="Seat map">
        {room.seats.map((seat) => {
          const viewStatus = selectedSeatIds.includes(seat.id) ? 'selected' : seat.status;
          const disabled = viewStatus === 'reserved' || viewStatus === 'occupied';

          return (
            <button
              key={seat.id}
              type="button"
              className={`seat ${viewStatus}`}
              onClick={() => onToggle(seat.id)}
              disabled={disabled}
              aria-label={`Seat ${seat.code}, status ${viewStatus}`}
              aria-pressed={viewStatus === 'selected'}
            >
              {seat.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
