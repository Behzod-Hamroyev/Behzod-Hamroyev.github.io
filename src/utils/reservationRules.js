export function evaluateSeatToggle({ seatStatus, alreadySelected, selectedCount, maxSelectableSeats }) {
  if (seatStatus !== 'available' && !alreadySelected) {
    return { allowed: false, error: 'This seat is not available for selection.' };
  }

  if (!alreadySelected && selectedCount >= maxSelectableSeats) {
    return {
      allowed: false,
      error: `You can select at most ${maxSelectableSeats} seat(s) in this room.`
    };
  }

  return { allowed: true, error: '' };
}

export function buildNextSeatIds(currentSeatIds, seatId) {
  if (currentSeatIds.includes(seatId)) {
    return currentSeatIds.filter((id) => id !== seatId);
  }
  return [...currentSeatIds, seatId];
}

export function canFinalizeReservation({ selectedSeatIds }) {
  return selectedSeatIds.length > 0;
}
