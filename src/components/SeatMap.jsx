import React, { useMemo, useRef } from 'react';

export default function SeatMap({
  room,
  selectedSeatIds,
  onToggle,
  isSeatMuted,
  readOnly = false,
  allowBlockedSelection = false
}) {
  const seatRefs = useRef({});

  const seatOrder = useMemo(() => room?.seats.map((seat) => seat.id) || [], [room]);

  if (!room) {
    return <div className="empty">No room selected.</div>;
  }

  const columns = `repeat(${room.cols}, minmax(clamp(32px, 3.5vw, 52px), 1fr))`;

  const handleKeyDown = (event, seatId) => {
    const idx = seatOrder.indexOf(seatId);
    if (idx === -1) return;

    let nextIdx = null;
    if (event.key === 'ArrowRight') nextIdx = idx + 1;
    if (event.key === 'ArrowLeft') nextIdx = idx - 1;
    if (event.key === 'ArrowDown') nextIdx = idx + room.cols;
    if (event.key === 'ArrowUp') nextIdx = idx - room.cols;

    if (nextIdx === null) return;
    event.preventDefault();

    const targetId = seatOrder[nextIdx];
    if (!targetId) return;
    seatRefs.current[targetId]?.focus();
  };

  return (
    <div className="seat-map-wrapper">
      <div className="map-label-row">
        <span>{room.rows} rows</span>
        <span>{room.cols} columns</span>
      </div>

      <div className="seat-map" style={{ gridTemplateColumns: columns }} role="grid" aria-label="Seat map">
        {room.seats.map((seat) => {
          const viewStatus = selectedSeatIds.includes(seat.id) ? 'selected' : seat.status;
          const blocked = viewStatus === 'reserved' || viewStatus === 'occupied';
          const muted = Boolean(isSeatMuted?.(seat, viewStatus)) && viewStatus !== 'selected';
          const featureList = [
            seat.features.powerOutlet ? 'Power outlet' : null,
            seat.features.nearWindow ? 'Near window' : null,
            seat.features.accessible ? 'Accessible' : null
          ].filter(Boolean);

          return (
            <div key={seat.id} role="gridcell">
              <button
                ref={(element) => {
                  seatRefs.current[seat.id] = element;
                }}
                type="button"
                className={`seat ${viewStatus} ${muted ? 'muted' : ''}`}
                onClick={() => {
                  if (!readOnly && (!blocked || allowBlockedSelection) && !muted) onToggle(seat.id);
                }}
                disabled={(blocked && !allowBlockedSelection) || readOnly}
                aria-disabled={muted || undefined}
                onKeyDown={(event) => handleKeyDown(event, seat.id)}
                aria-label={`Seat ${seat.code}, status ${viewStatus}${featureList.length ? `, ${featureList.join(', ')}` : ''}`}
                aria-pressed={viewStatus === 'selected'}
                title={`Seat ${seat.code}${featureList.length ? ` - ${featureList.join(', ')}` : ''}`}
              >
                {seat.code}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
