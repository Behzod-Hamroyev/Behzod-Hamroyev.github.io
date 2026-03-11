import { generateId, nowStamp } from '../utils/bookingUtils.js';
import {
  buildNextSeatIds,
  canFinalizeReservation,
  evaluateSeatToggle
} from '../utils/reservationRules.js';

export function setRoomStatus(libraries, selection, seatIds, targetStatus) {
  return libraries.map((library) => {
    if (library.id !== selection.libraryId) return library;

    return {
      ...library,
      floors: library.floors.map((floor) => {
        if (floor.id !== selection.floorId) return floor;

        return {
          ...floor,
          rooms: floor.rooms.map((room) => {
            if (room.id !== selection.roomId) return room;

            return {
              ...room,
              seats: room.seats.map((seat) =>
                seatIds.includes(seat.id) ? { ...seat, status: targetStatus } : seat
              )
            };
          })
        };
      })
    };
  });
}

export function findCurrent(data) {
  const library = data.libraries.find((item) => item.id === data.selection.libraryId);
  const floor = library?.floors.find((item) => item.id === data.selection.floorId);
  const room = floor?.rooms.find((item) => item.id === data.selection.roomId);
  return { library, floor, room };
}

export function toggleSeatInState(prev, seatId) {
  const { room } = findCurrent(prev);
  if (!room) return prev;

  const seat = room.seats.find((item) => item.id === seatId);
  if (!seat) return prev;

  const alreadySelected = prev.selection.seatIds.includes(seatId);
  const toggleCheck = evaluateSeatToggle({
    seatStatus: seat.status,
    alreadySelected,
    selectedCount: prev.selection.seatIds.length,
    maxSelectableSeats: room.maxSelectableSeats
  });

  if (!toggleCheck.allowed) {
    return {
      ...prev,
      ui: { error: toggleCheck.error, message: '' }
    };
  }

  const seatIds = buildNextSeatIds(prev.selection.seatIds, seatId);
  return {
    ...prev,
    selection: { ...prev.selection, seatIds },
    ui: { error: '', message: '' }
  };
}

export function cancelReservationInState(prev, reservationId) {
  const reservation = prev.reservations.find((r) => r.id === reservationId);
  if (!reservation) return prev;

  const updatedLibraries = prev.libraries.map((library) => {
    if (library.id !== reservation.libraryId) return library;

    return {
      ...library,
      floors: library.floors.map((floor) => {
        if (floor.id !== reservation.floorId) return floor;

        return {
          ...floor,
          rooms: floor.rooms.map((room) => {
            if (room.id !== reservation.roomId) return room;

            return {
              ...room,
              seats: room.seats.map((seat) =>
                reservation.seatIds.includes(seat.id) ? { ...seat, status: 'available' } : seat
              )
            };
          })
        };
      })
    };
  });

  return {
    ...prev,
    libraries: updatedLibraries,
    reservations: prev.reservations.filter((r) => r.id !== reservationId),
    ui: { error: '', message: `Reservation cancelled. Seat(s) ${reservation.seatCodes.join(', ')} are now available.` }
  };
}

export function confirmReservationInState(prev, reservedBy, stampProvider = nowStamp) {
  const { room, library, floor } = findCurrent(prev);
  if (!room) return prev;

  if (!canFinalizeReservation({ selectedSeatIds: prev.selection.seatIds })) {
    return {
      ...prev,
      ui: { error: 'Select at least one seat before confirmation.', message: '' }
    };
  }

  const invalid = prev.selection.seatIds.some((id) => {
    const seat = room.seats.find((item) => item.id === id);
    return !seat || seat.status !== 'available';
  });

  if (invalid) {
    return {
      ...prev,
      ui: { error: 'One or more selected seats are no longer available.', message: '' },
      selection: { ...prev.selection, seatIds: [] }
    };
  }

  const updatedLibraries = setRoomStatus(prev.libraries, prev.selection, prev.selection.seatIds, 'reserved');
  const reservedSeats = room.seats
    .filter((seat) => prev.selection.seatIds.includes(seat.id))
    .map((seat) => seat.code);

  const reservation = {
    id: generateId('res'),
    libraryId: library.id,
    libraryName: library.name,
    floorId: floor.id,
    floorLabel: floor.label,
    roomId: room.id,
    roomName: room.name,
    seatIds: [...prev.selection.seatIds],
    seatCodes: reservedSeats,
    reservedBy: reservedBy || 'Guest User',
    createdAt: stampProvider(),
    status: 'reserved'
  };

  return {
    ...prev,
    libraries: updatedLibraries,
    reservations: [reservation, ...prev.reservations],
    selection: { ...prev.selection, seatIds: [] },
    ui: {
      error: '',
      message: `Reservation confirmed for seat(s): ${reservedSeats.join(', ')}.`
    }
  };
}
