export function roomStats(room, selectedSeatIds) {
  const selected = new Set(selectedSeatIds);
  return room.seats.reduce(
    (acc, seat) => {
      const status = selected.has(seat.id) ? 'selected' : seat.status;
      acc[status] += 1;
      return acc;
    },
    { available: 0, reserved: 0, occupied: 0, selected: 0 }
  );
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function nowStamp() {
  return new Date().toLocaleString();
}
